The catalog is built the way you would build your own block: every catalog block is a `BlockEntry`, and `contentRegistry()` is `createRendererRegistry` over them. The capstone is to add one.

## The entry

A `BlockEntry` has seven fields:

| Field | What to put |
|---|---|
| `name` | the block's display name |
| `group` | one of the nine catalog groups, or `"Internal"`; the type allows no other |
| `type` | the block type documents name, for example `"callout"` |
| `definition` | its schema: `type` (the same string), `version`, `props`, and `slots` if it holds children |
| `capabilities` | what the host must grant: `[]`, `["embed"]` or `["form"]` |
| `render` | `({ node, props, context }) => …`, returning what to render |
| `example` | props, and slot children, that the example check renders |

The renderer gets `props` with each responsive value at its base, the `node` as stored, and a `context` with `theme`, `capabilities`, `resolve` and `slot`. It never gets the render mode, so it can't render preview differently from publication.

## Write the block

A callout: a titled note with children. `@fiberfx/content`'s blocks are `.tsx` compiled with `@fiberfx/hyperscript` as the JSX source, and yours can be too.

```tsx
import { renderToStaticMarkup } from "@fiberfx/hyperscript/server";
import { parseDocument } from "@fiberfx/schema";
import { catalogEntries, createRendererRegistry, exampleDocument, renderDocument, schemaFor, type BlockEntry } from "@fiberfx/content";

const callout: BlockEntry = {
  name: "Callout",
  group: "Composition",
  type: "callout",
  definition: {
    type: "callout",
    version: 1,
    props: { tone: { kind: "string", enum: ["note", "warning"] }, title: { kind: "string", maxLength: 120 } },
    slots: { content: {} },
  },
  capabilities: [],
  render: ({ node, props, context }) => (
    <aside class={`callout callout--${props.tone === "warning" ? "warning" : "note"}`} role="note">
      <p class="callout__title">{typeof props.title === "string" ? props.title : ""}</p>
      {context.slot(node, "content")}
    </aside>
  ),
  example: {
    props: { tone: "note", title: "Before you start" },
    slots: { content: [{ type: "paragraph", props: { text: "Inside the callout." } }] },
  },
};

const registry = createRendererRegistry([...catalogEntries(), callout]);
const schema = schemaFor(registry);

const parsed = parseDocument(exampleDocument(callout), schema);
if (!parsed.ok) throw new Error(`${parsed.code} at ${parsed.path}: ${parsed.reason}`);
const { element, report } = renderDocument(parsed.document, { mode: "publication", revision: 1, registry });
const markup = renderToStaticMarkup(element);
if (report.unsupported.length > 0 || !markup.includes("Inside the callout.")) throw new Error("the callout did not render");
```

The renderer guards each prop's type even though parsing has already checked it. The catalog does the same, so a document built without parsing still renders something readable.

## The renderer registry

`createRendererRegistry(entries)` indexes entries by `type`. Spread `catalogEntries()` into the list to keep every catalog block, as the package's own test does, then pass your registry to `renderDocument` with the `registry` option. Without that option `renderDocument` uses `contentRegistry()`, which has no `callout`, so your node renders as unsupported.

## The schema from the registry

`schemaFor(registry)` builds the schema registry that the registry's documents validate against: every entry's definition, with `BREAKPOINTS` declared. Parse with it, not with `contentSchema()`.

With `contentSchema()`, a `callout` node is an unknown type. It is kept and not checked, so a bad `tone` would pass parsing. With `schemaFor(registry)`, the node is checked against your definition, and a `tone` of `"loud"` is refused as `invalid-prop` at `#/nodes/<its id>/props/tone`, with the reason "expected one of note, warning".

## The example check

The package checks every catalog entry the same way:

1. the definition's `type` equals the entry's `type`;
2. `capabilities` is a list, and `render` is a function;
3. `exampleDocument(entry)` parses;
4. it renders non-empty markup with no `data-unsupported` in it.

`exampleDocument(entry)` builds a page document whose only root is your block, with node ids `<type>-1`, `<type>-2` and so on, and your example's children in their slots. The fence above runs steps 3 and 4 for the callout against your own schema and registry. The catalog's own check parses against `contentSchema()`, which has no `callout`.

## What throws

Mistakes in an entry are programming errors, so they throw when the registry is built, before any page renders.

`createRendererRegistry` throws an `Error`:

```ts
import { catalogEntries, createRendererRegistry, type BlockEntry } from "@fiberfx/content";

const page = catalogEntries()[0]!;
const renamed: BlockEntry = { ...page, type: "page-v2" };

try {
  createRendererRegistry([...catalogEntries(), page]);
} catch (error) {
  console.log((error as Error).message); // block type "page" is registered twice
}
try {
  createRendererRegistry([renamed]);
} catch (error) {
  console.log((error as Error).message); // "Page" declares type "page-v2" but its definition is "page"
}
```

`schemaFor` throws a `TypeError` from `createSchemaRegistry` for:

- a definition `version` below 1;
- migrations with a gap, or ending below the version;
- `defaults` that fail the block's own prop schema;
- a prop `kind` the schema package doesn't know;
- a `token` prop. `schemaFor` declares no token sets, so any token set is undeclared.

```ts
import { catalogEntries, createRendererRegistry, schemaFor, type BlockEntry } from "@fiberfx/content";

const badge: BlockEntry = {
  ...catalogEntries()[0]!,
  name: "Badge",
  type: "badge",
  definition: { type: "badge", version: 1, props: { tone: { kind: "token", set: "tone" } } },
};

try {
  schemaFor(createRendererRegistry([badge]));
} catch (error) {
  console.log((error as Error).message); // block "badge" prop "tone" names the token set "tone", which the registry does not declare
}
```

## Limits to know

- **Versions in examples.** `exampleDocument` takes each node's version from `contentRegistry()`, and writes 1 for a type it doesn't have. A block of your own at version 2 therefore gets an example at version 1, which your schema refuses as `outdated-block`. Keep a new block at version 1, or write its example document by hand.
- **The package's link checks aren't exported.** `safeHref` and `httpsUrl` stay inside `@fiberfx/content`, so a block with an author link must make its own check. The [references lesson](/content/references) lists what the catalog keeps and drops.
- **Capabilities are yours to honour.** Declaring `["form"]` or `["embed"]` doesn't gate anything. Your renderer reads `context.capabilities` and renders its own fallback, as the catalog's form and embed do.
- **Interactive blocks render static first.** The catalog's interactive blocks render a static form on the server and on the first client render, then upgrade once mounted, with hooks from `@fiberfx/hyperscript/hooks`. A block that does the same reads fully without JavaScript.

What this lesson doesn't cover: how a block you write reaches the Mercury site's own pages. The site's app parses with `contentSchema()` and renders without a `registry` option, so at this version it renders catalog blocks only.
