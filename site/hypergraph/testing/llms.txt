# Testing a model: a scope per test — Mercury LMS

> Test a `@fiberfx/hypergraph` model with one `fork()` per test: replace effect handlers per scope, drive with `allSettled`, read with `scopeBind(() => $s.getState(), {scope})()` or `snapshot(scope)`, assert observations with `inspect`. Tests run under `mx test` (headless browser; `vitest` maps to mx's runtime). The conformance vectors in `specs/mercury/vectors/hypergraph/` are the kernel's behaviour as data.

## Read this when

You write or fix a test for a Mercury model, need to fake an effect, or want to know exactly what the kernel does in a case (find its vector).

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- One `fork()` per test. A new scope reads every store's init, even after unscoped calls; a scoped launch never touches the global state.
- `fork({values: [[store, v]], handlers: [[effect, fn | effect]]})`: scope-local values and handlers; no module mocking.
- `await allSettled(event, {scope, params})`; for an effect it resolves `{status: 'done', value}` or `{status: 'fail', value: error}` (never rejects for a handler failure).
- Read: `scopeBind(() => $s.getState(), {scope})()`; `snapshot(scope).values[sid]` → `{shape, value}`; empty `{}` before any change.
- `inspect({scope, kinds, fn})` before driving, unsubscribe after. Every update reported once, in launch order. Assert no `fail`: a throwing reducer never throws out of the launch, it only logs and observes `fail`.
- `watch($s, fn, {scope})` reports updates only (no initial call).
- `mx test`: files `*.test.*` / `*.spec.*` (js, mjs, jsx, ts, mts, tsx); `import {describe, test, expect} from "vitest"`; exit 0 pass, 1 fail or none ran, 3 no browser. Do not use `@fiberfx/hypergraph/node` in these tests.
- Vectors: `{format: 'hgv/1', family, vectors}`; id `<family>.<name>`; keys `units`, `wiring`, `steps`, `expect` (`trace` = total order within a launch, `state`, `scopes`, `spies`, `errors` by `{code}`, `inspected`); functions in hgx/1 (`{arg: n}`, `{op, args}`, `{lit}`); `{"$undef": true}`, `{"$error": msg}`. `protocol.json` = Hypergraph's own rules (`observed {by, rule, why}`); `hmr.json` = the swap's diff.

## Minimal example

```ts
import { expect, test } from "vitest";
import { allSettled, effect, fork } from "@fiberfx/hypergraph";

const loadUser = effect(async (id: number) => ({ name: `remote ${id}` }));

test("loads a user", async () => {
  const scope = fork({ handlers: [[loadUser, async (id: number) => ({ name: `user ${id}` })]] });
  expect(await allSettled(loadUser, { scope, params: 7 })).toEqual({ status: "done", value: { name: "user 7" } });
});
```

## Never emit

Tests that call units outside a scope and read global state, module mocks for effects (use `handlers`), `effect.use`, `serialize`, `npm test`/`node --test`/Vite runners for app tests (use `mx test`), and any import from `effector`.

## Next

- Next chapter: /hypergraph/models (/hypergraph/models/llms.txt)
- The course: /hypergraph (/hypergraph/llms.txt)
- This companion: /hypergraph/testing/llms.txt

## Navigation

- [Read this page in the browser](/hypergraph/testing)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
