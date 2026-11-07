<!-- Published by scripts/package_readmes.py from fiberfx/ui/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/ui

The **Mercury** design system's component library on `@fiberfx/hyperscript` — token-driven,
presentational components styled through enum props (`variant` / `size` / `tone`).

## Install

```bash
npm install @fiberfx/ui@4.0.0 @fiberfx/core@4.0.0 @fiberfx/hyperscript@4.0.0
```

Version 4.0.0 declares `@fiberfx/core@4.0.0` and
`@fiberfx/hyperscript@4.0.0` as peers. Install them explicitly when setting up
a consumer; no React peer is required. For a native mx app, keep its `mx.mod`
and `mx.sum` and use `mx install` instead of replacing its dependency workflow.
The [first-page guide](https://mercury.jonnify.com/start) covers native and browser-only routes.

## Use

```tsx
import "@fiberfx/ui/styles.css";       // required — components are class-driven
import { Button, Card } from "@fiberfx/ui";

export function App() {
  return (
    <Card>
      <Button variant="primary">Ship it</Button>
    </Card>
  );
}
```

### Styles

Load the full stylesheet once at your app root. Importing the published
JavaScript entry alone does not establish that the component styles are loaded:

```ts
import "@fiberfx/ui/styles.css";   // tokens and component rules
```

`@fiberfx/ui/tokens.css` is a separate tokens-only export; it does not replace
the full stylesheet when rendering UI components. A browser-only HTML page
loads the version-pinned stylesheet with a `<link rel="stylesheet">`, as shown
in the [browser guide](https://mercury.jonnify.com/start/browser).

A `dark-theme` class on an ancestor selects the dark tokens.

## License

MIT
