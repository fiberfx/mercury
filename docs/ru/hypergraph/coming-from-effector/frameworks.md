В Effector модель связывается с представлением через пакет фреймворка: effector-react, effector-vue или effector-solid. У Mercury один слой представления — **Mercury Hyperscript** (`@fiberfx/hyperscript`): виртуальный DOM с собственной средой выполнения JSX и хуками. Привязок Vue и Solid нет, React тоже нет.

## Один слой представления

Хуки Hyperscript находятся в `@fiberfx/hyperscript/hooks`: `useState`, `useReducer`, `useRef`, `useEffect`, `useLayoutEffect`, `useCallback`, `useMemo`, `useContext`, `useImperativeHandle`, `useDebugValue`, `useErrorBoundary`, `useId` и `useSyncExternalStore`. Компоненты — функции, возвращающие JSX, как и в React.

## Запланированные привязки

Решение о привязках Hypergraph к Hyperscript принято, но они ещё не реализованы: это будут `useUnit` и `Provider` в подпути `@fiberfx/hypergraph/hyperscript` — знакомые имена из effector-react. Этот подпуть ещё не экспортируется: сегодня `@fiberfx/hypergraph` экспортирует только основную точку входа, `/node` и `/inspect`.

## До выпуска привязок

`useSyncExternalStore` читает любое хранилище (store), на которое можно подписаться. Хранилище Hypergraph это позволяет: `watch` подписывается на обновления и возвращает функцию завершения подписки, а `getState` читает значение.

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

Этот пример читает и записывает состояние вне всех изолированных областей состояния (scope). У него нет `Provider`, поэтому он не обращается к созданной через fork области. Рендеринг внутри области — например, серверный рендеринг или отдельная область на каждый остров — ждёт появления привязок.

## Привязки, которые не переносятся

| В effector-react | В Mercury |
|---|---|
| `useUnit(store)`, `useUnit(event)`, `useUnit({…})` | запланирован `useUnit` в `@fiberfx/hypergraph/hyperscript` |
| `Provider value={scope}` | запланирован `Provider` в `@fiberfx/hypergraph/hyperscript` |
| `useStore` | отсутствует; уже был устаревшим в пользу `useUnit` |
| `useEvent` | отсутствует; `useUnit` также принимает события |
| `useStoreMap` | отсутствует; получите производное значение через `$store.map` или `combine` и прочитайте результат |
| `useList` | отсутствует; преобразуйте массив внутри компонента |
| `useGate`, `createGate` | отсутствуют |
| `connect`, `createComponent` | отсутствуют |
| effector-vue, effector-solid | отсутствуют; слой представления Mercury — Hyperscript |
