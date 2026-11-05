# Hyperscript — виртуальный DOM — Mercury LMS

> `@fiberfx/hyperscript` 4.0.0: собственная среда выполнения виртуального DOM Mercury. Функциональные и классовые компоненты на JSX с источником импортов `@fiberfx/hyperscript` или через `h(type, props, ...children)`; нативная семантика DOM. Хуки, клиентский корень, серверный рендерер и средства тестирования поставляются как подпути единой среды выполнения.

## Когда читать

При написании или изменении компонента приложения Mercury либо Mercury UI или поиске подпути, экспортирующего нужное имя. Это вводная страница курса; главы: /ru/hyperscript/components, /ru/hyperscript/hooks, /ru/hyperscript/dom, /ru/hyperscript/context, /ru/hyperscript/server, /ru/hyperscript/testing и /ru/hyperscript/tested-component.

## Контракт (уровень готовности: опубликован, Shipped — @fiberfx/hyperscript 4.0.0 в npm с 2026-11-05)

- `@fiberfx/hyperscript`: `render(vnode, parent)`, `hydrate(vnode, parent)`, `h` = `createElement(type, props, ...children)`, `Fragment`, `createRef()`, `cloneElement`, `isValidElement`, `Component`, `createContext(default)`, `createPortal(children, container)`, `toChildArray`, `memo(component, comparer?)`. Типы: `VNode`, `ComponentChild`, `ComponentChildren`, `FunctionComponent`, `ComponentType`, `RenderableProps`, `Ref`, `RefObject`, `Context`, `JSX`.
- `@fiberfx/hyperscript/hooks`: `useState`, `useReducer`, `useRef`, `useEffect`, `useLayoutEffect`, `useImperativeHandle`, `useMemo`, `useCallback`, `useContext`, `useDebugValue`, `useErrorBoundary`, `useId`, `useSyncExternalStore`.
- `@fiberfx/hyperscript/client`: `createRoot(container)` → `{ render(children), unmount() }`; `hydrateRoot(container, children)`.
- `@fiberfx/hyperscript/server`: `renderToString(vnode, context?)` (также экспорт по умолчанию), `render` (та же функция), `renderToStaticMarkup` (та же функция), `renderToStringAsync(vnode, context?)` → `string | Promise<string>`.
- `@fiberfx/hyperscript/jsx-runtime`, `/jsx-dev-runtime`: `jsx`, `jsxs`, `jsxDEV`, `Fragment`, только для компилятора.
- `@fiberfx/hyperscript/test-utils`: `act`, `setupRerender`, `teardown`, `onCommit`, `onDiff`. `/inspect`: `inspect`, `inspectFailures`. `/debug`: импорт для предупреждений разработки. `/hmr`: `trackRoots`.
- `options` из корневой точки входа — внутренний интерфейс; не используйте его.

## Минимальный пример

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";

function Counter() {
  const [count, setCount] = useState(0);
  return <button class="counter" onClick={() => setCount(count + 1)}>{count}</button>;
}

const app = document.getElementById("app");
if (app) render(<Counter />, app);
```

## Не выдавать

- Импорты из `react`, `react-dom`, `preact` или `@preact/*`, а также любого подпути `/compat`: `@fiberfx/hyperscript/compat` не существует; компоненты Mercury импортируют только из `@fiberfx/hyperscript` и его подпутей.
- Хуки из корневой точки входа: они находятся в `@fiberfx/hyperscript/hooks`.
- `options` из корневой точки входа.

## Далее

- Сайт: /llms.txt
- Главы: /ru/hyperscript/components/llms.txt, /ru/hyperscript/hooks/llms.txt, /ru/hyperscript/dom/llms.txt, /ru/hyperscript/context/llms.txt, /ru/hyperscript/server/llms.txt, /ru/hyperscript/testing/llms.txt, /ru/hyperscript/tested-component/llms.txt
- Эта текстовая версия: /ru/hyperscript/llms.txt (страница в Markdown, `/hyperscript.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hyperscript)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)

### Текстовые версии глав

- [/ru/hyperscript/components](/ru/hyperscript/components/llms.txt)
- [/ru/hyperscript/context](/ru/hyperscript/context/llms.txt)
- [/ru/hyperscript/dom](/ru/hyperscript/dom/llms.txt)
- [/ru/hyperscript/hooks](/ru/hyperscript/hooks/llms.txt)
- [/ru/hyperscript/server](/ru/hyperscript/server/llms.txt)
- [/ru/hyperscript/tested-component](/ru/hyperscript/tested-component/llms.txt)
- [/ru/hyperscript/testing](/ru/hyperscript/testing/llms.txt)
