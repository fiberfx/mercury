A server renders one model for many requests at once. Hypergraph keeps them apart with scopes: one per request, settled on the server, then handed to the browser as data.

## The flow

1. **Fork** a scope for the request.
2. **Settle** it: start the event that loads the page with `allSettled`, which waits for every effect the launch started.
3. **Snapshot** it: a frame of its values, keyed by sid.
4. **Dispose** the server's scope.
5. **Send** the frame with the page; on the client, **apply** it to a scope of its own.

## On the server

```ts
import { allSettled, dispose, effect, event, fork, sample, snapshot, store } from "@fiberfx/hypergraph";

export const pageOpened = event<number>();
export const loadUser = effect(async (id: number) => {
  const response = await fetch(`https://api.example.com/users/${id}`);
  return (await response.json()) as { name: string };
});
export const $name = store("", { sid: "name" }).on(loadUser.doneData, (_, user) => user.name);

sample({ clock: pageOpened, target: loadUser });

export async function render(id: number): Promise<string> {
  const scope = fork();
  await allSettled(pageOpened, { scope, params: id });
  const frame = snapshot(scope);
  dispose(scope);
  return JSON.stringify(frame);
}
```

`allSettled` resolves only when nothing is in flight in the scope, so the effect that `sample` started has settled and `$name` holds the user's name, in this scope only. Another request's scope, or the work outside any scope, is not touched.

A request can also replace an effect's handler for its own scope only: `fork({handlers: [[loadUser, handler]]})`, for example to read from the server's own data instead of making an HTTP call.

## On the client

```ts
import { apply, fork, type Snapshot } from "@fiberfx/hypergraph";

export function resume(text: string) {
  const frame = JSON.parse(text) as Snapshot;
  const scope = fork();
  const misses = apply(scope, frame); // [] when the client's stores match
  return { scope, misses };
}
```

`fork({values: frame})` does the same in one call, and reports any miss as a `reset` observation. `apply` also returns them, which is useful while you build: each miss is `{unit, reason}`, with `removed` when no store on the client claims the sid, or `shape` with both shapes when the client's store has another shape.

## What travels in a frame

A frame is `{format: "mhg-scope/1", gen, values}`, where `values` maps a sid to `{shape, schema?, value}`. Its keys are sids, not positions or run-time identities, so a frame from the server's build applies in the client's.

- **Only stores with a sid travel.** The sid is the compiler's, or one written in `sid`; these examples write it so the keys are visible. A unit no compiler named has only a run-time identity, which means nothing in another process, and stays out.
- **Only what the scope changed or was given** is in the frame; a store still at its initial value is left out, and the client's own initial value stands.
- **Derived stores stay out.** The client recomputes them from the stores that travelled.
- **`serialize: 'ignore'`** keeps a store's value on the server, such as a secret or a cache.
- **A value that is not plain JSON** needs `serialize: {write, read}`: `write` turns it into a form that travels, and `apply` runs `read` to turn it back.

```ts
import { store } from "@fiberfx/hypergraph";

export const $seenAt = store(new Date(0), {
  sid: "seenAt",
  serialize: { write: (date) => date.toISOString(), read: (text: string) => new Date(text) },
});
```

## Concurrent requests and the carrier

A handler that awaits gives other requests time to run. The question is which scope a call belongs to when the handler resumes.

- **No carrier, the default.** An effect called in a scope puts its caller back in that scope when it settles. That is correct for one flow at a time, as in a browser tab, but a call from outside the flow that runs during the await, such as a timer's, can join the suspended scope.
- **A carrier** carries the scope down each asynchronous chain instead, so every request's continuations stay in its own scope and nothing else joins it.

On a JavaScript server, install the Node carrier once, at startup:

```ts
import { setCarrier } from "@fiberfx/hypergraph";
import { nodeCarrier } from "@fiberfx/hypergraph/node";

setCarrier(nodeCarrier());
```

The package's tests state the difference with a leak probe. A scoped effect awaits for 50 ms; at 25 ms a timer from outside the flow calls an event that increments a store. With no carrier, the stray call joins the suspended scope: global `0`, scope `1`. Under `nodeCarrier()`, it stays outside: global `1`, scope `0`. A second test races three scopes' effects without timers and asserts, under the carrier, that each scope keeps its own calls and the global counts stay `0`.

`@fiberfx/hypergraph/node` is its own entry, built on the server's `AsyncLocalStorage`, so browser code never imports a server's modules. Never import it from code the browser loads.

## Callbacks from outside the chain

A callback that the graph did not start, such as a message from a socket, has no scope of its own. Bind it when you have one: `scopeBind(fn, {scope})` returns a function that runs in that scope whenever it is called. Under the carrier, a bound async function keeps its scope across every `await` inside it: the package's test binds one that awaits four effect calls in turn, and the two increments among them count `2` in the scope and `0` outside it.

## A checklist

- One `fork()` per request; never share a scope between requests.
- `await allSettled(...)` before `snapshot`, so no effect is still in flight.
- `dispose` the server's scope once its frame is taken.
- `setCarrier(nodeCarrier())` once, at server start.
- A sid on every store whose value the client needs; `serialize: 'ignore'` on every one it must not see.
- On the client, check what `apply` returns while you build: an empty list means every value arrived.
