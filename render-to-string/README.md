<!-- Published by scripts/package_readmes.py from fiberfx/render-to-string/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/render-to-string

Mercury's server renderer: `renderToString` (and `renderToStringAsync`, `render`,
`renderToStaticMarkup`) for `@fiberfx/hyperscript` components.

```js
import { renderToString } from '@fiberfx/render-to-string';
renderToString(<App />);
```

This package is the published name for `@fiberfx/hyperscript/server`, where the one renderer
lives. That renderer is preact-render-to-string, vendored and built with the core's own mangle
map, so it renders the core's vnodes in source and in the build. ESM only.

Not exported yet: `./jsx` (pretty output), `./stream` and `./stream-node`. Each comes with a
measured rung of its own.

MIT. Upstream: https://github.com/preactjs/preact-render-to-string (Jason Miller and contributors).
