The catalog is what a page document can say. Each block is one entry in `@fiberfx/content`'s registry, and `contentRegistry()` holds them all.

## The catalog

`CATALOG` is the catalog's table: nine groups and the 51 names in them. `catalogEntries()` returns the registered entries themselves, which add one internal part, `Column`, that `Columns` composes.

Every entry ships with an example, and `exampleDocument(entry)` turns it into a one-block page document. The package's catalog check parses each example against `contentSchema()` and renders it, and none may come back empty or unsupported. You can run the same walk:

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

## What an entry declares

A `BlockEntry` has:

- `name`: its catalog name, for example `RichText display`;
- `group`: one of the nine groups, or `Internal`;
- `type`: the block type documents name, for example `rich-text`;
- `definition`: its schema, as `@fiberfx/schema` validates it;
- `capabilities`: what the host must grant, `embed` or `form`; most blocks need none;
- `render`: the renderer, called with `{ node, props, context }`;
- `example`: the props and slot children the catalog check renders.

In the tables below, a prop marked `?` is optional, and a number after a text prop is its longest length. A block with no slot column holds no children.

## Structure

| Block | type | Props | Slots | Renders |
|---|---|---|---|---|
| Page | `page` | `title` (200) | `content` | the page's `<main>`, labelled by the title |
| Section | `section` | `background?`: `default`, `muted` or `primary`, responsive | `content` | a `Section` with `py="48"` and a class for the background |
| Container | `container` | `size?`: `sm`–`xl` | `content` | a `Container` with `center`, `lg` unless set |
| Columns | `columns` | `count`: 2–4; `reverse?`, responsive | `columns`: only `column`, 2–4 | a `Grid` of `count` columns |
| Grid | `grid` | `cols`: 1–6 | `items` | a `Grid` |
| Stack | `stack` | `gap?`: `sm`–`xl` | `content` | a `Stack`, `md` unless set |
| Divider | `divider` | `label?` (80) | | a `Divider` |
| Spacer | `spacer` | `size`: `sm`–`xl` | | a `Spacer`, hidden from assistive technology |
| Column (internal) | `column` | | `content` | a `Stack` |

Sizes map to spacing: `sm` 12, `md` 24, `lg` 48, `xl` 72. `Columns`' `reverse` is written as `data-reverse` attributes (one per breakpoint override) for a stylesheet to read, and the DOM keeps document order. No stylesheet in this repository reads those attributes yet, so `reverse` changes no layout on its own; the [references lesson](/content/references) has the detail.

## Text

| Block | type | Props | Renders |
|---|---|---|---|
| Heading | `heading` | `text` (200), `level`: 1–6, `size?`: 1–9 | `h1`–`h6` by `level`, with the node's id as its `id` |
| Paragraph | `paragraph` | `text` (5000) | a `<p>` |
| RichText display | `rich-text` | `content`: up to 500 runs of `{ text, marks?, href? }` | a `<p>` of runs, each wrapped in `strong`, `em` or `code` as marked, and linked when `href` is safe |
| List | `list` | `items`: up to 200 strings; `ordered?` | an `<ol>` when `ordered`, else a `<ul>` |
| Quote | `quote` | `text` (2000), `cite?` (200) | a `Blockquote` |
| Code | `code` | `code` (20000), `language?` (40) | a block `Code`, wrapped with `data-language` |

A heading's `level` is its rank in the outline. Its visual `size` never chooses the rank; without one, the size follows the level. Rich text carries runs and marks only, never raw HTML.

## Media

| Block | type | Props | Renders |
|---|---|---|---|
| Image | `image` | `asset` (an asset reference), `alt` (500) | an `<img>` of the resolved source, loaded lazily |
| Figure | `figure` | `asset`, `alt`, `caption` (1000) | a `<figure>` with the image and a `<figcaption>` |
| Gallery | `gallery` | `images`: up to 48 `{ asset, alt }` | a list of images |
| Video | `video` | `title`, `asset`, `captions?` (an asset), `transcript?` | a `<figure>` with `<video controls>` once resolved, a captions track, and the transcript in a `<details>` |
| Audio | `audio` | `title`, `asset`, `transcript?` | the same with `<audio controls>` |
| Embed | `embed` | `url` (2000), `title` (200) | needs `embed`: a sandboxed `<iframe>`; otherwise a link |

An image never fetches its asset. When the host resolved no source, it shows its `alt` text in place, with `role="img"`; a decorative image (empty `alt`) with nothing resolved renders nothing. An embed frames only an absolute `https` URL, only when the host grants `embed`, and with `sandbox="allow-scripts"` and never the host's origin. If either condition is missing, it renders the title as a link.

## Navigation

| Block | type | Props | Slots | Renders |
|---|---|---|---|---|
| SiteHeader | `site-header` | `brand` (120) | `navigation`: only `navigation`, at most 1 | a `<header>` with the brand |
| Navigation | `navigation` | `label`, `links`: up to 40 `{ label, href }` | | a labelled `<nav>` with a list of links |
| Breadcrumbs | `breadcrumbs` | `items`: up to 12 `{ label, href? }` | | a `<nav aria-label="Breadcrumb">` with an ordered list |
| Footer | `footer` | `text?` (500) | `content` | a `<footer>` |
| AnchorLinks | `anchor-links` | `label`, `links`: up to 40 `{ label, target }` | | a labelled `<nav>` of `#target` links |

