# Frameworks, after effector-react — Mercury LMS

> Mercury's only view layer is Mercury Hyperscript (`@fiberfx/hyperscript`, hooks at `@fiberfx/hyperscript/hooks`). The Hypergraph bindings `useUnit` and `Provider` are planned at `@fiberfx/hypergraph/hyperscript` and NOT exported yet. Until then, read a store with `useSyncExternalStore` + `watch` + `getState`, unscoped.

## Read this when

You are porting a component that used effector-react, effector-vue or effector-solid, or you need a store's value in a Hyperscript component.

## The map

| effector-react | Mercury |
|---|---|
| `useUnit`, `Provider` | planned at `@fiberfx/hypergraph/hyperscript`; not importable today |
| `useStore` | none (deprecated for `useUnit`) |
| `useEvent` | none |
| `useStoreMap` | none: derive with `.map` / `combine`, then read |
| `useList` | none: map the array in JSX |
| `useGate`, `createGate`, `connect`, `createComponent` | none |
| effector-vue, effector-solid | none |

Hyperscript hooks: `useState`, `useReducer`, `useRef`, `useEffect`, `useLayoutEffect`, `useCallback`, `useMemo`, `useContext`, `useImperativeHandle`, `useDebugValue`, `useErrorBoundary`, `useId`, `useSyncExternalStore`.

## Minimal example (today, outside any scope)

```tsx
import { useSyncExternalStore } from "@fiberfx/hyperscript/hooks";
import { event, store, watch, type Store } from "@fiberfx/hypergraph";

const increment = event<number>();
const $count = store(0).on(increment, (n, by) => n + by);

const useStoreValue = <T,>(unit: Store<T>): T =>
  useSyncExternalStore((onChange) => watch(unit, onChange), () => unit.getState());

export function Counter() {
  const count = useStoreValue($count);
  return <button onClick={() => increment(1)}>Clicked {count} times</button>;
}
```

Limit: no scope reaches the component this way; scoped rendering (SSR, per-island scopes) waits for `Provider`.

## Never emit

Imports from `react`, `effector-react`, `effector-vue`, `effector-solid` or `@fiberfx/hypergraph/hyperscript` (not exported yet); `useStore`, `useStoreMap`, `useList`, `useGate`.

## Navigation

- [Read this page in the browser](/hypergraph/coming-from-effector/frameworks)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
