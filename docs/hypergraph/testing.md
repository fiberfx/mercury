Hypergraph's units are declared once, at module level, and every value lives in a scope. That makes a test simple to isolate: each test forks its own scope, and nothing it does reaches another test or the work outside any scope.

## Why a scope per test

- **Isolation.** A launch in a scope updates that scope only. The vector `fork.scope-isolated-from-global` states it: an effect started in a scope is awaited by `allSettled` and updates the scope's store to `1`, while outside it the store still reads `0`.
- **No reset code.** A new `fork()` reads each store's initial value, even after a call outside any scope changed it there (vector `fork.no-scope-event-before-fork`); there is nothing to clean up between tests except to `dispose` a scope you are done with.
- **Handlers per scope.** A test gives an effect the handler it needs, for that scope only, with no mocking of modules.

## Running tests with mx test

`mx test` runs a member's test files, `*.test.ts` and `*.spec.ts` among them, in a headless browser that mx starts itself. A `vitest` import maps to mx's own runtime, which has `describe`, `test`, `it`, `expect` and the usual matchers. It exits `0` when every test passed, `1` when one failed or none ran, and `3` when it could not start a browser.

The tests run in a browser, so `@fiberfx/hypergraph/node` is not for them; the scope behaves as it does in the browser.

## A first test

The model:

```ts
import { event, store } from "@fiberfx/hypergraph";

export const increment = event();
export const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);
```

The test reads a store in the scope through `scopeBind`, the same helper the package's own tests use:

```ts
import { describe, expect, test } from "vitest";
import { allSettled, fork, scopeBind, type Scope, type Store } from "@fiberfx/hypergraph";
import { $count, increment } from "./counter";

const read = <T>(store: Store<T>, scope: Scope): T => scopeBind(() => store.getState(), { scope })();

describe("counter", () => {
  test("counts in its own scope", async () => {
    const scope = fork();
    await allSettled(increment, { scope });
    await allSettled(increment, { scope });
    expect(read($count, scope)).toBe(2);
  });

  test("starts from a given value", async () => {
    const scope = fork({ values: [[$count, 10]] });
    await allSettled(increment, { scope });
    expect(read($count, scope)).toBe(11);
  });
});
```

## Replacing effects

`fork({handlers})` takes `[effect, handler]` pairs, where a handler is a function or another effect. For an effect, `allSettled` resolves to `{status, value}`, so a test can assert on both outcomes without a `try`:

```ts
import { expect, test } from "vitest";
import { allSettled, effect, fork } from "@fiberfx/hypergraph";

const loadUser = effect(async (id: number) => {
  const response = await fetch(`/api/users/${id}`);
  return (await response.json()) as { name: string };
});

test("loads a user", async () => {
  const scope = fork({ handlers: [[loadUser, async (id: number) => ({ name: `user ${id}` })]] });
  expect(await allSettled(loadUser, { scope, params: 7 })).toEqual({ status: "done", value: { name: "user 7" } });
});

test("reports a failure", async () => {
  const offline = new Error("offline");
  const scope = fork({ handlers: [[loadUser, async () => { throw offline; }]] });
  expect(await allSettled(loadUser, { scope, params: 7 })).toEqual({ status: "fail", value: offline });
});
```

## Asserting on a frame

`snapshot(scope)` gives every changed store with a sid at once, which suits a test of a whole page's state. Each entry is `{shape, value}`:

```ts
import { expect, test } from "vitest";
import { allSettled, fork, snapshot } from "@fiberfx/hypergraph";
import { increment } from "./counter";

test("the frame holds what changed", async () => {
  const scope = fork();
  expect(snapshot(scope).values).toEqual({});
  await allSettled(increment, { scope });
  expect(snapshot(scope).values.count).toMatchObject({ shape: "runtime:number", value: 1 });
});
```

## Asserting with inspect

`inspect` from `@fiberfx/hypergraph/inspect` sees what happened, not only where it ended: each update in launch order, each step a filter stopped, each function that threw. Subscribe for the scope before you drive it, and unsubscribe after:

