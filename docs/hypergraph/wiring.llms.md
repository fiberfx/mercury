# Wiring: units into a graph — Mercury LMS

> How `@fiberfx/hypergraph` connects units: `sample` (the one composition primitive), `combine` (stores through a barrier), `split`, `attach`, `merge`, `restore`, and `on`, `reset`, `map`, `filter`, `filterMap`, `prepend` as functions. One launch runs to quiescence, glitch-free.

## Read this when

You connect units: derive a value, route a payload, gate an update on a store, or call an effect with params built from state.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- `sample({clock?, source?, filter?, fn?, target?, batch?})`. `filter`: `Store<boolean>` or `(source, clock) => boolean`; `fn: (source, clock) => out`. With `target` it returns the target; without, a new derived unit. A non-unit field in `source` is a constant.
- A derived unit as `target` throws `HypergraphError` `derived-target`.
- `combine([..] | {..}, fn?, {skipVoid?}?)` or `combine(a, b, …, fn?)` → derived `Store`. One launch updates it once (vector `kernel.diamond-one-update-per-launch`).
- `split({source, clock?, match, cases})` → `void`; `match` is `Store<string>`, `(v) => caseName`, or `{case: predicate | Store<boolean>}`. `split(source, {case: predicate})` → `{case: Event, …, __: Event}` (`__` = no match).
- `attach({effect, source?, mapParams?: (params, source) => q})` → new `Effect`; `effect` may be `(source, params) => result`.
- `merge(units[])` → `Event`. `restore(unit, init)` → `StoreWritable` of the last payload; single-unit form only.
- `on(store, clock, fn)`, `reset(store, ...clocks)`, `map(unit, fn)`, `filter(event, fn)`, `filterMap(event, fn)`, `prepend(event, fn)` equal the unit methods.
- Units of two generations cannot be wired together.

## Minimal example

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

const submit = event();
const $text = store("");
export const $sent = store<string[]>([]);

sample({
  clock: submit,
  source: { text: $text, sent: $sent },
  filter: ({ text }) => text.length > 0,
  fn: ({ text, sent }) => [...sent, text],
  target: $sent,
});
```

## Never emit

`guard`, `forward`, `createApi`, `restore({...})` or `restore([...])`, `withFactory`, and any import from `effector`. Use `sample` and `.on` instead.

## Next

- Scopes: /hypergraph/scopes (/hypergraph/scopes/llms.txt)
- This companion: /hypergraph/wiring/llms.txt (the page as Markdown, `/hypergraph/wiring.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hypergraph/wiring)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
