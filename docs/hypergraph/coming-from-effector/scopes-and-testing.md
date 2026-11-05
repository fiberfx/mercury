All of Effector's scope model carries over: `fork` makes an isolated copy of the graph's state, `allSettled` runs a unit in it and waits, and `scopeBind` binds a callback to it. What changes is what comes out of a scope. Effector's `serialize` returned a plain object; Hypergraph's `snapshot` returns a frame.

## fork and handlers

`fork({values, handlers})` takes the same two keys as in Effector, and a third, `performers`, for declared effects.

- **`values`** sets stores' starting state in the scope: a list of `[store, value]` pairs, an object by sid, or a `snapshot` frame.
- **`handlers`** replaces effects' handlers in the scope: a list of `[effect, handler]` pairs, where the handler is a function or another effect.

There is no `fork(domain)`: domains are not part of Hypergraph.

## A test, end to end

The Effector testing pattern, a scope with a stubbed handler and `allSettled`, works as it did:

```ts
import { allSettled, effect, fork, scopeBind, store } from "@fiberfx/hypergraph";

const fetchUserFx = effect<number, string>(async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.text();
});
const $user = store<string | null>(null).on(fetchUserFx.doneData, (_, user) => user);

const scope = fork({
  handlers: [[fetchUserFx, async (id: number) => `stub ${id}`]],
});

await allSettled(fetchUserFx, { scope, params: 7 });

const user = scopeBind(() => $user.getState(), { scope })();
// user is "stub 7"; outside the scope, $user.getState() is still null.
```

`allSettled(scope)` with no unit waits for whatever is already in flight in that scope.

## Reading a store in a scope

Effector's scope had `scope.getState($store)`. A Hypergraph scope has no such method: it carries only its `id` and its generation, `gen`. A store's `getState()` reads the scope of whoever calls it, so you read a store in a scope by calling it inside a function bound to that scope, as above:

```ts
import { scopeBind } from "@fiberfx/hypergraph";

const read = scopeBind(() => $user.getState(), { scope });
read();
```

`scopeBind` binds any function, not only an event or an effect. Without a `scope` it binds to the caller's scope, such as a watcher's or a handler's; `safe: true` allows binding when there is none.

To follow a store in a scope over time, use `watch($user, fn, { scope })`.

## snapshot, apply and diff

For server rendering, Effector's `serialize(scope)` became `snapshot(scope)`, and `hydrate(scope, {values})` became `apply(scope, frame)`.

```ts
import { apply, fork, snapshot, store } from "@fiberfx/hypergraph";

// Today a store has a sid only when one is written, as here; the compiler is meant to assign them.
export const $user = store<string | null>(null, { sid: "user" });

// On the server, after the scope has settled:
const serverScope = fork({ values: [[$user, "Ada"]] });
const frame = snapshot(serverScope);
// frame is { format: "mhg-scope/1", gen, values: { user: { shape, value } } }

// In the browser, either fork from the frame...
const clientScope = fork({ values: frame });
// ...or apply it to a scope you already have, and see what it could not take:
const misses = apply(clientScope, frame);
```

Where Effector code read `serialize(scope)[sid]`, read `snapshot(scope).values[sid].value`. Every entry carries the store's shape beside its value, so `apply` takes an entry only when a store claims its sid with the same shape. It returns the rest, each with a reason: `removed`, when no store claims the sid, or `shape`, with the two shapes named. Effector's `hydrate` returned nothing.

`snapshot(scope, { ignore: [$secret] })` leaves stores out, as `serialize`'s `ignore` did. There is no `onlyChanges` option. A store's own `serialize: "ignore"` or `serialize: { write, read }` config works as in Effector.

`diff(scope, since)` is new: the frame of what changed since an earlier snapshot, with `changed` and `removed` entries, which `apply` also accepts.

## Ending a scope

`dispose(scope)` is new. It ends a scope: its values stop taking work, its watches stop, and an `allSettled` waiting on it settles. A unit called in a disposed scope is refused with the code `disposed-scope`.

Hypergraph's kernel can also keep a scope across a hot swap of the model: the scope you hold moves to the new generation of the graph, and the values that match carry over. That swap is built but not delivered yet: `@fiberfx/hypergraph/hmr` is not exported and `mx dev` doesn't deliver it, so today an edit reloads the page ([Hot replacement](/hypergraph/hot-replacement#status)).

## The scope across an await

By default, Hypergraph does what Effector does: an effect called in a scope puts its caller back in that scope when it settles. So an unrelated call that runs during the `await`, such as a timer, can land in that scope. `scopeBind` is the safe way to capture a scope in a callback.

On a Node server, set a carrier once, and the scope follows each async chain instead, so a call from outside the chain does not join a suspended flow:

```ts
import { setCarrier } from "@fiberfx/hypergraph";
import { nodeCarrier } from "@fiberfx/hypergraph/node";

setCarrier(nodeCarrier());
```

The browser has no carrier yet, so there the default holds.