```ts
import { expect, test } from "vitest";
import { allSettled, fork } from "@fiberfx/hypergraph";
import { inspect, type Observation } from "@fiberfx/hypergraph/inspect";
import { increment } from "./counter";

test("one update per launch, no failures", async () => {
  const scope = fork();
  const seen: Observation[] = [];
  const stop = inspect({ scope, kinds: ["update", "fail"], fn: (o) => seen.push(o) });
  await allSettled(increment, { scope });
  stop();
  expect(seen.filter((o) => o.type === "fail")).toHaveLength(0);
  expect(seen.filter((o) => o.unit === "count").map((o) => o.value)).toEqual([1]);
});
```

Watch for `fail` in particular. A function the graph runs never throws out of the launch: its error goes to `console.error` and to a `fail` observation, so a test that only reads values can pass while a reducer is failing.

## Reading the vectors

The conformance vectors in `specs/mercury/vectors/hypergraph/` say what the kernel does, as data that every runtime holding a scope runs. When you are unsure what a model will do, look for the vector that states it.

- A **family file** is `{"format": "hgv/1", "family": …, "vectors": […]}`, and a vector's id is `<family>.<name>`, such as `kernel.diamond-one-update-per-launch`.
- A **vector** has `units` (stores, events, effects), `wiring` (edges such as `on`, `map`, `combine`, `sample`, `watch`), `steps` (`call`, `fork`, `allSettled`, `check`, …) and `expect`.
- **`expect.trace`** is the whole ordered list of `[unit, value]` that the watches recorded, across units; the order within a launch is part of the contract. Its other keys are `state` (outside any scope), `scopes`, `spies`, `errors` and `inspected`.
- **Functions are data**, in hgx/1: `{"arg": 0}` is the first argument, `{"op": "add", "args": [{"arg": 0}, 1]}` adds one. No runner needs JavaScript to read them.
- **Values are JSON**, with `{"$undef": true}` for `undefined` and `{"$error": message}` for a thrown error. An error is checked by its portable code, `{"code": "derived-call"}`, never by its message.
- **Where each vector comes from.** A vector has a `source`, the test case it states, or `observed`, `{by, rule, why}`, for a rule set by design. `protocol.json` holds Hypergraph's own rules this way: generations, frames, slots, resets.

The package's own runners take the `hgv/1` and `protocol.json` vectors twice: once against the kernel, and once through the public API you import. The swap's `hmr.json` vectors run against its diff ([hot replacement](/hypergraph/hot-replacement)).

## From a vector to a test

`kernel.diamond-one-update-per-launch`, shortened:

```json
{
  "units": [{"id": "trigger", "kind": "event"}, {"id": "A", "kind": "store", "init": 1}],
  "wiring": [
    {"op": "on", "store": "A", "clock": "trigger", "fn": {"op": "add", "args": [{"arg": 0}, 1]}},
    {"op": "map", "from": "A", "fn": {"op": "add", "args": [{"arg": 0}, 1]}, "as": "B"},
    {"op": "map", "from": "B", "fn": {"op": "add", "args": [{"arg": 0}, 1]}, "as": "C"},
    {"op": "map", "from": "A", "fn": {"op": "add", "args": [{"arg": 0}, 1]}, "as": "D"},
    {"op": "combine", "stores": ["C", "D"], "variadic": true, "fn": {"op": "arr", "args": [{"arg": 0}, {"arg": 1}]}, "as": "E"},
    {"op": "watch", "unit": "E"}
  ],
  "steps": [{"call": "trigger"}],
  "expect": {"trace": [["E", [3, 2]], ["E", [4, 3]]]}
}
```

The same rule as a test of your own model, in a scope:

```ts
import { expect, test } from "vitest";
import { allSettled, combine, event, fork, store, watch } from "@fiberfx/hypergraph";

const trigger = event();
const $a = store(1).on(trigger, (a) => a + 1);
const $c = $a.map((a) => a + 1).map((b) => b + 1);
const $d = $a.map((a) => a + 1);
const $e = combine($c, $d, (c, d) => [c, d]);

test("the diamond updates once per launch", async () => {
  const scope = fork();
  const seen: number[][] = [];
  const stop = watch($e, (e) => seen.push(e), { scope });
  await allSettled(trigger, { scope });
  stop();
  expect(seen).toEqual([[4, 3]]);
});
```

The vector's trace starts with `[3, 2]` because its `watch` records the state at once; `watch` with a scope reports updates only, so the test sees the single update, `[4, 3]`, and never a half-updated `[4, 2]`.
