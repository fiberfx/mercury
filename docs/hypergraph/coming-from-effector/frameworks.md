In Effector, a model is bound to a view through a framework package: effector-react, effector-vue or effector-solid. Mercury has one view layer, **Mercury Hyperscript** (`@fiberfx/hyperscript`): a virtual DOM with its own JSX runtime and hooks. There are no Vue or Solid bindings, and no React.

## One view layer

Hyperscript's hooks are at `@fiberfx/hyperscript/hooks`: `useState`, `useReducer`, `useRef`, `useEffect`, `useLayoutEffect`, `useCallback`, `useMemo`, `useContext`, `useImperativeHandle`, `useDebugValue`, `useErrorBoundary`, `useId` and `useSyncExternalStore`. Components are functions that return JSX, as you write them with React.

## The bindings, planned

Hypergraph's bindings for Hyperscript are ruled and not built: they will be `useUnit` and `Provider` at the subpath `@fiberfx/hypergraph/hyperscript`, the names you know from effector-react. That subpath is not exported yet: `@fiberfx/hypergraph` exports only its main entry, `/node` and `/inspect` today.

## Until the bindings ship

`useSyncExternalStore` reads any store that can be subscribed to, and a Hypergraph store can: `watch` subscribes to its updates and returns a function that ends the subscription, and `getState` reads its value.

```tsx
import { useSyncExternalStore } from "@fiberfx/hyperscript/hooks";
import { event, store, watch, type Store } from "@fiberfx/hypergraph";

export const increment = event<number>();
export const $count = store(0).on(increment, (count, by) => count + by);

function useStoreValue<T>(unit: Store<T>): T {
  return useSyncExternalStore(
    (onChange) => watch(unit, onChange),
    () => unit.getState(),
  );
}

export function Counter() {
  const count = useStoreValue($count);
  return <button onClick={() => increment(1)}>Clicked {count} times</button>;
}
```

This reads and writes the state outside any scope. It has no `Provider`, so it does not reach a forked scope; scoped rendering, as for a server render or one scope per island, waits for the bindings.

## Bindings that are not carried

| In effector-react | In Mercury |
|---|---|
| `useUnit(store)`, `useUnit(event)`, `useUnit({…})` | planned: `useUnit` at `@fiberfx/hypergraph/hyperscript` |
| `Provider value={scope}` | planned: `Provider` at `@fiberfx/hypergraph/hyperscript` |
| `useStore` | none; it was already deprecated for `useUnit` |
| `useEvent` | none; `useUnit` takes events too |
| `useStoreMap` | none; derive with `$store.map` or `combine` and read the result |
| `useList` | none; map over the array in the component |
| `useGate`, `createGate` | none |
| `connect`, `createComponent` | none |
| effector-vue, effector-solid | none; Mercury's view layer is Hyperscript |
