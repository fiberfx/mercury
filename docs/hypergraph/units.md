Everything in a Hypergraph model is a unit, and every unit is one of three kinds. Each is a function imported from `@fiberfx/hypergraph`, and each handle carries its kind in `.kind`.

## Three kinds

| Kind | Made by | Holds or carries | Called? |
|---|---|---|---|
| store | `store(init, config?)` | a value, from `init` until an update | no |
| event | `event<T>(config?)` | a payload, once per call | yes, with the payload |
| effect | `effect(handler)` | a handler's run and its outcome | yes, returns a promise |

A unit the graph computes, such as the result of `.map`, is **derived**: the graph writes it, so it cannot be called or named as a target. The [errors lesson](/hypergraph/errors) has the refusals.

## store

`store(init, config?)` makes a writable store that holds `init` until something updates it. The config may give:

- `name`: the name a developer reads in a report;
- `sid`: an identity written by hand, the escape from the compiler's identity, for a value that must be found again across an edit or a server render;
- `skipVoid`: whether an update to `undefined` is skipped or kept;
- `updateFilter(next, prev)`: decides whether an update is taken;
- `serialize`: `'ignore'`, so the value never travels in a frame, or `{write, read}` for a value that needs its own form;
- `schema`: `{id, version}`, a declared schema; the store's shape becomes `<id>@<version>`.

A writable store updates through `.on(clock, fn)`, where `clock` is a unit or a list of units and `fn(state, payload)` returns the next state. `.reset(...clocks)` sets it back to `init`. Both return the store, so they chain.

Every store, writable or derived, has:

- `.getState()`: the state in the caller's scope (a watcher's, a handler's, a bound call's), else outside any scope;
- `.map(fn, {skipVoid?})`: a derived store;
- `.updates`: an event of its updates;
- `.watch(fn)`: called with the state now, then with every update.

```ts
import { event, store } from "@fiberfx/hypergraph";

const increment = event<number>();
const reset = event();

export const $count = store(0, { name: "$count" })
  .on(increment, (count, by) => count + by)
  .reset(reset);

export const $doubled = $count.map((count) => count * 2);
```

`setState` and `off` are not part of the API. A store changes only through its wiring.

## event

`event<T>(config?)` makes a callable event; the config may give a `name`. Calling it with a payload starts one update through everything wired to it.

- `.map(fn)`, `.filter(fn)` and `.filterMap(fn)` each make a derived event. `filter` also takes `{fn}`; `filterMap` drops a payload for which `fn` returns `undefined`.
- `.prepend(fn)`, on a callable event, makes a new callable event whose payload passes through `fn` first.
- `.watch(fn)` is called with each payload.

```ts
import { event } from "@fiberfx/hypergraph";

export const typed = event<string>();
export const trimmed = typed.map((text) => text.trim());
export const nonEmpty = trimmed.filter((text) => text.length > 0);
export const fromNumber = typed.prepend((n: number) => String(n));
```

## effect

`effect(handler)` makes an effect from a handler, which may return a value or a promise. Calling the effect runs the handler and returns a promise of its result. The outcome also arrives as units:

- `.done` carries `{params, result}`, and `.doneData` the result;
- `.fail` carries `{params, error}`, and `.failData` the error;
- `.finally` carries `{status: 'done', params, result}` or `{status: 'fail', params, error}`;
- `.pending` is a store of whether a call is running, and `.inFlight` a store of how many are.

An effect also has the event methods (`map`, `filter`, `filterMap`, `prepend`, `watch`). An effect made with no handler fails when it is called, until a scope's `handlers` give it one ([scopes](/hypergraph/scopes)). There is no `.use`: a handler is given once, at creation, or per scope.

```ts
import { effect, store } from "@fiberfx/hypergraph";

export const loadUser = effect(async (id: number) => {
  const response = await fetch(`/api/users/${id}`);
  return (await response.json()) as { name: string };
});

export const $name = store("").on(loadUser.doneData, (_, user) => user.name);
export const $loading = loadUser.pending;
```

## Declared effects

`effect` also takes a declared spec in place of a handler: `{request}`, `{channel, payload?}` or `{timer}`. A spec is data, and the scope's performer runs it, so a runtime other than JavaScript can perform the same effect. A slot is either a JavaScript function, which marks the effect as JavaScript-only, or an hgx/1 expression.

This is a **preview**. The performers arrive with a later step (H4); until a scope is forked with `performers`, a declared effect throws that the scope has no performer for it.

## What the vectors pin down

The conformance vectors state these behaviours as data, and every runtime runs them:

- `store.on-void-skips`: without an explicit `skipVoid`, a reducer that returns `undefined` leaves the store as it was and fires no update. `store.on-void-value-allowed` is the `skipVoid: false` case, where `undefined` is taken.
- `effect.pending-false-true-false`: a watcher of `.pending` sees `false` (the state now), `true` when the call starts, and `false` when it settles.
- `effect.finally-done-payload`: `.finally` carries `{status: "done", params, result}`.
- `effect.done-and-finally-one-launch`: `.done` and `.finally` settle in the same launch, so a store combined from both updates once, not twice.
