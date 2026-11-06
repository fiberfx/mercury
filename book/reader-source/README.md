# Reader source adapter

This is the app-owned source of the public [Design Book](https://mercury.jonnify.com/book), extracted from the verified reader revision recorded in [provenance.json](../provenance.json). The distributable HTML in `../index.html` and `../../site/book/index.html` was built with native mx on Linux; it embeds the Mercury runtime, styles, fonts and notices.

## Explore or adapt

Use the [prebuilt reader](../README.md) to explore without a toolchain. To adapt these sources, keep an existing Mercury application's working build setup and exact dependency pins. This edition imports `@fiberfx/hyperscript`, its hooks, and `@fiberfx/ui` 4.0.0; it uses real Button, Input, Select and Slider components. `main.tsx` expects an element with id `app` and a Hyperscript JSX transform. `App.tsx` imports the UI stylesheet and `reader.css`.

Copy the app-owned files into that host, provide DM Sans or accept the system fallback, and serve the book resources at `/book/` or adapt those URLs. Keep the host's navigation, licenses and font assets. These files are an adapter, not a standalone npm project or a claim that an untested compiler installation works. The private production build also adds the complete no-JavaScript representation and embeds notices; those are already included in the prebuilt HTML.

`content.json` is generated from the reviewed Markdown subset (nine chapters, prose and tables):

```sh
python3 content.py ../mercury-brand-book.md content.json
```

Review the parser before changing the source structure; unsupported headings and directives are rejected. State helpers include color validation, contrast, bounded preferences and exports. Their boundary checks can run with a supported Node test runner:

```sh
node --test state.test.mjs
```

Use [mercury-brand-book](../../skills/mercury-brand-book/SKILL.md) for source and format fidelity and [mercury-design-builder](../../skills/mercury-design-builder/SKILL.md) for the interface. Preserve the distinction between source values and reader experiments. The source Markdown and original PDF are unchanged by customization.
