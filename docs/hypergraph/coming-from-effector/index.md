Hypergraph is Mercury's state kernel, the package `@fiberfx/hypergraph`. If you have written Effector, you already know its model: stores, events and effects, wired together with `sample`, run in isolated scopes. This guide tells you where each Effector concept lives now, and where it does not.

## The naming rule

Hypergraph keeps a name when its contract is unchanged and changes it when the contract or the unit's kind in Mercury's IR changed. That one rule explains every difference you will meet:

- **The unit constructors take the names of their kinds.** `createStore`, `createEvent` and `createEffect` become `store`, `event` and `effect`. The arguments are the ones you know; `effect` also accepts a declared spec instead of a handler.
- **Composition keeps its names.** `sample`, `combine`, `split`, `attach`, `merge` and `restore` are the same names, stated by the same conformance vectors, and so are the unit methods `on`, `reset`, `map`, `filter`, `filterMap`, `prepend` and `watch`.
- **The scope keeps `fork`, `allSettled` and `scopeBind`,** and speaks in frames: `serialize` becomes `snapshot`, `hydrate` becomes `apply`, and `diff` and `dispose` are new.
- **A few names are retired:** domains, `guard`, `forward`, `createApi`, `is` and `withFactory`. Each has a replacement in the kept names, or none at all; the map below says which.

## The same model, side by side

An Effector counter is a store created with `createStore`, an event created with `createEvent`, and an `.on` between them. In Hypergraph only the constructors change:

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

export const increment = event<number>();
export const reset = event();

export const $count = store(0, { name: "$count" })
  .on(increment, (count, by) => count + by)
  .reset(reset);

export const $isPositive = $count.map((count) => count > 0);

export const saved = event<number>();
sample({ clock: increment, source: $count, target: saved });
```

## The concept map

Each row was checked against both packages. "Same" means the name and its arguments carry over unless a limitation is named in the row.

| In Effector | In Hypergraph | Note |
|---|---|---|
| `createStore(init, config)` | `store(init, config)` | config: `name`, `sid`, `serialize`, `updateFilter`, `skipVoid`, and a new `schema` |
| `createEvent()` | `event()` | takes an optional `{name}` |
| `createEffect(handler)` | `effect(handler)` | or `effect(spec)`, a declared request, channel or timer |
| `sample`, `combine`, `split`, `attach`, `merge`, `restore` | names retained; restore supports only the single-unit form, not an object or array | also exported: `on`, `reset`, `map`, `filter`, `filterMap`, `prepend` as functions |
| `store.on`, `.reset`, `.map`, `.getState`, `.updates`, `.watch` | same | |
| `event.map`, `.filter`, `.filterMap`, `.prepend`, `.watch` | same | |
| `effect.done`, `.doneData`, `.fail`, `.failData`, `.finally`, `.pending`, `.inFlight` | same | |
| `fork({values, handlers})` | `fork({values, handlers, performers})` | `values` also takes a `snapshot` frame |
| `allSettled(unit, {scope, params})`, `allSettled(scope)` | same | |
| `scopeBind(unit, {scope, safe})` | `scopeBind(fn, {scope, safe})` | binds a function |
| `serialize(scope)` | `snapshot(scope)` | returns a frame: read `.values[sid].value` |
| `hydrate(scope, {values})` | `apply(scope, frame)` | returns the entries it could not take |
| no equivalent | `diff(scope, since)`, `dispose(scope)` | a frame of changes; the end of a scope |
| `createWatch({unit, fn, scope})` | `watch(unit, fn, {scope})` | one unit, positional arguments |
| `is.store(x)`, `is.scope(x)`, … | `kindOf(x) === "store"`, … | answers `store`, `event`, `effect`, `scope` or `null` |
| `guard` | `sample` with `filter` | |
| `forward({from, to})` | `sample({clock, target})` | |
| `createApi($store, handlers)` | one `event` and one `.on` per key | |
| `inspect` | `inspect` from `@fiberfx/hypergraph/inspect` | the callback receives an `Observation` |
| `inspectGraph` | `inspect` with `kinds: ["declare"]` | |
| `useUnit`, `Provider` (effector-react) | not exported yet | see [Frameworks](/hypergraph/coming-from-effector/frameworks) |

## What has no equivalent

These Effector names have no Hypergraph counterpart. Code that uses them is rewritten, not renamed:

- **Domains:** `createDomain`, the domain hooks, `fork(domain)` and `hydrate(domain)`. A scope is the boundary, and a unit's identity comes from the compiler, so there is nothing for a domain to hold.
- **`withFactory` and `withRegion`.** The compiler composes a factory instance's identity.
- **The low-level graph:** `createNode`, `launch`, `step`, `clearNode`.
- **`fromObservable`, `setStoreName`.**
- **On units:** `store.setState`, `store.off`, `store.reinit` and `effect.use` are not in the API.
- **The effector-react extras:** `useStoreMap`, `useList`, `useGate`, `createGate`, `createComponent`, `connect`.

## Where to go next

- [Units and wiring](/hypergraph/coming-from-effector/units-and-wiring): stores, events, effects and `sample` in detail, with the retired names rewritten.
- [Scopes and testing](/hypergraph/coming-from-effector/scopes-and-testing): `fork`, handlers in tests, frames for server rendering, and the scope across an `await`.
- [Frameworks](/hypergraph/coming-from-effector/frameworks): what replaces effector-react in Mercury Hyperscript.
- [The Hypergraph course](/hypergraph): the kernel on its own terms.
