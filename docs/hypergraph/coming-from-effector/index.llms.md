# Coming from Effector — Mercury LMS

> Where each Effector concept lives in Hypergraph (`@fiberfx/hypergraph` 4.0.0), Mercury's state kernel. Rule: a name changes only when its contract or its IR kind changed. Unit constructors are renamed, composition is kept, the scope speaks frames, and domains, `guard`, `forward`, `createApi`, `is` and `withFactory` are retired.

## Read this when

You are translating Effector code or Effector knowledge into a Mercury model, or a user asks "what is X from Effector in Mercury?". This is the only page on the site that uses Effector's names; never emit them as code.

## The map (Effector → Hypergraph)

| Effector | Hypergraph |
|---|---|
| `createStore(init, cfg)` | `store(init, cfg)`; cfg adds `schema` |
| `createEvent()` | `event({name?})` |
| `createEffect(fn)` | `effect(fn)` or `effect(spec)` |
| `sample` `combine` `split` `attach` `merge` `restore` | same names |
| `.on` `.reset` `.map` `.getState` `.updates` `.watch` (store) | same |
| `.map` `.filter` `.filterMap` `.prepend` `.watch` (event) | same |
| `.done` `.doneData` `.fail` `.failData` `.finally` `.pending` `.inFlight` | same |
| `fork({values, handlers})` | `fork({values, handlers, performers})`; `values` may be a snapshot |
| `allSettled` | same (unit + `{scope, params}`, or a scope alone) |
| `scopeBind(unit, cfg)` | `scopeBind(fn, cfg)` |
| `serialize(scope)` | `snapshot(scope)` → `{format: "mhg-scope/1", gen, values: {[sid]: {shape, value}}}` |
| `hydrate(scope, {values})` | `apply(scope, frame)` → misses |
| — | `diff(scope, since)`, `dispose(scope)` |
| `createWatch({unit, fn, scope})` | `watch(unit, fn, {scope})` |
| `is.store(x)` etc. | `kindOf(x) === "store"` |
| `guard` | `sample({clock, source, filter, target})` |
| `forward({from, to})` | `sample({clock: from, target: to})` |
| `createApi` | one `event` + `.on` per key |
| `inspect`, `inspectGraph` | `inspect({scope?, kinds?, fn})` from `@fiberfx/hypergraph/inspect` |
| `useUnit`, `Provider` | not exported yet (planned at `/hyperscript`) |

## No equivalent

`createDomain` and domain hooks, `fork(domain)`, `hydrate(domain)`, `withFactory`, `withRegion`, `createNode`, `launch`, `step`, `clearNode`, `fromObservable`, `setStoreName`, `store.setState`, `store.off`, `store.reinit`, `effect.use`, `useStoreMap`, `useList`, `useGate`, `createGate`, `createComponent`, `connect`. Rewrite the code; do not invent a shim.

## Minimal example

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

const increment = event<number>();
const saved = event<number>();
export const $count = store(0, { name: "$count" }).on(increment, (n, by) => n + by);
sample({ clock: increment, source: $count, target: saved });
```

## Never emit

Any import from `effector`, `effector-react` or `@fiberfx/effector`; `createStore`, `createEvent`, `createEffect`, `createDomain`, `guard`, `forward`, `createApi`, `withFactory`, `is`, `serialize`, `hydrate`, `createWatch`.

## Next

- /hypergraph/coming-from-effector/units-and-wiring/llms.txt
- /hypergraph/coming-from-effector/scopes-and-testing/llms.txt
- /hypergraph/coming-from-effector/frameworks/llms.txt
- /hypergraph/llms.txt

## Navigation

- [Read this page in the browser](/hypergraph/coming-from-effector)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
