# Build routes and delivery boundaries

## Existing application or native starter

Use the working route first. Read `package.json`, `mx.mod`, `mx.sum`, workspace configuration, and repository build instructions where present. Run the actual binary's `--version` and inspect help when commands differ from examples. Keep coherent dependency versions and checksum pins; preserve the host's resolver and runtime conventions.

The distributed native starter uses `mx install`, `mx verify`, `mx dev`, and `mx build`, with built output in `dist/`. Recheck the starter and CLI before copying commands. Do not regenerate a working lockfile or disable verification merely to bypass a resolution failure.

For a source-workspace build, discover real module directories rather than assuming a distribution repository includes `ui/`, `hyperscript/`, or a compiler. Compute local replacement paths from the app root. An observed isolated `mx 0.1.0` build used `MXWORK=off mx build --bundle --root . --out <output-directory>`; that is a version-specific recipe, not a universal replacement for the host workflow.

Some compiler versions emitted additional runtime imports such as `@fiberfx/effector/compiler`. Inspect the actual output and dependency graph before adding dependencies. Resolve a required import to its real compatible module; do not stub it or mandate that dependency for every Mercury app. Keep upstream compiler/package fixes separate from application changes unless the task authorizes them.

## Native playground previews

When migration to native mx is requested, first try the app's existing `index.html` and `mx.mod` with
`mx dev --root path/to/playground --port 4800`, following the host's workspace and isolation rules. Five
existing Mercury playgrounds needed no wrapper or application changes. Keep remote stand listeners on
loopback and use the established SSH forwarding route; do not expose a source server as a public release.

Check a real interaction after the page mounts. Then edit one harmless style in an isolated copy and observe
both the visual change and retained input. Some qualified mx versions reload the whole page for CSS changes;
others may provide CSS HMR. Report the observed policy and return a missing native capability to the mx owner
instead of adding app-specific reload/persistence code. Restore the probe exactly. Preserve existing user tabs
and unsaved drafts by using a separate review origin.

Source preview and release preview can have different contracts. Checked-in graph/catalog data is not refreshed
by starting a server. A standalone app root may not serve a packaged companion, website route, release metadata
or no-JavaScript fallback. Verify those against the real built site and keep its public filename allowlist.
Changing the port changes the storage origin: export retained review work before moving it.

Use `mx run serve` only when the actual binary and project configuration support its contract. Let native mx
own orchestration through existing project configuration; preserve an application's real server and route
boundaries. Do not invent a server key, proxy prefix, pathname fallback or a new launcher to imitate an
unlanded capability. A root page returning 200 does not establish multi-page navigation or backend readiness.

## Obtaining mx

The compiler is a Rust binary. Its npm delivery contract is a root `@fiberfx/mx` package with a small Node launcher and optional platform packages. npm selects compatible packages using their OS/CPU metadata (and libc metadata where relevant); the launcher uses `require.resolve` to locate and execute the native binary. This route uses Node for the launcher, with no `postinstall` script and no download from GitHub Releases.

This describes the packaging contract, not evidence that a particular version or platform is published. Check the current installation lesson and available artifacts before offering installation commands. An archive route can run the native binary without Node; follow its hash verification requirements. Do not infer macOS, Windows, musl, or other CPU support from a successful Linux build. Preserve independently supplied manifest pins when using the distribution bootstrap.

## Browser-only page

Use a version-matched, complete import map from the supported browser example and load its UI stylesheet. Use plain JavaScript `h(Component, props, children)` and hooks. Preserve dependency pins and transitive import mappings; test resolution in the browser instead of assuming one CDN import supplies everything.

This route requires network access to its module, stylesheet, and font origins. It has no TSX compilation or native build step and is not an offline artifact. An unavailable module is a concrete limitation, not permission to substitute fake Mercury controls.

## Portable artifact, only when requested

Package the real compiled runtime, components, and styles. Inspect every emitted JavaScript import/chunk, import map, CSS `@import`, font URL, image, and other resource before promising one file. Inline or package the required assets and retain license notices. Remove an import map only after proving the emitted JavaScript no longer depends on it. If the exporter cannot handle the output topology, extend it deliberately or report the limitation.

Escape embedded data and closing script/style sequences for their HTML contexts. A self-contained artifact can use a restrictive content policy that blocks unnecessary network access; do not impose that policy on a product that needs authenticated services or remote data.

Load the packaged result and exercise its essential interactions with network requests unavailable. Inspect requests and failures rather than equating a successful build with offline behavior. If only a loopback-served artifact with blocked remote requests was tested, say so; it does not establish a direct `file://` launch. Respect browser access restrictions.

## Native test evidence

When a native runner is new, being qualified, or suspected of hiding errors, verify its failure boundary before relying on a green consumer suite. Keep a valid, explicitly handled-error control alongside an uncaught DOM callback, an unhandled rejection, and an observed error after the last case. The first control should pass; the others must fail the case or file with their original diagnostic. A DOM assertion can pass even when its event handler throws. Do not add an application-wide error trap to compensate for the runner.

Name the actual compiler and peer versions used. A suite run with an unlanded package overlay is candidate evidence, even if the application source is unchanged. An unavailable test export is a dependency failure: keep the affected cases visible and report which assertions ran, which could not load, and the full command outcome. Do not silently skip them or infer release readiness from the passing subset.

Synthetic events establish their named assertions, not native keyboard modality, forced-colors behavior or screenshot geometry. Run the relevant real-input checks when those are the acceptance boundary. A scaled browser preview can support visual review; target identity, measured viewport and image dimensions must agree before it counts as native capture evidence.

## Evidence to retain

Record the relevant source/package versions, actual successful command, host/platform, output entry point, and observed checks. Include compiler provenance or artifact hashes when distribution/reproducibility is part of the task. Do not import private source data into a reusable public skill or bundle just because it was present during development.

Check the built output as well as the development page when they differ. Report unavailable browser, platform, offline, or clipboard checks as unverified. Packaging, a local commit, or an uploaded source archive does not establish publication, consumer installation success, or user acceptance.
