# Mercury Design Book

Read the [English book](https://mercury.jonnify.com/book), [Русскую Дизайн книгу](https://mercury.jonnify.com/ru/book), or jump to its [Design Lab](https://mercury.jonnify.com/book#lab). Nine source chapters cover character, SVG identity, color, typography, spacing, navigation, adaptation, governance and evidence. Search, chapter links and local reading preferences support exploration; the Lab offers font, rem/px, leading, measure and semantic-color experiments with CSS, JSON and SVG export.

## Formats and source

- Markdown: [English source](mercury-brand-book.md) and [полный русский перевод](mercury-brand-book.ru.md), including all chapters, tables and references.
- [English PDF](mercury-brand-book.pdf): the supplied visual edition, preserved byte for byte. It is untagged; use HTML or Markdown for structured text.
- HTML: [English](index.html) and [Русский](index.ru.html), each a prebuilt interactive reader with embedded runtime, styles, fonts and license notices, plus complete no-JavaScript text.
- [Tokens](tokens.json) and [CSS](tokens.css): reviewed source values; colors in CSS are RGB channels, used as `rgb(var(--fg-primary))`.
- [SVG master](mx-mark.svg), [light](mx-mark-on-light.svg) and [dark](mx-mark-on-dark.svg) variants: original geometry and color contracts.
- [App source adapter](reader-source/README.md): genuine Mercury UI and Hyperscript source for an existing working host.
- [Agent index](llms.txt), [brand-book skill](../skills/mercury-brand-book/SKILL.md) and [design-builder skill](../skills/mercury-design-builder/SKILL.md): when to use this edition and how to build from it.

## Run the published snapshot locally

From the repository root, with Python 3:

```sh
python3 agents/serve.py --root site --port 8000
```

Open `http://127.0.0.1:8000/book/` or `http://127.0.0.1:8000/ru/book/`. The reader needs no account or external font request. Reading settings stay in browser storage; color experiments affect the specimen and their exports, not the original source files. The original English PDF remains fixed; print either HTML edition for a complete reading copy in that language. The top bar exposes language and theme controls and returns to the documentation space; language switching retains the chapter and saved preferences.

## Evidence and limits

[Provenance](provenance.json) records the exact private source revision, tested win-120 Docker image and SHA-256 of each public artifact. Bilingual source and UI checks passed (16 reader checks, 10 source checks); the application suite passed 107 tests and exported 279 successful pages. The release image was exercised through the Rust edge and Elixir runtime, including MCP and both localized book representations. Browser evidence and the current external-readiness report are recorded with this release; the previous scanner score is never presented as a post-release result.

The Russian edition preserves all nine chapters, seven tables, code identifiers, links, numeric values and source qualifications. Language, theme, chapter retention, search recovery and enlarged-text behavior have separate checks; a score of 100 does not certify accessibility or translation quality.

This is an interface edition, not a universal brand policy or accessibility certification. No assistive-technology session or physical-device testing is claimed. Four specimen contrast pairs do not establish whole-page conformance. SVG exports refer to font stacks; exact metrics require the same fonts on the receiving system. The book's source and publication artifacts are public; the production workspace and internal explorers remain private.
