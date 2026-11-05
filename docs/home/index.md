Mercury combines the native mx toolchain, Hyperscript's DOM runtime, Hypergraph state and Mercury UI components. Browser applications can also integrate with Phoenix and LiveView through Live Mercury. The native application workflow requires no React, Node.js or npm CLI. This site teaches each module and states its current limits.

## Start here

1. **Start an app with mx.** The native toolchain: modules, the dev loop, build and ship: [start the mx course](/mx).
2. **Write components.** Mercury Hyperscript, the virtual DOM and its hooks: [start the Hyperscript course](/hyperscript).
3. **Use Mercury UI.** The design system's components and tokens: [start the UI course](/ui).
4. **Model state.** Hypergraph, the state kernel: [start the Hypergraph course](/hypergraph).
5. **Publish pages.** Page documents and the block catalog: [start the content course](/content).
6. **Put islands in Phoenix and LiveView.** Mercury on the BEAM: [start the Live Mercury course](/live-mercury).
7. **Look up an API.** The reference, generated from each package's source, comes in a later wave.
8. **Give your agent the docs.** Append `/llms.txt` to any page's address.

## The modules

| Module | What it is | Import |
|---|---|---|
| mx | the native toolchain: build, dev loop, tests | the `mx` command |
| Hyperscript | the virtual DOM, its JSX runtime and hooks | `@fiberfx/hyperscript` |
| Mercury UI | the design system's components and tokens | `@fiberfx/ui` |
| Hypergraph | the state kernel | `@fiberfx/hypergraph` |
| Content | page documents and the block catalog | `@fiberfx/content` |
| Live Mercury | Mercury islands in Phoenix and LiveView | the `live_mercury` Mix package |

## Status

The homepage is available in English and Russian. Each course distinguishes available behavior from planned work. Check [readiness](/start/stability) before choosing a module, and [install mx](/start/install-mx) for the current way to obtain the toolchain. Publication in a package registry does not by itself establish a working native install; follow the verified steps in the [first-app guide](/mx/first-app).

## For agents

Every page answers its own address with `/llms.txt` appended: a short, hand-written companion with the page's purpose, its contract, a minimal example and the names never to emit. The site's map is at `/llms.txt`.
