---
name: mercury-page
description: Create or edit a Mercury browser page with Hyperscript and Mercury UI. Select a browser-only example or native mx workflow to fit the user's existing app and available tools.
---

# Mercury page

Preserve the user's requested outcome and existing application. Inspect its entry point, dependency pins and working toolchain before choosing a route. Do not replace an existing framework or install a second toolchain merely to reproduce the starter.

## Select the route

- **Existing Mercury app or working mx:** use its files and pins. Run mx --version, then follow the app's development workflow. For a new native app, read [Install mx](https://mercury.jonnify.com/start/install-mx/llms.txt) and [First page](https://mercury.jonnify.com/mx/first-app/llms.txt).
- **A simple page without CLI setup:** use the [browser lesson](https://mercury.jonnify.com/start/browser/llms.txt) and [complete HTML](https://mercury.jonnify.com/examples/first-page.html). It uses versioned UNPKG imports, plain JavaScript h/render and a stylesheet link. It requires a browser with import maps and network access; it is not an offline bundle. Do not put TSX in a browser module script.
- **Native development without installed mx:** check [installation readiness](https://mercury.jonnify.com/start/install-mx/llms.txt). The planned npm root package @fiberfx/mx is a Node launcher with optional platform packages. It uses require.resolve to locate the installed native binary and executes it; Node must remain installed for npm-installed mx invocations. npm obtains the platform package, with no postinstall and no GitHub Release binary download. Keep optional dependencies enabled. This npm route is not yet published. The archive route avoids Node/npm and verifies SHA-256 before extraction. Do not present pending packages or download URLs as available, or bypass a checksum failure. If neither native route is available, use the browser route when it satisfies the task, or report the blocker.

Only the Linux x64 native binary has verification evidence, requiring glibc 2.39 or later. The npm platform package is @fiberfx/mx-linux-x64; other platform packages are unbuilt future work, not available. Both binaries require ELF symbol version GLIBC_2.39 and were built on glibc 2.41; this measured requirement does not establish consumer-test success. Publication and consumer verification remain pending. Do not infer macOS, Windows, musl or older-glibc support. Keep environment changes local to the working shell. Check the installation lesson for exact commands and current platform limits.

## Bundled documentation

Serve `site/` with `agents/serve.py` and use its local origin for documentation links below. Keep dependency/CDN origins unchanged. Direct native mx is in `native/bin`; preserve `examples/first-page/.mx` and run `mx verify` before an offline build. The npm launcher is a separate Node-dependent route. Playground templates are in `skills/mercury-playground/`.

## Implement the requested page

Mount into an empty host. Hyperscript `render` appends to the host, so remove a static loading message before mounting; retain or restore a useful fallback if loading or rendering fails. A successful interaction check alone does not prove that loading indicators disappeared.

Use render and h from @fiberfx/hyperscript, hooks from @fiberfx/hyperscript/hooks and components from @fiberfx/ui. Native TSX is compiled by mx; the browser-only route uses h(Component, props, children). Use DOM attributes such as class. Do not add React imports or JSX pragma comments.

Styles are part of the deliverable: native apps import @fiberfx/ui/styles.css; browser HTML links the pinned UI stylesheet described in the example. Keep the native starter's package.json, mx.mod and mx.sum. Its pinned install needs no MXNOSUMDB exception. Adding an unpinned dependency changes the trust boundary; the installation lesson explains that checksum pinning is not authenticated checksum-database verification.

## Verify what the user asked for

Open the page in a browser and observe styling and the requested interactions. Exercise a meaningful invalid or boundary case where applicable. The starter counter check (0 → 1 → 2 and a saved heading edit) applies only when building that example; it does not replace acceptance checks for the user's page.

For native work, run mx install and mx verify as needed, mx dev, then mx build. Serve dist/ over HTTP and verify the built page too. The browser-only route has no build step. Report files produced, checks actually run and browser/network limitations. A successful download or build alone does not prove the UI works.

JavaScript runs in the browser; “native” describes mx. Phoenix/LiveView is optional. Deployment and external service changes remain within the user's authorization. Canonical skill: /agent/SKILL.md; /SKILL.md is an alias for the same file.

API references: [Mercury UI](https://mercury.jonnify.com/ui/llms.txt), [Hyperscript](https://mercury.jonnify.com/hyperscript/llms.txt), [site map](https://mercury.jonnify.com/llms.txt).
