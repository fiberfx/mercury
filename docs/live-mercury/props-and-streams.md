[LM1](/live-mercury/liveview) showed that an island's props follow its LiveView's assigns. This lesson opens the envelope: what the server writes into the element on each render, how the client reads it, and the two extensions to JSON Patch that LiveView streams need.

## Three attributes

`LiveMercury.mercury/1` writes the island's data into three attributes, and a fourth tells the client which one to read:

| Attribute | Holds | Written when |
|---|---|---|
| `data-props` | every prop, as compact JSON | the first render, a dead render, or any render with `diff` off |
| `data-props-diff` | the changed props, as a compact patch | every later render with `diff` on |
| `data-streams-diff` | the streams' changes, as a compact patch | every render that assigns a stream |
| `data-use-diff` | `"true"` or `"false"`, the `diff` setting | on every render's HTML; not one of the assigns `mercury/1` marks changed |

"Written when" is what LiveView sends. `mercury/1` marks its own computed assigns as changed, and LiveView sends only marked attributes, so a connected re-render with `diff` on sends `data-props-diff` and leaves `data-props` holding the first render's snapshot. A test asks LiveView's change tracking for exactly that, with or without a `socket` assign.

On the client, `updated()` applies `data-props-diff` when `data-use-diff` is `"true"`, and re-reads `data-props` in full otherwise. It applies `data-streams-diff` every time.

## Props diffs

With `diff` on, the default (`config :live_mercury, :enable_props_diff`, read at compile time), `mercury/1` takes only the assigns LiveView marks changed. For each one:

