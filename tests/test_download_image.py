import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

AGENTS = Path(__file__).resolve().parents[1] / "agents"
sys.path.insert(0, str(AGENTS))
import download_image


class ImageDownloadTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.output = self.root / "verified.tar.gz"
        self.archive = self.root / download_image.IMAGE_FILE
        self.archive.write_bytes(b"image archive bytes; never executed")
        self.image_id = "sha256:" + "a" * 64
        assets = {}
        for key, filename in [("bundle", "bundle.tar.gz"), ("native_linux_x64", "native.tar.gz"),
                              ("image_linux_x64", download_image.IMAGE_FILE)]:
            assets[key] = {"file": filename,
                           "url": f"https://github.com/fiberfx/mercury/releases/download/v1/{filename}",
                           "sha256": hashlib.sha256(self.archive.read_bytes()).hexdigest()}
        assets["image_linux_x64"]["image_id"] = self.image_id
        self.data = {"schema_version": 1, "release": "v1", "assets": assets}
        self.manifest = self.root / "manifest.json"
        self.write_manifest()

    def write_manifest(self):
        self.manifest.write_text(json.dumps(self.data))
        self.pinned = hashlib.sha256(self.manifest.read_bytes()).hexdigest()

    def download(self):
        return download_image.download(str(self.manifest), self.pinned, self.output, self.root)

    def assert_no_partial(self):
        self.assertFalse(self.output.exists())
        self.assertEqual(list(self.root.glob(".mercury-image-*")), [])

    def test_verified_image_download(self):
        self.assertEqual(self.download(), self.image_id)
        self.assertEqual(self.output.read_bytes(), self.archive.read_bytes())
        self.assertEqual(list(self.root.glob(".mercury-image-*")), [])

    def test_corrupt_archive_refused(self):
        self.archive.write_bytes(b"corrupted")
        with self.assertRaisesRegex(download_image.InstallError, "SHA-256 mismatch"):
            self.download()
        self.assert_no_partial()

    def test_preexisting_output_preserved(self):
        self.output.write_bytes(b"original")
        with self.assertRaisesRegex(download_image.InstallError, "already exists"):
            self.download()
        self.assertEqual(self.output.read_bytes(), b"original")

    def test_wrong_manifest_pin(self):
        self.pinned = "0" * 64
        with self.assertRaisesRegex(download_image.InstallError, "manifest SHA-256 mismatch"):
            self.download()
        self.assert_no_partial()

    def test_invalid_asset_metadata(self):
        original = dict(self.data["assets"]["image_linux_x64"])
        for field, value in [("file", "../escape"), ("url", "https://evil.example/image"),
                             ("sha256", "bad"), ("image_id", "sha256:bad")]:
            with self.subTest(field=field):
                self.data["assets"]["image_linux_x64"] = {**original, field: value}
                self.write_manifest()
                with self.assertRaises(download_image.InstallError):
                    self.download()
                self.assert_no_partial()

    def test_size_limit(self):
        with patch.object(download_image, "IMAGE_LIMIT", 2):
            with self.assertRaisesRegex(download_image.InstallError, "size limit"):
                self.download()
        self.assert_no_partial()

    def test_racing_destination_not_overwritten(self):
        original_link = download_image.os.link
        def raced_link(source, target):
            Path(target).write_bytes(b"other writer")
            original_link(source, target)
        with patch.object(download_image.os, "link", side_effect=raced_link):
            with self.assertRaises(FileExistsError):
                self.download()
        self.assertEqual(self.output.read_bytes(), b"other writer")
        self.assertEqual(list(self.root.glob(".mercury-image-*")), [])


if __name__ == "__main__":
    unittest.main()
