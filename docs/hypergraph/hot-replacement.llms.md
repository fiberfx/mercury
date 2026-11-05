# Hot replacement: the swap — Mercury LMS

> How `@fiberfx/hypergraph` carries a model's state across a code edit: a body-only edit swaps function slots in place; any other edit loads a new generation and keeps each store whose sid and shape match, naming a reason for every one it drops. Built inside the package; `@fiberfx/hypergraph/hmr` and `mx dev`'s delivery are planned.

## Read this when

You explain why a value survived or reset after an edit, design a model's stores so they survive edits, or read an `hmr:` log line or a `reset` observation.

## The contract (tier: Planned — built and vector-tested, not exported, not delivered by mx dev; today an edit reloads the page)

- Slots mode: every changed module equals the loaded one except function bodies → bodies swapped in place; scope, values, watchers, in-flight effects unchanged.
- Swap mode, otherwise: new generation; restore only kept sids; commit; report; dispose the old generation. Watches made by the old generation's code end with it. `Scope` handles move to the committed generation.
- Takes part: writable stores with a sid (regions included). Not: events, effects, derived stores, sid-less stores, `serialize: 'ignore'` on either side.
- keep: same sid and shape. A changed `init` within one shape keeps the value.
- new: sid only in the new generation; information, not a reset.
- reset reasons (`ResetReason`): `{kind: 'shape', from, to}`, `{kind: 'removed'}`, `{kind: 'renamed', to}` (hint on the OLD sid, never applied; needs a name shared by exactly one removed and one new store), `{kind: 'positional'}` (positional keys never keep in a changed module).
- Shape today: `runtime:<structure of init>`, object keys sorted, e.g. `runtime:object{age:number,name:string}`. Adding a field resets.
- Lists are sorted in UTF-16 code-unit order of sid.
- Each reset/new → an `inspect` `reset`/`declare fresh` observation and a log line `hmr: <sid>: <describe(reason)>`.
- Refusals: `DiffError` `duplicate-sid` | `no-shape`; the update throws, the loaded generation stays live, the caller reloads. An update during an update is refused.

## Minimal example

```ts
import { store } from "@fiberfx/hypergraph";

// before: store(0, { sid: "count" })  → shape runtime:number
// after:  store({}, { sid: "count" }) → shape runtime:object{}
// result: reset count, "shape changed from runtime:number to runtime:object{}"
export const $count = store({}, { sid: "count" });
export const $user = store(null, { sid: "user" }); // kept
```

## Never emit

An import from `@fiberfx/hypergraph/hmr` (not exported yet), `createRootScope`, `hmrScope`, an "init changed" reason, a rename that moves a value to the new sid, and any import from `effector`.

## Next

- Server rendering: /hypergraph/server-rendering (/hypergraph/server-rendering/llms.txt)
- This companion: /hypergraph/hot-replacement/llms.txt

## Navigation

- [Read this page in the browser](/hypergraph/hot-replacement)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
