# Capstone: a model, round-tripped — Mercury LMS

> One `@fiberfx/hypergraph` model built from the exports, run in a `fork()`, its frame taken with `snapshot`, applied into a fresh scope with `fork({values: frame})`, proven equal with `diff(replica, frame)`, then kept in step with `apply(replica, diff(scope, frame))`. Expected values are read from the package's own test, `fiberfx/hypergraph/test/api-types.test.ts`.

## Read this when

You need a complete, correct pattern for a model plus its test with a snapshot round-trip, e.g. server-to-client handoff or a replica kept current by diffs.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- Only writable stores with a `sid` enter a frame; derived stores recompute on the replica.
- `await allSettled(event, {scope, params})` settles effects started by `sample` too.
- `snapshot(scope)` → `{format: 'mhg-scope/1', gen, values: {sid: {shape, value}}}`.
- `fork({values: frame})` = new scope + apply the frame.
- Equality: `diff(replica, frame)` → `changed: {}` (no entry new or different) and `removed: []` (no frame entry missing). `changed` is asserted by the package's test; `removed` is read from the kernel, not run.
- Step: `apply(replica, diff(scope, since))`.
- A call outside any scope (`add(5)`) changes only the global state, never a scope.

## Minimal example

```ts
import { expect, test } from "vitest";
import { allSettled, apply, diff, event, fork, scopeBind, snapshot, store } from "@fiberfx/hypergraph";

const add = event<number>();
const $count = store(0, { sid: "count" }).on(add, (n, by) => n + by);
const read = (scope: ReturnType<typeof fork>) => scopeBind(() => $count.getState(), { scope })();

test("round-trips its frame", async () => {
  const scope = fork();
  await allSettled(add, { scope, params: 3 });
  const frame = snapshot(scope);              // values.count = { shape: "runtime:number", value: 3 }
  const replica = fork({ values: frame });
  expect(read(replica)).toBe(3);
  expect(diff(replica, frame).changed).toEqual({});
  await allSettled(add, { scope, params: 1 });
  apply(replica, diff(scope, frame));
  expect(read(replica)).toBe(4);
});
```

## Never emit

`serialize`, `hydrate`, a store without a `sid` expected to travel, a comparison of `getState()` outside the scope as proof of the replica, and any import from `effector` or `@fiberfx/hypergraph/hmr`.

## Next

- The course: /hypergraph (/hypergraph/llms.txt)
- This companion: /hypergraph/capstone/llms.txt

## Navigation

- [Read this page in the browser](/hypergraph/capstone)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