- **no old value** (LiveView's change map holds `true`): one `replace` at `/<key>` with the new value;
- **an old value**: `Jsonpatch.diff(old, new)` under `/<key>`, so only the changed leaves are sent. Structs go through `LiveMercury.Encoder` first, and list items are matched by their `id` field.

The tests show the shapes. A map prop whose two fields change:

```elixir
assigns = %{user: %{name: "John", age: 30}, __changed__: %{}}
assigns = assign(assigns, :user, %{name: "Alice", age: 25})
# props_diff: replace /user/age 25, replace /user/name "Alice"
```

and a list where one item's name changes, matched by `id`:

```elixir
assigns = %{items: [%{id: 1, name: "Alice"}, %{id: 2, name: "Bob"}], __changed__: %{}}
assigns = assign(assigns, :items, [%{id: 1, name: "Alice"}, %{id: 2, name: "New Bob"}])
# props_diff: replace /items/1/name "New Bob"
```

Every diff starts with a `test` operation at the root that carries a random number. `LiveMercury.Patch` writes it as a nonce, `n<digits>`, which exists only so that the attribute's text changes and LiveView sends it. The client's decoder skips it.

Pass `diff={false}` to an island to send full props on every render instead. The first render always sends full props, and its diff is empty.

## Streams

An assign that holds a `Phoenix.LiveView.LiveStream` is a stream, never a prop. Its changes go into `data-streams-diff`, and on the client each stream is an array under its own key in the component's props.

`mercury/1` turns a stream's pending changes into operations, by these rules:

| Stream change | Operation |
|---|---|
| reset | `replace /<name>` with `[]` |
| delete | `remove /<name>/$$<dom_id>` |
| insert at the end (`at: -1`) | `upsert /<name>/-` |
| insert at an index | `upsert /<name>/<at>` |
| update only | `replace /<name>/$$<dom_id>` |
| an insert with a limit | `limit /<name>` with the limit |

Each item is encoded with `LiveMercury.Encoder` and given a `__dom_id` field, the id LiveView gave it. The first render, and a dead render, first replace every stream with `[]` and then apply its inserts, so the client starts from nothing. Later renders put the nonce first instead.

The first render of a stream of two users:

```elixir
stream = LiveStream.new(:users, make_ref(), users, [])
# streams_diff:
#   replace /users []
#   upsert /users/- %{"__dom_id" => "users-1", "id" => 1, "name" => "Alice", "age" => 30}
#   upsert /users/- %{"__dom_id" => "users-2", "id" => 2, "name" => "Bob", "age" => 25}
```

Deleting Bob later is `remove /users/$$users-2`.

## The wire format

`LiveMercury.Patch.serialize/1` writes the operations as one string, and `decodeCompactPatch` on the client reads it back. Each operation is a one-letter code, a length-prefixed path, and a tagged value (except `remove`, which has none):

```text
<op><path_len>:<path><value>
```

| Op code | Operation | | Value tag | Value |
|---|---|---|---|---|
| `a` | add | | `z` | null |
| `d` | remove | | `b0`, `b1` | false, true |
| `r` | replace | | `n<len>:<number>` | a number |
| `u` | upsert | | `s<len>:<string>` | a string |
| `l` | limit | | `J<len>:<json>` | compact JSON |
| `n<digits>` | the nonce, skipped | | | |

Lengths count JavaScript string length (UTF-16 code units), not bytes, so a path or value can hold any character without escaping: `zażółć` is 6 and `🚀` is 2.

**Compact JSON** is JSON with every `"` written as `^`, so it fits an HTML attribute without entity escaping. A literal `^` becomes `~^` and a literal `~` becomes `~~`. `data-props` uses the same encoding, and `decodeCompactJson` reverses it.

From the client's tests:

```ts
import { decodeCompactPatch } from "@fiberfx/live-mercury";

decodeCompactPatch("n123r6:/countn1:6a8:/items/3s1:dd8:/items/0");
// [
//   { op: "replace", path: "/count", value: 6 },
//   { op: "add", path: "/items/3", value: "d" },
//   { op: "remove", path: "/items/0" },
// ]
```

`decodeCompactPatch(null)` and `decodeCompactPatch("")` return `[]`. An unknown op code, an unknown value tag or a malformed length prefix throws.

## Applying a patch

`applyPatch(document, patch)` applies an array of operations, and `applyOperation(document, operation)` applies one. They are JSON Patch (RFC 6902) with Live Mercury's extensions:

```ts
import { applyPatch, decodeCompactPatch } from "@fiberfx/live-mercury";

const next = applyPatch(props, decodeCompactPatch(payload));
```

`applyPatch` copies on write below the root. The first time a batch touches a container on an operation's path, it clones it, so a nested value an earlier render kept is never changed under it, and a container on an untouched path keeps its identity. The root itself is mutated in place and returned: a test asserts `applyPatch(original, …)` is `original`. That is why the hook spreads the props, streams and functions into a new object on each paint, so the component sees a new top-level object per update.

`test` operations are accepted and do nothing: no value is compared. `getValueByPointer(document, pointer)` reads one value by JSON Pointer, with `-` for an array's last item and `$$<id>` for an item by its `__dom_id`.

## upsert, limit and $$ paths

The three extensions exist for streams.

- **`$$<id>` path segments** address an array item by its `__dom_id` instead of its index. The comparison is loose, so a numeric `__dom_id` matches its string form. When no item has that id, the operation is skipped with a console warning.
- **`upsert`** with a value that has a `__dom_id` replaces the array item with the same `__dom_id` where there is one, and otherwise inserts the value at the path's index (`-` is the end). A value without `__dom_id` is inserted.
- **`limit`** with `n >= 0` keeps the first `n` items; with `n < 0` it keeps the last `|n|`. Its path names the array.

```ts
import { applyOperation } from "@fiberfx/live-mercury";

const doc = { rows: [{ __dom_id: "a", v: 1 }, { __dom_id: "b", v: 2 }] };
applyOperation(doc, { op: "upsert", path: "/rows/-", value: { __dom_id: "a", v: 99 } });
// doc.rows: [{ __dom_id: "a", v: 99 }, { __dom_id: "b", v: 2 }]
applyOperation(doc, { op: "remove", path: "/rows/$$a" });
// doc.rows: [{ __dom_id: "b", v: 2 }]
```

After a reconnect the hook rebuilds every stream from the re-mount's patch, which starts with a reset, rather than merging it into the streams it held. [LM1](/live-mercury/liveview) covers that callback.
