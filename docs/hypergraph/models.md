The earlier chapters taught each part on a few lines. An app's model is larger: features in their own modules, stores that read each other, effects that talk to a server. This chapter is about the layout that the kernel's rules reward.

## Where the worked consumers stand

The course plan names the worked consumers: first this course's own examples, then the models of `echd-os`, `edu-island-kan` and `analytics`, each after its own first migration slice. At the commit this page is grounded at, none of them imports `@fiberfx/hypergraph` yet; all three still import the predecessor package. So there is no app model in the repository to walk through, and this chapter does not invent one.

What does exist:

- **The package's own model**: its public-API test builds a typed model from the exports and runs it. The [capstone](/hypergraph/capstone) is built on it.
- **The site's example check**: every TypeScript or JavaScript block in the site's Hypergraph pages is built as a module of a scratch mx app with `mx build --bundle`, and a name the package does not export fails the build.

When the three apps move, their models become this chapter's examples. Until then, the rules below come from the kernel, its tests and its vectors.

## One module per feature

Declare each feature's units at the top level of its own module. A unit belongs to the generation of the code that made it, and all of an app's modules load into one generation, so units from different modules wire together freely. Units of two different generations cannot be wired together, which matters only under hot replacement, where each generation's code wires its own units.

```ts
// cart.ts
import { event, store } from "@fiberfx/hypergraph";

export const itemAdded = event<{ id: string; price: number }>();
export const cleared = event();

export const $items = store<{ id: string; price: number }[]>([], { sid: "cart/items" })
  .on(itemAdded, (items, item) => [...items, item])
  .reset(cleared);

export const $total = $items.map((items) => items.reduce((sum, item) => sum + item.price, 0));
```

## Events in, derived stores out

A feature's surface is the events other code may call and the stores other code may read. The types already draw that line:

- `EventCallable<T>` can be called; a derived `Event<T>`, from `.map` or `.filter`, has no call signature.
- `StoreWritable<T>` has `.on` and `.reset`; `Store<T>`, the type of every derived store, has neither.

The package's own type test marks both misuses as compile errors: calling a store, and `.on` on a derived store. At run time the kernel refuses the rest: calling a derived unit throws `derived-call`, and naming one as a `target` throws `derived-target`.

A feature can hand out its writable stores under the narrower type, so that other features read them and only the feature writes them:

```ts
// cart-public.ts
import type { Store } from "@fiberfx/hypergraph";
import { $items, $total } from "./cart";

export const items: Store<{ id: string; price: number }[]> = $items;
export const total: Store<number> = $total;
```

This is a compile-time fence, not a run-time one: the handle is the same object.

## Identity at scale

A store's sid is its identity across a server and a client, and across an edit. The compiler is meant to give it; `sid` in the config is the authored escape, and this course writes it by hand so the frames' keys are visible. With many modules, three rules hold:

- **One sid, one store, across the whole generation.** Loading a module whose sid another unit of the same generation already claims is refused, naming both units, whether they are in one module or two. A generation after it may reuse the sid: the rule holds within a generation, not across them.
- **The swap refuses it too**, with `duplicate-sid`, and keeps the loaded generation live.
- **Units made by plain calls are not loaded through that check.** When an authored sid repeats there, the scope's frame code looks the sid up as the first store that claims it; what happens to the second store's value is not stated by any test or vector, so do not rely on it. Prefixing sids by feature (`cart/items`) keeps them apart.

## Effects at the edges

Keep the calls that leave the model, such as a request, a timer or a socket, in effects, and the rest in pure wiring:

- A test or a server gives an effect another handler per scope, with `fork({handlers})`, so a feature whose side effects are all effects needs no module mocking.
- `attach({effect, source, mapParams})` builds an effect's params from state, so the call site passes only what the user did.
- A handler marks its effect JavaScript-only in the model's graph. A declared spec (`{request}`, `{channel}` or `{timer}`) is data a runtime other than JavaScript could perform; its performers are a preview.

```ts
// checkout.ts
import { attach, effect, sample } from "@fiberfx/hypergraph";
import { $items, cleared } from "./cart";

const postOrder = effect(async (items: { id: string; price: number }[]) => {
  const response = await fetch("/api/orders", { method: "POST", body: JSON.stringify(items) });
  return (await response.json()) as { orderId: string };
});

export const checkout = attach({ effect: postOrder, source: $items, mapParams: (_: void, items) => items });

sample({ clock: checkout.done, target: cleared });
```

## Wiring across features

A feature reads another through its exported stores and reacts to its exported events: `sample` with one feature's event as `clock` and another's store as `source`, `combine` across features' stores, `merge` of several features' events. All of it lowers to edges of the one graph, so a launch that crosses features is still one launch, run to quiescence and glitch-free.

## Deciding what travels

Every writable store answers one question: does its value travel in a frame, to the client and across a swap?

| The store | Give it |
|---|---|
| state the client or the next edit must keep | a unique `sid` |
| a value that is not plain JSON, such as a `Date` | a `sid` and `serialize: {write, read}` |
| a secret, a cache or scratch state | `serialize: 'ignore'` |
| a derived store | nothing: it is recomputed wherever the frame lands |

The same stores, writable with a sid and not ignored, are the ones a hot swap keeps or resets with a reason ([hot replacement](/hypergraph/hot-replacement)).

## A checklist for a model

- One module per feature, units at its top level.
- Callable events and derived stores as the feature's surface; writable stores written only inside it.
- A unique, feature-prefixed `sid` on every store that travels; `serialize: 'ignore'` on every one that must not.
- Every call that leaves the model inside an effect, so a fork can replace it.
- A test per feature in its own fork, and one round-trip test of the whole model's frame, as in the [capstone](/hypergraph/capstone).
