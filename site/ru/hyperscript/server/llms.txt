# Рендеринг на сервере — Mercury LMS

> HS4 Mercury Hyperscript. `@fiberfx/hyperscript/server` рендерит компоненты в HTML-строку без выполнения эффектов; `hydrate` / `hydrateRoot` подключаются к этому HTML в браузере. `@fiberfx/render-to-string` 4.0.0 реэкспортирует тот же модуль.

## Когда читать

При рендеринге страницы или острова в HTML на сервере либо в тесте, а также при подключении компонентов к серверной разметке в браузере.

## Контракт

- `renderToString(vnode, context?): string`. Экспорт по умолчанию, `render` и `renderToStaticMarkup` — одна функция. `context` — начальный объект контекста корня из прежнего API (`getChildContext`); код с `createContext` его не передаёт.
- При рендеринге в строку обработчики `useEffect` и `useLayoutEffect` не выполняются, обработчики событий не сериализуются. `useState` даёт начальное значение; `useContext` читает провайдеров в дереве.
- `useId`: идентификаторы идут по порядку дерева (`P0-0`, `P0-1`, …), нумерация сбрасывается для каждого корня `renderToString` и совпадает после гидратации.
- Если компонент выбрасывает промис, `renderToString` выбрасывает `Error('Use "renderToStringAsync" for suspenseful rendering.')`.
- `renderToStringAsync(vnode, context?)`: всегда используйте `await`. Повторно рендерит приостановленный компонент после завершения промиса, оборачивает результат в `<!--$s-->…<!--/$s-->` и поддерживает до 25 вложенных уровней. Предварительная версия: тестового покрытия нет.
- Браузер: `hydrate(vnode, parent)` из `@fiberfx/hyperscript` или `hydrateRoot(container, children)` из `@fiberfx/hyperscript/client`, возвращающий `{ render, unmount }`. Гидратируйте то же дерево с теми же свойствами; серверные узлы сохраняются.
- `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`: `getServerSnapshot` читается на сервере и при гидратации; после неё выполняется рендеринг с `getSnapshot`. Подписка оформляется в эффекте.

## Минимальный пример

```tsx
// server
import { renderToString } from "@fiberfx/hyperscript/server";
const html = renderToString(<Counter />); // "<button>0</button>"

// browser
import { hydrateRoot } from "@fiberfx/hyperscript/client";
const app = document.getElementById("app");
if (app) hydrateRoot(app, <Counter />);
```

## Не выдавать

- Чтение `window`, `document` или `navigator` во время рендеринга компонента на сервере: читайте их в `useEffect` либо через `useSyncExternalStore` с `getServerSnapshot`.
- `renderToStringAsync` без `await`.
- Подпути `./jsx`, `./stream` или `./stream-node` пакета `@fiberfx/render-to-string`: они не экспортируются.

## Далее

- Контекст, порталы и memo: /ru/hyperscript/context/llms.txt
- Тестирование и наблюдение: /ru/hyperscript/testing/llms.txt
- Эта текстовая версия: /ru/hyperscript/server/llms.txt (страница в Markdown, `/hyperscript/server.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hyperscript/server)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hyperscript/llms.txt)
