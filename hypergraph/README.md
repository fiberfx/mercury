<!-- Published by scripts/package_readmes.py from fiberfx/hypergraph/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/hypergraph

Mercury's state, 4.0.0: units, wiring and scopes over a kernel written from scratch for
mercury.epic.24, the successor of `@fiberfx/effector` with no
compatibility facade (hypergraph.md, D9). Its API is
H2a's option (c), ruled by the Operator on 2026-11-04.

**The naming rule: a name changes when its contract or its IR kind changes.** So the units take the IR's kinds
(`createStore` is now `store`, `createEvent` is `event`, `createEffect` is `effect`), and the scope speaks D5's frames
(`serialize` is now `snapshot`, `hydrate` is `apply`, with `diff` and `dispose` beside them; `createWatch` is `watch`).
Composition keeps Effector's names, because its contract is unchanged and the same conformance vectors hold it on
both kernels: `sample`, `combine`, `split`, `attach`, `merge`, `restore`, `on`, `reset`, `map`, `filter`, `filterMap`,
`prepend`, `fork`, `allSettled`, `scopeBind`. Domains, `guard`, `forward`, `createApi`, `is` (now `kindOf`) and
`withFactory` are retired; `inspect`, at `@fiberfx/hypergraph/inspect`, is the one observation surface (D7).

```ts
import {store, event, effect, sample, fork, allSettled, snapshot} from "@fiberfx/hypergraph";

const $count = store(0, {sid: "count"});
const add = event<number>();
$count.on(add, (n, by) => n + by);
const saveFx = effect(async (n: number) => fetch(`/count/${n}`));
sample({clock: add, source: $count, target: saveFx});

const scope = fork();
await allSettled(add, {scope, params: 2});
snapshot(scope); // {format: "mhg-scope/1", gen: 1, values: {count: {shape: "runtime:number", value: 2}}}
```

A scope lives across swaps: at each commit it moves to the new generation with its values, and what the new code
cannot take (a store removed, or of another shape) is a `reset` observation on it. The scope across an `await` (H2a Q6): by default an effect called in a scope puts its caller back there when it
settles, as Effector does. On Node, `setCarrier(nodeCarrier())` (from `@fiberfx/hypergraph/node`, AsyncLocalStorage)
carries the scope down the async chain instead, so an unrelated call never joins a suspended flow.

The hgv/1 conformance vectors are the specification (D8),
with the Hypergraph-only ones in `protocol.json` (format `hgv-hypergraph/1`); every one runs through this public API
(`test/api.test.ts`) and through the kernel's wiring (`test/hgv.test.ts`). No dependencies, no React, nothing from
`@fiberfx/effector`; it runs on bare Node 24 as it is.

## How it runs

- **Scheduler** (`src/kernel/kernel.ts`, `queue.ts`). A node holds a program of steps; a frame carries one value
  through it. A step that names a phase (`read`, `barrier`, `sampler`, `effect`) moves the rest of the frame to that
  queue; the queues drain child, pure, read, barrier/sampler, effect. Barrier and sampler share one heap, by phase,
  then batch id (creation order), then arrival. A batch step is queued once per launch and scope until it runs. A
  call made during a launch drains the shared queue before it returns; a deferred one (`setState`, an effect's
  runner, a settle) waits its turn.
- **State** (`state.ts`). A ref is a cell; outside a scope it holds its value, and a scope makes its own cell the
  first time it reads or writes it: from fork's values (by unit, then by sid), else from how the ref derives (a map,
  a combine's fields), else from the initial value.
- **Units and edges** (`units.ts`, `combine.ts`, `sample.ts`, `effect.ts`). A store skips an update `===` to its state
  and, unless `skipVoid: false`, an undefined one. An effect queues its runner, runs the handler (the scope's, else its
  own) in the effect phase, and settles through `finally` into `done`/`doneData` or `fail`/`failData`, with
  `inFlight`, `pending` and the scope's counter following every call.
- **Scopes** (`scope.ts`): `fork` (values by unit or sid, handlers), `allSettled`, `serialize` (by sid, through a
  store's `write`), `hydrate` (a domain's scope), `scopeBind`, scoped watchers. A scope carries a generation, `gen`
  (D6); internal until the API names it.
- **clearNode** (`clear.ts`): a unit and the edges it owns; deep, everything it owns; a domain, its units and their
  edges; a region owner, every node made inside it.
- **inspect** (`inspect.ts`) is the one observation surface (D7): `(type, unit, scope, gen, value, cause)` for each
  unit frame that updated (`update`) or refused its value (`skip`), each user function that threw (`fail`, also written
  to `console.error`), and each handoff outcome (`reset`, `new`). A refusal carries a portable code
  (`HypergraphError`: `pure-call`, `derived-call`); its wording is the kernel's own.
- **The port** (`port.ts`), the one kernel file the swap (`src/hmr/`) imports: a model's generations over one kernel
  (D6). `begin`, `load(gen, {module, units, edges})`, `commit`, `dispose(gen)` (clears everything made in it and
  disposes its scopes); `wiring(module)` with each store's shape by sid; `snapshot(scope)` →
  `{gen, values: {sid → {shape, value}}}` (serialize's set, hmr-identity's handoff); `restore(scope, values, {keep})`
  and D5's `diff`/`apply` frames, each returning what it could not take (`unclaimed`, `shape`) instead of throwing;
  `swapSlot(slot, fn)`; `report(scope, sid, reason)` for `removed`, `shape-changed`, `renamed` (a hint), `positional`
  and `new`. A store's shape is the wiring's, else `runtime:<I>` (`shape.ts`, mhs-shape/1's I of its init); a sid
  claimed twice in one generation is refused at `load`.

## Run

Bare Node 24, no install, from this directory:

```sh
# every hgv/1 and hgv-hypergraph/1 vector (HGV_DIR points at another set), the runner's own failing controls, H0's 33
# host rows (test/host.test.ts: the engine cases that need imperative JavaScript, ending "host conformance: n/33"),
# and the kernel's unit tests; the vector run ends with its count of order-only and value divergences
node --test "test/*.test.ts"
# the census: each rule in test/mutants.json, broken in a copy of src/, must turn its named vectors red; a rule no
# vector holds yet is a recorded gap that a kernel test must hold
node test/mutants.mjs
# typecheck src, then src and the tests
../effector/node_modules/.bin/tsc -p tsconfig.json
../effector/node_modules/.bin/tsc -p test/hgv.tsconfig.json
```

A queue job names the files, with junit beside the spec output (hypergraph-build.md's Jobs):
`node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit
--test-reporter-destination=out/junit.xml test/hgv.test.ts test/host.test.ts test/kernel.test.ts`. A bare directory argument
(`node --test test/`) fails on Node 24: it is loaded as a module.
