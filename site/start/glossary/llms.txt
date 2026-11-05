# Glossary: the words this site uses — Mercury LMS

> Seven terms as Mercury uses them: sid, scope, island, companion, tier, mx.work, member. Each one gives its definition, its source and the page that teaches it.

## Read this when

A Mercury page or user uses one of these words and you need its exact meaning before writing code or prose.

## Terms

- **sid**: a Hypergraph unit's stable identity, with a shape beside it. The compiler is meant to give it; today its sid pass covers only the legacy facade, so a Hypergraph unit has a sid only when written by hand, else a run-time `api:<n>`, and the kernel reads a store's shape from its initial value. Frames key values by sid. Hand-written via the store option `sid`. Under `mx dev`, the module path in the app's `mx.mod` is the sid package. → /hypergraph/units
- **scope**: `interface Scope { readonly id: number; readonly gen: number }`, an isolated state table. `gen` is the committed graph generation. API: `fork`, `allSettled`, `scopeBind`, `snapshot`, `diff`, `apply`, `dispose`. It survives a hot swap by carrying values whose sid and shape match. → /hypergraph/scopes
- **island**: a Hyperscript component mounted over one element of a server-painted page, and only where behaviour is needed. In LiveView: `phx-hook="MercuryHook"`, `data-name="X"` renders `components.X` (`getHooks(components)`, `createMercuryHook(resolve)` from `@fiberfx/live-mercury`). One render root per island. Bundled by `mx build --lib`. → /ui/foundations; course /live-mercury
- **companion**: `<name>.llms.md`, hand-written, served at `<route>/llms.txt` as text/plain. A lesson without one is refused at load; never generated. → /start/agents
- **tier**: Shipped (on a registry: the fifteen public `@fiberfx` 4.0.0 modules, npm, since 2026-11-05), Preview (built and tested, unreleased: `mx`, `live_mercury`, the private modules), Planned (not built, no runnable example). → /start/stability
- **mx.work**: the workspace file, a port of `go.work`, with `use ( … )` naming members. Found by `-workfile`, then `MXWORK` (`off` disables it), then the nearest one above. Mercury's: `fiberfx/mx.work`, 18 modules. → /mx/workspace
- **member**: in `mx.work`, a directory whose `package.json` has a `name` (else "error reading <file>: missing name"). Under `mx dev`, a directory the app's `mx.mod` replaces, served at `/@mx/<package name>/`. → /mx/workspace, /mx/first-app

## Never emit

- "island" for a client-rendered page with no server paint.
- "stable" or "released" for a Preview module.
- A generated companion.

## Next

- Start: /start
- Coming from another state library: /hypergraph/coming-from-effector
- This companion: /start/glossary/llms.txt

## Navigation

- [Read this page in the browser](/start/glossary)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/start/llms.txt)
