Hooks live in their own entry point, `@fiberfx/hyperscript/hooks`, beside the root entry's `render` and `h`. There are thirteen, and every one is on this page.

```ts
import {
  useState, useReducer, useRef, useImperativeHandle,
  useEffect, useLayoutEffect, useMemo, useCallback,
  useContext, useSyncExternalStore, useId, useErrorBoundary, useDebugValue,
} from "@fiberfx/hyperscript/hooks";
```

## The one rule

A component's hooks are kept in a list, and each call takes the next slot. The renderer has no other way to know which `useState` is which: it finds a hook's state again by its position in the call order.

So call hooks at the top level of a component (or of your own hook), in the same order on every render: never inside a condition, a loop, or after an early `return`. A hook called in a condition shifts every hook after it into another hook's slot.

## State

`useState(initial)` returns the current value and a function that sets the next one:

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";

export function Stepper() {
  const [count, setCount] = useState(0);
  return (
    <div class="stepper">
      <button onClick={() => setCount((c) => c - 1)}>−</button>
      <output>{count}</output>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}
```

- **Pass a function to compute from the previous value.** `setCount((c) => c + 1)` reads the latest state, even when several updates queue before a render.
- **Pass a function as the initial value to compute it once.** Mercury UI's `Form` writes `useState(createFormRegistry)`: the registry is made on the first render only.
- **An equal value changes nothing.** If the next state is `Object.is`-equal to the current one, the component doesn't render again.

`useReducer(reducer, initial)` is the same hook with the update logic in one function: `dispatch(action)` calls `reducer(state, action)` for the next state. A third argument, `init`, computes the initial state from the second:

```tsx
import { useReducer } from "@fiberfx/hyperscript/hooks";

type Action = { type: "add"; title: string } | { type: "clear" };

function lessons(state: string[], action: Action): string[] {
  switch (action.type) {
    case "add":
      return [...state, action.title];
    case "clear":
      return [];
  }
}

export function Reading() {
  const [list, dispatch] = useReducer(lessons, []);
  return (
    <section>
      <button onClick={() => dispatch({ type: "add", title: `Lesson ${list.length + 1}` })}>Add</button>
      <button onClick={() => dispatch({ type: "clear" })}>Clear</button>
      <ol>{list.map((title) => <li key={title}>{title}</li>)}</ol>
    </section>
  );
}
```

## Refs

`useRef(initial)` returns one object, `{ current }`, that stays the same for the component's whole life. Change `current` and nothing re-renders: that is the point. Use it for a DOM node, a timer or any value that must survive renders without causing one.

```tsx
import { useEffect, useRef } from "@fiberfx/hyperscript/hooks";

export function SearchField() {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);
  return <input ref={input} type="search" aria-label="Search" />;
}
```

`useImperativeHandle(ref, create, inputs?)` sets a ref passed in by a parent to the object `create()` returns, so a component can hand its parent a few methods instead of its DOM node.

## Effects

`useEffect(effect, inputs?)` runs code after the render has reached the screen: subscriptions, timers, a request. `effect` may return a cleanup function.

```tsx
import { useEffect, useState } from "@fiberfx/hyperscript/hooks";

export function Elapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <span>{seconds}s</span>;
}
```

The `inputs` decide when it runs again:

- **No array:** after every render.
- **`[]`:** once, after the first render.
- **`[a, b]`:** after a render in which any input is not `Object.is`-equal to its value last time, or the array's length changed.

Before an effect runs again, its previous cleanup runs; when the component unmounts, its cleanups run. Effects run after paint, and the cleanups of components that unmounted run before any new effect.

`useLayoutEffect(effect, inputs?)` takes the same arguments but runs after the DOM is changed and before the browser paints. Use it only to measure the layout and set state from it before the user sees a frame; anything else belongs in `useEffect`, which doesn't block painting.

## Memoizing

`useMemo(factory, inputs)` returns `factory()`'s value and keeps it until an input changes. `useCallback(callback, inputs)` keeps the same function until an input changes; it is `useMemo(() => callback, inputs)`. The `inputs` array is required by the types, because leaving it out recomputes on every render and is almost always a mistake.

Memoize to keep a value's identity stable for something that compares it: an effect's inputs, a context's value, a `memo` component's props.

## Context

`useContext(context)` reads the value of the nearest `context.Provider` above the component, or the context's default when there is none, and renders again when that provider's value changes. Here is Mercury UI's `EnvironmentProvider`, which reads its parent's value and provides a merged one:

```tsx
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { useContext, useMemo } from "@fiberfx/hyperscript/hooks";
import { UiEnvironmentContext, mergeUiEnvironment } from "@fiberfx/core";
import type { UiEnvironmentOptions } from "@fiberfx/core";

export interface EnvironmentProviderProps extends UiEnvironmentOptions {
  children?: ComponentChildren;
}

export function EnvironmentProvider({
  children,
  portalContainer,
  ownerDocument,
  ownerWindow,
  direction,
  locale,
  reducedMotion,
  focusFallback,
  idPrefix,
}: EnvironmentProviderProps) {
  const parent = useContext(UiEnvironmentContext);
  const value = useMemo(
    () => mergeUiEnvironment(parent, { portalContainer, ownerDocument, ownerWindow, direction, locale, reducedMotion, focusFallback, idPrefix }),
    [parent, portalContainer, ownerDocument, ownerWindow, direction, locale, reducedMotion, focusFallback, idPrefix],
  );
  return <UiEnvironmentContext.Provider value={value}>{children}</UiEnvironmentContext.Provider>;
}
```

The context itself is made once, in `@fiberfx/core`, with `createContext<UiEnvironmentOptions | null>(null)` from the root entry. The `useMemo` matters here: a provider whose value is a new object on every render re-renders every component that reads it.

## External stores

`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` reads a value that lives outside the component tree. `subscribe(onChange)` registers a listener and returns the function that removes it; `getSnapshot()` returns the current value. The read is tear-free: a change between render and commit renders again. `getServerSnapshot` is read when rendering to a string and while hydrating.

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

Mercury UI's `ListBox`, `Combobox` and `CustomSelect` read their option registries this way: `useSyncExternalStore(registry.subscribe, registry.getVersion, registry.getVersion)`.

## Ids, errors and debug values

- **`useId()`** returns a string that stays the same for the component's life, for pairing elements by id: `aria-labelledby`, `aria-controls`, a label's `for`. Mercury UI's `Collapsible` writes `` const contentId = `${useId()}-content` ``.
- **`useErrorBoundary(callback?)`** turns its component into an error boundary. It returns `[error, reset]`: `error` is what a descendant threw, or `undefined`, and `reset()` clears it to render the children again. `callback(error, errorInfo)` is called with each caught error.
- **`useDebugValue(value, formatter?)`** labels your own hook for debugging tools: it passes `value`, or `formatter(value)`, to the renderer's debug slot, and does nothing when no tool is attached.

```tsx
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { useErrorBoundary } from "@fiberfx/hyperscript/hooks";

export function Boundary({ children }: { children: ComponentChildren }) {
  const [error, reset] = useErrorBoundary();
  if (error) {
    return (
      <div role="alert">
        <p>This part of the page failed to render.</p>
        <button onClick={reset}>Try again</button>
      </div>
    );
  }
  return <>{children}</>;
}
```
