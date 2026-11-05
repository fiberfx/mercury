# Scopes: fork, settle, hand over — Mercury LMS

> A scope is one isolated copy of a model's state in `@fiberfx/hypergraph`. `fork` makes one, `allSettled` steps it, `scopeBind` binds a function to it, `snapshot`/`diff`/`apply` move its frames by sid with each value's shape, `dispose` ends it.

## Read this when

You write a test, render on a server, hand state from server to client, or run code from a timer or callback inside a scope.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- `Scope` = `{id, gen}`; the handle survives a hot swap and rebinds to the committed generation.
- `fork({values?, handlers?, performers?})`. `values`: `[[store, v], …]`, `{sid: v}`, or a `Snapshot`. `handlers`: `[[effect, fn | effect], …]`, scope-local.
- `allSettled(unit, {scope, params?})` → resolves when nothing is in flight; for an effect `{status: 'done' | 'fail', value}`. `allSettled(scope)` waits for in-flight work.
- `scopeBind(fn, {scope?, safe?})`: binds to `scope` or the caller's; no scope and no `safe` throws. Read a value: `scopeBind(() => $s.getState(), {scope})()`.
- `snapshot(scope, {ignore?})` → `{format: 'mhg-scope/1', gen, values: {sid: {shape, schema?, value}}}`: writable stores with a sid that the scope changed or was given; `serialize: 'ignore'` stays out.
- `diff(scope, since)` → `{format, gen, from, changed, removed}`.
- `apply(scope, snapshot | diff)` → `Miss[]` `{unit: sid, reason: {kind: 'removed'} | {kind: 'shape', from, to}}`; an entry is taken only on the same sid and shape. Misses also go to `inspect` as `reset`.
- Shape until the compiler emits one: `runtime:<structure>` (e.g. `runtime:number`); with `schema` it is `<id>@<version>`.
- `dispose(scope)`: stops work and scoped watches, settles waiting `allSettled`; later `allSettled` or an effect call there rejects `HypergraphError` `disposed-scope`.
- A store needs a `sid` to travel in a frame.

## Minimal example

```ts
import { allSettled, event, fork, scopeBind, snapshot, store } from "@fiberfx/hypergraph";

const increment = event();
const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);

export async function run() {
  const scope = fork({ values: [[$count, 3]] });
  await allSettled(increment, { scope });
  return { now: scopeBind(() => $count.getState(), { scope })(), frame: snapshot(scope) };
}
```

## Never emit

`serialize`, `hydrate`, `fork(domain)`, `createDomain`, and any import from `effector`. Use `snapshot` and `apply`.

## Next

- Watching and inspecting: /hypergraph/observing (/hypergraph/observing/llms.txt)
- This companion: /hypergraph/scopes/llms.txt (the page as Markdown, `/hypergraph/scopes.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hypergraph/scopes)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
