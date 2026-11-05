# Content, Mercury's page documents — Mercury LMS

> `@fiberfx/schema` 4.0.0 holds the page document format and `parseDocument`; `@fiberfx/content` 4.0.0 holds the block catalog and `renderDocument`. A page is JSON data: parse it against a schema registry, render it through a renderer registry, mount the element.

## Read this when

You show, check or produce a Mercury page document, or you need to know which package owns which step. This page is the course's landing.

## The contract

- `@fiberfx/schema`: `parseDocument(input, registry)` → `{ ok: true, document }` or a refusal `{ ok: false, code, path, reason, subject, node? }`. Also `createSchemaRegistry`, `DEFAULT_LIMITS`, `FORMAT_VERSION`, `applyCommand`, `validateCommand`, `migrateDocument`, `inspectDocument`, `resolveReferences`, `resolveResponsive`.
- `@fiberfx/content`: `renderDocument(document, options)` → `{ element, report }`; `contentRegistry()` (every catalog block), `contentSchema()` (the schema registry content documents validate against), `CATALOG`, `catalogEntries()`, `exampleDocument(entry)`, `createRendererRegistry`, `schemaFor`, `BREAKPOINTS`.
- Peer dependencies of `@fiberfx/content`: `@fiberfx/hyperscript`, `@fiberfx/schema`, `@fiberfx/ui`, each 4.0.0.
- Order: `parseDocument` first, then `renderDocument` on `parsed.document`, then `render(element, container)` from `@fiberfx/hyperscript`.

## Minimal example

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

## Never emit

A function, an element or a DOM handle inside a document's props: a document is JSON data only. A `renderDocument` call on input that `parseDocument` has not accepted.

## Next

- Page documents: /content/documents (/content/documents/llms.txt)
- Rendering a document: /content/rendering (/content/rendering/llms.txt)
- The block catalog: /content/blocks (/content/blocks/llms.txt)
- References, capabilities and responsive values: /content/references (/content/references/llms.txt)
- Add a block: /content/add-a-block (/content/add-a-block/llms.txt)
- The site: /llms.txt
- This companion: /content/llms.txt

## Navigation

- [Read this page in the browser](/content)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)

### Chapter companions

- [/content/add-a-block](/content/add-a-block/llms.txt)
- [/content/blocks](/content/blocks/llms.txt)
- [/content/documents](/content/documents/llms.txt)
- [/content/references](/content/references/llms.txt)
- [/content/rendering](/content/rendering/llms.txt)
