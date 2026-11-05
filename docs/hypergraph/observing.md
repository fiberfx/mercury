A model is observed in two ways: application code watches a unit, and a tool, such as DevTools, a log or a test, inspects the whole model.

## watch

`watch(unit, fn, {scope?})` calls `fn` with each update of `unit` and returns a `Subscription`: a function that ends the watch, with `.unsubscribe()` as the same call.

- With `scope`, the watch sees that scope's updates and nothing outside it.
- Without one, it sees the work outside any scope.
- The watch is also owned by the **generation** of the code that made it. When a hot swap retires that generation, the watch ends with it, even if its scope lives on.

```ts
import { allSettled, event, fork, store, watch } from "@fiberfx/hypergraph";

const increment = event();
const $count = store(0).on(increment, (n) => n + 1);

export async function seen() {
  const scope = fork();
  const values: number[] = [];
  const stop = watch($count, (n) => values.push(n), { scope });
  await allSettled(increment, { scope });
  increment(); // outside the scope: not seen
  stop();
  return values; // [1]
}
```

The vector `watch.scoped-store-not-global` states the line marked *not seen*: a watch in a scope records nothing for a call outside it.

## watch and unit.watch

The two differ on a store, on purpose:

| | Called with the state now? |
|---|---|
| `watch($store, fn, {scope?})` | no, only with updates |
| `$store.watch(fn)` | yes, then with every update |

Use `watch` for a reaction in a scope. A conformance vector's `watch` records the state now as well, which is why a trace such as the diamond's in [wiring](/hypergraph/wiring) starts with each store's state.

## inspect

`inspect` is imported from its own subpath, `@fiberfx/hypergraph/inspect`, so an app that never inspects does not carry it.

`inspect({scope?, kinds?, fn})` calls `fn` with each **observation**, and returns a `Subscription`.

- With `scope`, it sees that scope only. Without one, it sees the work outside any scope, and no scoped work.
- With `kinds`, it sees only the kinds listed.
- When the last subscriber unsubscribes, the kernel stops recording, so inspection costs nothing after.

An observation is `{type, unit, scope, gen, value, cause}`. `unit` is the unit's sid, or a run-time identity for a unit no compiler named yet; `cause` is the nearest unit upstream in the launch, or `null` for a call from outside.

```ts
import { allSettled, event, fork, store } from "@fiberfx/hypergraph";
import { inspect, type Observation } from "@fiberfx/hypergraph/inspect";

const increment = event();
const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);

export async function updates() {
  const scope = fork();
  const seen: Observation[] = [];
  const subscription = inspect({ scope, kinds: ["update"], fn: (o) => seen.push(o) });
  await allSettled(increment, { scope });
  subscription.unsubscribe();
  return seen.filter((o) => o.unit === "count").map((o) => o.value);
}
```

## The kinds of observation

| `type` | When | Extra fields |
|---|---|---|
| `update` | a unit took a value | |
| `skip` | a step was stopped: a filter, an equal or `undefined` store update, an `updateFilter` refusal | |
| `fail` | a user function threw; `value` is the error | |
| `declare` | a unit was made; `value` is its `Declaration` | `fresh` when it is new in its generation |
| `perform` | an effect started | `at`, ms since the epoch |
| `settle` | an effect finished | `at` |
| `reset` | a value was not carried across a swap or a frame | `reason` |

`skip` is information, which `kinds` can leave out; it answers "why did this sample not fire". `declare` goes to unscoped inspectors. A `Declaration` is `{unit, kind, sid?, name?, derived?, owner?, gen}`; `owner` is not given yet, until the compiler names it.

A `declare` marked `fresh` is a store that only the new generation has: it starts from its initial value and nothing was lost, so it is information, not a reset (the vector `hmr.new-is-information-not-a-reset`).

## describe

`describe(reason)`, from the same subpath, words a reset's reason the way a developer reads it, for a console, an overlay or DevTools:

| `reason` | `describe(reason)` |
|---|---|
| `{kind: "removed"}` | `removed` |
| `{kind: "shape", from, to}` | `shape changed from <from> to <to>` |
| `{kind: "renamed", to}` | `renamed (a hint, not applied: it may now be <to>)` |
| `{kind: "positional"}` | `positional` |
| `{kind: "new"}` | `new` |

```ts
import { describe } from "@fiberfx/hypergraph/inspect";

export const line = describe({ kind: "shape", from: "runtime:number", to: "runtime:string" });
// "shape changed from runtime:number to runtime:string"
```

The types `Observation`, `Declaration`, `Kind` and `ResetReason` are exported from `@fiberfx/hypergraph/inspect` too.
