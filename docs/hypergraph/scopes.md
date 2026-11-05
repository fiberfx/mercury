A scope is one isolated copy of a model's state. The model's units are declared once; each scope holds its own values for them. A server forks one per request, a test forks one per case, a page holds one root.

## What a scope is

A `Scope` is a small handle, `{id, gen}`, where `gen` is the generation of the graph now committed. The handle lives across a hot swap: when a new generation commits, every live scope moves to it, carries over each value whose sid and shape still match, and reports what it could not carry. Code that holds a scope keeps using the same handle.

## fork

`fork(config?)` makes a scope of the committed generation. The config may give:

- `values`: initial values, as `[store, value]` pairs, as a record by sid, or as a snapshot frame;
- `handlers`: `[effect, handler]` pairs that replace effects' handlers in this scope only; a handler may be a function or another effect;
- `performers`: what runs declared effects in this scope (a preview; see [units](/hypergraph/units)).

```ts
import { effect, fork, store } from "@fiberfx/hypergraph";

const $count = store(0, { sid: "count" });
const loadUser = effect(async (id: number) => ({ id, name: "from the network" }));

export const scope = fork({
  values: [[$count, 3]],
  handlers: [[loadUser, async (id: number) => ({ id, name: "Ada" })]],
});
```

## allSettled

`allSettled(unit, {scope, params})` starts `unit` in the scope and resolves when nothing is in flight there, including effects that the launch started. For an effect it resolves to `{status: 'done' | 'fail', value}`. `allSettled(scope)` alone waits for what is already in flight.

```ts
import { allSettled, effect, fork, store } from "@fiberfx/hypergraph";

const loadUser = effect(async (id: number) => ({ id, name: "from the network" }));
export const $name = store("", { sid: "name" }).on(loadUser.doneData, (_, user) => user.name);

export async function testLoad() {
  const scope = fork({ handlers: [[loadUser, async (id: number) => ({ id, name: "Ada" })]] });
  const result = await allSettled(loadUser, { scope, params: 1 });
  return result; // { status: "done", value: { id: 1, name: "Ada" } }
}
```

## scopeBind and reading a value

`scopeBind(fn, {scope?, safe?})` returns `fn` bound to a scope, so a call from outside it, such as a timer's, still runs there. Without `scope`, it binds to the caller's scope (a watcher's or a handler's); with no caller scope, it throws unless `safe: true`. The binding is resolved at each call, so a function bound before a hot swap runs in the scope the handle names after it.

A store's `.getState()` reads the caller's scope, so a bound call is how code outside the graph reads a value in a scope:

```ts
import { allSettled, event, fork, scopeBind, store } from "@fiberfx/hypergraph";

const increment = event();
const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);

export async function twice() {
  const scope = fork();
  await allSettled(increment, { scope });
  await allSettled(increment, { scope });
  return scopeBind(() => $count.getState(), { scope })(); // 2
}
```

## snapshot, diff and apply

A **frame** is a scope's values as data: `{format: 'mhg-scope/1', gen, values}`, where `values` maps a sid to an entry `{shape, schema?, value}`. Its keys are sids, so a frame from one build applies in another.

- `snapshot(scope, {ignore?})` is the scope's frame: each writable store with a sid that the scope changed or was given, its value written through the store's `serialize`, and its shape. A store with `serialize: 'ignore'`, or one listed in `ignore`, stays out.
- `diff(scope, since)` is the frame of what changed since an earlier snapshot: `{format, gen, from, changed, removed}`.
- `apply(scope, frame)` brings a scope to a snapshot or a diff. It takes an entry only where a store claims its sid with the same shape, and returns each entry it could not take as a `Miss`, `{unit, reason}`, with the reason `{kind: 'removed'}` (no store claims the sid) or `{kind: 'shape', from, to}`. Each miss is also reported to `inspect` as a `reset`.

Until the compiler emits shapes, a store's shape is read from its value, as `runtime:<structure>`: `runtime:number`, `runtime:string`, `runtime:object{a:number}`. A declared `schema` gives `<id>@<version>` instead.

```ts
import { apply, diff, fork, snapshot, store } from "@fiberfx/hypergraph";

const $count = store(0, { sid: "count" });

export function handOver() {
  const server = fork({ values: [[$count, 3]] });
  const frame = snapshot(server); // values: { count: { shape: "runtime:number", value: 3 } }
  const client = fork();
  const misses = apply(client, frame); // []
  const since = snapshot(client);
  return { misses, changes: diff(client, since) };
}
```

## dispose

`dispose(scope)` ends a scope. Its values stop taking work, the watches bound to it stop, and an `allSettled` waiting on it settles. After that, `allSettled` on the scope and an effect called in it reject with a `HypergraphError` whose code is `disposed-scope`.

```ts
import { dispose, fork } from "@fiberfx/hypergraph";

const scope = fork();
dispose(scope);
```

## What the vectors pin down

- `fork.scope-isolated-from-global`: an async effect started during a scoped launch is awaited by `allSettled` and updates only the scope; outside it the store is unchanged.
- `fork.serialize-skips-unchanged`: a frame holds only what the scope changed; before the first update it is empty.
- `fork.serialize-sidless-omitted`: a store with an empty sid takes values in the scope but stays out of the frame.
