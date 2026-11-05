A page document says *which* image, route or collection it means, never what it is. What it is belongs to the host, and so does whether the page may frame other sites or take a form. This lesson covers everything `renderDocument` leaves to the host.

## References in a document

A prop holds a reference as `{ "$ref": kind, "id": id }`, where the kind is `asset`, `route`, `entity` or `fragment`. Any further JSON fields in it are kept. The reference's key is `<kind>:<id>`, which `referenceKey` from `@fiberfx/schema` returns, for example `asset:hero` or `entity:posts`.

The catalog's references are typed in each block's schema: an `image` takes an `asset`, a `form`'s `action` a `route`, a data-backed block's `collection` an `entity`.

## What a host puts in resolved

`renderDocument`'s `resolved` option is a plain record from key to what the host found:

| Field | Meaning |
|---|---|
| `src` | a source to load, for an asset |
| `href` | an address, for a route |
| `title` | a title |
| `items` | a resolved collection: each item a `title`, with an optional `href` and `summary` |
| `error` | the host's message when it tried and failed |

A block calls `context.resolve(prop)` and gets the entry for that prop's key, or `undefined` when the prop isn't a reference or the host left the key out. Nothing in `@fiberfx/content` fetches it.

The Mercury site's app resolves each image's asset id as its own source:

```ts
import { renderDocument, type ResolvedReference } from "@fiberfx/content";
import { collectReferences, referenceKey, type MercuryDocument } from "@fiberfx/schema";

function show(document: MercuryDocument, sources: { readonly [id: string]: string }) {
  const resolved: { [key: string]: ResolvedReference } = {};
  for (const { reference } of collectReferences(document)) {
    const src = reference.$ref === "asset" ? sources[reference.id] : undefined;
    if (src !== undefined) resolved[referenceKey(reference)] = { src };
  }
  return renderDocument(document, { mode: "publication", revision: 0, resolved });
}
```

## Which blocks read what

| Blocks | Read | Without it |
|---|---|---|
| `image`, `figure`, `gallery` | `src` | the alt text, as `role="img"`; nothing for an empty alt |
| `video` | `src` of its asset and of its `captions` | no player without the asset's `src`, no captions track without the captions' `src`; the title and transcript still show |
| `audio` | `src` | no player; the title and transcript still show |
| `logo-list` | `src` of each logo | the logo's name |
| `form` | `href` of its `action`, with the `form` capability | a disabled form that says it can't be sent |
| `collection-feed`, `article-list`, `related-content`, `related-articles` | `items`, `error` | the `unavailable` state |

For a data-backed block the four answers are distinct. With the reference keyed `entity:example`, the package's test renders `{}` as `unavailable`, `{ items: [] }` as `empty`, `{ error: "The feed is down." }` as `error` with the message in an alert, and a list of items as `ready`.

No catalog block reads `title` from a resolved reference at this version.

## Resolving with the schema package

`@fiberfx/schema` has its own resolution step, separate from the renderer's record. `collectReferences(document)` lists every reference in the nodes' props, with its node and path. `resolveReferences(document, resolve)` calls your resolver once per distinct key and returns a `Map` from key to a `Resolution`:

- `{ status: "resolved", reference, details? }`;
- `{ status: "unknown", reference }`: no such target;
- `{ status: "unauthorized", reference }`: the reader may not see it. It keeps only the reference's identity, whatever details the resolver had.

Any other answer from the resolver throws a `TypeError`. Neither call changes the document.

Neither package converts a `Resolution` into `renderDocument`'s `resolved` record. That mapping is the host's, as in the example above.

## Capabilities

A capability is a permission from the host's content policy: `"embed"` to frame third-party content, `"form"` to take form submissions at a resolved route. The host grants them with `renderDocument`'s `capabilities` option, and none are granted by default.

Three catalog blocks declare one in their entry's `capabilities`: `embed` declares `embed`, while `form` and `form-submit` declare `form`. `renderDocument` doesn't enforce the declaration. Each block reads `context.capabilities` itself and renders its own fallback:

- **`embed`:** with `embed` granted and an `https` URL, a sandboxed `<iframe>`. Otherwise, a link with the title.
- **`form`:** with `form` granted and its route resolved to a safe `href`, a `<form method="post">` to that address. Otherwise it shows "This form can't be sent from here.", disables every control through a disabled `<fieldset>`, and prevents a submit that reaches it anyway.
- **`form-submit`:** its button is disabled without `form`.

The package's tests check the form fallback after hydration. Every control matches `:disabled`, a dispatched submit is prevented, and nothing calls `fetch` or writes to storage.

## Author links and embed URLs

Every `href` an author writes passes one check before it reaches the markup. Kept:

- relative paths: `/…`, `./…`, `../…`;
- fragments `#…` and queries `?…`;
- `http:`, `https:`, `mailto:` and `tel:` links.

Dropped: `data:`, `vbscript:`, `javascript:` and every other scheme; a protocol-relative start (`//`, `/\` or `\\`); and any link containing a control character. A browser deletes tab, line-feed and carriage-return characters from a URL, so `"/\t/host"` would become `"//host"`. A dropped link keeps its label and loses only the `href`.

An embed frames only an absolute `https` URL with a host, and its `<iframe>` carries `sandbox="allow-scripts"` and never `allow-same-origin`, so the framed page can't take the host's origin. A `/same-origin` path, an `http:` URL or a `data:` URL renders the title as a link instead.

These checks live inside the package: `safeHref` and `httpsUrl` are not exported from `@fiberfx/content`, so a block you write yourself makes its own check.

## Responsive values

A prop whose schema says `responsive: true` may hold, instead of a plain value, a responsive value such as `{ "$responsive": { "base": false, "overrides": { "md": true } } }`.

`base` applies wherever no override does. Each override sets the value from its breakpoint up, and `{ "$removed": true }` removes the inherited value from that breakpoint up. The catalog has two responsive props, `section.background` and `columns.reverse`.

`BREAKPOINTS`, from `@fiberfx/content`, is `["sm", "md", "lg", "xl"]` in cascade order, and `contentSchema()` declares them. Parsing checks the base and every override as the prop's own kind. It refuses an override at any other name (`tablet`, say), and a responsive wrapper on a prop that isn't responsive, each as `invalid-prop` at its path.

## Reading overrides

A block receives every responsive prop already at its base, and the node it also receives keeps the overrides. In the catalog:

- **`section`** renders its base background only.
- **`columns`** writes `data-reverse` when the base is `true`, and `data-reverse-<breakpoint>` for each override that is `true`. The DOM keeps document order. These attributes are left for a stylesheet to read, and no stylesheet in this repository reads them at this version, so on its own `reverse` changes no layout.

To read a prop at one width outside a block, use `resolveResponsive(value, breakpoint, order)` from `@fiberfx/schema`. It answers where that width's value comes from:

```ts
import { resolveResponsive } from "@fiberfx/schema";
import { BREAKPOINTS } from "@fiberfx/content";

const reverse = { $responsive: { base: false, overrides: { md: true } } };
for (const breakpoint of BREAKPOINTS) console.log(breakpoint, resolveResponsive(reverse, breakpoint, BREAKPOINTS));
// sm { state: "inherited", from: "base", value: false }
// md { state: "explicit", from: "md", value: true }
// lg { state: "inherited", from: "md", value: true }
// xl { state: "inherited", from: "md", value: true }
```

The four states are `explicit` (set at that breakpoint), `inherited` (from a smaller breakpoint or the base), `removed` (removed at that breakpoint) and `absent` (nothing applies, or a smaller width removed it). A plain value is `inherited` from `base` at every width. Reading never writes back to the document.
