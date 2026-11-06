# Mercury Design Book

Read the [interactive book](https://mercury.jonnify.com/book) or jump to its [Design Lab](https://mercury.jonnify.com/book#lab). Nine source chapters cover character, SVG identity, color, typography, spacing, navigation, adaptation, governance and evidence. Search, chapter links and local reading preferences support exploration; the Lab offers font, rem/px, leading, measure and semantic-color experiments with CSS, JSON and SVG export.

## Formats and source

- [Markdown](mercury-brand-book.md): editable source with references and explicit scope.
- [PDF](mercury-brand-book.pdf): the supplied visual edition, preserved byte for byte. It is untagged; use HTML or Markdown for structured text.
- [HTML](index.html): prebuilt interactive reader with embedded runtime, styles, fonts and license notices, plus complete no-JavaScript text.
- [Tokens](tokens.json) and [CSS](tokens.css): reviewed source values; colors in CSS are RGB channels, used as `rgb(var(--fg-primary))`.
- [SVG master](mx-mark.svg), [light](mx-mark-on-light.svg) and [dark](mx-mark-on-dark.svg) variants: original geometry and color contracts.
- [App source adapter](reader-source/README.md): genuine Mercury UI and Hyperscript source for an existing working host.
- [Agent index](llms.txt), [brand-book skill](../skills/mercury-brand-book/SKILL.md) and [design-builder skill](../skills/mercury-design-builder/SKILL.md): when to use this edition and how to build from it.

## Run the published snapshot locally

From the repository root, with Python 3:

```sh
python3 agents/serve.py --root site --port 8000
```

Open `http://127.0.0.1:8000/book/`. The reader needs no account or external font request. Reading settings stay in browser storage; color experiments affect the specimen and their exports, not the original source files. The original PDF remains fixed; print the HTML for a separate reading copy.

## Evidence and limits

[Provenance](provenance.json) records the private source revision, tested Docker image and SHA-256 of each public artifact. The final image was built on win-120 through ecd-box and passed 74 MCP and 19 book HTTP checks. Reader checks covered all nine chapters, search/no-results, invalid color recovery, persistence, keyboard dismissal and focus return, exports, 320/390px reflow, 200% root text and combined text-spacing overrides. Research and its consequences are explained inside the Design Lab and skill.

This is an interface edition, not a universal brand policy or accessibility certification. No assistive-technology session or physical-device testing is claimed. Four specimen contrast pairs do not establish whole-page conformance. SVG exports refer to font stacks; exact metrics require the same fonts on the receiving system. The book's source and publication artifacts are public; the production workspace and internal explorers remain private.
