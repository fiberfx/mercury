"""Parse the book's reviewed Markdown subset without executing embedded HTML."""
import hashlib
import json
import re
from pathlib import Path

SLUGS = ['character', 'mark', 'color', 'typography', 'rhythm', 'navigation', 'adaptation', 'governance', 'evidence']

def blocks(raw):
    result = []
    lines = raw.strip().splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [x.strip() for x in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+', x) for x in cells):
                    rows.append(cells)
                i += 1
            if not rows or any(len(row) != len(rows[0]) for row in rows):
                raise ValueError('Inconsistent Markdown table')
            result.append({'type': 'table', 'rows': rows})
            continue
        if line.startswith(('#', '<!--')):
            raise ValueError('Unexpected heading or directive in chapter body')
        parts = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith('|'):
            parts.append(lines[i].strip())
            i += 1
        result.append({'type': 'paragraph', 'text': ' '.join(parts)})
    return result

def parse(raw):
    parts = re.split(r'<!-- PAGE \d+: [^>]+ -->', raw)
    if len(parts) != 10:
        raise ValueError('Expected the nine numbered source chapters')
    chapters = []
    for index, part in enumerate(parts[1:]):
        match = re.match(r'\s*## (\d+)\. ([^\n]+)\n(.*)', part, re.S)
        if not match or int(match[1]) != index + 1:
            raise ValueError('Chapter order does not match the edition')
        chapters.append({'id': SLUGS[index], 'number': index + 1, 'title': match[2], 'blocks': blocks(match[3]), 'search': match[3]})
    return {'title': 'Mercury', 'subtitle': 'A practical brand book for the documentation interface',
            'edition': 'Interface edition 1.0 · 6 November 2026',
            'sourceSha256': hashlib.sha256(raw.encode()).hexdigest(), 'intro': parts[0],
            'scope': re.search(r'\*\*Scope\.\*\* ([^\n]+)', parts[0])[1], 'chapters': chapters}

if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('source', type=Path)
    ap.add_argument('out', type=Path)
    args = ap.parse_args()
    args.out.write_text(json.dumps(parse(args.source.read_text()), ensure_ascii=False, indent=2) + '\n')
