<!-- Published by scripts/package_readmes.py from fiberfx/live-mercury/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/live-mercury

Live Mercury's browser client for Phoenix LiveView islands, on Mercury hyperscript: `MercuryHook`, the
island lifecycle, and the two renderer-independent codecs a live island's props arrive through.

## The hook

- `getHooks(components)` returns `{ MercuryHook }` for LiveSocket's `hooks`. Each `<.mercury name="X">`
  island (`phx-hook="MercuryHook"`, `data-name="X"`) renders `components.X` with its props, its streams,
  the hook's six functions (`pushEvent`, `pushEventTo`, `handleEvent`, `removeHandleEvent`, `upload`,
  `uploadTo`) and its default slot.
- `createMercuryHook(resolve)` is the same lifecycle given a function from the island's element to its
  component, or to a promise of it (a bundle imported per island). Updates that arrive first still
  apply; the first render shows them; after `destroyed()` nothing renders.
- `useLiveMercury()` gives any component under an island the hook's functions (null outside one);
  `LiveMercuryProvider` is the context the hook renders.
- `Link` maps `href`, `patch`, `navigate` and `replace` to LiveView's `data-phx-link` attributes.

`@fiberfx/hyperscript` is a peer: the island renders with the page's one runtime.

## The codecs

- `decodeCompactPatch`, `decodeCompactJson`: the compact patch wire format, decoded into JSON Patch
  operations.
- `applyPatch`, `applyOperation`, `getValueByPointer`: JSON Patch (RFC 6902) with Live Mercury's
  extensions — `upsert`, `limit` and `$$<id>` path segments that address an array item by
  `__dom_id`. `applyPatch` copies on write below the root: every container on a touched path is cloned
  once per batch, so a nested reference an earlier render kept never changes. The root itself is
  mutated in place and returned (its identity is stable), so a consumer that needs a new value per
  update makes one.

## Install

```bash
npm i @fiberfx/live-mercury
```

## Use

```ts
import { Socket } from "@fiberfx/phoenix";
import { LiveSocket } from "@fiberfx/phoenix_live_view";
import { getHooks } from "@fiberfx/live-mercury";
import { Counter } from "./islands/counter";

const liveSocket = new LiveSocket("/live", Socket, { hooks: getHooks({ Counter }) });
liveSocket.connect();
```

The codecs on their own:

```ts
import { applyPatch, decodeCompactPatch } from "@fiberfx/live-mercury";

const next = applyPatch(props, decodeCompactPatch(payload));
```

## Origin

Ported to TypeScript from [live_react](https://github.com/mrdotb/live_react) (MIT, Mrdotb) by way
of `echo/apps/live_mercury`: the codecs with their behaviour unchanged, the hook moved from React to
Mercury hyperscript (mercury.81). See [LICENSE](LICENSE).
