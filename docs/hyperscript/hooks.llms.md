# Hooks — Mercury LMS

> HS1 of Mercury Hyperscript. The 13 hooks of `@fiberfx/hyperscript/hooks`, with signatures from `src/hooks/index.d.ts`. Hook state is found by call position, so call hooks unconditionally, in the same order, at a component's top level.

## Read this when

You add state, a ref, an effect, a memoized value, a context read or an external store to a function component, or you write your own hook.

## The contract

Import every hook from `@fiberfx/hyperscript/hooks` (never from the root entry).

- `useState<S>(initial: S | (() => S)): [S, (next: S | ((prev: S) => S)) => void]` — a function initial runs once; an `Object.is`-equal next value does not re-render.
- `useReducer(reducer, initialState)` / `useReducer(reducer, initialArg, init)`: `[S, Dispatch<A>]`.
- `useRef<T>(initial): { current }` — stable for the component's life; writing it does not re-render.
- `useImperativeHandle(ref, create, inputs?)` — sets a parent's ref to `create()`.
- `useEffect(effect, inputs?)` — after paint; `effect` may return a cleanup. No `inputs`: every render; `[]`: once; else when any input is not `Object.is`-equal or the length changed. The previous cleanup runs before a re-run; all cleanups run on unmount.
- `useLayoutEffect(effect, inputs?)` — same arguments, after DOM mutation and before paint; only for layout reads.
- `useMemo<T>(factory, inputs: Inputs | undefined): T` and `useCallback<T>(callback, inputs): T` — `inputs` is required by the types.
- `useContext<T>(context: Context<T>): T` — nearest `context.Provider`'s value, else the default from `createContext(default)`. A provider re-renders its readers whenever its `value` is a different object: memoize it.
- `useSyncExternalStore<T>(subscribe: (onChange) => unsubscribe, getSnapshot: () => T, getServerSnapshot?: () => T): T` — tear-free; `getServerSnapshot` for string renders and hydration.
- `useId(): string` — stable per component, for `aria-*` and `for` pairs.
- `useErrorBoundary(callback?): [error, reset]` — makes its component catch descendants' errors.
- `useDebugValue(value, formatter?)` — a label for debugging tools; no effect otherwise.

## Minimal example

```tsx
import { useEffect, useMemo, useState } from "@fiberfx/hyperscript/hooks";

export function Filtered({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => items.filter((item) => item.includes(query)), [items, query]);
  useEffect(() => {
    document.title = `${shown.length} results`;
  }, [shown.length]);
  return (
    <div>
      <input value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
      <ul>{shown.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
```

## Never emit

- A hook inside a condition, a loop, a callback or after an early `return`.
- Hooks imported from anywhere but `@fiberfx/hyperscript/hooks`: the root entry has none.
- Names this package does not export: `useTransition`, `useDeferredValue`, `useInsertionEffect`, `useActionState`, `useOptimistic`, `use`.
- `onChange` for per-keystroke text: use `onInput` (see /hyperscript/dom/llms.txt).

## Next

- Components and render: /hyperscript/components/llms.txt
- The DOM contract: /hyperscript/dom/llms.txt
- This companion: /hyperscript/hooks/llms.txt (the page as Markdown, `/hyperscript/hooks.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hyperscript/hooks)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hyperscript/llms.txt)
