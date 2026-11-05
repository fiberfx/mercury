`renderDocument` is the one way a page document becomes markup. It reads; it never fetches, stores or submits anything, and it needs no provider around it.

## The call

```ts
import { parseDocument } from "@fiberfx/schema";
import { contentSchema, renderDocument } from "@fiberfx/content";

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

if (parsed.ok) {
  const { element, report } = renderDocument(parsed.document, { mode: "publication", revision: 1, lang: "en" });
  console.log(report); // { unsupported: [], publishable: true }
}
```

It takes a `MercuryDocument`, which is what `parseDocument` hands back on `ok`. It does not validate the document itself: parse first, then render.

It returns `{ element, report }`. The `element` is a `VNode` of `@fiberfx/hyperscript`; the `report` says what could not be shown.

## The options

| Option | Required | What it does |
|---|---|---|
| `mode` | yes | `"preview"` or `"publication"`: which surface asked. The markup never depends on it, and no block sees it. |
| `revision` | yes | the local revision being shown, a number; written to the root as `data-revision` |
| `theme` | no | `"light"` (the default) or `"dark"` |
| `lang` | no | the content's language, independent of the editor chrome's locale |
| `dir` | no | `"ltr"` or `"rtl"` |
| `registry` | no | the renderer registry; `contentRegistry()`, every catalog block, by default |
| `resolved` | no | what the host resolved for each reference, keyed `<kind>:<id>`, for example `asset:hero` |
| `capabilities` | no | what the host's content policy grants: `"embed"`, `"form"`; none by default |
| `allowUnsupported` | no | `true` by default; when `false`, any unsupported block makes the report unpublishable |

**`mode` is deliberately invisible.** A block receives a context with the theme, the capabilities, `resolve` and `slot`, and no mode. A block cannot tell preview from publication, so the two can't drift apart through one. The package's test renders a document both ways and asserts the markup is equal.

**`resolved` is the host's answer, never a fetch.** Each entry may carry `src`, `href`, `title`, `items` (a resolved collection) or `error`. A block asks `context.resolve(prop)` and gets the entry for that reference's key, or `undefined` when the host resolved nothing. The Mercury site's app resolves each image's asset to its source:

```ts
import { renderDocument, type ResolvedReference } from "@fiberfx/content";
import type { MercuryDocument } from "@fiberfx/schema";

function show(document: MercuryDocument) {
  const resolved: { [key: string]: ResolvedReference } = { "asset:hero": { src: "/images/hero.png" } };
  return renderDocument(document, { mode: "publication", revision: 0, resolved });
}
```

## The root element

Everything renders inside one `div`:

- `class`: `mx-content`, then `light-theme` or `dark-theme` from `theme`;
- `data-document`: the document's `id`;
- `data-revision`: the `revision` option, as a string;
- `lang` and `dir`: from the options.

The theme lives on this wrapper, not on the page around it. The Mercury site's app passes the theme it reads from the `<html>` element, and when the reader's colour scheme changes it toggles `dark-theme` and `light-theme` on every `.mx-content` root.

## What a block receives

Each node is rendered by the registry's entry for its `type`, called with `{ node, props, context }`:

- `props`: the node's props with each responsive value resolved to its **base**;
- `node`: the node as stored, so a block that needs the breakpoint overrides reads them from `node.props`;
- `context.slot(node, name)`: the rendered children of one slot, in document order.

A slot that lists an id with no node in `nodes` renders nothing in that place. A parsed document never has one, since `parseDocument` refuses an `unknown-child`.

## Unsupported blocks and the report

A node whose `type` the registry has no entry for is not an error. It renders a placeholder, a `div` with the class `mx-content-unsupported`, `data-unsupported` set to the type and `role="note"`, holding the sentence "This content can't be shown here." Its slots still render inside it, so the content a newer block wraps stays readable.

The node's id goes into `report.unsupported`, in document order. `report.publishable` is `true` when nothing is unsupported, or when `allowUnsupported` isn't `false`. Whether a page with unsupported content may publish is the host's decision; the option lets it say so:

```ts
import { renderDocument } from "@fiberfx/content";
import type { MercuryDocument } from "@fiberfx/schema";

function check(document: MercuryDocument): boolean {
  const { report } = renderDocument(document, { mode: "preview", revision: 1, allowUnsupported: false });
  return report.publishable; // false when any block is unsupported
}
```

The document itself is never changed by rendering, unsupported nodes included.

## Mounting the element

`render(element, container)` from `@fiberfx/hyperscript` mounts the result. The site's app replaces the container's first paint, mounts, and records how many blocks were unsupported:

```ts
import { render } from "@fiberfx/hyperscript";
import { renderDocument } from "@fiberfx/content";
import type { MercuryDocument } from "@fiberfx/schema";

function mount(document: MercuryDocument, main: HTMLElement) {
  const { element, report } = renderDocument(document, { mode: "publication", revision: 0 });
  main.replaceChildren();
  render(element, main);
  if (report.unsupported.length > 0) main.dataset.unsupported = String(report.unsupported.length);
}
```
