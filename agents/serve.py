#!/usr/bin/env python3
"""Serve a Mercury site locally with Python 3.11+; no package installation needed."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".md": "text/markdown; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".wasm": "application/wasm",
    }

    def translate_path(self, path):
        candidate = Path(super().translate_path(path)).resolve()
        root = Path(self.directory).resolve()
        if not candidate.is_relative_to(root):
            raise PermissionError("path outside serving root")
        return str(candidate)

    def send_head(self):
        try:
            candidate = Path(self.translate_path(self.path))
            if candidate.is_dir():
                for name in ("index.html", "index.htm"):
                    index = candidate / name
                    if index.exists() and not index.resolve().is_relative_to(Path(self.directory).resolve()):
                        raise PermissionError("index outside serving root")
            return super().send_head()
        except (PermissionError, RuntimeError):
            self.send_error(403, "Path is outside the serving root")
            return None

    def list_directory(self, path):
        self.send_error(404, "No index page")
        return None

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("site"))
    parser.add_argument("--bind", default="127.0.0.1", help="use 0.0.0.0 explicitly for Docker")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    root = args.root.resolve(strict=True)
    if not root.is_dir():
        parser.error("--root must be a directory")
    with ThreadingHTTPServer((args.bind, args.port), partial(Handler, directory=str(root))) as server:
        print(f"Serving {root} at http://{args.bind}:{server.server_port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
