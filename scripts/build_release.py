#!/usr/bin/env python3
"""Assemble a reproducible agent bundle and a release manifest; never publishes."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import re
import shutil
import tarfile

ROOT = Path(__file__).resolve().parents[1]
OWNERS = ('site', 'docs', 'agents', 'skills', 'playgrounds', 'examples', 'LICENSE', 'NOTICE.txt')

def sha(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--native-archive', required=True, type=Path)
    parser.add_argument('--native-sha256', required=True)
    parser.add_argument('--prepared-starter', required=True, type=Path,
                        help='Verified Node-free consumer directory, including its installed .mx store')
    parser.add_argument('--tag', required=True)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,199}', args.tag):
        parser.error('invalid release tag')
    if sha(args.native_archive) != args.native_sha256:
        parser.error('native archive SHA-256 mismatch')
    if not (args.prepared_starter / '.mx').is_dir():
        parser.error('prepared starter needs its verified installed .mx store')
    for name in ('mx.mod', 'mx.sum'):
        if (args.prepared_starter / name).read_bytes() != (ROOT / 'examples/first-page' / name).read_bytes():
            parser.error(f'prepared starter {name} differs from the public example')
    if args.out.exists():
        parser.error('output directory already exists')
    args.out.mkdir(parents=True)
    files = {}
    for owner in OWNERS:
        origin = ROOT / owner
        if not origin.exists():
            continue
        paths = origin.rglob('*') if origin.is_dir() else [origin]
        for path in paths:
            if path.is_symlink():
                raise ValueError(f'symlink not distributable: {path}')
            if path.is_file() and '__pycache__' not in path.parts:
                files[path.relative_to(ROOT).as_posix()] = path
    for path in args.prepared_starter.rglob('*'):
        if path.is_symlink():
            raise ValueError(f'prepared starter contains symlink: {path}')
        if path.is_file():
            files['examples/first-page/' + path.relative_to(args.prepared_starter).as_posix()] = path
    bundle = args.out / 'mercury-agent-bundle.tar.gz'
    with bundle.open('wb') as raw, gzip.GzipFile(filename='', fileobj=raw, mode='wb', mtime=0) as gz:
        with tarfile.open(fileobj=gz, mode='w', format=tarfile.USTAR_FORMAT) as tar:
            for name, path in sorted(files.items()):
                info = tar.gettarinfo(str(path), arcname=name)
                info.uid = info.gid = info.mtime = 0
                info.uname = info.gname = ''
                info.mode = 0o755 if path.stat().st_mode & 0o111 else 0o644
                with path.open('rb') as stream:
                    tar.addfile(info, stream)
    native = args.out / 'mx-linux-x86_64.tar.gz'
    shutil.copyfile(args.native_archive, native)
    assets = {}
    for key, path in [('bundle', bundle), ('native_linux_x64', native)]:
        assets[key] = {'file': path.name, 'sha256': sha(path),
                       'url': f'https://github.com/fiberfx/mercury/releases/download/{args.tag}/{path.name}'}
    manifest = {'schema_version': 1, 'release': args.tag, 'assets': assets,
                'provenance': json.loads((ROOT / 'release/provenance.json').read_text())}
    release = args.out / 'release.json'
    release.write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
    (args.out / 'SHA256SUMS').write_text(''.join(f'{sha(p)}  {p.name}\n' for p in [release, bundle, native]))
    print(json.dumps({'manifest_sha256': sha(release), 'files': len(files), 'output': str(args.out)}, indent=2))

if __name__ == '__main__':
    main()
