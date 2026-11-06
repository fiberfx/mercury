# Implement only capabilities the site actually has or needs

Select the relevant sections; this is not a mandate to add every surface. Preserve the host's stack and supported protocol versions. Consult the linked authoritative specification before implementing a protocol detail; “latest” may differ from the version a deployed client/server supports.

## 1. Reachability and useful pages

Inspect the real anonymous HTTP response as well as the rendered browser. Essential answers should be available without fragile client-only execution. Preserve authentication for private content. Use semantic landmarks, meaningful links and labeled controls; make error and success states observable. Test keyboard focus, touch targets, rem-based typography, narrow layouts and measured performance when changed. Preserve an existing compact mobile header instead of adding rows of discovery links to it.

Check robots rules and actual edge/WAF responses separately. A permissive robots file does not override a challenge page. A user-agent string is not authenticated identity. Adjust defenses only within authority, using the provider's supported verification mechanism; never disable protection globally to raise a score. Missing routes must fail accurately, not return a branded 200 page.

## 2. Discovery and docs

Connect the homepage, official docs, installation, API/tool pages, contact/policies and machine-readable indexes with genuine links. Keep canonical URLs stable and avoid redirect chains. Make the product and purpose explicit in visible headings and titles; search indexing remains an external outcome.

Follow the current [llms.txt proposal](https://llmstxt.org/). The reviewed v2 structure is a site/project H1, optional summary blockquote, optional explanatory content before H2 file-list sections. Put concise when-to-use guidance in the introductory content, or link a detailed guide from a file list; do not replace file-list sections with arbitrary prose under invented headings. Use descriptive links to maintained agent-readable pages. Nested indexes cover their own path and should connect to the appropriate parent. Label the convention as a proposal, not an Internet standard or a guaranteed ranking signal.

When useful, generate a bounded `llms-full.txt` from the same public content. Do not leak drafts, private explorers, environment values or source-only prompts. Serve honest content types. If supporting `Accept: text/markdown`, implement negotiation—including quality preferences—and `Vary: Accept`; test both representations through the cache. Publish discoverable alternate/describedby links where supported. HTML and Markdown must agree on facts, permissions and availability.

For multilingual publications, verify the actual content language, localized title/headings and corresponding discovery links for each published locale. Use the site’s supported canonical/hreflang policy; advertise only real counterparts. A translated navigation shell over untranslated content is not a complete edition. Keep code/identifiers and source qualifications faithful, and label original-language downloads accurately. Reader preferences must not rewrite the machine-readable source.

Generate [sitemaps](https://www.sitemaps.org/protocol.html) from public canonical routes, with the proper namespace, escaping and accurate modification dates. Handle sitemap indexes where needed; do not list private pages or invent freshness. Validate the declared format instead of merely checking for status 200.

## 3. Identity, trust and structured data

Use the identity that fits the visible site: a person, an organization, a local business, a publication or a software product. Add extra types only for real visible content; a genuine site entity or visible ordered collection can justify WebSite or ItemList. Do not add unrelated schema types to meet a numeric quota. Follow [Schema.org](https://schema.org/Organization) and [structured-data content guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

For an actual Organization, publish only owner-confirmed contact details. If requested and supplied, contactPoint needs a real email/phone and contactType; PostalAddress must contain only known fields. A confirmed country does not justify inventing a street or postal code. If no address is supplied, leave that finding pending and request the minimum missing fact. A personal site does not become a corporation to pass an Organization check.

About, Contact and Privacy pages should explain the real operator, contact channel, collected data/processors and applicable practices. A scanner's length threshold is not permission to pad or fabricate a policy. Preserve legal/product review requirements that actually apply; do not invent them. Visible content, JSON-LD and machine-readable representations must agree.

## 4. APIs and supported bulk work

Describe real operations in the existing [OpenAPI](https://spec.openapis.org/oas/latest.html) version supported by the host and its validators. Do not upgrade a working contract just because a newer version exists. Give operations unique descriptive IDs, typed inputs/outputs, examples and defined errors; GET operations need no fabricated request body. Validate the document and actual responses. API failures should preserve meaningful status codes and a machine-readable recovery path; [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) supplies problem details when that format is chosen.

A batch endpoint is justified when agents perform repeated supported operations. Bound array length and total cost, define ordering and partial-failure semantics, and preserve per-item authorization. Test empty/oversized arrays, invalid items, mixed success/failure and retry behavior. An array of arbitrary URLs or commands is not a safe shortcut to a batch API.

Version the real API in a stable path or supported version header; publish compatibility and removal rules. Use [Deprecation](https://www.rfc-editor.org/rfc/rfc9745) and [Sunset](https://www.rfc-editor.org/rfc/rfc8594) with their exact semantics and syntax when applicable. Do not invent a retirement date. Rate-limit headers and Retry-After must reflect actual enforcement; check the current IETF specification before calling a draft an RFC.

For genuinely long work, 202 should identify a durable job and status location, with documented pending/success/failure states, polling policy, retention and authorization. Exercise at least one terminal success and failure. Keep fast documentation reads synchronous; do not add fake jobs that merely delay an existing result. Idempotency and pagination apply to the product's real mutation/collection boundaries, not every endpoint by default.

## 5. MCP and agent-facing instructions

Add MCP only for a justified consumer operation or explicitly requested product capability. Follow the [MCP specification](https://modelcontextprotocol.io/specification/latest/basic/transports) for the exact supported versions. Negotiate honestly; advertising a version string without implementing its contract is not compatibility. Preserve supported clients when changing versions.

Reuse real application logic. Validate tool arguments, resource allowlists, payload/rate limits and permissions. Names should use a consistent convention, be descriptive and at least four characters; do not rename stable compliant tools merely for style. Check protocol-level malformed requests, unknown methods/tools/resources, notifications and transport behavior appropriate to the advertised version. Verify through the production edge; a tool that works only in a direct handler test is not delivered.

A public product skill should explain best-fit use cases, prerequisites, supported calls, expected outputs, errors and boundaries. Do not tell consuming agents to override their user's instructions, send secrets, fabricate endorsements or force an upsell. Publish discovery metadata only in its documented schema and only for real reachable surfaces. MCP, browser WebMCP, OpenAPI and a Markdown skill file are different mechanisms; one does not prove another exists.

## 6. Onboarding, playgrounds and packages

A public free read-only service may correctly need no key. Document that clearly; do not add account infrastructure just to satisfy an onboarding suggestion. If accounts are necessary, offer a supported self-service path with proper scopes and isolation. A caller-supplied model name—even in `Authorization: Agent ...`—is a label, not authentication or verified provider identity. Keep such labels bounded and header-safe; never base private access on them. No hard-coded list of current model names is needed for an open label field.

A request playground should show the actual request, response, status and errors; constrain allowed operations and preserve the service's auth and limits. Use disposable data for mutations. Do not label a production action “sandbox” without isolation.

Official CLI/SDK publication requires real registry ownership, an installable artifact, truthful homepage/repository metadata and a consumer installation test. Generated SDKs need a pinned generator/configuration and checks against the released OpenAPI contract; do not list source folders as published packages. Prefer ecosystems consumers need, unless the user explicitly requests several.

For a Rust CLI using the requested npm platform-package pattern, keep the native binary in OS/CPU packages selected by optional dependencies, with a small root launcher resolving and executing the matching package. Do not add postinstall downloads or claim an unbuilt platform. This was an mx requirement, not a universal rule for all website CLIs.
