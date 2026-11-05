# Тестирование и наблюдение — Mercury LMS

> HS5 Mercury Hyperscript. `@fiberfx/hyperscript/test-utils` выполняет отложенные рендеринги и эффекты после отрисовки для тестов; `./inspect` предоставляет независимые записи о работе рендерера; импорт `./debug` включает проверки разработки.

## Когда читать

При написании теста компонента Mercury, инструмента наблюдения за рендерингом или поиске понятной диагностики ошибки хука, ключа или `render`.

## Контракт

- `act(callback: () => void | Promise<void>): Promise<void>`: выполняет обработчик, затем рендеринги и эффекты до опустошения очередей. После синхронного обработчика это происходит до возврата из `act`, поэтому `await` не нужен; для асинхронного используйте `await act(async () => …)`. Вложенные вызовы опустошают очереди один раз, на внешнем уровне.
- `setupRerender(): () => void`: очередь ждёт вызова возвращённой функции. `teardown()` выполняет остаток и восстанавливает очередь; вызывайте после каждого такого теста.
- `onCommit(listener: (root) => void): () => void`: после каждой фиксации, один раз на корень, с обновлённым DOM.
- `onDiff(listener: () => void): () => void`: только для тестов; вызов внутри рендерера после каждого сравнения узла; исключение останавливает рендеринг и выходит из `render`.
- `inspect({ root?, phases?, fn }): Subscription`: `phases` ⊆ `root | render | diffed | commit | unmount | error`; неизвестная фаза вызывает `TypeError`. `root` — контейнер из `render`/`hydrate`. Запись `{ kind, id, parentId, rootId, type, name, error? }` отделена от рендерера, совместима с `structuredClone`, id стабильны между рендерингами. Возвращает `dispose()`, также `.unsubscribe()`. `inspectFailures(): number` считает перехваченные ошибки подписчиков. Импорт ничего не устанавливает.
- `import "@fiberfx/hyperscript/debug"` — побочный эффект, только для разработки: исключение при неопределённом родителе `render`, неопределённом компоненте или хуке вне рендеринга; `console.error` при повторных ключах и неверной вложенности таблиц/абзацев. Экспортирует `getDisplayName`, `getCurrentVNode`, `getOwnerStack`, `captureOwnerStack`, `setupComponentStack`, `resetPropWarnings`.
- Тестовые средства Mercury UI, `fiberfx/ui/test/testing.ts`, оборачивают `render`, `rerender`, `unmount`, `cleanup` и `fireEvent` в `act`; поиск элементов — из `@fiberfx/testing`.

## Минимальный пример

```tsx
import { expect, it } from "vitest";
import { render } from "@fiberfx/hyperscript";
import { useEffect, useState } from "@fiberfx/hyperscript/hooks";
import { act } from "@fiberfx/hyperscript/test-utils";

function Greeting() {
  const [name, setName] = useState("…");
  useEffect(() => setName("Mercury"), []);
  return <p>Hello, {name}</p>;
}

it("flushes the effect's update", () => {
  const container = document.createElement("div");
  act(() => render(<Greeting />, container));
  expect(container.textContent).toBe("Hello, Mercury");
});
```

## Не выдавать

- Проверки DOM сразу после изменения состояния вне `act` или `setupRerender`: рендеринг ещё в очереди.
- `options` из корневой точки входа для подключения к рендереру: используйте `./inspect` или `onCommit`/`onDiff` в тестах.
- `onDiff` в коде приложения: только для тестов.
- Библиотеку тестирования другого фреймворка: используйте `act` из `./test-utils`, на котором построены тестовые средства Mercury UI.

## Далее

- Рендеринг на сервере: /ru/hyperscript/server/llms.txt
- Компоненты и render: /ru/hyperscript/components/llms.txt
- Эта текстовая версия: /ru/hyperscript/testing/llms.txt (страница в Markdown, `/hyperscript/testing.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hyperscript/testing)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hyperscript/llms.txt)
