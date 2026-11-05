Hot replacement is what happens to a model's state when you save an edit to its code. The rule is simple to state: keep every value that is still the same store, and name a reason for every value that is dropped.

## What is built, what is planned

The swap is **built** inside `@fiberfx/hypergraph`: the HMR root and the diff it decides by, with 27 conformance vectors of their own (`hmr.json`).

It is **not yet exported**: the package's entries are `.`, `./node` and `./inspect`, and `@fiberfx/hypergraph/hmr` is planned. `mx dev` does not deliver the swap yet either, so today an edit to a model reloads the page. Nothing on this page is an import you can write; it is how the swap behaves once `mx dev` delivers it, as the kernel and its vectors state it now.

## Two kinds of update

An update hands the root the modules that changed. It does one of two things:

- **Slots, in place.** When every changed module differs from the loaded one only in the bodies of its functions (a reducer, a `map`, a filter, a handler), each function takes its new body. The generation, the scope, its values, its watchers and any effect in flight stay exactly as they are.
- **A swap, to a new generation.** Any other edit: a new unit, a removed one, a changed initial value, a new edge. The root loads every module into a new generation, forks a scope there, restores only the values the diff keeps, commits, reports each reset and each new store, and disposes the old generation.

The first update is the initial load; in-place slots are possible only after it.

## Generations

A **generation** is one loaded version of the model's graph. Every unit, edge and watch belongs to the generation of the code that made it.

- Two generations can be live for a moment, and the old one is then disposed; a disposed generation takes no work.
- A watch made by a generation's code ends when that generation is disposed, even if its scope lives on. No subscription outlives the code that declared it.
- Your `Scope` handle does not change. At each commit, every live scope moves to the committed generation and carries over what it can; what it cannot carry is reported as a `reset` observation ([observing](/hypergraph/observing)).

## Which stores take part

Only a **writable store with a sid** takes part in the decision. That leaves out:

- events and effects, which hold no value to keep;
- derived stores, which the graph recomputes;
- a store without a sid, which nothing can find again;
- a store with `serialize: 'ignore'`, on either side of the edit.

Stores declared inside a region take part like any other.

## Keep, new or reset

Every store that takes part lands in exactly one of three lists, each in sid order:

| Outcome | When | Reason reported |
|---|---|---|
| **keep** | the sid is on both sides with the same shape | none: the value travels |
| **new** | only the new generation has the sid | `new`: information, nothing was lost |
| **reset** | the sid is there with another shape | `shape changed from <old> to <new>` |
| **reset** | no store in the new generation claims the sid | `removed` |
| **reset** | the old sid is gone and exactly one new store has its name | `renamed (a hint, not applied: it may now be <new sid>)` |
| **reset** | either side's key came from its position in the file | `positional` |

Three rules are worth stating on their own:

- **A changed initial value within one shape is kept.** A counter whose `init` goes from `0` to `1` keeps the count it had. There is no "init changed" reason (vector `hmr.keep-literal-change-within-one-shape`).
- **A rename is a hint, never applied.** The old value is not moved to the new sid, even with an equal shape. The hint goes on the old sid, and the new sid is reported as new (vector `hmr.renamed-is-a-hint-never-applied`).
- **A positional key never keeps** in a module that changed: an equal position is no evidence of the same store. Until the compiler's module hash reaches the run-time graph, every positional key resets.

## A worked edit

This is the vector `hmr.reset-shape-changed-names-both-shapes`. Before the edit:

```ts
import { store } from "@fiberfx/hypergraph";

export const $count = store(0, { sid: "count" });
export const $user = store(null, { sid: "user" });
```

After it, `$count` starts as an object:

```ts
import { store } from "@fiberfx/hypergraph";

export const $count = store({}, { sid: "count" });
export const $user = store(null, { sid: "user" });
```

Until the compiler emits shapes, a store's shape is read from its initial value: `runtime:number` before, `runtime:object{}` after. The diff is:

- keep: `user`;
- new: none;
- reset: `count`, `shape changed from runtime:number to runtime:object{}`.

`$user` keeps whatever value it had; `$count` starts from `{}`, and the log says why: `hmr: count: shape changed from runtime:number to runtime:object{}`.

Adding a field to an object is a shape change too: `{name: ""}` is `runtime:object{name:string}`, and `{name: "", age: 0}` is `runtime:object{age:number,name:string}` (vector `hmr.reset-on-a-new-field-in-a-literal-object`).

## When an update is refused

The diff refuses an IR it cannot decide on, with a `DiffError` whose `code` is:

- `duplicate-sid`: two units claim one sid;
- `no-shape`: a store that takes part has no shape.

A refused update disposes the generation it opened and throws. The loaded generation and its scope stay live, and the caller falls back to a page reload. An update started while another is running is refused the same way, rather than merged into it.

## Writing models that swap well

- Keep a store's shape when you mean to keep its value: change the literal, not the structure.
- Give scratch state that should never travel `serialize: 'ignore'`.
- Expect a reset when you add a field to an object store: the reason will say so, with both shapes.
- Read the reasons. Each one is an `inspect` observation and a log line, so a lost value is never silent.
