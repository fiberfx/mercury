Content is how Mercury describes a page as data. Two packages share the work: `@fiberfx/schema` owns the document format and its checks, and `@fiberfx/content` owns the blocks and the renderer. Both are version 4.0.0.

## Two packages

- **`@fiberfx/schema`** is the portable document format. A document is versioned, JSON-safe data: a flat map of nodes, each naming a block type and holding props and slots. `parseDocument` reads one against a schema registry and answers either the document or one refusal. The package also holds the command layer (`applyCommand`, `validateCommand`), migration (`migrateDocument`, `inspectDocument`) and the reference and responsive helpers.
- **`@fiberfx/content`** is the published-page renderer and its block catalog. `renderDocument` turns a document into an element through a renderer registry; `contentRegistry()` is the built-in one, every catalog block, and `contentSchema()` is the schema registry its documents validate against. Its import graph reaches no builder, history or editing engine: a published page carries only what it needs to read.

`@fiberfx/content` takes `@fiberfx/hyperscript`, `@fiberfx/schema` and `@fiberfx/ui` as peer dependencies. Its blocks render with `@fiberfx/ui`'s components and `@fiberfx/hyperscript`'s elements.

## The route a page takes

The Mercury site's own app is the worked consumer. For each route it fetches the page's `page.json`, then:

1. **parses** the text with `parseDocument(text, contentSchema())`. A refusal stops here, and the first paint the build wrote stays on screen.
2. **renders** the document with `renderDocument(document, { mode, revision, lang, theme, resolved })`, which returns an element and a report.
3. **mounts** the element with `render(element, main)` from `@fiberfx/hyperscript`.

```ts
import { render } from "@fiberfx/hyperscript";
import { parseDocument } from "@fiberfx/schema";
import { contentSchema, renderDocument } from "@fiberfx/content";

const main = document.querySelector<HTMLElement>("[data-page]");
const response = await fetch("/page.json", { headers: { accept: "application/json" } });
const parsed = parseDocument(await response.text(), contentSchema());
if (main && parsed.ok) {
  const { element } = renderDocument(parsed.document, { mode: "publication", revision: 0 });
  render(element, main);
}
```

## The course map

- **CT0 [Page documents](/content/documents):** what a document is, its nodes and slots, the schema registry, and `parseDocument`'s verdicts.
- **CT1 [Rendering a document](/content/rendering):** `renderDocument`'s options, the element it returns, and the report of unsupported blocks.
- **CT2 [The block catalog](/content/blocks):** the nine groups, each block's type, props and slots, and what it renders.
- **CT3 [References, capabilities and responsive values](/content/references):** what a host resolves for a block, the `embed` and `form` capabilities, the link checks, and breakpoints with their overrides.
- **CT4 [Add a block](/content/add-a-block):** the capstone. A `BlockEntry` of your own, a registry with `createRendererRegistry`, its schema with `schemaFor`, and the example check.

## What is shipped

Both packages are at version 4.0.0 in this repository, and the Mercury site's app renders its pages through them. The catalog holds every block its nine groups name. A builder that edits documents is not part of these packages: `@fiberfx/content` reads documents and never edits them.
