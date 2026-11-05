# Stability: Shipped, Preview, Planned — Mercury LMS

> Tiers: Shipped = released on a registry; Preview = early implementation with stated limits; a downloadable build does not imply stable APIs or all-platform support; Planned = recorded, not built, no runnable example. The fifteen public `@fiberfx` 4.0.0 modules are Shipped: on npm since 2026-11-05, `latest` 4.0.0. 3.x stays on npm as `@mercury-fx/*`.

## Read this when

You are about to tell a user to install a Mercury package, pin a version, or rely on an API, and need to know whether it exists, at what version, and whether it is released.

## Modules

- Shipped, 4.0.0 on npm: `@fiberfx/hyperscript`, `render-to-string`, `core`, `ui`, `hypergraph`, `schema`, `content`, `cms`, `analytics`, `phoenix`, `phoenix_live_view`, `live-mercury`, `testing`, `devtools` (development only), `vite-plugin-mhs`.
- Preview, private, not packages: `@fiberfx/hypercompiler` 3.0.0, `@fiberfx/hyperscript-lsap` 0.1.0.
- Preview: `mx` 0.1.0 (candidate npm and archive require Linux x64/glibc 2.39+; publication and consumer verification pending: /start/install-mx; metadata: /downloads.json).
- Preview: `live_mercury` 2.8.0 (Mix; not on Hex).
- This site: `mercury_lms` 0.1.0. Phoenix-rendered home at `/` and `/ru`; course pages by path. Public host: `mercury.jonnify.com`; preview: `mercury-next.jonnify.com`.

Courses are already available: Start, mx, Hyperscript, Mercury UI, Hypergraph, Content and Live Mercury.

## Planned

- `@fiberfx/hypergraph/hyperscript` and `@fiberfx/hypergraph/hmr`: not exported.
- Hypergraph's state-keeping swap delivered by `mx dev` (waits on `/hmr`). (Done: `mx dev` hot-reloads modules, /mx/dev; the modules build and test with mx; pnpm remains only for apps and tools under `node/`.)
- `<page>.md`, `/agents`, search. (`/llms-full.txt` is served.)

## Rules

- The `@fiberfx` 4.0.0 packages are on npm, but a native app installs its dependencies with `mx install`. The separate npm bootstrap obtains the mx executable when published; see [installation readiness](/start/install-mx/llms.txt).
- Never cite `mx push`: mx has no such command at this commit.
- Never present a Planned name (above) as importable.
- State a version only from this page or the module's `package.json`.

## Next

- Start: /start
- How agents read this site: /start/agents
- The site map: /llms.txt

## Navigation

- [Read this page in the browser](/start/stability)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/start/llms.txt)
