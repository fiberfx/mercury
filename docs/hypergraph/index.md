Hypergraph is Mercury's state kernel: the package `@fiberfx/hypergraph`, version 4.0.0, with no dependencies. A model is a graph of units, and Hypergraph runs it.

## What Hypergraph is

Hypergraph is a scheduler and graph executor. It runs a model's wiring to quiescence, glitch-free and batched, with fork scopes, effects and one observation surface. Three things set it apart:

- **Identity is the compiler's job, by design.** Each unit has a stable identity, its sid, and a shape beside it, so a store can be found again across an edit, a server render or another runtime. Today the compiler's sid pass instruments only the legacy facade's calls, not Hypergraph's, so a Hypergraph unit has a sid only when you write one; an unnamed unit gets a run-time identity, `api:<n>`, until the compiler names it. Until the compiler emits shapes too, the kernel reads each store's shape from its initial value.
- **The wiring is data.** A model's units and edges are a graph the kernel loads, so a browser, a server and a test can all run one description of it.
- **The semantics are vectors.** What the kernel must do is stated as conformance vectors: 467 of them, in 19 families. Every runtime that holds a scope runs the same files, and a count against them is the claim.

## The names

- **Units take the names of their kinds:** `store`, `event` and `effect`. An effect takes its handler directly.
- **Wiring:** `sample` is the one composition primitive. `combine` batches its sources through a barrier. `split`, `attach`, `merge` and `restore` complete it, with `on`, `reset`, `map`, `filter`, `filterMap` and `prepend` on units.
- **Scopes:** `fork` makes an isolated scope, `allSettled` steps it, and `scopeBind` binds a function to it. `snapshot` returns a frame with each value's shape, `apply` brings a scope to a frame, `diff` names what changed between two frames, and `dispose` ends a scope.
- **Watching:** `watch(unit, fn, {scope})` is owned by its generation. When a model's graph is swapped, the old generation's watchers end with it.
- **Kinds:** `kindOf` answers `store`, `event`, `effect`, `scope` or nothing.

```ts example
import { event, store } from "@fiberfx/hypergraph";

const increment = event<number>();
export const $count = store(0, { name: "$count" }).on(increment, (count, by) => count + by);
```

## Subpaths

- `@fiberfx/hypergraph`: the units, the wiring, the scope's frames and the types.
- `@fiberfx/hypergraph/node`: `nodeCarrier`, which carries a scope across an `await` on a JavaScript server. It is its own entry, so code for the browser never imports a server's modules.
- `@fiberfx/hypergraph/inspect`: `inspect` and `describe`, and the types `Observation`, `Declaration`, `Kind` and `ResetReason`.

Two more subpaths are planned and not exported yet: `/hyperscript`, the bindings for Mercury Hyperscript (`useUnit`, `Provider`), and `/hmr`, hot replacement.

## How an edit behaves under mx dev

Once `mx dev` delivers the swap, a saved edit to a model swaps its graph instead of reloading the page. An edit that changes only the bodies of functions is swapped in place, so the scope, its values and any effect in flight stay as they are. Any other edit loads a new generation of the graph, carries over every store whose sid and shape both match, and then retires the old generation with its watchers.

Every store that does not carry over is named, with a reason:

- **removed:** no store in the new graph claims its sid;
- **shape changed:** its sid is there with another shape, and both shapes are named;
- **renamed:** a hint only, never applied, when exactly one removed store and one new store share a name;
- **positional:** its key came from its position in the file, which is no evidence of the same store once the file changed.

A store that only the new graph declares is **new**: it starts from its initial value and nothing was lost, so it is reported as information, not as a reset.

## The chapters

Read them in this order; each builds on the ones before it.

- **[Units: store, event and effect](/hypergraph/units).** A model is made of three kinds of unit, named after the kinds the graph records. A store holds a value, an event carries a payload, and an effect runs a handler and settles.
- **[Wiring: units into a graph](/hypergraph/wiring).** Wiring connects units into one graph. sample is the composition primitive; combine joins stores through a barrier; split, attach, merge and restore complete the set.
- **[Scopes: fork, settle, hand over](/hypergraph/scopes).** A scope is one isolated copy of a model's state, for a request on a server, a test, or a root on a page. Its frames carry each value by sid, with its shape, so a frame from one build applies in another.
- **[Observing: watch, inspect, describe](/hypergraph/observing).** Two ways to see a model. watch calls a function for a unit's updates; inspect, on its own subpath, is the one surface a tool reads, with every update, skip, failure, declaration, effect run and reset as an observation.
- **[Kinds, carriers and errors](/hypergraph/errors).** Three small parts that keep a model honest. kindOf tells a unit from a scope, a carrier keeps a scope across an await, and every refusal is a HypergraphError with a code that is the same on every runtime.
- **[Hot replacement: the swap](/hypergraph/hot-replacement).** An edit to a model should keep the state you were looking at, and say exactly what it could not keep. Hypergraph decides store by store, by sid and shape, and names a reason for every value it drops.
- **[Server rendering: a scope per request](/hypergraph/server-rendering).** On a server, many requests run one model at once. Each gets its own scope, settles it, and hands its values to the browser as a frame keyed by sid, which the client applies to a scope of its own.
- **[Testing a model: a scope per test](/hypergraph/testing).** A test is a scope. Fork one, give its effects the handlers the test needs, drive it with allSettled, and read what happened, from the scope's values or from its observations. The conformance vectors are the same idea written as data.
- **[Models at scale: structure and identity](/hypergraph/models).** A real model is many modules, many stores and a few effects. The kernel's rules on identity, derivation and scopes decide how to lay it out, so that it tests in a fork, hands over by frame and survives an edit.
- **[Capstone: a model, round-tripped](/hypergraph/capstone).** Everything in the course, in one file and one test. Build a model from the exports, run it in a scope, take its frame, bring a fresh scope to that frame, and prove the two hold the same state.

## Coming from Effector

If you know Effector, this guide maps what you know onto Hypergraph: where each concept lives, the names that changed, and the few that are gone. Effector is retired; nothing here imports it.

- **[Coming from Effector](/hypergraph/coming-from-effector).** Most of what you know carries over. Units take the names of their kinds, the scope speaks in frames, and a few Effector names are gone for good.
- **[Units and wiring](/hypergraph/coming-from-effector/units-and-wiring).** The constructors are renamed and the wiring is not. sample is still the one composition primitive.
- **[Scopes and testing](/hypergraph/coming-from-effector/scopes-and-testing).** fork, allSettled and scopeBind are where you left them. What leaves a scope is now a frame.
- **[Frameworks, after effector-react](/hypergraph/coming-from-effector/frameworks).** Mercury has one view layer, Hyperscript. Its Hypergraph bindings are next; until then a component reads a store through a hook Hyperscript already has.

## What is shipped

The kernel, its API and the swap are built inside `@fiberfx/hypergraph`. Version 4.0.0 is on npm since 2026-11-05. `mx dev` does not deliver the swap yet: that is the next step, and until then an edit to a model reloads the page.
