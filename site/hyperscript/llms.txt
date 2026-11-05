# Hyperscript, the virtual DOM — Mercury LMS

> `@fiberfx/hyperscript` 4.0.0: Mercury's own virtual DOM runtime. Function and class components, written in JSX (import source `@fiberfx/hyperscript`) or with `h(type, props, ...children)`, rendered with native DOM semantics. Hooks, a client root, a server renderer and test utilities ship as subpaths of one runtime.

## Read this when

You write or change a component for a Mercury app or for Mercury UI, or you need to know which subpath exports a name. This page is the course's landing; the chapters are /hyperscript/components, /hyperscript/hooks, /hyperscript/dom, /hyperscript/context, /hyperscript/server, /hyperscript/testing and /hyperscript/tested-component.

## The contract (tier: Shipped — @fiberfx/hyperscript 4.0.0 on npm since 2026-11-05)

- `@fiberfx/hyperscript`: `render(vnode, parent)`, `hydrate(vnode, parent)`, `h` = `createElement(type, props, ...children)`, `Fragment`, `createRef()`, `cloneElement`, `isValidElement`, `Component`, `createContext(default)`, `createPortal(children, container)`, `toChildArray`, `memo(component, comparer?)`. Types: `VNode`, `ComponentChild`, `ComponentChildren`, `FunctionComponent`, `ComponentType`, `RenderableProps`, `Ref`, `RefObject`, `Context`, `JSX`.
- `@fiberfx/hyperscript/hooks`: `useState`, `useReducer`, `useRef`, `useEffect`, `useLayoutEffect`, `useImperativeHandle`, `useMemo`, `useCallback`, `useContext`, `useDebugValue`, `useErrorBoundary`, `useId`, `useSyncExternalStore`.
- `@fiberfx/hyperscript/client`: `createRoot(container)` → `{ render(children), unmount() }`; `hydrateRoot(container, children)`.
- `@fiberfx/hyperscript/server`: `renderToString(vnode, context?)` (default export too), `render` (same function), `renderToStaticMarkup` (same function), `renderToStringAsync(vnode, context?)` → `string | Promise<string>`.
- `@fiberfx/hyperscript/jsx-runtime`, `/jsx-dev-runtime`: `jsx`, `jsxs`, `jsxDEV`, `Fragment`, for the compiler only.
- `@fiberfx/hyperscript/test-utils`: `act`, `setupRerender`, `teardown`, `onCommit`, `onDiff`. `/inspect`: `inspect`, `inspectFailures`. `/debug`: import for development warnings. `/hmr`: `trackRoots`.
- `options` from the root is internal; do not use it.

## Minimal example

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";

function Counter() {
  const [count, setCount] = useState(0);
  return <button class="counter" onClick={() => setCount(count + 1)}>{count}</button>;
}

const app = document.getElementById("app");
if (app) render(<Counter />, app);
```

## Never emit

- Imports from `react`, `react-dom`, `preact` or `@preact/*`, or any `/compat` subpath: `@fiberfx/hyperscript/compat` does not exist, and Mercury's components import from `@fiberfx/hyperscript` and its subpaths only.
- Hooks imported from the root entry: they live in `@fiberfx/hyperscript/hooks`.
- `options` from the root entry.

## Next

- The site: /llms.txt
- Chapters: /hyperscript/components/llms.txt, /hyperscript/hooks/llms.txt, /hyperscript/dom/llms.txt, /hyperscript/context/llms.txt, /hyperscript/server/llms.txt, /hyperscript/testing/llms.txt, /hyperscript/tested-component/llms.txt
- This companion: /hyperscript/llms.txt (the page as Markdown, `/hyperscript.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hyperscript)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)

### Chapter companions

- [/hyperscript/components](/hyperscript/components/llms.txt)
- [/hyperscript/context](/hyperscript/context/llms.txt)
- [/hyperscript/dom](/hyperscript/dom/llms.txt)
- [/hyperscript/hooks](/hyperscript/hooks/llms.txt)
- [/hyperscript/server](/hyperscript/server/llms.txt)
- [/hyperscript/tested-component](/hyperscript/tested-component/llms.txt)
- [/hyperscript/testing](/hyperscript/testing/llms.txt)
