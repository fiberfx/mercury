"""Check the README of each published @fiberfx package directory in this repository.

`python3 scripts/package_readmes.py check` exits 1 when any package README is missing or contains:

- a generator marker comment (`<!-- Published by`);
- a relative link or image whose target does not exist in this repository;
- a link whose target contains `/specs/` or `../../`;
- a delivery-ledger pattern: a decision-maker reference, a participant name or a KAN-style id.

Links inside fenced code blocks are not checked. The script holds its own source to the same ledger
rule. It exits 0 when every README passes.
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKAGES = (
    'hyperscript', 'core', 'hypergraph', 'live-mercury', 'phoenix', 'phoenix_live_view', 'reflect',
    'render-to-string', 'schema', 'testing', 'ui', 'analytics', 'cms', 'content', 'devtools', 'vite-plugin-mhs',
    'mercury', 'mx',
)
LINK = re.compile(r'!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
FENCE = re.compile(r'^\s*(```|~~~)')
EXTERNAL = re.compile(r'^(https?:|mailto:|#)')
MARKER = '<!-- Published by'
LEDGER = re.compile(
    r'the [O]perator'
    r'|\b(CRS|AGT|KAN|SES|JOB)0[A-Za-z0-9]{10}\b'
    r'|\b(mx-(cto|coach|mercury|server|integration|trafikist|lsap-s[q]uad|idiomatic-squad|workspace-tasks)'
    r'|m5-(integration|hypercompiler|trafikist|edu)'
    r'|mercury-(designer|ias|lms|web|craft-lead|craft-delivery|craft-model)'
    r'|kan-(squad|consultant)|kanos-(squad|integration)|lsap-(squad|researcher)'
    r'|fiber-r[e]searcher|fiberfx-s[q]uad|fly-s[q]uad|vivaldi-s[q]uad|integration-s[q]uad)\b'
)


def check_readme(package):
    readme = ROOT / package / 'README.md'
    name = f'{package}/README.md'
    if not readme.is_file():
        return [f'{name}: missing']
    failures = []
    fenced = False
    for number, line in enumerate(readme.read_text().splitlines(), 1):
        where = f'{name}:{number}'
        if MARKER in line:
            failures.append(f'{where}: generator marker')
        match = LEDGER.search(line)
        if match:
            failures.append(f'{where}: ledger pattern {match.group(0)!r}')
        if FENCE.match(line):
            fenced = not fenced
            continue
        if fenced:
            continue
        for target in LINK.findall(line):
            if '/specs/' in target or '../../' in target:
                failures.append(f'{where}: private link {target}')
                continue
            if EXTERNAL.match(target):
                continue
            path = target.partition('#')[0]
            if not (readme.parent / path).exists():
                failures.append(f'{where}: dead link {target}')
    return failures


def check():
    failures = [failure for package in PACKAGES for failure in check_readme(package)]
    for number, line in enumerate(Path(__file__).read_text().splitlines(), 1):
        match = LEDGER.search(line)
        if match:
            failures.append(f'scripts/package_readmes.py:{number}: ledger pattern {match.group(0)!r}')
    for failure in failures:
        print(failure)
    print(f'package_readmes: {len(PACKAGES)} package README(s), {len(failures)} finding(s)')
    return 1 if failures else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='mode', required=True)
    sub.add_parser('check')
    parser.parse_args()
    return check()


if __name__ == '__main__':
    sys.exit(main())
