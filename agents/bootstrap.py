#!/usr/bin/env python3
"""Install a caller-pinned Mercury release using Python 3.11+ standard library."""
import argparse
import hashlib
import gzip
import json
import os
from pathlib import Path, PurePosixPath
import platform
import re
import shutil
import sys
import tarfile
import tempfile
import urllib.parse
import urllib.request

MANIFEST_LIMIT = 1024 * 1024
ARCHIVE_LIMIT = 256 * 1024 * 1024
EXPANDED_LIMIT = 1024 * 1024 * 1024
MEMBER_LIMIT = 20000
HASH = re.compile(r"[0-9a-f]{64}\Z")
NAME = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,199}\Z")

class InstallError(Exception):
    pass


def require(condition, message):
    if not condition:
        raise InstallError(message)


def release_url(url, release, filename):
    expected = f"https://github.com/fiberfx/mercury/releases/download/{release}/{filename}"
    require(url == expected, f"asset URL must be {expected}")


class HTTPSOnly(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        require(urllib.parse.urlsplit(newurl).scheme == "https", "refusing non-HTTPS redirect")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def read_to(source, output, limit):
    total = 0
    digest = hashlib.sha256()
    while chunk := source.read(min(1024 * 1024, limit - total + 1)):
        total += len(chunk)
        require(total <= limit, "download exceeds size limit")
        digest.update(chunk)
        output.write(chunk)
    return digest.hexdigest()


def open_https(url):
    parsed = urllib.parse.urlsplit(url)
    require(parsed.scheme == "https" and parsed.hostname and not parsed.username and not parsed.password,
            "download URL must be HTTPS without credentials")
    return urllib.request.build_opener(HTTPSOnly()).open(url, timeout=30)


def manifest_bytes(source):
    if source.startswith("https://"):
        stream = open_https(source)
    else:
        require("://" not in source, "manifest must be HTTPS or a local path")
        stream = open(source, "rb")
    with stream:
        data = stream.read(MANIFEST_LIMIT + 1)
    require(len(data) <= MANIFEST_LIMIT, "manifest exceeds size limit")
    return data


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"duplicate JSON key: {key}")
        result[key] = value
    return result


def load_manifest(source, pinned_hash):
    require(bool(HASH.fullmatch(pinned_hash)), "manifest SHA-256 must be 64 lowercase hex characters")
    data = manifest_bytes(source)
    require(hashlib.sha256(data).hexdigest() == pinned_hash, "manifest SHA-256 mismatch")
    manifest = json.loads(data, object_pairs_hook=unique_object)
    require(isinstance(manifest, dict) and type(manifest.get("schema_version")) is int
            and manifest["schema_version"] == 1, "unsupported manifest schema")
    release = manifest.get("release")
    require(isinstance(release, str) and NAME.fullmatch(release), "invalid release name")
    assets = manifest.get("assets")
    require(isinstance(assets, dict), "missing assets")
    filenames = set()
    for key in ("bundle", "native_linux_x64"):
        asset = assets.get(key)
        require(isinstance(asset, dict), f"missing asset: {key}")
        filename = asset.get("file")
        require(isinstance(filename, str) and NAME.fullmatch(filename)
                and filename.endswith(".tar.gz"), "invalid archive filename")
        require(filename not in filenames, "duplicate archive filename")
        filenames.add(filename)
        require(isinstance(asset.get("sha256"), str) and HASH.fullmatch(asset["sha256"]), "invalid asset SHA-256")
        release_url(asset.get("url"), release, filename)
    return manifest


def check_native_platform():
    require(platform.system() == "Linux" and platform.machine().lower() in ("x86_64", "amd64"),
            "native requires Linux x86_64; use --docs-only elsewhere")
    try:
        libc = os.confstr("CS_GNU_LIBC_VERSION") or ""
        match = re.fullmatch(r"glibc (\d+)\.(\d+)(?:\.\d+)?", libc)
    except (ValueError, OSError, AttributeError):
        match = None
    require(match and tuple(map(int, match.groups())) >= (2, 39),
            "native requires glibc >= 2.39; use --docs-only on unsupported systems")


class BoundedReader:
    """Bound all decompressed bytes, including PAX headers and tar padding."""
    def __init__(self, source):
        self.source = source
        self.remaining = EXPANDED_LIMIT + 16 * 1024 * 1024

    def read(self, size=-1):
        requested = self.remaining + 1 if size < 0 else min(size, self.remaining + 1)
        data = self.source.read(requested)
        self.remaining -= len(data)
        require(self.remaining >= 0, "decompressed archive exceeds size limit")
        return data


