# Components and render — Mercury LMS

> HS0 of Mercury Hyperscript (`@fiberfx/hyperscript` 4.0.0). Elements are VNodes built by JSX (import source `@fiberfx/hyperscript`) or `h(type, props, ...children)`; a function component returns `ComponentChildren`; `render(vnode, parent)` mounts and re-renders by diffing.

## Read this when

You write a component, render a list, forward a ref, or mount a tree into the page.

## The contract

- `h(type, props | null, ...children): VNode` — `h` is `createElement`. `type` is a tag name or a component.
- `ComponentChild` = `VNode | object | string | number | bigint | boolean | null | undefined`; `ComponentChildren` = one or an array. `null`, `undefined` and booleans render nothing.
- JSX: `jsxImportSource: "@fiberfx/hyperscript"` (set in `fiberfx/tsconfig.base.json`, for TypeScript and editors). No per-file pragma: the Hypercompiler fixes the runtime and refuses any `@jsx` comment (/mx/compile). Never import `jsx`/`jsxs`/`jsxDEV` by hand.
- `FunctionComponent<P>`: `(props: RenderableProps<P>, context?) => ComponentChildren`. Type `children` as `ComponentChildren`.
- `Fragment` (JSX `<>…</>`) groups children with no element.
- `key` is removed from props; give list items a stable key (an id when items can move).
- `createRef<T>()` → `{ current: T | null }`; a ref may be a callback, which may return a cleanup. A function component receives `ref` as a plain prop and forwards it by passing it on; only tag-name elements consume `ref`.
- `class X extends Component<P, S>`: `render(props?, state?, context?)`, `this.state`, `this.setState(update, callback?)`, `this.forceUpdate(callback?)`, optional lifecycle (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`, `shouldComponentUpdate`, `getSnapshotBeforeUpdate`, `componentDidCatch`). Mercury UI uses none: prefer functions with hooks.
- `render(vnode, parent)`: mounts; a second call on the same parent diffs; `render(null, parent)` clears. `hydrate(vnode, parent)` diffs against server HTML already in `parent`.
- `@fiberfx/hyperscript/client`: `createRoot(container)` → `{ render(children), unmount() }`; `hydrateRoot(container, children)` → root.

## Minimal example

```tsx
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { render } from "@fiberfx/hyperscript";

function Badge({ children }: { children: ComponentChildren }) {
  return <span class="mx-badge">{children}</span>;
}

const app = document.getElementById("app");
if (app) render(<ul>{["a", "b"].map((id) => <li key={id}><Badge>{id}</Badge></li>)}</ul>, app);
```

## Never emit

- `className` or `htmlFor` in new code: write `class` and `for`.
- `forwardRef`: it is not exported; pass `ref` through props.
- A mount call from another library: mount with `render`, `hydrate` or `@fiberfx/hyperscript/client`.

## Next

- Hooks: /hyperscript/hooks/llms.txt
- The DOM contract: /hyperscript/dom/llms.txt
- This companion: /hyperscript/components/llms.txt (the page as Markdown, `/hyperscript/components.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hyperscript/components)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hyperscript/llms.txt)
