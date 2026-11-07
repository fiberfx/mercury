# Languages, spaces and source completeness

Use this reference when a book has multiple languages or a reader sits beside documentation. The Mercury Book's English/Russian implementation supplies examples, not a requirement for every brand to use those languages or routes.

## One edition, complete language counterparts

Identify the authoritative source edition and requested locales. Translation includes the introduction/scope, every chapter, tables, captions, qualifications and evidence—not just the navigation. Inventory UI strings separately: search/empty states, errors, status feedback, accessible names, SVG descriptions, settings, print and download labels. Preserve API identifiers, token names, code and source URLs unless an intentional localized counterpart is chosen.

Compare stable chapter IDs, table headers/rows, links, code and significant numeric/color values across editions. A structural check catches omission or drift; it does not prove semantic translation quality. Review meaning in context and keep any unavailable translation explicit. Do not silently substitute English and call the edition complete. Include a missing-section or altered-token fixture when extending a reusable content adapter.

Set the actual document language on `html`; mark passages/language choices in another language where appropriate. `Content-Language` does not replace `lang`. Titles, descriptions and labels should describe the actual edition. Follow [W3C language declarations](https://www.w3.org/International/questions/qa-html-language-declarations); apply direction-aware layout when the requested script needs it.

## Move between spaces without losing intent

Use real links for language and destination changes. Keep matching stable section anchors where content corresponds; if a target section is missing, choose and explain a useful fallback. Preserve valid theme/reading preferences across language changes without translating stored enum keys or mutating source content. Keep browser Back and modified clicks useful.

For the Mercury reader, `/book` and `/ru/book` are language counterparts; the reader returns to `/start` or `/ru/start`, while documentation opens the localized Book. Reuse the host's verified route model; do not assume a generated reader belongs to the lesson registry. Keep these controls visible at the applicable breakpoint and test the forward and return paths in each language.

Language, theme and chapter position are separate state. A theme toggle must not navigate; a language link must not reset the chapter inadvertently. A skip link focuses the current heading, even when the fragment used to select a chapter differs from the focus target. Test from a chapter other than the first.

## Exports and agent-readable counterparts

Label each download by its actual language and edition. A translated reader does not translate the original PDF. Preserve the original bytes when requested, clearly label an English-only PDF, and offer the translated HTML/print/Markdown that actually exists. Do not claim a print stylesheet is a verified PDF export.

Derive preview, SVG wording and other generated formats from the intended locale and last valid applied values. Check standalone SVG text at maximum size with each offered font; longer translations may need explicit wrapping or a larger canvas. Preserve brand geometry and source token tables.

For public readers, connect real canonical language counterparts through the site's existing hreflang, sitemap and discovery conventions. Localized HTML, Markdown and nested llms guides must agree on edition, availability and links. A localized URL returning the wrong-language body is a failure despite status 200. Check private/unknown assets remain excluded. Use the available readiness skill only when an audit or publication check is part of the task; translation alone does not require a site-wide scan.

## Focused acceptance example

Input: a supplied English book and complete Russian translation, with an existing reader. Expected: open a later chapter, change theme, switch language and return to localized documentation; the chapter and valid preference survive. Also check long Russian labels at narrow/enlarged layouts, a missing translation, a skip link, original PDF language, and an independently opened translated SVG. Record which checks actually ran; do not inherit evidence from the source edition.
