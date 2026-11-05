# Фреймворки после effector-react — Mercury LMS

> Единственный слой представления Mercury — Mercury Hyperscript (`@fiberfx/hyperscript`, хуки в `@fiberfx/hyperscript/hooks`). Привязки Hypergraph `useUnit` и `Provider` запланированы в `@fiberfx/hypergraph/hyperscript` и ещё НЕ экспортируются. Пока читайте хранилище через `useSyncExternalStore` + `watch` + `getState`, вне областей.

## Когда читать

Если вы переносите компонент с effector-react, effector-vue или effector-solid либо вам нужно значение хранилища в компоненте Hyperscript.

## Соответствия

| effector-react | Mercury |
|---|---|
| `useUnit`, `Provider` | запланированы в `@fiberfx/hypergraph/hyperscript`; сегодня их нельзя импортировать |
| `useStore` | отсутствует; устарел в пользу `useUnit` |
| `useEvent` | отсутствует |
| `useStoreMap` | отсутствует: получите производное значение через `.map` / `combine`, затем прочитайте его |
| `useList` | отсутствует: преобразуйте массив в JSX |
| `useGate`, `createGate`, `connect`, `createComponent` | отсутствуют |
| effector-vue, effector-solid | отсутствуют |

Хуки Hyperscript: `useState`, `useReducer`, `useRef`, `useEffect`, `useLayoutEffect`, `useCallback`, `useMemo`, `useContext`, `useImperativeHandle`, `useDebugValue`, `useErrorBoundary`, `useId`, `useSyncExternalStore`.

## Минимальный пример: доступен сегодня, вне всех областей

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

Ограничение: таким способом изолированная область состояния (scope) не передаётся компоненту; рендеринг внутри области — серверный или с отдельной областью на каждый остров — ждёт `Provider`.

## Никогда не генерируйте

Импорты из `react`, `effector-react`, `effector-vue`, `effector-solid` или `@fiberfx/hypergraph/hyperscript` (ещё не экспортируется); `useStore`, `useStoreMap`, `useList`, `useGate`.

## Навигация

- [Страница в браузере](/ru/hypergraph/coming-from-effector/frameworks)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
