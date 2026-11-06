"""Parse the book's reviewed Markdown subset without executing embedded HTML."""
from collections import Counter
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

def parse(raw, language="en"):
    if language not in ("en", "ru"):
        raise ValueError("Unsupported book language: " + language)
    parts = re.split(r'<!-- PAGE \d+: [^>]+ -->', raw)
    if len(parts) != 10:
        raise ValueError('Expected the nine numbered source chapters')
    chapters = []
    for index, part in enumerate(parts[1:]):
        match = re.match(r'\s*## (\d+)\. ([^\n]+)\n(.*)', part, re.S)
        if not match or int(match[1]) != index + 1:
            raise ValueError('Chapter order does not match the edition')
        chapters.append({'id': SLUGS[index], 'number': index + 1, 'title': match[2], 'blocks': blocks(match[3]), 'search': match[3]})
    preamble = parts[0].strip().splitlines()
    title = re.search(r'^# ([^\n]+)', parts[0], re.M)
    subtitle = re.search(r'^## ([^\n]+)', parts[0], re.M)
    scope_label = 'Scope' if language == 'en' else 'Область применения'
    scope = re.search(r'\*\*' + re.escape(scope_label) + r'\.\*\* ([^\n]+)', parts[0])
    edition = next((line.strip() for line in preamble if line.strip() and not line.startswith(('#', '**'))), '')
    if not title or not subtitle or not scope or not edition:
        raise ValueError('Missing localized title, subtitle, edition or scope')
    return {'language': language, 'title': title[1], 'subtitle': subtitle[1], 'edition': edition,
            'sourceSha256': hashlib.sha256(raw.encode()).hexdigest(), 'intro': parts[0],
            'scope': scope[1], 'chapters': chapters}

def bilingual(english, russian):
    books = {'en': parse(english, 'en'), 'ru': parse(russian, 'ru')}
    for left, right in zip(books['en']['chapters'], books['ru']['chapters']):
        if [b['type'] for b in left['blocks']] != [b['type'] for b in right['blocks']]:
            raise ValueError('Translated chapter structure differs: ' + left['id'])
        for a, b in zip(left['blocks'], right['blocks']):
            if a['type'] == 'table' and [len(r) for r in a['rows']] != [len(r) for r in b['rows']]:
                raise ValueError('Translated table dimensions differ: ' + left['id'])
    for pattern, label in [(r'\]\((https://[^)]+)\)', 'reference URLs'), (r'`([^`]+)`', 'code identifiers')]:
        if Counter(re.findall(pattern, english)) != Counter(re.findall(pattern, russian)):
            raise ValueError('Translated ' + label + ' differ from the source')
    return books

if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('source', type=Path)
    ap.add_argument('out', type=Path)
    ap.add_argument('--language', choices=['en', 'ru'], default='en')
    args = ap.parse_args()
    args.out.write_text(json.dumps(parse(args.source.read_text(), args.language), ensure_ascii=False, indent=2) + '\n')
