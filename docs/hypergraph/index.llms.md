# Hypergraph, the state kernel — Mercury LMS

> `@fiberfx/hypergraph` 4.0.0: Mercury's state kernel. A scheduler and graph executor for a model's units (store, event, effect) and their wiring, with fork scopes, effects and one observation surface. No dependencies, no React.

## Read this when

You write or change state in a Mercury app: a store, an event, an effect, their wiring, or a scope for a test or a server render. This page is the course's landing; the API by name follows in the reference.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- Units: `store(init, config?)`, `event()`, `effect(handler)`.
- Wiring: `sample({clock, source, filter, fn, target})`, `combine`, `split`, `attach`, `merge`, `restore`, and `on`, `reset`, `map`, `filter`, `filterMap`, `prepend`.
- Scopes: `fork`, `allSettled`, `scopeBind`, `snapshot`, `apply`, `diff`, `dispose`.
- `watch(unit, fn, {scope})`, `kindOf(x)`, `setCarrier`, `HypergraphError`.
- Subpaths: `@fiberfx/hypergraph`, `@fiberfx/hypergraph/node` (`nodeCarrier`), `@fiberfx/hypergraph/inspect` (`inspect`, `describe`). `/hyperscript` and `/hmr` are planned and not exported.

## Minimal example

```ts
import { event, store } from "@fiberfx/hypergraph";

const increment = event<number>();
export const $count = store(0, { name: "$count" }).on(increment, (count, by) => count + by);
```

## Never emit

`createStore`, `createEvent`, `createEffect`, `createDomain`, `guard`, `forward`, `createApi`, `withFactory`, `is`, and any import from `effector` or `effector-react`. They are not Mercury's names.

## Errors

A refusal is a `HypergraphError` with a `code`: `pure-call`, `derived-call`, `derived-target`, `disposed-scope`, `reset-reason`.

## Next

- Chapters, in order: /hypergraph/units/llms.txt, /hypergraph/wiring/llms.txt, /hypergraph/scopes/llms.txt, /hypergraph/observing/llms.txt, /hypergraph/errors/llms.txt, /hypergraph/hot-replacement/llms.txt, /hypergraph/server-rendering/llms.txt, /hypergraph/testing/llms.txt, /hypergraph/models/llms.txt, /hypergraph/capstone/llms.txt
- Coming from Effector, in order: /hypergraph/coming-from-effector/llms.txt, /hypergraph/coming-from-effector/units-and-wiring/llms.txt, /hypergraph/coming-from-effector/scopes-and-testing/llms.txt, /hypergraph/coming-from-effector/frameworks/llms.txt
- The site: /llms.txt
- This companion: /hypergraph/llms.txt (the page as Markdown, `/hypergraph.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hypergraph)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)

### Chapter companions

- [/hypergraph/capstone](/hypergraph/capstone/llms.txt)
- [/hypergraph/coming-from-effector](/hypergraph/coming-from-effector/llms.txt)
- [/hypergraph/coming-from-effector/frameworks](/hypergraph/coming-from-effector/frameworks/llms.txt)
- [/hypergraph/coming-from-effector/scopes-and-testing](/hypergraph/coming-from-effector/scopes-and-testing/llms.txt)
- [/hypergraph/coming-from-effector/units-and-wiring](/hypergraph/coming-from-effector/units-and-wiring/llms.txt)
- [/hypergraph/errors](/hypergraph/errors/llms.txt)
- [/hypergraph/hot-replacement](/hypergraph/hot-replacement/llms.txt)
- [/hypergraph/models](/hypergraph/models/llms.txt)
- [/hypergraph/observing](/hypergraph/observing/llms.txt)
- [/hypergraph/scopes](/hypergraph/scopes/llms.txt)
- [/hypergraph/server-rendering](/hypergraph/server-rendering/llms.txt)
- [/hypergraph/testing](/hypergraph/testing/llms.txt)
- [/hypergraph/units](/hypergraph/units/llms.txt)
- [/hypergraph/wiring](/hypergraph/wiring/llms.txt)
