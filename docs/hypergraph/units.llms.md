# Units: store, event and effect — Mercury LMS

> The three kinds of unit in a Hypergraph model, from `@fiberfx/hypergraph` 4.0.0: `store(init, config?)`, `event<T>(config?)`, `effect(handler)`. A store holds a value, an event carries a payload, an effect runs a handler and settles.

## Read this when

You declare state, a signal or a side effect in a Mercury model, or you need a unit's methods and members.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- `store<T>(init: T, config?)` → `StoreWritable<T>`. Config: `name`, `sid` (authored identity), `skipVoid`, `updateFilter(next, prev)`, `serialize: 'ignore' | {write, read}`, `schema: {id, version}` (shape becomes `<id>@<version>`).
- `StoreWritable`: `.on(clock | clock[], (state, payload) => next)`, `.reset(...clocks)`; both return the store.
- Every `Store`: `.getState()` (caller's scope, else outside any), `.map(fn, {skipVoid?})` (derived), `.updates` (event), `.watch(fn)` (called with the state now, then each update).
- A reducer returning `undefined` is skipped unless `skipVoid: false` (vector `store.on-void-skips`).
- `event<T = void>({name?})` → callable. `.map`, `.filter(fn | {fn})`, `.filterMap` (drop on `undefined`) make derived events; `.prepend(fn)` makes a callable event; `.watch(fn)`.
- `effect<P, D, F = Error>(handler)` → `(params) => Promise<D>`. Members: `done {params, result}`, `doneData`, `fail {params, error}`, `failData`, `finally {status, params, result | error}`, `pending: Store<boolean>`, `inFlight: Store<number>`. With no handler a call fails until `fork({handlers})` supplies one.
- Declared effects (`{request}`, `{channel, payload?}`, `{timer}`) need `fork({performers})`; performers arrive with H4.
- A derived unit can be neither called nor targeted.

## Minimal example

```ts
import { effect, event, store } from "@fiberfx/hypergraph";

const increment = event<number>();
export const $count = store(0, { name: "$count" }).on(increment, (n, by) => n + by);

export const loadUser = effect(async (id: number) => ({ id, name: "Ada" }));
export const $name = store("").on(loadUser.doneData, (_, user) => user.name);
```

## Never emit

`createStore`, `createEvent`, `createEffect`, `store.setState`, `store.off`, `effect.use`, and any import from `effector` or `effector-react`.

## Next

- Wiring units together: /hypergraph/wiring (/hypergraph/wiring/llms.txt)
- This companion: /hypergraph/units/llms.txt (the page as Markdown, `/hypergraph/units.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hypergraph/units)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
