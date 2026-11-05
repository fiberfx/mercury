A model's wiring is data: each call below lowers to one edge of the graph the kernel runs. Everything here is imported from `@fiberfx/hypergraph`.

## The graph runs to quiescence

A call to an event starts a **launch**. The kernel runs every unit the launch reaches, phase by phase from one queue, until nothing is left to run; barriers wait in a heap ordered by phase, so a tie is never reordered. Within one launch, a unit downstream of two paths updates once, after both, and never sees half of them. That is what *glitch-free* means here, and a vector states it.

`kernel.diamond-one-update-per-launch` wires a diamond: `A` feeds `C` through `B`, and `D` directly; `E` combines `C` and `D`.

```ts
import { combine, event, store } from "@fiberfx/hypergraph";

const trigger = event();
const $a = store(1).on(trigger, (a) => a + 1);
const $b = $a.map((a) => a + 1);
const $c = $b.map((b) => b + 1);
const $d = $a.map((a) => a + 1);
export const $e = combine($c, $d, (c, d) => [c, d]);
```

A watcher of `$e` sees `[3, 2]` (the state now), then, after one `trigger()`, exactly one update: `[4, 3]`. There is no `[4, 2]` in between.

## sample

`sample({clock, source, filter, fn, target})` is the one composition primitive. When `clock` updates, it reads `source`, keeps the update only if `filter` allows it, maps it through `fn`, and sends the result to `target`.

- `clock`: a unit or a list of units.
- `source`: a unit, or a list or object of units. A field that is not a unit is a constant.
- `filter`: a `Store<boolean>`, or a function of `(source, clock)`.
- `fn`: a function of `(source, clock)`.
- `target`: a unit or a list. With a `target`, `sample` returns it; without one, it returns a new derived unit that carries the result.

A derived unit cannot be a `target`: the kernel refuses it with `derived-target`.

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

const submit = event();
const $text = store("");
export const $sent = store<string[]>([]);

sample({
  clock: submit,
  source: { text: $text, sent: $sent },
  filter: ({ text }) => text.length > 0,
  fn: ({ text, sent }) => [...sent, text],
  target: $sent,
});
```

## combine

`combine` makes a derived store from several stores. It takes either a list or an object of stores, then an optional function and config, or the stores as separate arguments followed by the function. A field that is not a store is a constant. The config takes `skipVoid`.

Updates in one launch reach a combined store together, through a barrier: that is the diamond above.

```ts
import { combine, store } from "@fiberfx/hypergraph";

const $first = store("Ada");
const $last = store("Lovelace");

export const $full = combine($first, $last, (first, last) => `${first} ${last}`);
export const $both = combine({ first: $first, last: $last });
```

## split

`split` routes each update of a source to one case.

- `split({source, clock?, match, cases})` sends to the units in `cases`. `match` is a `Store<string>` or a function that names the case, or an object of predicates (functions or `Store<boolean>`). It returns nothing.
- `split(source, match)`, with an object of predicates, returns one new event per case, plus `__` for a value no case matches.

```ts
import { event, split } from "@fiberfx/hypergraph";

const listed = event<string[]>();
export const { empty, one, __: many } = split(listed, {
  empty: (list: string[]) => list.length === 0,
  one: (list: string[]) => list.length === 1,
});
```

This is the vector `split.shape-default-case`: `[]` goes to `empty`, `["foo", "bar"]` to `__`.

## attach

`attach({effect, source, mapParams})` makes a new effect that calls another with its params built from a source. `mapParams(params, source)` builds them. `effect` may also be a function of `(source, params)`.

```ts
import { attach, effect, store } from "@fiberfx/hypergraph";

const $token = store("secret");
const request = effect(async ({ url, token }: { url: string; token: string }) =>
  fetch(url, { headers: { authorization: token } }),
);

export const authorized = attach({
  effect: request,
  source: $token,
  mapParams: (url: string, token: string) => ({ url, token }),
});
```

## merge and restore

`merge(units)` is one event for the updates of several units: its payload is any of theirs. `restore(from, init)` is a writable store that holds a unit's last payload, starting from `init`. `restore` takes one unit; it has no object or list form.

```ts
import { event, merge, restore } from "@fiberfx/hypergraph";

const saved = event<string>();
const loaded = event<string>();

export const changed = merge([saved, loaded]);
export const $last = restore(changed, "");
```

## The unit operators as functions

`on`, `reset`, `map`, `filter`, `filterMap` and `prepend` are also exported as functions of a unit, for code that wires from outside it: `on(store, clock, fn)` is `store.on(clock, fn)`, `map(unit, fn)` is `unit.map(fn)`, and so on.

```ts
import { event, map, on, store } from "@fiberfx/hypergraph";

const add = event<number>();
export const $total = store(0);
on($total, add, (total, n) => total + n);
export const $label = map($total, (total) => `${total} items`);
```

## One generation per wiring

Every unit belongs to the generation of the code that made it. Wiring units of two generations together is refused (`units of two generations cannot be wired together`): under hot replacement, a new generation's code wires only its own units.
