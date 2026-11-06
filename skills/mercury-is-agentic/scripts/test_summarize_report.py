import copy
from datetime import datetime, timezone
import unittest
from summarize_report import ReportError, summarize

NOW = datetime(2026, 11, 6, 14, tzinfo=timezone.utc)

def report():
    return {'target': 'https://example.com', 'score': 100, 'scanned_at': '2026-11-06T12:00:00Z', 'issues': [
        {'id': 'search', 'name': 'Search', 'tier': 'recommended', 'result': 'failed'},
        {'id': 'address', 'name': 'Address', 'tier': 'recommended', 'result': 'partial'},
        {'id': 'access', 'name': 'Access', 'tier': 'essential', 'result': 'failed'},
    ], 'score_breakdown': {'essential': {'earned': 80}, 'recommended': {'earned': 15.9}, 'bonus': {'points': 5}}}

class ReportTests(unittest.TestCase):
    def summarize(self, data, **kwargs):
        return summarize(data, now=NOW, **kwargs)

    def test_capped_100_keeps_failures_and_does_not_claim_delivery(self):
        result = self.summarize(report())
        self.assertTrue(result['score_is_100'])
        self.assertEqual(result['remaining_issue_count'], 3)
        self.assertEqual(result['completion'], 'not_assessed')
        self.assertEqual(result['freshness'], 'not_checked')

    def test_initial_triage_essential_then_failure_then_partial(self):
        self.assertEqual([x['id'] for x in self.summarize(report())['issues_by_priority']], ['access', 'search', 'address'])

    def test_freshness_uses_scan_time_not_retrieval_time(self):
        self.assertEqual(self.summarize(report(), not_before='2026-11-06T12:01:00Z')['freshness'], 'before_boundary')
        self.assertEqual(self.summarize(report(), not_before='2026-11-06T14:59:00+03:00')['freshness'], 'after_boundary')

    def test_future_timestamp_is_not_fresh_proof(self):
        data = report(); data['scanned_at'] = '2026-11-06T15:00:00Z'
        self.assertEqual(self.summarize(data, not_before='2026-11-06T12:00:00Z')['freshness'], 'future_timestamp')

    def test_target_preserves_path_query_and_scheme(self):
        self.summarize(report(), expected_target='https://EXAMPLE.com:443/')
        for target in ['http://example.com', 'https://example.com/docs', 'https://other.example', 'https://example.com/?x=1']:
            with self.assertRaises(ReportError): self.summarize(report(), expected_target=target)

    def test_credentials_and_fragments_are_rejected(self):
        for url in ['https://u:p@example.com', 'https://example.com/#secret', 'file:///tmp/report']:
            data = report(); data['target'] = url
            with self.assertRaises(ReportError): self.summarize(data)

    def test_not_measured_is_not_not_applicable(self):
        data = report(); data['issues'] = [
            {'id':'a','name':'A','tier':'recommended','result':'not measured'},
            {'id':'b','name':'B','tier':'recommended','result':'not applicable'}]
        result = self.summarize(data)
        self.assertEqual(result['remaining_issue_count'], 1)
        self.assertEqual(len(result['issues_by_priority']), 2)

    def test_unknown_classifications_are_retained_for_review(self):
        data = report(); data['issues'].append({'id':'x','name':'X','tier':'new tier','result':'inconclusive'})
        result = self.summarize(data)
        self.assertEqual(result['unknown_classifications'][0]['id'], 'x')
        self.assertEqual(result['issues_by_priority'][0]['id'], 'x')
        self.assertEqual(result['remaining_issue_count'], 4)

    def test_bad_scores_timestamps_and_shapes_fail_closed(self):
        for value in [True, -1, 101, float('nan'), '100']:
            data = report(); data['score'] = value
            with self.assertRaises(ReportError): self.summarize(data)
        for value in ['2026-11-06T12:00:00', 'not a date', None]:
            data = report(); data['scanned_at'] = value
            with self.assertRaises(ReportError): self.summarize(data)
        for data in [{'score':100, 'url':'https://example.com', 'layers':[]}, {}, []]:
            with self.assertRaises(ReportError): self.summarize(data)
        data = report(); data['issues'] = None
        with self.assertRaises(ReportError): self.summarize(data)
        data = report(); del data['issues'][0]['result']
        with self.assertRaises(ReportError): self.summarize(data)

    def test_invalid_freshness_boundary_is_rejected_even_for_future_reports(self):
        for scan in ['2026-11-06T12:00:00Z', '2026-11-06T15:00:00Z']:
            data = report(); data['scanned_at'] = scan
            with self.assertRaises(ReportError): self.summarize(data, not_before='not a timestamp')

    def test_input_and_duplicate_evidence_are_preserved(self):
        data = report(); data['issues'].append(copy.deepcopy(data['issues'][0])); before = copy.deepcopy(data)
        self.assertEqual(len(self.summarize(data)['issues_by_priority']), 4)
        self.assertEqual(data, before)

if __name__ == '__main__':
    unittest.main()
