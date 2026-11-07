<!-- Published by scripts/package_readmes.py from fiberfx/content/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/content

Mercury published pages: a renderer registry and block catalog that reads Mercury
documents without the editor. Its import graph has no builder, history, editing engine
or Effector provider.

## Install

```bash
npm i @fiberfx/content @fiberfx/hyperscript @fiberfx/schema @fiberfx/ui   # hyperscript, schema and ui are peer dependencies
```

## Use

```ts
import { renderDocument, createRendererRegistry, CATALOG } from "@fiberfx/content";
```

Exports: `renderDocument`, `createRendererRegistry`, `schemaFor`, `BREAKPOINTS`, and the
block catalog (`CATALOG`, `catalogEntries`, `contentRegistry`, `contentSchema`,
`exampleDocument`). It ships as one ES-module bundle (`dist/index.js`) with
type declarations.

## License

MIT
