# Verification, crawling and publication

Keep direct product evidence separate from scanner evidence. A source test, built artifact, running candidate, public deployment and newly completed external report establish different facts.

## Recursive crawl and sitemap reconciliation

Use this traversal for a comprehensive audit or when discovery/navigation changes. For a narrow unrelated correction, reuse relevant existing evidence with its original scope and timestamp, and check only affected links. Use an existing trusted crawler when available. Otherwise build a bounded traversal rather than an unbounded URL generator:

1. Seed with the canonical root, linked documentation indexes and sitemap (including sitemap indexes). Record the chosen public origin/path scope, maximum pages/depth/bytes, concurrency and timeout. Follow the owner's crawl and rate limits; do not submit forms or traverse state-changing links.
2. Normalize URLs without erasing meaningful query parameters or case-sensitive paths. Record redirect chains and final destinations. Deduplicate fetches; validate fragments against the target document separately. Do not cross a new origin or private/address boundary silently after a redirect.
3. Extract internal HTML, Markdown and discovery-file links. Keep nodes with requested/final URL, status, media type and relevant canonical/heading information; edges retain source, target, link kind and fragment. Queue newly discovered in-scope URLs until exhausted or a declared budget is reached.
4. Compare graph reachability with sitemap entries and the source route inventory when available. Identify broken links, unresolved fragments, redirect loops, sitemap-only pages and public routes with no incoming path. A link status of 200 is insufficient if it is a soft error or wrong representation.
5. Export the graph in a machine-readable form plus a compact summary; DOT/Mermaid is optional. Set `complete: false` and record unexplored nodes when capped, timed out or blocked. “No broken links in 200 sampled pages” is not “the whole site has no broken links.”

Do not add every possible query variant or crawl external sites recursively. Avoid sensitive URLs in public evidence. A count of links is not proof that the primary agent journey works.

## Verification matrix

Choose rows affected by the change; do not run unrelated suites as ceremony.

| Boundary | Positive evidence | Relevant violating case |
| --- | --- | --- |
| Content/discovery | Linked canonical page and machine variant agree | Missing page, bad link/fragment, wrong media type, private route |
| Negotiation/cache | HTML and Markdown requests return their intended bodies with correct Vary | Mixed Accept preferences and sequential requests through the cache |
| Structured data | Parser/validator accepts real visible facts | Missing required field or fixture with a mismatched visible value |
| API | Schema-valid success from a real operation | Invalid body/argument, unknown route, unsupported method, enforced limits |
| Batch | Ordered real per-item results | Oversized array, partial failure, unauthorized item where relevant |
| MCP | A compatible client connects and completes the intended read/action | Malformed protocol message, unknown tool/resource, incompatible negotiation |
| Job API | 202 identifies a real job that reaches a terminal state | Failure/unknown job, inappropriate access, expired result |
| UI/playground | Real control edits or requests change the actual result | Blank/invalid input, error recovery, keyboard and narrow layout |
| Distribution | Public install resolves the expected artifact/version | Unsupported platform, integrity mismatch, unavailable package |

Use version-matched validators and retain their versions. Do not replace an expectation just to make a test pass. A screenshot proves appearance, not API behavior; an API response does not prove navigation or focus.

## Deploy the reviewed candidate

- Use the project's required stand and build/release mechanism. Mercury's win-120, Rust edge, Elixir runtime, branch and Fly application are case-specific, not portable requirements.
- Record exact source revision, artifact identity, relevant checks and a recovery path. Exercise the deployable artifact through a representative edge/router in the supported preview or stand where available. Confirm compiled resources, generated files, migrations and route precedence where affected. Record which assertions require the production environment and verify those after an authorized release; do not claim preview evidence proves production behavior.
- Stage/commit only owned changes; preserve the existing dirty tree. Reuse deployment authority for its actual destination and scope. Do not turn permission for one branch/provider into permission to publish elsewhere.
- After an authorized release, confirm provider completion and public endpoint behavior. A push or successful build alone is insufficient. Verify machine files, live headers, schema responses and intentionally excluded private routes. Spot-check the human experience.
- Request one supported rescan, then read the completed report. Compare its timestamp and target to the deployment. If external caching prevents a fresh observation, state “published; score verification pending” and retain the last valid score as a dated baseline.

## Concise delivery record

Keep this with the existing work item or artifact, not in a new per-phase bureaucracy:

- scope/consumer value and exact candidate or release;
- changed files and granular commits;
- valid/invalid checks, environment and evidence paths;
- baseline and final score, source/model, target and scan times;
- whether a fresh post-release 100 was observed;
- remaining optional issues, external dependencies and owner decisions;
- temporary resources cleaned and services/artifacts intentionally retained.

Report **Delivered** only for the promised verified scope. Search indexing, registry credentials, real business identity and unresolved authorization require explicit limits and a next action. A checklist checkmark, reported score and acceptance decision are separate states.
