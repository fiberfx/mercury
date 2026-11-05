# Mercury

The published `@fiberfx/*` modules: Mercury's renderer, design system, state layer, compiler and test host. This directory is an [`mx`](mx) workspace: one directory per module, one module per path, `github.com/fiberfx/mercury/<name>`.

Fifteen modules, no third-party runtime dependency in any published package, and no React.

## Modules

| Directory | Package | What it is |
|---|---|---|
| [`hyperscript`](hyperscript) | `@fiberfx/hyperscript` | The virtual DOM: hyperscript, JSX runtime, hooks, server and client entries |
| [`render-to-string`](render-to-string) | `@fiberfx/render-to-string` | The server renderer for `@fiberfx/hyperscript` |
| [`core`](core) | `@fiberfx/core` | The UI-free foundation: headless hooks, `cx`, dates and shared types |
| [`ui`](ui) | `@fiberfx/ui` | The design system: tokens and components, grouped by purpose |
| [`effector`](effector) | `@fiberfx/effector` | Mercury's Effector: stores, plus theme, toast and form adapters |
| [`schema`](schema) | `@fiberfx/schema` | Mercury documents: a portable, versioned, JSON-safe page format |
| [`content`](content) | `@fiberfx/content` | Published pages: a renderer registry and block catalog |
| [`cms`](cms) | `@fiberfx/cms` | CMS compositions: the collection workspace |
| [`analytics`](analytics) | `@fiberfx/analytics` | The analytics browser client and dashboard islands |
| [`phoenix`](phoenix) | `@fiberfx/phoenix` | The Phoenix client, with Mercury islands |
| [`phoenix_live_view`](phoenix_live_view) | `@fiberfx/phoenix_live_view` | The LiveView client, with Mercury islands |
| [`live-mercury`](live-mercury) | `@fiberfx/live-mercury` | Live Mercury's browser client: LiveView's patch codecs |
| [`testing`](testing) | `@fiberfx/testing` | The test kit: render, queries, matchers and a DOM host |
| [`devtools`](devtools) | `@fiberfx/devtools` | Native Mercury DevTools, development only: the `./connect` collector over `@fiberfx/effector/inspect` and the `./panel` dock |
| [`vite-plugin-mhs`](vite-plugin-mhs) | `@fiberfx/vite-plugin-mhs` | The Vite plugin: automatic JSX and the Hypercompiler |
| [`hypercompiler`](hypercompiler) | `@fiberfx/hypercompiler` | The compiler: a Rust crate built to WebAssembly, its Cargo package at the module's root |

## The directory

```text
mercury/
├─ <module>/         one per row above, each with package.json, mx.mod and mx.sum
├─ mx.work           the workspace: names the sixteen modules
├─ mx.work.sum       the workspace's checksums
├─ conformance/      the host conformance page and probe
├─ docs/             migration and publishing guides
├─ release/          platform targets and release evidence
├─ scripts/          the gates and release tools
├─ CLAUDE.md         the guide for agents and contributors
├─ NOTICE.txt        third-party notices for code modified from upstream sources
├─ tsconfig.base.json
└─ tsdown.lib.ts     the shared library build
```

## Work on it

The move to `mx` isn't finished. Modules build and test through pnpm from `../mercury/`, its root until `mx install` replaces it, and applications live in `../node/` for now. The end layout is `fiberfx/` for packages and `mercury/` for the showcase and applications, with no `node/`.

```bash
cd ../mercury
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

Agents and contributors: start with [CLAUDE.md](CLAUDE.md). The records are in [`specs/mercury/`](../specs/mercury/README.md#toc).

## Releases

The first release under this scope is 4.0.0, a major version because every import name changes (the Operator's decision, [mx-modules M9](../specs/mercury/design/mx-modules.md#decisions)). It isn't published yet: 3.x stays on npm as `@mercury-fx/*`. Until then the manifests carry the workspace version, 3.0.0; `mx push npm 4.0.0` sets every member to 4.0.0 when it releases. See [migrating to 3.0](docs/migrating-to-3.0.md) for the previous major.