Breadcrumbs are static markup. The last item is the current page (`aria-current="page"`) and is never a link.

## Composition

| Block | type | Props | Slots | Renders |
|---|---|---|---|---|
| Button | `button` | `label` (80), `href`, `variant?`: `primary`, `secondary` or `ghost` | | a link styled as a button |
| ButtonGroup | `button-group` | | `buttons`: only `button`, 1–4 | a group of buttons |
| Hero | `hero` | `title`, `subtitle?` | `actions`: `button` or `button-group`, at most 1 | a `<section>` with an `h1` |
| CTASection | `cta-section` | `title`, `text?` | `actions`: as Hero | a `<section>` with an `h2` |
| Card | `card` | `title`, `text?`, `href?` | | a `Card` with an `h3`, linked when `href` is safe |
| CardGrid | `card-grid` | `columns?`: 1–4 | `cards`: only `card` | a `Grid`, 3 columns unless set |
| FeatureList | `feature-list` | `items`: up to 24 `{ title, text }` | | a list, each item an `h3` and a paragraph |
| LogoList | `logo-list` | `label`, `logos`: up to 24 `{ name, asset? }` | | a labelled `<section>`, each logo an image once resolved, else its name |
| Testimonials | `testimonials` | `items`: up to 24 `{ quote, author, role? }` | | a `Stack` of quotes with their authors |

A Button stays an `<a>`: what the author wrote is navigation, so it is a link that looks like a button.

## Interactive content

| Block | type | Props | Renders |
|---|---|---|---|
| Accordion | `accordion` | `items`: up to 30 `{ title, text }` | a native `<details>` per item |
| Tabs | `tabs` | `label?`, `items`: up to 12 `{ label, text }` | every panel under its own heading, then `@fiberfx/ui`'s `Tabs` once mounted |
| Disclosure | `disclosure` | `summary`, `text` | a native `<details>` |
| Carousel | `carousel` | `label?`, `autoAdvance?`, `slides`: up to 20 `{ text }` | every slide, then one at a time once mounted, with previous and next controls |

Every panel and slide is in the static markup, so the page reads in full without JavaScript, and Tabs and Carousel render that same static form first so the first client render matches. A carousel with `autoAdvance` moves every 6 seconds and has a Pause toggle; a reader who asked for reduced motion starts paused.

## Form content

| Block | type | Props | Slots | Needs | Renders |
|---|---|---|---|---|---|
| Form | `form` | `label`, `action` (a route reference) | `fields` | `form` | a `<form method="post">` to the resolved route |
| FieldGroup | `field-group` | `legend` | `fields` | | a `<fieldset>` with its legend |
| supported primitive fields | `field` | `kind`, `name`, `label`, `required?`, `options?` (up to 50) | | | a label and its control |
| Submit and success/error states | `form-submit` | `label`, `success?`, `error?`, `state?`: `idle`, `success` or `error` | | `form` | a submit button and the message for the state |

A field's `kind` is `text`, `email`, `tel`, `number`, `url`, `textarea`, `checkbox` or `select`. A form posts natively and only when the host grants `form` and resolved its route. Without that it says "This form can't be sent from here.", disables every field and refuses a submit, so nothing is fetched, stored or pretended. The submit's `state` is the host's, after a real submission: a success message is a status, an error an alert.

## Data-backed content

| Block | type | Props | Renders |
|---|---|---|---|
| CollectionFeed | `collection-feed` | `title` (120), `collection` (an entity reference) | the resolved items as a list, each a link when its `href` is safe, with its summary when it has one |
| ArticleList | `article-list` | as CollectionFeed | as CollectionFeed |
| RelatedContent | `related-content` | as CollectionFeed | as CollectionFeed |
| AuthorCard | `author-card` | `name`, `bio?`, `href?` | a `Card` with the name, linked when `href` is safe |

A data-backed block shows the entity snapshot the host resolved and never queries for one. Under its heading it is in one of four states, written as `data-state`:

- `error`: the host's error message, as an alert;
- `unavailable`: nothing was resolved: "This list isn't available right now.";
- `empty`: the snapshot has no items: "Nothing here yet.";
- `ready`: the items.

## Editorial page

| Block | type | Props | Slots | Renders |
|---|---|---|---|---|
| ArticleHeader | `article-header` | `title`, `subtitle?`, `author?`, `published?` | | a `<header>` with an `h1`, then a byline of the author and the `published` date as a `<time>` when set |
| ArticleBody | `article-body` | | `content` | the article's content |
| TableOfContents | `table-of-contents` | `label?`, `items`: up to 50 `{ label, target }` | | a `<nav>`, labelled "Contents" unless set, of `#target` links |
| Metadata | `metadata` | `items`: up to 20 `{ label, value }` | | a description list |
| RelatedArticles | `related-articles` | `title`, `collection` (an entity reference) | | the four data-backed states, ready as a list of links |

## Links an author writes

Every `href` an author types (a button's, a rich-text run's, a card's, a navigation or breadcrumb item's) passes one check, and so does every `href` in a resolved collection. Relative paths, fragments, queries and `http`, `https`, `mailto` and `tel` links are kept. Any other scheme, a protocol-relative `//host`, or a link with a control character is dropped, and the label renders without an `href`.
