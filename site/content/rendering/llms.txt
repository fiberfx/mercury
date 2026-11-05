# Rendering a document: renderDocument — Mercury LMS

> `renderDocument(document, options)` from `@fiberfx/content` 4.0.0 turns a parsed page document into `{ element, report }`: one `@fiberfx/hyperscript` VNode and the list of unsupported blocks. No fetch, no storage, no provider; preview and publication give the same markup.

## Read this when

You show a page document, choose its render options, pass what the host resolved, or decide whether a page with unknown blocks may publish.

## The contract

- `renderDocument(document: MercuryDocument, options: RenderOptions): { element: VNode, report: { unsupported: NodeId[], publishable: boolean } }`. Pass `parsed.document` from `parseDocument`; it does not validate.
- Required: `mode: "preview" | "publication"` (no block sees it; markup never depends on it), `revision: number` (written as `data-revision`).
- Optional: `theme: "light" | "dark"` (default `light`), `lang`, `dir: "ltr" | "rtl"`, `registry` (default `contentRegistry()`), `resolved: { ["<kind>:<id>"]: { src?, href?, title?, items?, error? } }`, `capabilities: ("embed" | "form")[]` (default none), `allowUnsupported` (default `true`).
- Root: `<div class="mx-content light-theme|dark-theme" data-document=<id> data-revision=<revision> lang dir>`.
- Blocks get `{ node, props, context }`: `props` with responsive values at their base; `node.props` keeps overrides; `context` is `{ theme, capabilities, resolve, slot }`.
- Unregistered type: `<div class="mx-content-unsupported" data-unsupported=<type> role="note">` with "This content can't be shown here." and its slots rendered inside; its id joins `report.unsupported` in document order.
- `report.publishable` is `false` only when something is unsupported and `allowUnsupported: false`.
- Mount with `render(element, container)` from `@fiberfx/hyperscript`.

## Minimal example

```ts
import { render } from "@fiberfx/hyperscript";
import { parseDocument } from "@fiberfx/schema";
import { contentSchema, renderDocument } from "@fiberfx/content";

const main = document.querySelector<HTMLElement>("[data-page]");
const response = await fetch("/page.json", { headers: { accept: "application/json" } });
const parsed = parseDocument(await response.text(), contentSchema());
if (main && parsed.ok) {
  const { element, report } = renderDocument(parsed.document, { mode: "publication", revision: 0, lang: "en", theme: "light" });
  render(element, main);
  if (report.unsupported.length > 0) main.dataset.unsupported = String(report.unsupported.length);
}
```

## Never emit

A `fetch` inside a block for its data: pass the host's answers in `resolved`. A branch on `mode` inside a block: blocks can't see it. A `throw` for an unsupported block: it is reported, not an error.

## Next

- The block catalog: /content/blocks (/content/blocks/llms.txt)
- Page documents: /content/documents (/content/documents/llms.txt)
- This companion: /content/rendering/llms.txt

## Navigation

- [Read this page in the browser](/content/rendering)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/content/llms.txt)
