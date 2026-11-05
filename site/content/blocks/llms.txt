# The block catalog: nine groups, one registry — Mercury LMS

> `@fiberfx/content` 4.0.0's catalog: 51 blocks in nine groups plus the internal `column`, all in `contentRegistry()`. Each entry declares a block `type`, a schema, its host capabilities (`embed`, `form` or none), a renderer and an example.

## Read this when

You write a node of a given block type, need a block's props and slots, or need to know what a block renders and what it asks of the host.

## The contract

- `CATALOG`: `{ group, names }[]`, nine groups, 51 names. `catalogEntries()`: every `BlockEntry` (adds `Column`, group `Internal`). `exampleDocument(entry)`: a one-block page document from the entry's example.
- `BlockEntry`: `{ name, group, type, definition, capabilities, render, example }`.
- Types by group (`?` optional prop):
  - Structure: `page` {title; slot content}, `section` {background? default|muted|primary, responsive; content}, `container` {size? sm–xl; content}, `columns` {count 2–4, reverse? responsive; columns: only `column`, 2–4}, `grid` {cols 1–6; items}, `stack` {gap? sm–xl; content}, `divider` {label?}, `spacer` {size sm–xl}, internal `column` {content}.
  - Text: `heading` {text, level 1–6, size? 1–9}, `paragraph` {text}, `rich-text` {content: [{text, marks? strong|em|code, href?}] ≤500}, `list` {items ≤200, ordered?}, `quote` {text, cite?}, `code` {code, language?}.
  - Media: `image` {asset ref, alt}, `figure` {asset, alt, caption}, `gallery` {images ≤48 [{asset, alt}]}, `video` {title, asset, captions? asset, transcript?}, `audio` {title, asset, transcript?}, `embed` {url, title} (capability `embed`).
  - Navigation: `site-header` {brand; navigation: only `navigation`, ≤1}, `navigation` {label, links ≤40 [{label, href}]}, `breadcrumbs` {items ≤12 [{label, href?}]}, `footer` {text?; content}, `anchor-links` {label, links ≤40 [{label, target}]}.
  - Composition: `button` {label, href, variant? primary|secondary|ghost}, `button-group` {buttons: only `button`, 1–4}, `hero` {title, subtitle?; actions: button|button-group ≤1}, `cta-section` {title, text?; actions}, `card` {title, text?, href?}, `card-grid` {columns? 1–4; cards: only `card`}, `feature-list` {items ≤24 [{title, text}]}, `logo-list` {label, logos ≤24 [{name, asset?}]}, `testimonials` {items ≤24 [{quote, author, role?}]}.
  - Interactive content: `accordion` {items ≤30 [{title, text}]}, `tabs` {label?, items ≤12 [{label, text}]}, `disclosure` {summary, text}, `carousel` {label?, autoAdvance?, slides ≤20 [{text}]}.
  - Form content: `form` {label, action route ref; fields} (capability `form`), `field-group` {legend; fields}, `field` {kind text|email|tel|number|url|textarea|checkbox|select, name, label, required?, options? ≤50}, `form-submit` {label, success?, error?, state? idle|success|error} (capability `form`).
  - Data-backed content: `collection-feed`, `article-list`, `related-content` {title, collection entity ref}; `author-card` {name, bio?, href?}.
  - Editorial page: `article-header` {title, subtitle?, author?, published?}, `article-body` {content}, `table-of-contents` {label?, items ≤50 [{label, target}]}, `metadata` {items ≤20 [{label, value}]}, `related-articles` {title, collection entity ref}.
- Behaviour: images and media never fetch; an unresolved image shows its alt as `role="img"`. `embed` frames only absolute https with the `embed` capability, `sandbox="allow-scripts"`; else a link. Every panel and slide is in static markup; Tabs and Carousel upgrade once mounted. A form posts natively only with `form` granted and a resolved route; else it is disabled and says so. Data-backed blocks render `data-state` `error`, `unavailable`, `empty` or `ready` from the host's snapshot. Author hrefs pass `safeHref`: relative, `#`, `?`, http, https, mailto, tel; anything else renders with no href.

## Minimal example

```ts
import { catalogEntries, contentSchema, exampleDocument, renderDocument } from "@fiberfx/content";
import { parseDocument } from "@fiberfx/schema";

for (const entry of catalogEntries().filter((entry) => entry.group !== "Internal")) {
  const parsed = parseDocument(exampleDocument(entry), contentSchema());
  if (!parsed.ok) throw new Error(`${entry.name}: ${parsed.code} at ${parsed.path}`);
  const { report } = renderDocument(parsed.document, { mode: "preview", revision: 1 });
  console.log(entry.group, entry.name, entry.type, report.unsupported.length);
}
```

## Never emit

A catalog name as a node's `type` (`"RichText display"`): documents use the type (`"rich-text"`). Raw HTML in a rich-text run. A `level` chosen for its visual size: set `size` instead. A child whose type a slot's `allow` excludes (`slot-not-allowed`).

## Next

- Rendering a document: /content/rendering (/content/rendering/llms.txt)
- The course: /content (/content/llms.txt)
- This companion: /content/blocks/llms.txt

## Navigation

- [Read this page in the browser](/content/blocks)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/content/llms.txt)
