<!-- Published by scripts/package_readmes.py from fiberfx/core/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/core

The UI-free foundation of the **Mercury** design system: a class utility (`cx`),
locale-aware date formatters, headless behaviour hooks, and the shared type kit.
No UI components or styles; no React dependency.

[`@fiberfx/ui`](https://www.npmjs.com/package/@fiberfx/ui) declares this package
as a peer. Install it explicitly for a UI consumer, or use it directly for
the utilities without UI styles.

## Install

```bash
npm install @fiberfx/core@4.0.0 @fiberfx/hyperscript@4.0.0
```

Version 4.0.0 declares `@fiberfx/hyperscript@4.0.0` as its only peer.
For an existing mx app, preserve `mx.mod` and `mx.sum` and use `mx install`.

## Use

```ts
import { cx, createFormatter } from "@fiberfx/core";

cx("btn", isActive && "btn--active");   // conditional classNames
const fmt = createFormatter("en-US");   // locale-aware Intl wrapper
```

Ships as a single ES-module bundle (`dist/index.js`) with type
declarations. `@fiberfx/hyperscript` is external as a peer; there is no React
peer and no `dependencies` entry. The date module is in `src/internal/date/`.

## License

MIT
