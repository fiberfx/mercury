Страница Mercury может приходить в виде HTML. Сервер рендерит компоненты в строку, браузер сразу показывает её, затем Hyperscript выполняет гидратацию: связывает компоненты с уже существующим DOM, не перестраивая его. Всё для серверной стороны экспортируется из `@fiberfx/hyperscript/server`.

## Рендеринг в строку

```tsx
import { renderToString } from "@fiberfx/hyperscript/server";

function Greeting({ name }: { name: string }) {
  return <p class="greeting">Hello, {name}</p>;
}

const html = renderToString(<Greeting name="Mercury" />);
```

`renderToString(vnode, context?)` возвращает HTML-строку. Та же функция экспортируется ещё под тремя именами: экспорт по умолчанию, `render` и `renderToStaticMarkup`. Тесты Mercury UI используют оба именованных варианта. Тест `EnvironmentProvider` рендерит через `renderToString` и читает идентификаторы из разметки; тест `Box` использует `renderToStaticMarkup`.

`@fiberfx/render-to-string` 4.0.0 — тот же рендерер под отдельным именем пакета: он реэкспортирует `@fiberfx/hyperscript/server` и не содержит собственной копии.

Необязательный второй аргумент — начальный объект контекста корня, который `getChildContext` классового компонента расширяет для потомков. Коду с `createContext` он не нужен.

Строка содержит тот же HTML, который записывает клиент. Атрибуты сохраняют имена DOM, а числовое размерное свойство стиля получает `px` с обеих сторон.

## Что выполняется на сервере

Рендеринг в строку вызывает каждый компонент один раз, сверху вниз, и на этом завершается:

- **Компоненты и вычисляющие хуки выполняются.** `useState` возвращает начальное значение, `useMemo` вычисляет результат, `useContext` читает значение ближайшего провайдера или значение по умолчанию.
- **Эффекты не выполняются.** `useEffect` и `useLayoutEffect` ничего не ставят в очередь при рендеринге в строку, поэтому их обработчики не вызываются, а содержащий их компонент рендерится без ошибки.

Всё, что обращается к браузеру, например к `window`, `document`, измерениям или подпискам, следует помещать в эффект. Тогда это выполняется в браузере после гидратации, а не на сервере.

## Совпадающие идентификаторы

`useId` выдаёт одинаковые идентификаторы на сервере и в браузере. Поэтому идентификатор, который сервер записал в атрибуты `for` и `aria-*`, остаётся согласованным после гидратации. Нумерация идёт в порядке дерева (`P0-0`, `P0-1`, …) и начинается заново при каждом вызове `renderToString`: два рендеринга одного дерева дают одинаковую строку.

```tsx
import { useId } from "@fiberfx/hyperscript/hooks";

export function EmailField() {
  const id = useId();
  return (
    <p>
      <label for={id}>Email</label>
      <input id={id} type="email" />
    </p>
  );
}
```

`EnvironmentProvider` из Mercury UI добавляет `idPrefix`, чтобы два острова с отдельными корнями рендеринга не создавали один и тот же `P0-0`.

## Ожидание данных

`renderToString` синхронен. Если компонент выбрасывает промис, обозначая ожидание, вызов завершается ошибкой `Use "renderToStringAsync" for suspenseful rendering.`.

`renderToStringAsync(vnode, context?)` умеет ждать. Если компонент выбрасывает промис, функция ждёт его завершения, рендерит компонент снова и оборачивает результат маркерами-комментариями `<!--$s-->` и `<!--/$s-->`. Поддерживаются вложенные ожидания глубиной до 25 уровней. Это `async`-функция, поэтому всегда используйте `await`, хотя объявленный тип результата — `string | Promise<string>`:

```tsx
import { renderToStringAsync } from "@fiberfx/hyperscript/server";

const html = await renderToStringAsync(<Greeting name="Mercury" />);
```

Ни один тест в `fiberfx/hyperscript/test` не вызывает `renderToStringAsync`, и ни один пакет Mercury пока не использует его. Считайте этот интерфейс предварительной версией.

## Гидратация в браузере

`hydrate(vnode, parent)` отображает `vnode` в `parent`, уже содержащий соответствующий серверный HTML. Он сравнивает дерево с существующим DOM, использует эти узлы и подключает обработчики событий. После этого `parent` — обычная цель рендеринга: последующий `render` сравнивает деревья как обычно.

Клиентский корень предоставляет ту же пару операций. `hydrateRoot(container, children)` гидратирует содержимое и возвращает корень:

```tsx
import { hydrateRoot } from "@fiberfx/hyperscript/client";
import { useState } from "@fiberfx/hyperscript/hooks";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// The server sent renderToString(<Counter />): "<button>0</button>".
const app = document.getElementById("app");
if (app) {
  const root = hydrateRoot(app, <Counter />);
  // later: root.render(...) diffs against the hydrated DOM; root.unmount() clears it
}
```

Гидратируйте то же дерево с теми же свойствами, которое отрендерил сервер. Тесты Hyperscript закрепляют результат: серверные узлы сохраняются, а DOM после гидратации побайтово совпадает с серверной строкой, включая идентификаторы.

## Внешние хранилища между сервером и браузером

Значение вне дерева может различаться на сервере и в браузере: доступность сети, сохранённая настройка, размер области просмотра. Третий аргумент `useSyncExternalStore`, `getServerSnapshot`, согласует эти состояния. При рендеринге в строку и затем при гидратации читается `getServerSnapshot()` вместо `getSnapshot()`, поэтому первый браузерный рендеринг совпадает с серверным HTML. Затем выполняется повторный рендеринг с собственным значением браузера.

```tsx
import { useSyncExternalStore } from "@fiberfx/hyperscript/hooks";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function NetworkStatus() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  return <span class="network">{online ? "Online" : "Offline"}</span>;
}
```

На сервере и при первом рендеринге гидратации выводится «Online», как в HTML. Браузер без сети затем отображает «Offline». Функция `subscribe` обращается к `window` только при оформлении подписки на хранилище: в эффекте после гидратации, никогда на сервере.
