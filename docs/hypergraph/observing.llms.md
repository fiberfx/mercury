# Observing: watch, inspect, describe — Mercury LMS

> How code and tools see a `@fiberfx/hypergraph` model. `watch(unit, fn, {scope})` for a unit's updates, owned by its generation; `inspect` and `describe` from `@fiberfx/hypergraph/inspect`, the one observation surface.

## Read this when

You react to updates outside the graph, write a test that asserts what happened, or build a log, overlay or DevTools view of a model.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- `watch(unit, fn, {scope?})` → `Subscription` (callable; `.unsubscribe()` is the same). Updates only: a store's current state is NOT delivered at once. With `scope`, only that scope's updates; without, the work outside any scope. Ends when its scope's work stops or its generation is retired, whichever first.
- `$store.watch(fn)` differs: called with the state now, then each update.
- `inspect({scope?, kinds?, fn})` from `@fiberfx/hypergraph/inspect` → `Subscription`. Scoped: that scope only; unscoped: no scoped work. Last unsubscribe stops recording.
- `Observation`: `{type, unit, scope, gen, value, cause}`, where `unit` is a sid or run-time identity; additional fields: `fresh?` (declare), `owner?`, `reason?` (reset), `at?` (perform, settle).
- `Kind`: `update`, `skip` (filter, equal or undefined update, updateFilter refusal), `fail` (user function threw), `declare` (value: `Declaration {unit, kind, sid?, name?, derived?, owner?, gen}`; unscoped inspectors only), `perform`, `settle`, `reset`.
- A `fresh` declare is a new store: information, not a reset.
- `describe(reason)` → `removed` | `shape changed from <from> to <to>` | `renamed (a hint, not applied: it may now be <to>)` | `positional` | `new`.
- Types from `/inspect`: `Observation`, `Declaration`, `Kind`, `ResetReason`.

## Minimal example

```ts
import { allSettled, event, fork, store, watch } from "@fiberfx/hypergraph";
import { inspect } from "@fiberfx/hypergraph/inspect";

const increment = event();
const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);

export async function run() {
  const scope = fork();
  const stop = watch($count, (n) => console.log("count", n), { scope });
  const sub = inspect({ scope, kinds: ["update", "skip"], fn: (o) => console.log(o.type, o.unit) });
  await allSettled(increment, { scope });
  stop();
  sub.unsubscribe();
}
```

## Never emit

`createWatch`, `inspectGraph`, `inspectObserverFailures`, the `Message` type, and any import from `effector` or `effector/inspect`.

## Next

- Kinds and errors: /hypergraph/errors (/hypergraph/errors/llms.txt)
- This companion: /hypergraph/observing/llms.txt (the page as Markdown, `/hypergraph/observing.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hypergraph/observing)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
