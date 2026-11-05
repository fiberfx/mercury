## kindOf

`kindOf(x)` says what a value is: `"store"`, `"event"`, `"effect"`, `"scope"`, or `null` for anything else, including a value that looks like a unit but was not made by this module.

```ts
import { effect, event, fork, kindOf, store } from "@fiberfx/hypergraph";

export const kinds = [kindOf(store(0)), kindOf(event()), kindOf(effect(() => 1)), kindOf(fork()), kindOf(42)];
// ["store", "event", "effect", "scope", null]
```

## setCarrier and nodeCarrier

A scope must follow an asynchronous chain: code after an `await` in a handler should still run in the handler's scope. `setCarrier(carrier)` chooses how.

- **No carrier** (`setCarrier(null)`, the default, and the browser's until the platform has async context): an effect called in a scope puts its caller back in that scope when it settles. An unrelated call that runs during the await can join the scope.
- **A carrier** carries the scope down the chain instead, so an unrelated call does not join it. A `Carrier` is `{current(), run(scope, fn)}`.

On a JavaScript server, `nodeCarrier()` from `@fiberfx/hypergraph/node` is one, built on `AsyncLocalStorage`. It is its own entry, so browser code never imports a server's modules. Set it once, at the server's start:

```ts
import { setCarrier } from "@fiberfx/hypergraph";
import { nodeCarrier } from "@fiberfx/hypergraph/node";

setCarrier(nodeCarrier());
```

## HypergraphError

A refusal is a `HypergraphError`, a subclass of `Error` with `name` `"HypergraphError"` and a `code`. The **code** is the contract: a conformance vector checks `{"code": …}`, and every runtime that holds a scope uses the same codes. The message is each kernel's own wording and may change.

```ts
import { HypergraphError, event } from "@fiberfx/hypergraph";

const typed = event<string>();
const trimmed = typed.map((text) => text.trim());

export function callDerived() {
  try {
    (trimmed as unknown as (text: string) => void)(" hi ");
  } catch (error) {
    return error instanceof HypergraphError ? error.code : "unexpected"; // "derived-call"
  }
}
```

A derived event's type has no call signature, so the cast above is needed to make the mistake at all; the kernel refuses it anyway. This is the vector `derived.map-event-refuses-call`.

## The codes, and where each surfaces

| `code` | The rule broken | How it surfaces | Do instead |
|---|---|---|---|
| `derived-call` | a derived unit was called directly | thrown to the caller | call the unit it derives from |
| `derived-target` | a derived unit was named as a `sample` target or a `split` case | thrown when the wiring is made | target a store or an event |
| `pure-call` | a unit was called from inside a pure function, such as a reducer or a `map` | reported, never thrown out of the launch (below) | wire the call with `sample` |
| `disposed-scope` | work was started in a disposed scope | the `allSettled` or the effect call rejects | fork a new scope |
| `reset-reason` | a reset was reported with a reason outside `removed`, `shape`, `renamed`, `positional`, `new` | thrown by the hot-replacement port | report one of the ruled reasons |

`reset-reason` guards the hot-replacement port, which the planned `/hmr` subpath drives; application code does not report resets.

```ts
import { HypergraphError, allSettled, dispose, event, fork } from "@fiberfx/hypergraph";

const ping = event();

export async function afterDispose() {
  const scope = fork();
  dispose(scope);
  try {
    await allSettled(ping, { scope });
  } catch (error) {
    return error instanceof HypergraphError ? error.code : "unexpected"; // "disposed-scope"
  }
}
```

## A throw inside the graph

A function the graph runs, such as a reducer, a `map`, a filter or a watcher, never throws out of the launch. A throw there is written to `console.error`, stops that branch only, and reaches `inspect` as a `fail` observation ([observing](/hypergraph/observing)).

So `pure-call` is reported, not thrown to you. The vector `impure.store-on-refuses-call` wires a reducer that calls an event: the call is refused and reported with `pure-call`, the event never launches, and the store keeps its state.

```ts
import { event, store } from "@fiberfx/hypergraph";

const hit = event();
const trigger = event();

// Refused: a reducer must not call a unit. Wire it with sample({clock: trigger, target: hit}) instead.
export const $x = store(0).on(trigger, (x) => {
  hit();
  return x;
});
```

## Errors that are not refusals

Some mistakes are plain `Error`s, with no code, because they are this JavaScript API's own and no vector states them:

- wiring units of two generations together;
- passing a value that is not a unit of this module where a unit is expected;
- `scopeBind` with no scope given and no caller scope, without `safe: true`;
- `allSettled` on a derived unit;
- a declared effect in a scope with no performer for it.

Test for a refusal by its `code`, never by its message.
