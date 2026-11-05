# Mercury implementation contracts

Mercury means the actual `@fiberfx/hyperscript` runtime, hooks from `@fiberfx/hyperscript/hooks`, and composed components from `@fiberfx/ui`. Native SVG or canvas is appropriate for custom diagrams; use Mercury components for the surrounding controls and feedback. Do not create a parallel component library inside the playground.

## Read the installed version

Locate `fiberfx/CLAUDE.md` (or the equivalent module instructions), `hyperscript/package.json`, `ui/package.json`, current `mx.mod`/`mx.work`, and the used components' source and contracts. Do not hardcode this machine's checkout path into the skill or generated application. Do not treat legacy package scripts as authorization to replace the native `mx` build with pnpm, npm, Vite, or React.

The observed UI source exports `Button`, `Input`, `Textarea`, and `Checkbox` through `@fiberfx/ui`. Styles are exposed as `@fiberfx/ui/styles.css`; confirm the current manifest's export target before building. The library's own `.mx-*` classes are private implementation details.

## Important differences from React-shaped habits

| Boundary | Mercury usage |
| --- | --- |
| Imports | `@fiberfx/hyperscript`, `@fiberfx/hyperscript/hooks`, `@fiberfx/ui` |
| Text input | Native `onInput`; read `event.currentTarget.value` synchronously |
| App DOM attributes | `class` and `for` |
| SVG attributes | `stroke-width`, `stroke-linecap`, `stroke-dasharray`, `marker-end`; retain standard case-sensitive names such as `viewBox` |
| SVG keyboard focus | Use lowercase `tabindex="0"` on interactive SVG nodes; the observed runtime emits `tabIndex` verbatim on SVG, which does not establish focusability |
| Checkbox facade | `checked` plus `onChange(checked: boolean)`; this is a component callback, not a text input event |
| Component style | Public enum props such as Button `variant` and `size` |
| Application colors | Mercury token values with `rgb(var(--token))`, including alpha as needed |
| Application selectors | Own scoped names; never author or override `.mx-*` |

For example, the current controlled text contract is:

```tsx
import { useState } from '@fiberfx/hyperscript/hooks';
import { Input } from '@fiberfx/ui';

function SearchControl() {
  const [query, setQuery] = useState('');
  return <Input label="Find components" value={query}
    onInput={event => setQuery(event.currentTarget.value)} />;
}
```

This is an API illustration, not a complete build scaffold. Use the host application's verified mount and compiler setup. Keep hooks at component scope; do not mutate a state object in place or rebuild the full DOM on each keystroke.

Mount into an empty application host. In the observed runtime, `render` appends into its host; static loading children left inside that host remain alongside the application. Put a JavaScript-disabled explanation in a separate `noscript` element, or remove an intentional fallback before the first render.

## Native build recipe: verified boundary

A local standalone application was successfully bundled with `mx 0.1.0` and Mercury package version `4.0.0`, with Node absent from `PATH`. Recheck these versions and the current checkout before reusing the recipe:

1. Declare `@fiberfx/core`, `@fiberfx/hyperscript`, and `@fiberfx/ui` as application dependencies at the available coherent version.
2. Initialize the application's native module with `mx mod init`. In the observed version this resolves those package names to `registry.npmjs.org/fiberfx/*` requirements.
3. For checkout-local builds, add `replace` entries for those exact generated module identities pointing to the real sibling module directories. Compute relative paths from the application's directory; do not paste paths from another checkout.
4. The observed compiler also emitted an `@fiberfx/effector/compiler` import for TSX. It required `@fiberfx/effector` at the same version with a corresponding local replacement. Include it when the current compiler requires it; do not silently redirect a failed import to a stub.
5. From the application directory, build using the native binary with `MXWORK=off` and arguments `build --bundle --root . --out <output-directory>`. A caller may supply `MX_BIN` for the binary path. Use a suitable native-tool `PATH` when demonstrating that Node is not involved.

This establishes successful native bundling, not automatic single-file packaging. The observed output included real UI styles and fonts; unused stylesheet entries in an emitted import map required inspection. Remove an import map only after proving the output JavaScript has no imports that depend on it. The application's recorded build/export recipe remains the executable reference.

## Packaging and evidence

The build must include the actual Mercury runtime and components. Inspect emitted imports and assets before claiming a single-file result. Inline emitted CSS and JavaScript only after checking their referenced chunks, URLs, and CSS imports; preserve required license notices. Escape embedded data for the target HTML/script context rather than injecting source text through `innerHTML`.

Keep one source of truth for prompt text. Render source, document content, and comments as text nodes; syntax highlighting should emit escaped tokens, not execute pasted markup. Clipboard access, download, zoom, and canvas drawing can use browser APIs without replacing Mercury as the UI runtime.

Record the compiler path/version, exact successful build command, and host alongside the application evidence. Revalidate a recipe when the local manifest or compiler differs. A compiler or bundler failure is not permission to introduce an alternate toolchain or modify Mercury packages outside the task.
