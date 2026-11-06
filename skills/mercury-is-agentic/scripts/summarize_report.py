#!/usr/bin/env python3
"""Summarize saved Is Agentic report JSON without rescoring or network access."""
import argparse
from datetime import datetime, timedelta, timezone
import json
import math
from pathlib import Path
import sys
from urllib.parse import urlsplit, urlunsplit


class ReportError(ValueError):
    pass


def timestamp(value):
    if not isinstance(value, str):
        raise ReportError('A timezone-qualified ISO timestamp is required')
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError as error:
        raise ReportError('Invalid ISO timestamp: ' + value) from error
    if parsed.tzinfo is None:
        raise ReportError('Timestamp must include a timezone: ' + value)
    return parsed.astimezone(timezone.utc)


def canonical_target(value):
    if not isinstance(value, str):
        raise ReportError('Target must be an HTTP(S) URL')
    try:
        parts = urlsplit(value)
        port = parts.port
    except ValueError as error:
        raise ReportError('Invalid target URL') from error
    if parts.scheme not in ('http', 'https') or not parts.hostname or parts.username is not None or parts.password is not None or parts.fragment:
        raise ReportError('Use an absolute HTTP(S) target without credentials or a fragment')
    host = parts.hostname.lower()
    if ':' in host:
        host = '[' + host + ']'
    if port is not None and port != (443 if parts.scheme == 'https' else 80):
        host += ':' + str(port)
    return urlunsplit((parts.scheme, host, parts.path or '/', parts.query, ''))


def summarize(report, expected_target=None, not_before=None, now=None):
    if not isinstance(report, dict) or not {'target', 'score', 'scanned_at', 'issues'}.issubset(report):
        raise ReportError('Expected saved Is Agentic report API JSON with target, score, scanned_at and issues; raw Ora reports use a different contract')
    target = canonical_target(report['target'])
    if expected_target is not None and target != canonical_target(expected_target):
        raise ReportError('Report target does not match the requested target')
    score = report['score']
    if isinstance(score, bool) or not isinstance(score, (int, float)) or not math.isfinite(score) or not 0 <= score <= 100:
        raise ReportError('score must be a finite number from 0 to 100')
    scanned = timestamp(report['scanned_at'])
    boundary = timestamp(not_before) if not_before is not None else None
    clock = now or datetime.now(timezone.utc)
    if scanned > clock + timedelta(minutes=5):
        freshness = 'future_timestamp'
    elif boundary is None:
        freshness = 'not_checked'
    elif scanned < boundary:
        freshness = 'before_boundary'
    else:
        freshness = 'after_boundary'
    if not isinstance(report['issues'], list):
        raise ReportError('issues must be an array; missing evidence is not an empty issue list')
    tier_rank = {'essential': 0, 'required': 0, 'recommended': 1, 'bonus': 2}
    status_rank = {'failed': 0, 'fail': 0, 'partial': 1, 'warning': 1, 'not_measured': 2, 'passed': 3, 'pass': 3, 'not_applicable': 4}
    unknown = []
    rows = []
    remaining = 0
    for index, issue in enumerate(report['issues']):
        if not isinstance(issue, dict) or any(not isinstance(issue.get(key), str) or not issue[key].strip() for key in ('id', 'name', 'tier', 'result')):
            raise ReportError(f'Issue {index} needs nonempty id, name, tier and result strings')
        tier = issue['tier'].strip().lower()
        status = issue['result'].strip().lower().replace('-', '_').replace(' ', '_')
        unfamiliar = tier not in tier_rank or status not in status_rank
        if unfamiliar:
            unknown.append({'id': issue['id'], 'tier': issue['tier'], 'result': issue['result']})
        if status not in ('pass', 'passed', 'not_applicable'):
            remaining += 1
        # Unknown classifications stay visible for review; do not infer pass/N/A.
        key = (-1 if unfamiliar else tier_rank[tier], status_rank.get(status, -1), index)
        rows.append((key, issue))
    return {
        'target': target,
        'scanned_at': report['scanned_at'],
        'score': score,
        'score_is_100': score == 100,
        'freshness': freshness,
        'not_before': not_before,
        'score_breakdown': report.get('score_breakdown'),
        'remaining_issue_count': remaining,
        'unknown_classifications': unknown,
        'issues_by_priority': [issue for _, issue in sorted(rows, key=lambda row: row[0])],
        'completion': 'not_assessed',
        'next_check': 'Confirm the published revision, direct behavior checks, applicability and report freshness before claiming delivery.',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('report', type=Path)
    parser.add_argument('--target', help='Expected canonical public HTTP(S) URL')
    parser.add_argument('--not-before', help='Verified publication boundary as an ISO timestamp')
    args = parser.parse_args()
    try:
        report = json.loads(args.report.read_text(encoding='utf-8'))
        result = summarize(report, args.target, args.not_before)
    except (OSError, json.JSONDecodeError, ReportError) as error:
        print(json.dumps({'error': str(error)}), file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
