Seven words come up across this site. Each entry says what the word means here and links the lesson that teaches it.

## sid

A unit's stable identity in Hypergraph, with a shape beside it, so a store can be found again across an edit, a server render or another runtime. Giving every store, event and effect its sid is the compiler's job by design, but today the compiler's sid pass instruments only the legacy facade's calls: a Hypergraph unit has a sid only when you write one, and an unnamed unit gets a run-time identity, `api:<n>`, until the compiler names it. Until the compiler emits shapes too, the kernel reads each store's shape from its initial value. A frame that a scope writes keys its values by sid, so a frame from one build applies in another. You can write a sid by hand, as a store's `sid` option, when a value must be found again; for a Hypergraph unit today, that is the only way it gets one. Under `mx dev`, the module path in an app's `mx.mod` is the sid package of its modules. This does not yet preserve Hypergraph state after a model edit: the sid pass does not support its units.

Taught in [Hypergraph](/hypergraph) and [Units](/hypergraph/units).

## scope

An isolated state table in Hypergraph. A `Scope` is a small handle, `{id, gen}`, where `gen` is the generation of the graph now committed. `fork` makes one, `allSettled` starts a unit in it and resolves when nothing is in flight there, `snapshot` and `apply` write and restore its frames, and `dispose` ends it. Tests and server renders each get their own scope, so they never share values. A scope survives a hot swap: it moves to the new generation and carries over each value whose sid and shape still match.

Taught in [Scopes](/hypergraph/scopes). Coming from another state library: [/hypergraph/coming-from-effector](/hypergraph/coming-from-effector).

## island

A Mercury Hyperscript component mounted over one element of a page the server has already painted. The server renders the page as HTML first, and an island adds behaviour only where the page needs it. In LiveView, `MercuryHook` mounts it: an element with `phx-hook="MercuryHook"` and `data-name="X"` renders the component `X` with its props. Each island is its own render root, so two islands on one page number their ids separately. `mx build --lib` builds an island's bundle.

Taught in [Foundations](/ui/foundations), on render roots, and [Philosophy](/start/philosophy). The Live Mercury course teaches islands in full.

## companion

A page's hand-written version for agents, in plain text. Each lesson `<name>.md` has its companion `<name>.llms.md` beside it, served at the page's address with `/llms.txt` appended. A lesson without one is refused when the site loads. Nothing generates a companion.

Taught in [For agents](/start/agents).

## tier

How far you can rely on a module or a page. **Shipped** is released on a registry. **Preview** is built and tested in Mercury's tree but not released. **Planned** is recorded in a plan and not built, so it has no runnable example. The fifteen public `@fiberfx` 4.0.0 modules are Shipped, on npm since 2026-11-05; `mx`, `live_mercury` and the private modules are Previews.

Taught in [Stability](/start/stability).

## mx.work

The file that makes modules developed together into one workspace, as `go.work` does for Go. It names its members in a `use ( … )` block. `mx` finds it from `-workfile`, then from `MXWORK` (where `off` turns the workspace off), then as the nearest `mx.work` above the working directory. Mercury's own is `fiberfx/mx.work`, which names eighteen modules.

Taught in [Workspaces](/mx/workspace).

## member

A directory that a workspace or an app builds from source. In an `mx.work`, a member is a directory whose `package.json` has a `name`. A member without one is refused: `error reading <file>: missing name`. Under `mx dev`, an app's members are the directories its `mx.mod` replaces, each served under `/@mx/<package name>/`.

Taught in [Workspaces](/mx/workspace) and [Your first app](/mx/first-app).
