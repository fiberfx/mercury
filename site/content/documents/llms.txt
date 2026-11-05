# Page documents: nodes, the schema and parseDocument — Mercury LMS

> A Mercury page document (`@fiberfx/schema` 4.0.0) is JSON: `format`, `id`, `kind`, ordered `roots` and a flat `nodes` record. `parseDocument(input, registry)` answers `{ ok: true, document }` or exactly one refusal, and never throws.

## Read this when

You write, generate or store a page document, build a schema registry, or handle a refused document.

## The contract

- Document: `{ format: 1, id: string, kind: "page" | "fragment" | "template", roots: NodeId[], nodes: { [id]: DocumentNode } }`. Unknown fields are kept; they must be JSON.
- Node: `{ id, type, version, props, slots }`. `id` equals its key in `nodes`. `version` is an integer from 1. `props` is JSON only. `slots` maps a slot name to an ordered list of child ids.
- Reference in a prop: `{ "$ref": "asset" | "route" | "entity" | "fragment", "id": string }`; resolved outside the document.
- `createSchemaRegistry({ blocks, limits?, breakpoints?, tokens? })`. Throws `TypeError` on a duplicate type, a version below 1, a migration gap, or defaults failing their schema.
- `BlockDefinition`: `{ type, version, props, defaults?, slots?, migrations? }`. Prop kinds: `string`, `number`, `boolean`, `reference`, `token`, `list`, `record`, `json`; each may be `optional` or `responsive`. Slot: `{ allow?, min?, max? }`.
- `DEFAULT_LIMITS`: `maxDepth` 32, `maxBytes` 1048576 (compact JSON), `maxNodes` 10000, `maxPropDepth` 16.
- Catalog documents: `parseDocument(input, contentSchema())` with `contentSchema` from `@fiberfx/content`; breakpoints `sm`, `md`, `lg`, `xl`.
- `parseDocument(input: unknown, registry)` → `{ ok: true, document }` (the input itself, nothing coerced or defaulted) or `{ ok: false, code, path, reason, subject: "document", node? }`.
- Check order, first failure wins: shape (`malformed`, `newer-format`, `too-many-nodes`, `not-json-safe`, `too-deep`) → size (`too-large`) → structure (`unknown-child`, `multiple-parents`, `cycle`, `too-deep`, `orphan`) → each known node (`unknown-slot`, `slot-cardinality`, `slot-not-allowed`, `unknown-prop`, `missing-prop`, `invalid-prop`) → a fragment referencing itself (`cycle`).
- Unknown block type or newer version: kept and not checked against a definition. Older version: `outdated-block`; migrate first.

## Minimal example

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
      page: { id: "page", type: "page", version: 1, props: { title: "Hello" }, slots: { content: ["intro"] } },
      intro: { id: "intro", type: "paragraph", version: 1, props: { text: "A first page." }, slots: {} },
    },
  },
  contentSchema(),
);
if (!parsed.ok) console.log(parsed.code, parsed.path, parsed.reason);
```

## Never emit

A nested node tree inside `props` or `slots`: children are ids in slots. A function, an element or a DOM handle in props. A `try`/`catch` around `parseDocument` in place of checking `parsed.ok`.

## Next

- Rendering a document: /content/rendering (/content/rendering/llms.txt)
- The course: /content (/content/llms.txt)
- This companion: /content/documents/llms.txt

## Navigation

- [Read this page in the browser](/content/documents)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/content/llms.txt)