def extract(archive, root, budget):
    seen = set()
    with gzip.open(archive, "rb") as decompressed, tarfile.open(fileobj=BoundedReader(decompressed), mode="r|") as tar:
        for member in tar:
            budget[0] += 1
            require(budget[0] <= MEMBER_LIMIT, "too many archive members")
            name = member.name
            path = PurePosixPath(name)
            require(name and not path.is_absolute() and "\\" not in name and "\x00" not in name
                    and all(p not in ("", ".", "..") for p in name.rstrip("/").split("/"))
                    and ":" not in name, "unsafe archive path")
            require(str(path) not in seen, "duplicate archive member")
            seen.add(str(path))
            require((member.isdir() or member.isfile()) and member.sparse is None,
                    "archive links, sparse and special files are forbidden")
            require(not member.mode & 0o7022, "unsafe archive permissions")
            require(member.size >= 0, "negative archive member size")
            budget[1] += member.size
            require(budget[1] <= EXPANDED_LIMIT, "expanded archive exceeds size limit")
            target = root.joinpath(*path.parts)
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
                require(target.is_dir(), "archive path collision")
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                with tar.extractfile(member) as source, open(target, "xb") as output:
                    copied = 0
                    while chunk := source.read(1024 * 1024):
                        copied += len(chunk)
                        require(copied <= member.size, "archive member exceeds declared size")
                        output.write(chunk)
                    require(copied == member.size, "truncated archive member")
                target.chmod(0o755 if member.mode & 0o111 else 0o644)


def install(manifest_source, pinned_hash, dest, cache_dir=None, docs_only=False):
    dest = Path(dest).absolute()
    require(not os.path.lexists(dest), "destination already exists")
    manifest = load_manifest(manifest_source, pinned_hash)
    if not docs_only:
        check_native_platform()
    require(dest.parent.is_dir(), "destination parent must exist")
    stage = Path(tempfile.mkdtemp(prefix=".mercury-stage-", dir=dest.parent))
    reservation = None
    try:
        payload = stage / "payload"
        payload.mkdir()
        budget = [0, 0]
        for key in (["bundle"] if docs_only else ["bundle", "native_linux_x64"]):
            asset = manifest["assets"][key]
            archive = stage / asset["file"]
            source = open(Path(cache_dir) / asset["file"], "rb") if cache_dir else open_https(asset["url"])
            with source, open(archive, "xb") as output:
                actual = read_to(source, output, ARCHIVE_LIMIT)
            require(actual == asset["sha256"], f"asset SHA-256 mismatch: {asset['file']}")
            target = payload
            if key == "native_linux_x64":
                target = payload / "native"
                require(not target.exists(), "bundle must not contain reserved native path")
                target.mkdir()
            extract(archive, target, budget)
        if os.name == "nt":
            # Windows rename refuses an existing destination atomically.
            os.rename(payload, dest)
        else:
            # Reserve exclusively so rename never replaces another destination.
            dest.mkdir(mode=0o700)
            reservation = dest.stat()
            os.replace(payload, dest)
            reservation = None
    finally:
        if reservation is not None:
            try:
                current = dest.stat()
                if (current.st_dev, current.st_ino) == (reservation.st_dev, reservation.st_ino):
                    dest.rmdir()
            except OSError:
                pass
        shutil.rmtree(stage)
    return manifest["release"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    if sys.version_info < (3, 11):
        parser.exit(1, "Python 3.11 or newer is required.\n")
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--sha256", required=True, help="independently trusted manifest SHA-256")
    parser.add_argument("--cache-dir", type=Path)
    parser.add_argument("--dest", required=True, type=Path)
    parser.add_argument("--docs-only", action="store_true", help="omit Linux native tools")
    args = parser.parse_args()
    try:
        release = install(args.manifest, args.sha256, args.dest, args.cache_dir, args.docs_only)
    except (InstallError, OSError, ValueError, EOFError, tarfile.TarError) as error:
        parser.exit(1, f"Mercury install failed: {error}\n")
    print(f"Installed Mercury {release} at {args.dest.absolute()}; no downloaded code was executed.")


if __name__ == "__main__":
    main()
