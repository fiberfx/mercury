Тест компонента сложнее теста функции по двум причинам. Hyperscript объединяет рендеринги: обновление состояния ставит рендеринг в очередь, а не выполняет сразу. Кроме того, эффекты запускаются после отрисовки. `@fiberfx/hyperscript/test-utils` отдаёт оба механизма под управление теста. Дополняют его `./inspect`, сообщающий о работе рендерера, и `./debug`, добавляющий проверки разработки.

## act

`act(callback)` выполняет `callback`, затем опустошает очереди: запускает все рендеринги и ожидающие эффекты, повторяя это, пока ничего не останется. После возврата из `act` DOM содержит установившийся результат.

```tsx
import { describe, expect, it } from "vitest";
import { render } from "@fiberfx/hyperscript";
import { useEffect, useState } from "@fiberfx/hyperscript/hooks";
import { act } from "@fiberfx/hyperscript/test-utils";

function Greeting() {
  const [name, setName] = useState("…");
  useEffect(() => setName("Mercury"), []);
  return <p>Hello, {name}</p>;
}

describe("Greeting", () => {
  it("shows the name its effect sets", () => {
    const container = document.createElement("div");
    act(() => render(<Greeting />, container));
    expect(container.textContent).toBe("Hello, Mercury");
  });
});
```

- **После синхронного обработчика очереди опустошаются до возврата из `act`.** Использовать `await` необязательно, хотя возвращается промис.
- **После асинхронного обработчика очереди опустошаются по завершении его промиса.** Используйте `await act(async () => { … })`.
- **Вложенные вызовы опустошают очереди один раз,** при возврате из внешнего `act`.

На время работы `act` подменяет слоты кадров и очереди рендеринга, а затем восстанавливает прежние.

## Управление очередью рендеринга

`setupRerender()` приостанавливает очередь: обновление состояния ставит рендеринг в очередь, но он не выполняется, пока вы не вызовете возвращённую функцию. Это позволяет посмотреть DOM до и после одного обновления. `teardown()` выполняет оставшееся и возвращает очередь в обычный режим; вызывайте его после каждого теста с `setupRerender`.

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";
import { setupRerender, teardown } from "@fiberfx/hyperscript/test-utils";

let increment = () => {};
function Counter() {
  const [count, setCount] = useState(0);
  increment = () => setCount(count + 1);
  return <b>{count}</b>;
}

const container = document.createElement("div");
const rerender = setupRerender();
render(<Counter />, container);
increment();
// container.textContent is still "0": the render is queued
rerender();
// container.textContent is now "1"
teardown();
```

Так собственный набор тестов Hyperscript для `./inspect` управляет счётчиком.

## onCommit и onDiff

Два слушателя сообщают о работе рендерера. Каждый возвращает функцию удаления; повторное удаление безопасно.

- **`onCommit(listener)`** вызывает `listener(root)` после каждой фиксации, по одному разу для каждого обработанного корня, когда DOM уже обновлён.
- **`onDiff(listener)`** вызывает `listener()` внутри рендерера после сравнения каждого узла. Это средство только для тестов: ошибка слушателя попадает в рендеринг и останавливает его на месте. Так тест может ограничить цикл обновлений.

```ts
import { onDiff } from "@fiberfx/hyperscript/test-utils";

let diffs = 0;
const stop = onDiff(() => {
  if (++diffs > 1000) throw new Error("more than 1000 diffs: an update loop?");
});
// … render and interact …
stop();
```

## Тестовые средства Mercury UI

Компоненты Mercury UI тестируются через `fiberfx/ui/test/testing.ts`, который строит привычные `render`, `rerender`, `unmount`, `cleanup` и `fireEvent` поверх `act`. Его `render(ui)` монтирует через Hyperscript `render` внутри `act`; каждый `fireEvent` тоже выполняется внутри `act`. Поэтому следующая строка теста видит установившийся DOM. Средства поиска элементов берутся из `@fiberfx/testing`.

## Наблюдение за рендерером

`@fiberfx/hyperscript/inspect` сообщает о работе рендерера в виде записей. Им может пользоваться панель разработчика, профилировщик или тест.

```ts
import { inspect, inspectFailures } from "@fiberfx/hyperscript/inspect";

const app = document.getElementById("app");
if (app) {
  const stop = inspect({
    root: app,
    phases: ["render", "error"],
    fn: (record) => console.log(record.kind, record.type, record.name ?? "", record.id),
  });
  // … later
  stop();
  console.log(inspectFailures(), "subscriber calls threw");
}
```

- **Шесть фаз:** `root`, `render`, `diffed`, `commit`, `unmount` и `error`. `phases` выбирает нужные; без него поступают все шесть. Неизвестная фаза вызывает `TypeError` с перечнем допустимых.
- **`root` выбирает один корень:** контейнер, переданный в `render` или `hydrate`. Без него поступают записи всех корней.
- **Запись отделена от объектов рендерера.** Она содержит `kind`, `id`, `parentId`, `rootId`, `type` (тег, `"#text"`, `"#fragment"` или `"#component"`), `name` (имя функционального компонента, иначе `null`) и для `error` — выброшенную `error`. Узлов и компонентов в ней нет, поэтому её можно передать через `structuredClone`.
- **Идентификаторы стабильны.** Смонтированный компонент сохраняет id между рендерингами; при повторном монтировании получает новый.
- **Наблюдатель не может сломать приложение.** Ошибка из `fn` перехватывается и учитывается; `inspectFailures()` возвращает их число. Остальные подписчики всё равно получают запись.
- **Импорт ничего не устанавливает.** Обработчики устанавливает первый вызов `inspect`; `inspect` возвращает функцию удаления подписки, также доступную как `.unsubscribe()`.

## Проверки разработки

`@fiberfx/hyperscript/debug` добавляет проверки рендереру. Импорт модуля включает их: это побочный эффект, поэтому импортируйте его один раз в точке входа для разработки или в подготовке тестов. README пакета описывает его как предупреждения для разработки.

С ним ошибки, которые иначе проявились бы неясно, получают сообщения:

- **Выбрасывается исключение:** `render` с неопределённым родителем ("Undefined parent passed to render(), this is the second argument."); неопределённый компонент в `createElement`, обычно из-за пропущенного экспорта; хук вне рендеринга компонента ("Hook can only be invoked from render methods.").
- **Выводится через `console.error`:** два потомка с одинаковым `key`, неверная вложенность таблиц или абзацев. Каждое сообщение называет компонент и стек его владельцев.

Также экспортируются функции для инструментов: `getDisplayName(vnode)`, `getCurrentVNode()`, `getOwnerStack(vnode)`, `captureOwnerStack()`, `setupComponentStack()` и `resetPropWarnings()`.

Ни один файл в `fiberfx/ui/src`, `fiberfx/ui/test` или `fiberfx/core` не импортирует `./inspect` или `./debug` и не вызывает `setupRerender`: собственные тесты Mercury UI используют только `act`.
