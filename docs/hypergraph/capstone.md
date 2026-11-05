This chapter puts the course together. The model and every number in it come from the package's own test of its public API, `a typed model composes from the exports, and runs`, which the package type-checks and runs. The model here is that test's, without the units its assertions never read. The test below is that test written for `mx test`; that form is not run here, and the last section says where each expected value is read from.

## The goal

1. Build one model from what `@fiberfx/hypergraph` exports.
2. Run it in a fork, so nothing touches the work outside any scope.
3. Take the scope's frame with `snapshot`.
4. Apply the frame to a fresh scope.
5. Assert that the fresh scope holds the same state, and keep it in step with a `diff`.

## The model

A counter with a label, a derived sum, and an effect that saves the current count each time `add` fires (a `reset` changes the count without saving it). Only `$count` has a sid, so only `$count` travels in a frame; everything else is derived from it, or rebuilt by the effect.

```ts
import { combine, effect, event, restore, sample, store } from "@fiberfx/hypergraph";

export const add = event<number>();
export const reset = event();

export const $count = store(0, { sid: "count" })
  .on(add, (n, by) => n + by)
  .reset(reset);

export const $label = $count.map((n) => `count ${n}`);
export const $both = combine({ count: $count, label: $label });
export const $sum = combine($count, $count, (a: number, b: number) => a + b);

export const saveFx = effect(async (n: number) => `saved ${n}`);
export const $saved = restore(saveFx.doneData, "");

sample({ clock: add, source: $count, fn: (count: number) => count, target: saveFx });
```

Every unit kind and most of the wiring are here: a writable store with `.on` and `.reset`, a derived store from `.map`, `combine` in both of its forms, an effect, `restore` of its `doneData`, and `sample` from an event to an effect.

## Run it in a fork

```ts
import { allSettled, fork, scopeBind, type Scope, type Store } from "@fiberfx/hypergraph";
import { $both, $saved, $sum, add } from "./model";

const read = <T>(store: Store<T>, scope: Scope): T => scopeBind(() => store.getState(), { scope })();

const scope = fork();
await allSettled(add, { scope, params: 3 });

read($both, scope).label; // "count 3"
read($sum, scope);        // 6
read($saved, scope);      // "saved 3"
```

`allSettled` waits for everything the launch started, the effect that `sample` called included, so `$saved` already holds the effect's result.

## Take the frame

```ts
import { snapshot } from "@fiberfx/hypergraph";

const frame = snapshot(scope);
frame.values.count; // { shape: "runtime:number", value: 3 }
```

The frame holds `count` alone: it is the only writable store with a sid. `$label`, `$both` and `$sum` are derived and are recomputed wherever the frame lands.

## Apply it to a fresh scope

`fork({values: frame})` makes a new scope and applies the frame to it in one call:

```ts
import { diff, fork } from "@fiberfx/hypergraph";
import { $count } from "./model";

const replica = fork({ values: frame });
read($count, replica);         // 3
diff(replica, frame).changed;  // {}
```

`diff(replica, frame)` compares the replica's current frame with the one it was given. Its `changed` holds every new entry and every entry with a different shape or value. An empty `changed` means there are no new or changed entries. Its `removed` lists entries of the supplied frame that the replica lacks; both fields must be empty for their entries to match, as they are in this example.

The replica is a scope like any other. A call outside any scope, `add(5)`, changes the global `$count` to `5`, and the replica's `diff` against the frame is still empty.

## Keep the replica in step

The same frames keep a replica current, as a page would after the server's next change. Change the original, take the `diff` from the first frame, and apply it:

```ts
import { allSettled, apply, diff } from "@fiberfx/hypergraph";

await allSettled(add, { scope, params: 1 });
apply(replica, diff(scope, frame));
read($count, replica); // 4
```

## The whole test

```ts
import { describe, expect, test } from "vitest";
import { allSettled, apply, diff, fork, scopeBind, snapshot, type Scope, type Store } from "@fiberfx/hypergraph";
import { $both, $count, $saved, $sum, add } from "./model";

const read = <T>(store: Store<T>, scope: Scope): T => scopeBind(() => store.getState(), { scope })();

describe("the capstone model", () => {
  test("runs in a fork and round-trips its frame", async () => {
    const scope = fork();
    await allSettled(add, { scope, params: 3 });
    expect(read($both, scope).label).toBe("count 3");
    expect(read($sum, scope)).toBe(6);
    expect(read($saved, scope)).toBe("saved 3");

    const frame = snapshot(scope);
    expect(frame.values.count).toEqual({ shape: "runtime:number", value: 3 });

    const replica = fork({ values: frame });
    expect(read($count, replica)).toBe(3);
    expect(diff(replica, frame).changed).toEqual({});
    expect(diff(replica, frame).removed).toEqual([]);

    add(5);
    expect($count.getState()).toBe(5);
    expect(diff(replica, frame).changed).toEqual({});

    await allSettled(add, { scope, params: 1 });
    apply(replica, diff(scope, frame));
    expect(read($count, replica)).toBe(4);
  });
});
```

## Where each expected value comes from

| Assertion | Read from |
|---|---|
| `"count 3"`, `6`, `"saved 3"` after `add(3)` | the package's test, `api-types.test.ts:52-54` |
| `frame.values.count` is `{shape: "runtime:number", value: 3}` | the same test, `:51` |
| the replica reads `3` | the same test, `:61` |
| `diff(replica, frame).changed` is `{}`, before and after `add(5)`; the global `$count` is `5` | the same test, `:62-64` |
| the replica reads `4` after the `diff` is applied | the same test, `:65-67` |
| `diff(replica, frame).removed` is `[]` | **not run**: read from the kernel's frame diff (`port.ts:371`), which lists only sids of the given frame missing from the replica |

The vectors state the same round trip through the kernel: `protocol.restored-value-serializes` (a restored value is the scope's own and the next snapshot carries it) and `protocol.apply-brings-a-replica-to-the-frame` (a replica restored from one frame and given the diff to the next holds the next frame).

The package's test also wires a filtered `sample`, a `merge`, a `split` and an `attach`, and gives a declared timer effect a performer in its fork (`fork({performers})`). Its assertions above read none of them, so they are left out here; declared effects and their performers are a preview.
