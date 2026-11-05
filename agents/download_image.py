#!/usr/bin/env python3
"""Download a pinned Mercury Docker image archive without executing Docker."""
import argparse
import os
from pathlib import Path
import re
import shlex
import tempfile

from bootstrap import InstallError, load_manifest, release_url, read_to, open_https

IMAGE_FILE = "mercury-agent-linux-x64.docker.tar.gz"
IMAGE_LIMIT = 1024 * 1024 * 1024
HEX = re.compile(r"[0-9a-f]{64}\Z")


def download(manifest_source, pinned_hash, output, cache_dir=None):
    output = Path(output).absolute()
    if os.path.lexists(output):
        raise InstallError("output already exists")
    manifest = load_manifest(manifest_source, pinned_hash)
    asset = manifest["assets"].get("image_linux_x64")
    if not isinstance(asset, dict) or asset.get("file") != IMAGE_FILE:
        raise InstallError(f"image asset must name {IMAGE_FILE}")
    release_url(asset.get("url"), manifest["release"], IMAGE_FILE)
    checksum = asset.get("sha256")
    if not isinstance(checksum, str) or not HEX.fullmatch(checksum):
        raise InstallError("invalid image archive SHA-256")
    image_id = asset.get("image_id")
    if not isinstance(image_id, str) or not image_id.startswith("sha256:") or not HEX.fullmatch(image_id[7:]):
        raise InstallError("invalid Docker image ID")
    if not output.parent.is_dir():
        raise InstallError("output parent must exist")
    temporary = None
    try:
        # Stage on the destination filesystem so hard-link publication is atomic.
        with tempfile.NamedTemporaryFile(prefix=".mercury-image-", dir=output.parent, delete=False) as staged:
            temporary = Path(staged.name)
            source = open(Path(cache_dir) / IMAGE_FILE, "rb") if cache_dir else open_https(asset["url"])
            with source:
                actual = read_to(source, staged, IMAGE_LIMIT)
            if actual != checksum:
                raise InstallError("image archive SHA-256 mismatch")
            staged.flush()
            os.fsync(staged.fileno())
        # link() fails if any destination already exists, including a symlink.
        # No fallback to a copying write: unsupported filesystems fail safely.
        os.link(temporary, output)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return image_id


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--sha256", required=True, help="independently trusted manifest SHA-256")
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--cache-dir", type=Path)
    args = parser.parse_args()
    try:
        image_id = download(args.manifest, args.sha256, args.output, args.cache_dir)
    except (InstallError, OSError, ValueError) as error:
        parser.exit(1, f"Mercury image download failed: {error}\n")
    print(f"Verified archive: {args.output.absolute()}")
    print(f"Next step (not executed): docker load --input {shlex.quote(str(args.output.absolute()))}")
    print(f"Expected Docker image ID after load: {image_id}")
    print("The image ID is trusted manifest data; this downloader has not loaded or inspected the image.")


if __name__ == "__main__":
    main()
