# Scanner evidence and freshness

Read this before interpreting a score. Recheck the official [developer docs](https://is-agentic.com/docs) and [methodology](https://is-agentic.com/methodology) at the time of use; the observations here were reviewed on 2026-11-06.

## Obtain the baseline

For an authorized public target, the documented CLI examples are:

```sh
npx is-agentic example.com --json > before.json
```

Confirm the official package and current options before execution; record the resolved package version for reproducibility. Use the existing project toolchain or the read-only report API if installing a CLI is unnecessary:

```sh
curl --fail-with-body --get \
  --data-urlencode 'url=https://example.com' \
  'https://is-agentic.com/api/v1/report' > before.json
```

The API reads stored results. The CLI also uses stored results; its documented behavior can start a scan when none exists. Neither a successful fetch nor a second invocation proves that the target was scanned again. Use the supported public scan/rescan workflow when new evidence is required. A private preview must not be submitted to a public service without authorization; inspect what a local audit tool uploads before using it with private or authenticated pages.

Retain the raw response without replacing it with your own score. Record canonical target, scan time, retrieval time, model/source, applicability, breakdown, remaining findings and relevant deployment revision/time. Report errors are evidence failures, not a score of zero. Handle documented failures: correct invalid input; initiate a supported scan if no stored report exists; honor Retry-After for throttling; bound temporary-error retries. Do not scrape private scanner endpoints or bypass cache controls.

## Interpret without gaming

The reviewed Is Agentic model allocates 80 points to essentials, 20 to recommendations and up to 5 bonus points, with the displayed total capped at 100. Applicable checks differ across surfaces. Keep the reported result; do not reconstruct it from rounded numbers or from a different Ora response shape. Site-type views and the site-type meta declaration select a presentation lens, not extra points.

A complete report may still be old. The reviewed methodology describes a possible six-hour Ora freshness cache. Compare the report timestamp to the verified release boundary, not just the time you fetched JSON. If the public scan remains cached, retain the implemented/tested/published states and label score verification pending. A failed rescan does not erase the last valid observation.

Search rank, indexing, public package registries and external profiles have their own delays and ownership. A source edit cannot prove any of them changed. Keep these dependencies out of a claim of directly implemented behavior.

## Offline triage helper

The bundled helper reads a saved **Is Agentic report API JSON**; it performs no requests or writes to the site:

```sh
python3 scripts/summarize_report.py before.json \
  --target https://example.com

python3 scripts/summarize_report.py after.json \
  --target https://example.com \
  --not-before 2026-11-06T12:00:00Z > after-summary.json
```

Supply the actual publication boundary, not the example date. The helper validates the known top-level shape, target and timestamp, keeps remaining findings at score 100, and flags stale/future evidence and unfamiliar classifications. It rejects raw Ora payloads instead of pretending their scores are interchangeable. Review unknown classifications manually. Sorting is an initial triage order, not a substitute for consumer value, cost or applicability judgment. `score_is_100` alone never establishes delivery.

Run its regression checks with `python3 -m unittest discover -s scripts -p 'test_*.py'`. The helper uses only Python's standard library. A schema change should produce a clear adapter update and test, not silent omission of evidence.
