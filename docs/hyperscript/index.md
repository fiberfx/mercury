Mercury Hyperscript is the virtual DOM runtime of the Mercury packages: the package `@fiberfx/hyperscript`, version 4.0.0. Mercury UI's components are written with it, and so is any component you write for a Mercury app.

## What Hyperscript is

Hyperscript turns a tree of elements into DOM, and turns the next tree into the smallest set of DOM changes. Three things to know before the first component:

- **Components are functions.** A function component takes its props and returns children: elements, strings, numbers, or nothing. A class component, extending `Component`, is there too.
- **It follows the DOM.** You write `class` and `for`, `onInput` fires on each keystroke and `onChange` on the DOM's `change` event, and SVG attributes keep their SVG names. The [DOM contract](/hyperscript/dom) chapter lists the rules.
- **One runtime per app.** Every entry point imports the runtime by its own name, so the hooks, the client root, the JSX runtime and the test utilities all drive the same renderer.

You write components in JSX: the Mercury packages compile it with `@fiberfx/hyperscript` as the JSX import source. Without JSX, `h(type, props, ...children)` builds the same tree.

## Entry points

| Import | What it gives you |
|---|---|
| `@fiberfx/hyperscript` | `render`, `hydrate`, `h` and `createElement`, `Fragment`, `createRef`, `cloneElement`, `isValidElement`, `Component`, `createContext`, `createPortal`, `toChildArray`, `memo`, and the types (`VNode`, `ComponentChildren`, `FunctionComponent`, `Context`…) |
| `@fiberfx/hyperscript/hooks` | `useState`, `useReducer`, `useRef`, `useEffect`, `useLayoutEffect`, `useImperativeHandle`, `useMemo`, `useCallback`, `useContext`, `useDebugValue`, `useErrorBoundary`, `useId`, `useSyncExternalStore` |
| `@fiberfx/hyperscript/client` | `createRoot`, `hydrateRoot` |
| `@fiberfx/hyperscript/server` | `renderToString` (also the default export), `render`, `renderToStringAsync`, `renderToStaticMarkup` |
| `@fiberfx/hyperscript/jsx-runtime` and `/jsx-dev-runtime` | the automatic JSX runtime: `jsx`, `jsxs`, `jsxDEV`, `Fragment`, used by the compiler, not by your code |
| `@fiberfx/hyperscript/test-utils` | `act`, `setupRerender`, `teardown`, `onCommit`, `onDiff` |
| `@fiberfx/hyperscript/inspect` | `inspect`, `inspectFailures`: the renderer observed as detached records |
| `@fiberfx/hyperscript/debug` | development warnings: importing it turns them on |
| `@fiberfx/hyperscript/hmr` | `trackRoots`, the root tracking that hot replacement uses |

The root entry also exports `options`, the renderer's hook slots. It is internal to the package: to observe the renderer, use `./inspect`.

## A first component

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button class="counter" onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

const app = document.getElementById("app");
if (app) render(<Counter />, app);
```

`render` mounts the tree into `app`. Each click calls `setCount`, the component renders again, and Hyperscript diffs the new tree against the one it rendered last and updates the DOM to match.

## The chapters

- **HS0 [Components and render](/hyperscript/components):** elements, JSX, function and class components, keys, refs, `render`, `hydrate` and the client root.
- **HS1 [Hooks](/hyperscript/hooks):** every hook `@fiberfx/hyperscript/hooks` exports, with its signature and when it runs.
- **HS2 [The DOM contract](/hyperscript/dom):** `class` and `for`, native input and change events, SVG names, focus, custom elements, numeric styles and controlled inputs.
- **HS3 [Context, portals and memo](/hyperscript/context):** `createContext` with its `Provider` and `Consumer`, `createPortal`, `memo`, `cloneElement` and `toChildArray`.
- **HS4 [Rendering on the server](/hyperscript/server):** `./server`'s `renderToString` and `renderToStringAsync`, then `hydrate` and `hydrateRoot` in the browser.
- **HS5 [Testing and inspecting](/hyperscript/testing):** `./test-utils`' `act` and `setupRerender`, `./inspect`, and `./debug`'s warnings.
- **HS6 [A tested component](/hyperscript/tested-component):** the capstone. One of the KAN views' components gets a contract and a test: rendered inside `act`, driven by a click, its DOM asserted, its commits inspected, and its server render compared with the client's.

## What is shipped

Everything on this page is exported by `@fiberfx/hyperscript` 4.0.0. Mercury UI's components import the root entry, `./hooks` and `./server`. All seven chapters, HS0 to HS6, are written.
