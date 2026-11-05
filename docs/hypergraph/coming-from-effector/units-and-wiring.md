Everything on this page imports from `@fiberfx/hypergraph`. What you know about Effector's units and their wiring still holds; the differences are the constructors' names, a few methods that are gone, and the effect's second form.

## Stores

`createStore(init, config)` is `store(init, config)`. The config takes the keys you know, `name`, `sid`, `serialize`, `updateFilter` and `skipVoid`, and one new key, `schema`, which names the store's shape for frames.

```ts
import { event, store } from "@fiberfx/hypergraph";

export const added = event<string>();
export const cleared = event();

export const $todos = store<string[]>([], { name: "$todos" })
  .on(added, (todos, text) => [...todos, text])
  .reset(cleared);

export const $count = $todos.map((todos) => todos.length);
```

What carries over and what does not:

- **The same:** `.on`, `.reset`, `.map`, `.getState`, `.updates` and `.watch`. `.getState()` reads the caller's scope: a watcher's, a handler's or a bound call's, else the state outside any scope.
- **Gone from the API:** `.setState`, `.off` and `.reinit`. Write a store through an event and `.on`; reset it with `.reset(event)`.
- **`sid` is the compiler's job by design, not yet in fact.** Today the compiler's sid pass instruments only the legacy facade's calls, so a Hypergraph unit has a sid only when you write one, and an unnamed unit gets a run-time identity, `api:<n>`. Write `sid` on a store that must be found again across an edit or a server render.
- **Two ways to watch.** `$store.watch(fn)` is called with the state now and then with every update. The function `watch($store, fn)`, the successor of `createWatch`, is called only on updates.

## Events

`createEvent()` is `event()`, with an optional `{name}`. An event is called as a function, and `.map`, `.filter`, `.filterMap`, `.prepend` and `.watch` are unchanged. `.filter` takes a function directly, or `{fn}` as Effector does.

A derived event, one made by `.map` or `.filter`, cannot be called: Hypergraph refuses the call with the code `derived-call`, and refuses a derived unit as a `sample` target with `derived-target`.

## Effects

`createEffect(handler)` is `effect(handler)`. The members are the same: `done`, `doneData`, `fail`, `failData`, `finally`, `pending` and `inFlight`.

```ts
import { effect, store } from "@fiberfx/hypergraph";

type User = { id: number; name: string };

export const fetchUserFx = effect<number, User>(async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

export const $user = store<User | null>(null).on(fetchUserFx.doneData, (_, user) => user);
export const $loading = fetchUserFx.pending;
```

Two things differ:

- **`effect.use` is gone.** To replace a handler, as in a test, pass it to `fork({handlers})`; see [Scopes and testing](/hypergraph/coming-from-effector/scopes-and-testing). An effect made with no handler fails when called until a scope's handler replaces it.
- **An effect can be declared instead of written.** `effect({request})`, `effect({channel})` or `effect({timer})` describes the work as data, and the scope's performer runs it. A function handler is marked JavaScript-only; a declared effect whose slots are portable expressions can run in any runtime that holds a scope. The performers are not built yet, so a declared effect fails today unless its scope is forked with `performers`, saying the scope "has no request performer for a declared effect".

## sample

`sample` is the same primitive with the same configuration: `clock`, `source`, `filter`, `fn`, `target` and `batch`. With a `target` it returns the target; without one it returns a new unit.

```ts
import { effect, event, sample, store } from "@fiberfx/hypergraph";

export const fetchUserFx = effect<number, string>(async (id) => `user ${id}`);
export const $enabled = store(true);
export const opened = event<number>();

sample({ clock: opened, filter: $enabled, target: fetchUserFx });
```

## combine, split, attach, merge and restore

All five keep their names. The restore function supports only the single-unit form; object and array forms are not supported.

```ts
import { attach, combine, effect, event, split, store } from "@fiberfx/hypergraph";

// combine: an object or a list of stores, or one argument per store, then a function.
const $first = store("Ada");
const $last = store("Lovelace");
export const $fullName = combine({ first: $first, last: $last }, ({ first, last }) => `${first} ${last}`);

// split without cases: one event per case, and __ for the rest.
const received = event<{ type: string; text: string }>();
export const { text, image, __ } = split(received, {
  text: (message) => message.type === "text",
  image: (message) => message.type === "image",
});

// attach: an effect with a source and mapParams.
const $token = store("");
const loadFx = effect<{ id: number; token: string }, string>(async ({ id, token }) => `${id}:${token}`);
export const loadWithTokenFx = attach({
  effect: loadFx,
  source: $token,
  mapParams: (id: number, token: string) => ({ id, token }),
});
```

`split({source, clock, match, cases})` routes to the cases you give, as in Effector. `merge([a, b])` is one event for the updates of several units, and `restore(event, init)` is a store holding an event's last payload or an effect's last result.

The unit methods are also exported as functions under the same names: `on($store, clock, fn)`, `reset($store, clock)`, `map`, `filter`, `filterMap` and `prepend`.

## Rewriting guard, forward and createApi

These three were deprecated or redundant in Effector, and Hypergraph does not have them. Each is a line of the kept names:

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

const submitted = event<string>();
const saved = event<string>();
const $valid = store(true);

// guard({clock: submitted, filter: $valid, target: saved})
sample({ clock: submitted, filter: $valid, target: saved });

// forward({from: submitted, to: saved})
sample({ clock: submitted, target: saved });

// createApi($volume, {up, down}): one event and one .on per key
export const $volume = store(5);
export const up = event();
export const down = event();
$volume.on(up, (volume) => volume + 1).on(down, (volume) => volume - 1);
```

## Refusals

Hypergraph names each refusal with a `HypergraphError` and a portable `code`, so a test can match the code rather than the wording, and another runtime words the same code its own way:

| Code | When |
|---|---|
| `pure-call` | a pure function calls a unit; wire the call with `sample` instead |
| `derived-call` | a derived unit is called; call the unit it derives from |
| `derived-target` | a derived unit is named as a `sample` target; target a store or an event |
| `disposed-scope` | a unit is called, or `allSettled` waits, in a disposed scope |
| `reset-reason` | the HMR port is given a reason that is not a reset reason |
