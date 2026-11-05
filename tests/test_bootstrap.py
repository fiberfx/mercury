import hashlib
import importlib.util
import io
import json
import threading
import urllib.request
import urllib.error
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("bootstrap", Path(__file__).resolve().parents[1] / "agents/bootstrap.py")
bootstrap = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(bootstrap)


class BootstrapTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.dest = self.root / "installed"
        self.bundle = self.archive("bundle.tar.gz", [("site/index.html", b"Mercury", None)])
        self.native = self.archive("native.tar.gz", [("bin/mx", b"not executed", None)])
        self.write_manifest()

    def archive(self, name, members):
        path = self.root / name
        with tarfile.open(path, "w:gz") as archive:
            for name, body, kind in members:
                member = tarfile.TarInfo(name)
                member.mode = 0o755 if name == "bin/mx" else 0o644
                member.size = len(body)
                if kind:
                    member.type = kind
                    member.linkname = "../../outside"
                    member.size = 0
                archive.addfile(member, io.BytesIO(body) if not kind else None)
        return path

    def write_manifest(self):
        assets = {}
        for key, path in [("bundle", self.bundle), ("native_linux_x64", self.native)]:
            assets[key] = {"file": path.name,
                           "url": f"https://github.com/fiberfx/mercury/releases/download/v1/{path.name}",
                           "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
        self.manifest = self.root / "manifest.json"
        self.manifest.write_text(json.dumps({"schema_version": 1, "release": "v1", "assets": assets}))
        self.digest = hashlib.sha256(self.manifest.read_bytes()).hexdigest()

    def install(self, **kwargs):
        with patch.object(bootstrap, "check_native_platform"):
            return bootstrap.install(self.manifest.as_posix(), self.digest, self.dest, self.root, **kwargs)

    def assert_clean_failure(self):
        self.assertFalse(self.dest.exists())
        self.assertEqual(list(self.root.glob(".mercury-stage-*")), [])

    def test_valid_install_and_no_execution(self):
        self.assertEqual(self.install(), "v1")
        self.assertEqual((self.dest / "site/index.html").read_bytes(), b"Mercury")
        self.assertEqual((self.dest / "native/bin/mx").read_bytes(), b"not executed")
        self.assertEqual((self.dest / "native/bin/mx").stat().st_mode & 0o777, 0o755)

    def test_docs_only_does_not_require_native_platform(self):
        with patch.object(bootstrap, "check_native_platform", side_effect=AssertionError("must not run")):
            bootstrap.install(str(self.manifest), self.digest, self.dest, self.root, docs_only=True)
        self.assertFalse((self.dest / "native").exists())

    def test_manifest_hash_precedes_json(self):
        self.manifest.write_text("not JSON")
        with self.assertRaisesRegex(bootstrap.InstallError, "manifest SHA-256 mismatch"):
            self.install()
        self.assert_clean_failure()

    def test_wrong_asset_hash(self):
        self.bundle.write_bytes(b"corrupt")
        with self.assertRaisesRegex(bootstrap.InstallError, "asset SHA-256 mismatch"):
            self.install()
        self.assert_clean_failure()

    def test_unsafe_archive_members(self):
        for name, kind in [("../escape", None), ("/absolute", None),
                           ("link", tarfile.SYMTYPE), ("hard", tarfile.LNKTYPE),
                           ("device", tarfile.CHRTYPE)]:
            with self.subTest(name=name):
                self.archive(self.bundle.name, [(name, b"bad", kind)])
                self.write_manifest()
                with self.assertRaises(bootstrap.InstallError):
                    self.install()
                self.assert_clean_failure()
        self.assertFalse((self.root / "escape").exists())

    def test_duplicate_members(self):
        self.archive(self.bundle.name, [("file", b"a", None), ("file", b"b", None)])
        self.write_manifest()
        with self.assertRaisesRegex(bootstrap.InstallError, "duplicate"):
            self.install()
        self.assert_clean_failure()

    def test_unsafe_permissions(self):
        with tarfile.open(self.bundle, "w:gz") as archive:
            member = tarfile.TarInfo("unsafe")
            member.mode = 0o4777
            archive.addfile(member, io.BytesIO(b""))
        self.write_manifest()
        with self.assertRaisesRegex(bootstrap.InstallError, "unsafe archive permissions"):
            self.install()
        self.assert_clean_failure()

    def test_existing_destination_preserved(self):
        self.dest.mkdir()
        marker = self.dest / "keep"
        marker.write_text("original")
        with self.assertRaisesRegex(bootstrap.InstallError, "destination already exists"):
            self.install()
        self.assertEqual(marker.read_text(), "original")

    def test_expansion_limit(self):
        with patch.object(bootstrap, "EXPANDED_LIMIT", 2):
            with self.assertRaisesRegex(bootstrap.InstallError, "expanded archive"):
                self.install()
        self.assert_clean_failure()

    def test_native_platform_guard(self):
        with patch.object(bootstrap.platform, "system", return_value="Darwin"):
            with self.assertRaisesRegex(bootstrap.InstallError, "Linux x86_64"):
                bootstrap.check_native_platform()
        with patch.object(bootstrap.platform, "system", return_value="Linux"), \
             patch.object(bootstrap.platform, "machine", return_value="x86_64"), \
             patch.object(bootstrap.os, "confstr", return_value="glibc 2.38"):
            with self.assertRaisesRegex(bootstrap.InstallError, "glibc >= 2.39"):
                bootstrap.check_native_platform()

    def test_wrong_asset_origin(self):
        data = json.loads(self.manifest.read_text())
        data["assets"]["bundle"]["url"] = "https://evil.example/bundle.tar.gz"
        self.manifest.write_text(json.dumps(data))
        self.digest = hashlib.sha256(self.manifest.read_bytes()).hexdigest()
        with self.assertRaisesRegex(bootstrap.InstallError, "asset URL"):
            self.install()
        self.assert_clean_failure()


class ServingTests(unittest.TestCase):
    def test_mime_and_symlink_escape(self):
        spec = importlib.util.spec_from_file_location("serve", Path(__file__).resolve().parents[1] / "agents/serve.py")
        serve = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(serve)
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            root = base / "site"
            root.mkdir()
            (root / "guide.md").write_text("# Mercury")
            (base / "secret").write_text("private")
            (root / "escape").symlink_to(base / "secret")
            directory = root / "nested"
            directory.mkdir()
            (directory / "index.html").symlink_to(base / "secret")
            server = ThreadingHTTPServer(("127.0.0.1", 0), partial(serve.Handler, directory=str(root)))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                origin = f"http://127.0.0.1:{server.server_port}"
                with urllib.request.urlopen(origin + "/guide.md", timeout=5) as response:
                    self.assertEqual(response.headers.get_content_type(), "text/markdown")
                    self.assertEqual(response.read(), b"# Mercury")
                for path in ("/escape", "/nested/"):
                    with self.assertRaises(urllib.error.HTTPError) as error:
                        urllib.request.urlopen(origin + path, timeout=5)
                    self.assertEqual(error.exception.code, 403)
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=5)


if __name__ == "__main__":
    unittest.main()
