# References, capabilities and responsive values — Mercury LMS

> What `renderDocument` (`@fiberfx/content` 4.0.0) leaves to the host: a `resolved` record keyed `<kind>:<id>` for every reference, the `embed` and `form` capabilities, and responsive props read at their base. Blocks never fetch, and every missing answer has a visible fallback.

## Read this when

You host Mercury pages and must supply images, routes or collections, grant or withhold embeds and forms, or read a responsive prop at a breakpoint.

## The contract

- Reference in a prop: `{ $ref: "asset" | "route" | "entity" | "fragment", id }`. Key: `referenceKey(reference)` → `"<$ref>:<id>"` (`@fiberfx/schema`).
- `renderDocument(document, { resolved })`: `resolved: { [key]: { src?, href?, title?, items?: { title, href?, summary? }[], error? } }`. Nothing in the package fetches.
- Readers: `image`/`figure`/`gallery`/`logo-list`/`audio` read `src`; `video` reads `src` for its asset and `captions`; `form` reads `href` (with `form` granted); `collection-feed`/`article-list`/`related-content`/`related-articles` read `items` and `error`. No catalog block reads `title`.
- Data-backed states: key missing → `unavailable`; `items: []` → `empty`; `error` → `error` (alert); items → `ready`.
- `@fiberfx/schema`: `collectReferences(document)` → `{ node, path, reference }[]`; `resolveReferences(document, resolve)` → `Map<key, { status: "resolved" | "unknown" | "unauthorized", reference, details? }>`, once per key; `unauthorized` keeps only the identity; any other answer throws `TypeError`. Converting a `Resolution` to `resolved` is the host's job.
- `capabilities: ("embed" | "form")[]`, none by default. `renderDocument` does not enforce an entry's declared capabilities; each block reads `context.capabilities`.
- `embed`: an `<iframe sandbox="allow-scripts">` only with `embed` granted and an absolute https URL; else a link. `form`: posts only with `form` granted and a safe resolved `href`; else disabled, with "This form can't be sent from here." `form-submit`: disabled without `form`.
- Author `href`s kept: `/`, `./`, `../`, `#`, `?`, `http:`, `https:`, `mailto:`, `tel:`. Dropped (label kept, no href): other schemes, `//`, `/\`, `\\`, any control character. `safeHref` and `httpsUrl` are not exported.
- Responsive value: `{ $responsive: { base?, overrides: { [breakpoint]: value | { $removed: true } } } }`, only on props with `responsive: true` (catalog: `section.background`, `columns.reverse`). `BREAKPOINTS` = `["sm", "md", "lg", "xl"]`. An override at another name, or a wrapper on a non-responsive prop: `invalid-prop`.
- Blocks get the base in `props`; `node.props` keeps overrides. `section` renders the base only. `columns` writes `data-reverse` / `data-reverse-<bp>`, and no stylesheet in the repository reads them.
- `resolveResponsive(value, breakpoint, BREAKPOINTS)` → `{ state: "explicit" | "inherited" | "removed" | "absent", from?, value? }`.

## Minimal example

```ts
import { renderDocument, type ResolvedReference } from "@fiberfx/content";
import { collectReferences, referenceKey, type MercuryDocument } from "@fiberfx/schema";

function show(document: MercuryDocument, sources: { readonly [id: string]: string }) {
  const resolved: { [key: string]: ResolvedReference } = {};
  for (const { reference } of collectReferences(document)) {
    const src = reference.$ref === "asset" ? sources[reference.id] : undefined;
    if (src !== undefined) resolved[referenceKey(reference)] = { src };
  }
  return renderDocument(document, { mode: "publication", revision: 0, resolved, capabilities: ["embed"] });
}
```

## Never emit

A `fetch` inside a block to resolve a reference. A resolved key without its kind (`"hero"` for `"asset:hero"`). An `import { safeHref } from "@fiberfx/content"`: it is not exported. A responsive wrapper on a prop whose schema isn't `responsive`.

## Next

- Add a block: /content/add-a-block (/content/add-a-block/llms.txt)
- Rendering a document: /content/rendering (/content/rendering/llms.txt)
- This companion: /content/references/llms.txt

## Navigation

- [Read this page in the browser](/content/references)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/content/llms.txt)
