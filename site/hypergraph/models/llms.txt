# Models at scale: structure and identity — Mercury LMS

> How to lay out an app-sized `@fiberfx/hypergraph` model: one module per feature, callable events in and derived stores out, a unique feature-prefixed `sid` on every store that travels, every outside call in an effect, wiring across features in one graph. No app in the repository imports `@fiberfx/hypergraph` yet; the worked consumers (echd-os, edu-island-kan, analytics) follow their migration slices.

## Read this when

You split a model into feature modules, choose sids, decide which stores travel in a frame, or expose a feature's state to other features.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- Units belong to the generation of the code that made it; all modules of an app load into one generation; units of two generations cannot be wired together.
- Types draw the surface: `EventCallable<T>` callable, derived `Event<T>` not; `StoreWritable<T>` has `.on`/`.reset`, `Store<T>` not. Exporting a writable store as `Store<T>` is a compile-time fence only.
- Run time: calling a derived unit → `HypergraphError` `derived-call`; derived `target` → `derived-target`.
- Sids: unique per generation. Module loading through the port refuses a sid claimed twice (in one module or across modules), naming both; the swap's diff refuses `duplicate-sid`. Plain `store()` calls are not checked; a frame looks a repeated sid up as its first store; the second's fate is unstated — never rely on it. Prefix by feature (`cart/items`).
- Effects: outside calls only in effects; `fork({handlers})` replaces them per scope; `attach({effect, source, mapParams})` builds params from state; a handler marks the effect JS-only, a declared spec is data (preview).
- Travels: writable + `sid` + not `serialize: 'ignore'`; non-JSON values need `serialize: {write, read}`; derived stores never travel. The same stores are the ones a hot swap keeps or resets.

## Minimal example

```ts
import { event, store, type Store } from "@fiberfx/hypergraph";

export const itemAdded = event<{ id: string; price: number }>();
const $items = store<{ id: string; price: number }[]>([], { sid: "cart/items" })
  .on(itemAdded, (items, item) => [...items, item]);

export const items: Store<{ id: string; price: number }[]> = $items;
export const total = $items.map((list) => list.reduce((sum, item) => sum + item.price, 0));
```

## Never emit

A sid shared by two stores, a store meant to travel without a `sid`, a fetch or timer inside `.on`/`.map`/`sample`'s `fn`, `withFactory`, `createDomain`, and any import from `effector` or `@fiberfx/hypergraph/hmr`.

## Next

- The capstone: /hypergraph/capstone (/hypergraph/capstone/llms.txt)
- This companion: /hypergraph/models/llms.txt

## Navigation

- [Read this page in the browser](/hypergraph/models)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
