# Units and wiring (coming from Effector) — Mercury LMS

> Effector's units and composition in Hypergraph (`@fiberfx/hypergraph`): `store`/`event`/`effect` replace the `create*` constructors; `sample`, `combine`, `split`, `attach`, `merge`, `restore` and the unit methods retain their names, but restore supports only the single-unit form; `guard`, `forward` and `createApi` are rewritten with `sample` and `.on`.

## Read this when

You are porting an Effector model's units or wiring, or writing one from Effector habits.

## Units

| Effector | Hypergraph |
|---|---|
| `createStore(init, {name, sid, serialize, updateFilter, skipVoid})` | `store(init, {…same, schema?})` |
| `$s.on` `.reset` `.map` `.getState` `.updates` `.watch` | same |
| `$s.setState` `.off` `.reinit` | not in the API: use an event + `.on` / `.reset` |
| `createEvent<T>()` | `event<T>({name?})` |
| `ev.filter({fn})` | `ev.filter(fn)` or `ev.filter({fn})` |
| `createEffect(handler)` | `effect<P, D>(handler)` |
| `fx.use(handler)` | not in the API: `fork({handlers: [[fx, handler]]})` |
| — | `effect({request} \| {channel} \| {timer})`: declared; needs `fork({performers})` until H4 |

Notes: `$s.watch(fn)` fires now and on updates; `watch($s, fn)` fires on updates only. `getState()` reads the caller's scope. `sid` is the compiler's job by design, but today its sid pass covers only the legacy facade: write `sid` on a store that must travel or survive an edit (an unnamed unit gets a run-time `api:<n>`).

## Wiring

`sample({clock, source, filter, fn, target, batch})` — returns `target`, or a new unit without one.
`combine(shape, fn?)` or `combine($a, $b, fn?)` — non-store fields are constants.
`split({source, clock?, match, cases})`, or `split(source, match)` → `{[case]: Event, __: Event}`.
`attach({effect, source?, mapParams?})` — `effect` may be `(source, params) => …`.
`merge([units])`, `restore(unit, init)`. Also as functions: `on`, `reset`, `map`, `filter`, `filterMap`, `prepend`.

## Rewrites

| Effector | Hypergraph |
|---|---|
| `guard({clock, filter, target})` | `sample({clock, filter, target})` |
| `forward({from, to})` | `sample({clock: from, target: to})` |
| `createApi($s, {a: fnA, b: fnB})` | `const a = event(); $s.on(a, fnA)` per key |

## Minimal example

```ts
import { effect, event, sample, store } from "@fiberfx/hypergraph";

const fetchUserFx = effect<number, string>(async (id) => `user ${id}`);
const opened = event<number>();
const $enabled = store(true);
export const $user = store<string | null>(null).on(fetchUserFx.doneData, (_, u) => u);
sample({ clock: opened, filter: $enabled, target: fetchUserFx });
```

## Errors

`HypergraphError.code`: `pure-call` (a pure fn called a unit), `derived-call`, `derived-target`, `disposed-scope`, `reset-reason`.

## Never emit

`createStore`, `createEvent`, `createEffect`, `guard`, `forward`, `createApi`, `.setState`, `.use`, `.off`, `.reinit`, or any import from `effector`.

## Navigation

- [Read this page in the browser](/hypergraph/coming-from-effector/units-and-wiring)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
