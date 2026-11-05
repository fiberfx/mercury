A Mercury page is not a component tree in code. It is a JSON document: data that a server can store, a renderer can read and an editor can change, with the same checks everywhere. `@fiberfx/schema` defines it.

## The document

A document has five fields:

| Field | What it holds |
|---|---|
| `format` | the portable format's version, an integer from 1; `FORMAT_VERSION` is 1 |
| `id` | the document's id, a non-empty string |
| `kind` | `page` (ordinary content), `fragment` (shared content other documents reference) or `template` |
| `roots` | the ids of the top-level nodes, in order |
| `nodes` | every node, in one flat record keyed by id |

Fields the format does not name are kept as they are, so a host can carry its own data beside the content. They must be JSON too.

## Nodes and slots

The tree is not nested in the JSON. Each node sits once in `nodes`, and a parent lists its children by id in named **slots**:

- `id`: the node's id, equal to its key in `nodes`;
- `type`: the block type it renders as, for example `heading`;
- `version`: the version of that block's schema, an integer from 1;
- `props`: its values, JSON only;
- `slots`: a record of slot names to ordered lists of child ids.

A prop may hold a **reference** instead of a plain value: `{ "$ref": "asset", "id": "…" }`, where `$ref` is `asset`, `route`, `entity` or `fragment`. The document stores only the reference. What it points to is resolved beside the document, never inside it.

## The schema registry

A schema registry says which blocks exist and what each accepts. `createSchemaRegistry({ blocks, limits?, breakpoints?, tokens? })` builds one from block definitions. A definition has a `type`, a `version`, its `props` and, optionally, `defaults`, `slots` and `migrations`.

- **A prop schema** has a `kind`: `string` (with `enum`, `maxLength`), `number` (with `integer`, `min`, `max`), `boolean`, `reference` (with `to`), `token` (with `set`), `list` (with `items`, `maxItems`), `record` (with `fields`) or `json`. Any of them may be `optional`, and any may be `responsive`.
- **A slot** may name the block types it allows (`allow`) and how many children it holds (`min`, `max`). Without them it admits any type and any count.
- **Limits** default to `DEFAULT_LIMITS`: `maxDepth` 32 nested nodes, `maxBytes` 1,048,576, `maxNodes` 10,000, `maxPropDepth` 16.

A mistake in a definition is a programming error, so `createSchemaRegistry` throws a `TypeError` for it: a type registered twice, a version below 1, a gap in the migrations, or defaults that fail their own schema.

For the catalog you don't build a registry yourself. `contentSchema()` from `@fiberfx/content` returns the one every content document validates against: each catalog block's definition, with the breakpoints `sm`, `md`, `lg` and `xl`.

## parseDocument

`parseDocument(input, registry)` reads a document from JSON text or from a value already parsed. It answers one of two shapes:

- `{ ok: true, document }`, where `document` is the input itself, unknown fields included. Nothing is coerced and nothing is defaulted.
- a refusal, `{ ok: false, code, path, reason, subject, node? }`.

It never throws on bad input. Text that isn't JSON, a throwing getter or a revoked proxy comes back as a `malformed` refusal. Text more than eight times `maxBytes` is refused as `too-large` before it is parsed, and `maxBytes` itself is counted on the document's compact JSON, so whitespace never changes a verdict.

```ts
import { parseDocument } from "@fiberfx/schema";
import { contentSchema } from "@fiberfx/content";

const parsed = parseDocument(
  {
    format: 1,
    id: "hello",
    kind: "page",
    roots: ["page"],
    nodes: {
      page: { id: "page", type: "page", version: 1, props: { title: "Hello" }, slots: { content: ["title", "intro"] } },
      title: { id: "title", type: "heading", version: 1, props: { text: "Hello", level: 7 }, slots: {} },
      intro: { id: "intro", type: "paragraph", version: 1, props: { text: "A first page." }, slots: {} },
    },
  },
  contentSchema(),
);

if (!parsed.ok) console.log(parsed.code, parsed.path, parsed.node, parsed.reason);
// invalid-prop #/nodes/title/props/level title expected at most 6
```

The heading's `level` is a number from 1 to 6, so 7 is refused. With `level: 1` the same call answers `{ ok: true, document }`.

## The verdicts

A refusal names one problem: a typed `code`, a JSON Pointer `path` in its fragment form (`#` is the whole document, `#/nodes/title/props/level` one prop), a `reason` in a sentence, the `subject` the path points into (always `document` for a parse), and the `node` when the problem is inside one.

The checks run in order, and the first failure is the answer:

1. **Shape:** `malformed` for a missing or wrong field, `newer-format` for a format above 1, `too-many-nodes` past `maxNodes`, `not-json-safe` for a value that isn't JSON, `too-deep` for a value nested past `maxPropDepth`. Each node's key must equal its `id`.
2. **Size:** `too-large` when the compact JSON passes `maxBytes`.
3. **Structure:** every node is reached exactly once from the roots. Otherwise `unknown-child` (an id not in `nodes`), `multiple-parents`, `cycle`, `too-deep` past `maxDepth`, or `orphan` (a node no root or slot holds).
4. **Each node of a known block:** `unknown-slot`, `slot-cardinality` (outside `min` or `max`), `slot-not-allowed` (a child type outside `allow`), then its props: `unknown-prop`, `missing-prop` (unless the prop is optional) and `invalid-prop` (wrong kind, enum, length, range, token, or an override at a name that is not a breakpoint).
5. **A fragment** that references itself is a `cycle`.

The Mercury site's app shows what to do with a refusal: it logs `code`, `path` and `reason`, and leaves the page's first paint in place instead of rendering anything partial.

## Blocks the registry doesn't know

A node whose `type` the registry doesn't have, or whose `version` is newer than the registered one, is kept unchanged and not checked against a definition. Its place in the structure is still checked. So a document written for a later catalog still parses, and the renderer shows such a node as unsupported, as the [rendering lesson](/content/rendering) explains.

A node with an **older** version is different: it is refused as `outdated-block`, and the document must be migrated first.
