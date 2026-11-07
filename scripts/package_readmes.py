"""Publish each @fiberfx package's README here, at <package>/README.md, from one monorepo revision.

A published package's npm `homepage` points at github.com/fiberfx/mercury/tree/<branch>/<package>#readme, so
each package in fiberfx/scripts/packages.mjs's INVENTORY needs its directory here (the Operator, 7 Nov 2026:
"To resolve blockers add README to each package in public"). The README is the package's own
fiberfx/<package>/README.md, unchanged except for links that would be dead in this repository:

- a link to a sibling package (its directory or its README) stays relative;
- a link to the package's LICENSE or NOTICE.txt copies that file beside the README, so the license shown is
  the package's own, not this repository's;
- any other relative link (private specs, source files) keeps its text and loses its target.

Usage:
  python3 scripts/package_readmes.py write --monorepo <fiberfx checkout> --rev <commit>
  python3 scripts/package_readmes.py check
"""
import argparse
import posixpath
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINK = re.compile(r'(!?)\[([^\]]*)\]\(([^)\s]+)\)')
FENCE = re.compile(r'^\s*(```|~~~)')
COPYABLE = ('LICENSE', 'LICENSE.md', 'NOTICE.txt')
MARK = '<!-- Published by scripts/package_readmes.py from fiberfx/{package}/README.md at {rev}. Edit it there. -->\n'


def git(monorepo, *args):
    return subprocess.run(['git', '-C', monorepo, *args], check=True, capture_output=True).stdout


def inventory(monorepo, rev):
    source = git(monorepo, 'show', f'{rev}:fiberfx/scripts/packages.mjs').decode()
    block = re.search(r'export const INVENTORY\s*=\s*\[(.*?)\];', source, re.S)
    if not block:
        sys.exit('package_readmes: no INVENTORY in fiberfx/scripts/packages.mjs')
    names = re.findall(r'"@fiberfx/([a-z0-9_-]+)"', block.group(1))
    if not names:
        sys.exit('package_readmes: INVENTORY lists no @fiberfx package')
    return names


def rewrite(text, package, packages, copies):
    def link(match):
        bang, label, target = match.groups()
        if re.match(r'^(https?:|mailto:|#)', target):
            return match.group(0)
        path, _, fragment = target.partition('#')
        anchor = f'#{fragment}' if fragment else ''
        resolved = posixpath.normpath(posixpath.join(package, path))
        head = resolved.split('/')[0]
        if head in packages and head != package and resolved in (head, f'{head}/README.md'):
            return f'{bang}[{label}](../{resolved}{anchor})'
        if resolved in tuple(f'{package}/{name}' for name in COPYABLE):
            copies.add(posixpath.basename(resolved))
            return f'{bang}[{label}]({posixpath.basename(resolved)}{anchor})'
        return label
    lines, fenced = [], False
    for line in text.splitlines(keepends=True):
        if FENCE.match(line):
            fenced = not fenced
            lines.append(line)
        else:
            lines.append(line if fenced else LINK.sub(link, line))
    return ''.join(lines)


def write(monorepo, rev):
    rev = git(monorepo, 'rev-parse', '--verify', f'{rev}^{{commit}}').decode().strip()
    packages = inventory(monorepo, rev)
    for package in packages:
        readme = git(monorepo, 'show', f'{rev}:fiberfx/{package}/README.md').decode()
        copies = set()
        body = MARK.format(package=package, rev=rev) + rewrite(readme, package, set(packages), copies)
        target = ROOT / package
        target.mkdir(exist_ok=True)
        (target / 'README.md').write_text(body)
        for name in sorted(copies):
            (target / name).write_bytes(git(monorepo, 'show', f'{rev}:fiberfx/{package}/{name}'))
        print(f'{package}/README.md' + ''.join(f' {package}/{name}' for name in sorted(copies)))
    return packages


def check():
    failures, count = [], 0
    for readme in sorted(ROOT.glob('*/README.md')):
        text = readme.read_text()
        if not text.startswith('<!-- Published by scripts/package_readmes.py'):
            continue
        count += 1
        fenced = False
        for line in text.splitlines():
            if FENCE.match(line):
                fenced = not fenced
                continue
            if fenced:
                continue
            for _, _, target in LINK.findall(line):
                if re.match(r'^(https?:|mailto:|#)', target):
                    continue
                if not (readme.parent / target.partition('#')[0]).exists():
                    failures.append(f'{readme.relative_to(ROOT)}: dead link {target}')
    for failure in failures:
        print(failure)
    print(f'package_readmes: {count} package README(s), {len(failures)} dead relative link(s)')
    return 1 if failures or not count else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='mode', required=True)
    w = sub.add_parser('write')
    w.add_argument('--monorepo', required=True)
    w.add_argument('--rev', required=True)
    sub.add_parser('check')
    args = parser.parse_args()
    if args.mode == 'write':
        write(args.monorepo, args.rev)
        return check()
    return check()


if __name__ == '__main__':
    sys.exit(main())
