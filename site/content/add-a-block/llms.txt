# Add a block: the capstone — Mercury LMS

> Add your own block to Mercury page documents (`@fiberfx/content` 4.0.0): write a `BlockEntry`, put it in a registry with `createRendererRegistry([...catalogEntries(), entry])`, derive its schema with `schemaFor(registry)`, then parse and render `exampleDocument(entry)` with both.

## Read this when

You need a block the catalog doesn't have, or you are checking a block entry before a page uses it.

## The contract

- `BlockEntry`: `{ name, group, type, definition, capabilities, render, example }`. `group` is a catalog group or `"Internal"` (closed union). `definition.type` must equal `type`. `capabilities`: `[]`, `["embed"]` or `["form"]`.
- `render({ node, props, context })`: `props` at their base; `context` is `{ theme, capabilities, resolve, slot }`, never the mode. `.tsx` with `jsxImportSource: "@fiberfx/hyperscript"`.
- `example`: `{ props, slots?: { [slot]: { type, props, slots? }[] } }`.
- `createRendererRegistry(entries)` throws `Error` for a type registered twice (`block type "x" is registered twice`) or a type mismatch (`"Name" declares type "a" but its definition is "b"`).
- `schemaFor(registry)` → the schema registry (every definition, `BREAKPOINTS`). It throws `TypeError` for a version below 1, a migration gap, failing defaults, an unknown prop kind, or any `token` prop (no token sets are declared).
- Parse your documents with `schemaFor(registry)`. Under `contentSchema()` your type is unknown, so it is kept and unchecked. Render with `{ registry }`, or your node is unsupported.
- The example check: parse `exampleDocument(entry)`, render it, and expect non-empty markup with `report.unsupported` empty. `exampleDocument` takes versions from `contentRegistry()`, else 1, so keep a new block at version 1.
- `safeHref` and `httpsUrl` are not exported; check author links yourself. Declared capabilities aren't enforced; read `context.capabilities`.

## Minimal example

```tsx
import { parseDocument } from "@fiberfx/schema";
import { catalogEntries, createRendererRegistry, exampleDocument, renderDocument, schemaFor, type BlockEntry } from "@fiberfx/content";

const callout: BlockEntry = {
  name: "Callout",
  group: "Composition",
  type: "callout",
  definition: { type: "callout", version: 1, props: { title: { kind: "string", maxLength: 120 } }, slots: { content: {} } },
  capabilities: [],
  render: ({ node, props, context }) => (
    <aside class="callout" role="note">
      <p>{typeof props.title === "string" ? props.title : ""}</p>
      {context.slot(node, "content")}
    </aside>
  ),
  example: { props: { title: "Before you start" }, slots: { content: [{ type: "paragraph", props: { text: "Inside." } }] } },
};

const registry = createRendererRegistry([...catalogEntries(), callout]);
const parsed = parseDocument(exampleDocument(callout), schemaFor(registry));
if (!parsed.ok) throw new Error(`${parsed.code} at ${parsed.path}`);
const { report } = renderDocument(parsed.document, { mode: "preview", revision: 1, registry });
if (report.unsupported.length > 0) throw new Error("callout is unsupported");
```

## Never emit

A `group` outside the catalog's nine or `"Internal"`. A `definition.type` that differs from `type`. A `token` prop with `schemaFor`. A parse against `contentSchema()` for a document using your block. A `renderDocument` call without `registry` for one.

## Next

- References, capabilities and responsive values: /content/references (/content/references/llms.txt)
- The block catalog: /content/blocks (/content/blocks/llms.txt)
- This companion: /content/add-a-block/llms.txt

## Navigation

- [Read this page in the browser](/content/add-a-block)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/content/llms.txt)
