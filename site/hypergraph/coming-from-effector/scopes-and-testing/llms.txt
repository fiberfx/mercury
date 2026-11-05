# Scopes and testing (coming from Effector) — Mercury LMS

> Effector's scope model in Hypergraph (`@fiberfx/hypergraph`): `fork`, `allSettled`, `scopeBind` keep their names; `serialize` → `snapshot` (a frame), `hydrate` → `apply` (returns misses); `diff` and `dispose` are new; no domains; no `scope.getState`.

## Read this when

You are porting Effector tests, SSR serialization or scope handling, or reading a store's value in a scope.

## The map

| Effector | Hypergraph |
|---|---|
| `fork({values, handlers})` | `fork({values, handlers, performers})` |
| `fork(domain, cfg)` | none: `fork(cfg)` |
| `values: [[$s, v]]` or `{[sid]: v}` | same, or a `snapshot` frame |
| `handlers: [[fx, fn]]` | same (`fn` or another effect) |
| `allSettled(unit, {scope, params})`, `allSettled(scope)` | same |
| `scope.getState($s)` | `scopeBind(() => $s.getState(), {scope})()` |
| `scopeBind(unit, {scope, safe})` | `scopeBind(fn, {scope, safe})` |
| `serialize(scope, {ignore})` | `snapshot(scope, {ignore})` |
| `serialize(...)[sid]` | `snapshot(...).values[sid].value` |
| `serialize(..., {onlyChanges})` | no option |
| `hydrate(scope, {values})` → void | `apply(scope, frame)` → `[{unit, reason: {kind: "removed"} \| {kind: "shape", from, to}}]` |
| — | `diff(scope, since)` → `{format, gen, from, changed, removed}` |
| — | `dispose(scope)`; later calls → `HypergraphError` `disposed-scope` |
| `createWatch({unit, fn, scope})` | `watch(unit, fn, {scope})` |

Frame: `{format: "mhg-scope/1", gen, values: {[sid]: {shape, schema?, value}}}`. Only stores with a sid appear; today a sid is written by hand (the compiler's sid pass covers only the legacy facade).

## Minimal example (a test)

```ts
import { allSettled, effect, fork, scopeBind, store } from "@fiberfx/hypergraph";

const fetchUserFx = effect<number, string>(async (id) => `real ${id}`);
const $user = store<string | null>(null).on(fetchUserFx.doneData, (_, u) => u);

const scope = fork({ handlers: [[fetchUserFx, async (id: number) => `stub ${id}`]] });
await allSettled(fetchUserFx, { scope, params: 7 });
scopeBind(() => $user.getState(), { scope })(); // "stub 7"
```

## The scope across an await

Default (browser): as Effector, a settled effect restores its caller's scope, so an unrelated call during the await can join it; capture with `scopeBind`. Node: `setCarrier(nodeCarrier())`, with `nodeCarrier` from `@fiberfx/hypergraph/node`.

## Never emit

`serialize`, `hydrate`, `fork(domain)`, `scope.getState`, `createWatch`, `fx.use`, or any import from `effector`.

## Navigation

- [Read this page in the browser](/hypergraph/coming-from-effector/scopes-and-testing)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
