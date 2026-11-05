# Rendering on the server — Mercury LMS

> HS4 of Mercury Hyperscript. `@fiberfx/hyperscript/server` renders components to an HTML string with no effects run; `hydrate` / `hydrateRoot` adopt that HTML in the browser. `@fiberfx/render-to-string` 4.0.0 re-exports the same module.

## Read this when

You render a page or an island to HTML on a server or in a test, or you attach components to server-rendered markup in the browser.

## The contract

- `renderToString(vnode, context?): string`. The default export, `render` and `renderToStaticMarkup` are the same function. `context` is the root's initial legacy context object (for `getChildContext`); `createContext` code omits it.
- While rendering to a string, `useEffect` and `useLayoutEffect` callbacks never run, and event handlers are not serialized. `useState` gives its initial value; `useContext` reads providers in the tree.
- `useId`: ids are in tree order (`P0-0`, `P0-1`, …), reset per `renderToString` root, and match after hydration.
- A component that throws a promise makes `renderToString` throw `Error('Use "renderToStringAsync" for suspenseful rendering.')`.
- `renderToStringAsync(vnode, context?)`: always `await` it. It re-renders a suspended component after its promise settles, wraps that output in `<!--$s-->…<!--/$s-->`, and follows at most 25 nested levels. Preview: no test covers it.
- Browser: `hydrate(vnode, parent)` from `@fiberfx/hyperscript`, or `hydrateRoot(container, children)` from `@fiberfx/hyperscript/client`, which returns `{ render, unmount }`. Hydrate the same tree with the same props; the server's nodes are kept.
- `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`: `getServerSnapshot` is read on the server and during hydration; after hydration it re-renders with `getSnapshot`. It subscribes in an effect.

## Minimal example

```tsx
// server
import { renderToString } from "@fiberfx/hyperscript/server";
const html = renderToString(<Counter />); // "<button>0</button>"

// browser
import { hydrateRoot } from "@fiberfx/hyperscript/client";
const app = document.getElementById("app");
if (app) hydrateRoot(app, <Counter />);
```

## Never emit

- `window`, `document` or `navigator` read during render in a component that renders on the server: read them in `useEffect`, or through `useSyncExternalStore` with a `getServerSnapshot`.
- `renderToStringAsync` without `await`.
- `./jsx`, `./stream` or `./stream-node` subpaths of `@fiberfx/render-to-string`: they are not exported.

## Next

- Context, portals and memo: /hyperscript/context/llms.txt
- Testing and inspecting: /hyperscript/testing/llms.txt
- This companion: /hyperscript/server/llms.txt (the page as Markdown, `/hyperscript/server.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hyperscript/server)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hyperscript/llms.txt)
