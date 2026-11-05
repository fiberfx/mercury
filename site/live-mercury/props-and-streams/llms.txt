# Props and streams: patches on the wire — Mercury LMS

> LM3. After the first render, `LiveMercury.mercury/1` sends changed props as a JSON Patch in `data-props-diff` and LiveView streams as patches in `data-streams-diff`, both in a compact wire format. `@fiberfx/live-mercury` decodes them with `decodeCompactPatch` and applies them with `applyPatch`, which adds `upsert`, `limit` and `$$<id>` paths to RFC 6902.

## Read this when

You debug an island that shows stale props, render a LiveView stream in an island, or decode or apply Live Mercury's patches yourself.

## The contract

- `data-props`: full props, compact JSON; sent on the first render, a dead render, or with `diff={false}`. `data-props-diff`: sent on later renders with `diff` on (default `config :live_mercury, :enable_props_diff`, `true`, compile time). A connected re-render with `diff` on does not resend `data-props`.
- Client `updated()`: `data-use-diff="true"` → `applyPatch(props, decodeCompactPatch(data-props-diff))`; else full `data-props`. Streams: always `applyPatch(streams, decodeCompactPatch(data-streams-diff))`.
- Props diff: changed key with no old value → `replace /<key>`; with an old value → `Jsonpatch.diff` under `/<key>` (structs via `LiveMercury.Encoder`, list items matched by `id`). Every diff starts with a root `test` nonce, serialized `n<digits>`, skipped by the decoder.
- Streams (`%Phoenix.LiveView.LiveStream{}` assigns, never props): reset → `replace /<name> []`; delete → `remove /<name>/$$<dom_id>`; insert → `upsert /<name>/-` (at -1) or `/<name>/<at>`; update only → `replace /<name>/$$<dom_id>`; limit → `limit /<name> <n>`. Items carry `__dom_id`. First and dead renders reset every stream first.
- Wire: `<op><path_len>:<path><value>`; ops `a` add, `d` remove (no value), `r` replace, `u` upsert, `l` limit; values `z`, `b0`/`b1`, `n<len>:<num>`, `s<len>:<str>`, `J<len>:<compact json>`. Lengths are JavaScript string lengths (UTF-16 units).
- Compact JSON: `"` → `^`, `^` → `~^`, `~` → `~~`. `decodeCompactJson` reverses it.
- `applyPatch(doc, ops)`: copy on write below the root (each touched container cloned once per batch); the root is mutated and returned. `applyOperation(doc, op)`: one op in place. `getValueByPointer(doc, pointer)`.
- `$$<id>`: the item whose `__dom_id` loosely equals `id`; missing → warning, op skipped. `upsert`: replace by `__dom_id`, else insert. `limit n`: keep first `n` (n ≥ 0) or last `|n|` (n < 0). `test`: no-op.

## Minimal example

```ts
import { applyPatch, decodeCompactPatch } from "@fiberfx/live-mercury";

const props = { count: 5, items: ["a", "b", "c"] };
const next = applyPatch(props, decodeCompactPatch("n123r6:/countn1:6d8:/items/0"));
// next === props; next.count === 6; next.items is a new array ["b", "c"]
```

## Errors

`decodeCompactPatch` throws `Unknown LiveMercury patch operation code`, `Unknown LiveMercury patch value tag`, or `Invalid LiveMercury patch length prefix`. A props struct without `LiveMercury.Encoder` raises `Protocol.UndefinedError`.

## Never emit

A `move` or `copy` operation: neither has an op code in the wire format. Byte lengths in a hand-written payload.

## Next

- LM4, server rendering: /live-mercury/server-rendering (/live-mercury/server-rendering/llms.txt)
- Back: /live-mercury/liveview/llms.txt
- This companion: /live-mercury/props-and-streams/llms.txt

## Navigation

- [Read this page in the browser](/live-mercury/props-and-streams)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/live-mercury/llms.txt)
