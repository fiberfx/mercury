Mercury Hyperscript — среда выполнения виртуального DOM для пакетов Mercury: пакет `@fiberfx/hyperscript`, версия 4.0.0. На нём написаны компоненты Mercury UI и любой компонент, который вы создаёте для приложения Mercury.

## Что такое Hyperscript

Hyperscript превращает дерево элементов в DOM, а следующее дерево — в минимальный набор изменений DOM. Перед первым компонентом нужно знать три вещи:

- **Компоненты — функции.** Функциональный компонент принимает свойства и возвращает дочернее содержимое: элементы, строки, числа или ничего. Также доступен классовый компонент, наследующий `Component`.
- **Семантика следует DOM.** Вы пишете `class` и `for`; `onInput` срабатывает при каждом вводе, а `onChange` — по событию DOM `change`; атрибуты SVG сохраняют свои имена. Правила перечислены в главе [контракт DOM](/ru/hyperscript/dom).
- **Одна среда выполнения на приложение.** Каждая точка входа импортирует среду выполнения по её собственному имени. Поэтому хуки, клиентский корень, JSX и средства тестирования работают с одним рендерером.

Компоненты пишутся на JSX: пакеты Mercury компилируют его с `@fiberfx/hyperscript` в качестве источника импортов JSX. Без JSX то же дерево создаёт `h(type, props, ...children)`.

## Точки входа

| Импорт | Что предоставляет |
|---|---|
| `@fiberfx/hyperscript` | `render`, `hydrate`, `h` и `createElement`, `Fragment`, `createRef`, `cloneElement`, `isValidElement`, `Component`, `createContext`, `createPortal`, `toChildArray`, `memo` и типы (`VNode`, `ComponentChildren`, `FunctionComponent`, `Context`…) |
| `@fiberfx/hyperscript/hooks` | `useState`, `useReducer`, `useRef`, `useEffect`, `useLayoutEffect`, `useImperativeHandle`, `useMemo`, `useCallback`, `useContext`, `useDebugValue`, `useErrorBoundary`, `useId`, `useSyncExternalStore` |
| `@fiberfx/hyperscript/client` | `createRoot`, `hydrateRoot` |
| `@fiberfx/hyperscript/server` | `renderToString` (также экспорт по умолчанию), `render`, `renderToStringAsync`, `renderToStaticMarkup` |
| `@fiberfx/hyperscript/jsx-runtime` и `/jsx-dev-runtime` | автоматическая среда выполнения JSX: `jsx`, `jsxs`, `jsxDEV`, `Fragment`; используется компилятором, а не вашим кодом напрямую |
| `@fiberfx/hyperscript/test-utils` | `act`, `setupRerender`, `teardown`, `onCommit`, `onDiff` |
| `@fiberfx/hyperscript/inspect` | `inspect`, `inspectFailures`: наблюдение за рендерером через отделённые от него записи |
| `@fiberfx/hyperscript/debug` | предупреждения для разработки: импорт включает их |
| `@fiberfx/hyperscript/hmr` | `trackRoots` — отслеживание корней для горячей замены |

Корневая точка входа также экспортирует `options` — слоты хуков рендерера. Это внутренний интерфейс пакета; для наблюдения используйте `./inspect`.

## Первый компонент

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

`render` монтирует дерево в `app`. Каждый щелчок вызывает `setCount`, компонент рендерится заново, а Hyperscript сравнивает новое дерево с предыдущим и обновляет DOM.

## Главы

- **HS0 [Компоненты и render](/ru/hyperscript/components):** элементы, JSX, функциональные и классовые компоненты, ключи, ссылки ref, `render`, `hydrate` и клиентский корень.
- **HS1 [Хуки](/ru/hyperscript/hooks):** все хуки из `@fiberfx/hyperscript/hooks`, их сигнатуры и условия выполнения.
- **HS2 [Контракт DOM](/ru/hyperscript/dom):** `class` и `for`, нативные события ввода и изменения, имена SVG, фокус, пользовательские элементы, числовые стили и управляемые поля ввода.
- **HS3 [Контекст, порталы и memo](/ru/hyperscript/context):** `createContext` с `Provider` и `Consumer`, `createPortal`, `memo`, `cloneElement` и `toChildArray`.
- **HS4 [Рендеринг на сервере](/ru/hyperscript/server):** `./server` с `renderToString` и `renderToStringAsync`, затем `hydrate` и `hydrateRoot` в браузере.
- **HS5 [Тестирование и наблюдение](/ru/hyperscript/testing):** `./test-utils` с `act` и `setupRerender`, `./inspect` и предупреждения `./debug`.
- **HS6 [Компонент с тестами](/ru/hyperscript/tested-component):** итоговое задание. Один из компонентов представлений KAN получает контракт и тест: рендеринг внутри `act`, действие щелчком, проверка DOM, наблюдение фиксаций рендеринга и сравнение серверного результата с клиентским.

## Что поставляется

Всё перечисленное на странице экспортируется из `@fiberfx/hyperscript` 4.0.0. Компоненты Mercury UI импортируют корневую точку входа, `./hooks` и `./server`. Все семь глав, от HS0 до HS6, написаны.
