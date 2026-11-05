Package publication and platform verification are separate claims. The candidate native installation requires Linux x86_64 with glibc 2.39 or later (ELF requirement measured; consumer verification pending); see [Install mx](/start/install-mx) and [release metadata](/downloads.json). macOS and Windows are not verified by this route.

## The three tiers

- **Shipped:** released. You can install it from a registry at the version shown.
- **Preview:** an early implementation with stated limits. It may have a downloadable build; that does not establish a stable API or support for every platform. A course may teach it.
- **Planned:** recorded in a program's plan, not built. A Planned page has no runnable example.

The fifteen public `@fiberfx` modules are Shipped: 4.0.0 was released on npm on 2026-11-05, and `latest` is 4.0.0 for each. The day before, npm still answered "not found" for them. The previous major, 3.x, stays published on npm under the earlier scope, `@mercury-fx/*` (`@mercury-fx/ui` is at 3.0.0 there). `mx`, `live_mercury` and the private modules are still Previews.

## Modules and versions

| Module | Version | Tier | What it is |
|---|---|---|---|
| `mx` | 0.1.0 | Preview | native toolchain; npm and archive pending publication and consumer verification: /start/install-mx |
| `@fiberfx/hyperscript` | 4.0.0 | Shipped | the virtual DOM: JSX runtime, hooks, server and client entries |
| `@fiberfx/render-to-string` | 4.0.0 | Shipped | the server renderer for Hyperscript |
| `@fiberfx/core` | 4.0.0 | Shipped | the UI-free foundation: headless hooks, `cx`, dates, shared types |
| `@fiberfx/ui` | 4.0.0 | Shipped | the design system: tokens and components |
| `@fiberfx/hypergraph` | 4.0.0 | Shipped | the state kernel |
| `@fiberfx/schema` | 4.0.0 | Shipped | Mercury documents: a portable, versioned, JSON-safe page format |
| `@fiberfx/content` | 4.0.0 | Shipped | published pages: a renderer registry and block catalog |
| `@fiberfx/cms` | 4.0.0 | Shipped | CMS compositions: the collection workspace |
| `@fiberfx/analytics` | 4.0.0 | Shipped | the analytics browser client and dashboard islands |
| `@fiberfx/phoenix` | 4.0.0 | Shipped | the Phoenix client, with Mercury islands |
| `@fiberfx/phoenix_live_view` | 4.0.0 | Shipped | the LiveView client, with Mercury islands |
| `@fiberfx/live-mercury` | 4.0.0 | Shipped | Live Mercury's browser client: `MercuryHook` and LiveView's patch codecs |
| `live_mercury` (Mix) | 2.8.0 | Preview | Live Mercury's Elixir side: Hyperscript islands in LiveView; not on Hex |
| `@fiberfx/testing` | 4.0.0 | Shipped | the test kit: render, queries, matchers and a DOM host |
| `@fiberfx/devtools` | 4.0.0 | Shipped | DevTools for development only: a collector and a dock |
| `@fiberfx/vite-plugin-mhs` | 4.0.0 | Shipped | the Vite plugin: automatic JSX and the Hypercompiler |
| `@fiberfx/hypercompiler` | 3.0.0 | Preview, private | the compiler: a Rust crate built to WebAssembly, not a published package |
| `@fiberfx/hyperscript-lsap` | 0.1.0 | Preview, private | the language server, in Rust; today the imported server, made to build and test |

The `mx` workspace names eighteen modules: fifteen public, three private. The table lists seventeen of them. The eighteenth is the state package that Hypergraph succeeds: private, retired and not published, and this site doesn't teach it.

## How versions move

The `@fiberfx` modules release together at one version. 4.0.0 is a major release because every import name changes from the 3.x scope. The compiler and the language server keep their own versions, since neither is published as a package. `mx` and `live_mercury` keep their own versions too.

## What is planned

- **Hypergraph:** two more subpaths, `/hyperscript` (the bindings for Hyperscript) and `/hmr` (hot replacement).
- **mx:** `mx dev` already hot-reloads, with its watcher and client ([MX2](/mx/dev)); delivering Hypergraph's state-keeping swap through it waits on `/hmr`, above. The modules already build and test with mx; pnpm remains only for apps and tools under `node/`.
- **For agents:** `<page>.md`, `/agents` and search. (`/llms-full.txt` is served.) See [For agents](/start/agents).

## This site

**Courses available now:** Start, mx, Hyperscript, Mercury UI, Hypergraph, Content and Live Mercury. Their landing pages list the available lessons.

This site's application is `mercury_lms` 0.1.0, built with Elixir. It serves the Phoenix-rendered home at `/` and `/ru`, course pages by path, and plain-text companions for agents. `mercury.jonnify.com` is the public host; `mercury-next.jonnify.com` is the preview host.
