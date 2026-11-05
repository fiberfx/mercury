A Mercury page can arrive as HTML. The server renders the components to a string, the browser shows it at once, and Hyperscript then hydrates it: it attaches the components to the DOM that is already there, without rebuilding it. Everything server-side comes from `@fiberfx/hyperscript/server`.

## Rendering to a string

```tsx
import { renderToString } from "@fiberfx/hyperscript/server";

function Greeting({ name }: { name: string }) {
  return <p class="greeting">Hello, {name}</p>;
}

const html = renderToString(<Greeting name="Mercury" />);
```

`renderToString(vnode, context?)` returns the HTML as a string. The same function is exported under three more names: the module's default export, `render`, and `renderToStaticMarkup`. Mercury UI's tests use both spellings. `EnvironmentProvider`'s test renders with `renderToString` and reads the ids out of the markup; `Box`'s test uses `renderToStaticMarkup`.

`@fiberfx/render-to-string` 4.0.0 is the same renderer under its own package name: it re-exports `@fiberfx/hyperscript/server` and holds no copy of its own.

The optional second argument is the root's initial context object, which a class component's `getChildContext` extends for its children. Code that uses `createContext` never needs it.

The string is the same HTML the client writes. Attributes keep their DOM names, and a numeric style length is written in `px` on both sides.

## What runs on the server

A string render calls each component once, top to bottom, and stops there:

- **Components and hooks that compute run.** `useState` returns its initial value, `useMemo` computes, and `useContext` reads the nearest provider's value or the default.
- **Effects don't run.** `useEffect` and `useLayoutEffect` queue nothing while rendering to a string, so their callbacks are never called, and a component that has them renders without error.

So anything that touches the browser, such as `window`, `document`, a measurement or a subscription, belongs in an effect. It then runs in the browser after hydration, never on the server.

## Ids that match

`useId` gives the same ids on the server and in the browser, so an id the server wrote into `for` and `aria-*` attributes still matches after hydration. Ids are numbered in tree order (`P0-0`, `P0-1`, …), and numbering starts again for each `renderToString` call, so rendering the same tree twice gives the same string.

```tsx
import { useId } from "@fiberfx/hyperscript/hooks";

export function EmailField() {
  const id = useId();
  return (
    <p>
      <label for={id}>Email</label>
      <input id={id} type="email" />
    </p>
  );
}
```

Mercury UI's `EnvironmentProvider` adds an `idPrefix` on top of this, so two islands, each its own render root, don't both mint `P0-0`.

## Waiting for data

`renderToString` is synchronous. If a component throws a promise to say it is waiting, it fails with the error `Use "renderToStringAsync" for suspenseful rendering.`

`renderToStringAsync(vnode, context?)` is the waiting version. When a component throws a promise, it waits for the promise to settle, renders that component again, and wraps its output in `<!--$s-->` and `<!--/$s-->` comment markers. It follows nested waits up to 25 levels deep. It is an `async` function, so always `await` it, even though its declared return type is `string | Promise<string>`:

```tsx
import { renderToStringAsync } from "@fiberfx/hyperscript/server";

const html = await renderToStringAsync(<Greeting name="Mercury" />);
```

No test in `fiberfx/hyperscript/test` calls `renderToStringAsync`, and no Mercury package uses it yet. Treat it as a preview.

## Hydrating in the browser

`hydrate(vnode, parent)` renders `vnode` into a `parent` that already holds the server's HTML for it. It diffs the tree against the DOM that is there, adopting those nodes and attaching the event handlers. After that, `parent` is an ordinary render target: a later `render` diffs as usual.

The client root has the same pair. `hydrateRoot(container, children)` hydrates and returns a root:

```tsx
import { hydrateRoot } from "@fiberfx/hyperscript/client";
import { useState } from "@fiberfx/hyperscript/hooks";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// The server sent renderToString(<Counter />): "<button>0</button>".
const app = document.getElementById("app");
if (app) {
  const root = hydrateRoot(app, <Counter />);
  // later: root.render(...) diffs against the hydrated DOM; root.unmount() clears it
}
```

Hydrate the same tree the server rendered, with the same props. Hyperscript's tests pin what follows when you do: the server's nodes are kept, not replaced, and after hydration the DOM is byte-for-byte the string the server rendered, ids included.

## External stores across the boundary

A value from outside the tree can differ between the server and the browser: whether the user is online, a stored preference, the viewport. `useSyncExternalStore`'s third argument, `getServerSnapshot`, settles it. While rendering to a string, and again while hydrating, it reads `getServerSnapshot()` rather than `getSnapshot()`, so the first browser render matches the server's HTML. Then it renders again with the browser's own value.

```tsx
import { useSyncExternalStore } from "@fiberfx/hyperscript/hooks";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function NetworkStatus() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  return <span class="network">{online ? "Online" : "Offline"}</span>;
}
```

On the server and in the first hydrated render this shows "Online", as the HTML says. A browser that is offline then renders "Offline". The `subscribe` function touches `window` only when the store subscribes, which happens in an effect, after hydration, never on the server.
