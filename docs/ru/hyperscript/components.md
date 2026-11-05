В основе каждого компонента Mercury две идеи: элемент описывает часть DOM, а компонент — функция, возвращающая элементы. Глава разбирает обе идеи, затем монтирование.

## Элементы

Элемент — это `VNode`: обычный объект с `type`, свойствами `props` и необязательными `key` и `ref`. `type` — имя тега, например `"button"`, или компонент. Элемент создаётся через `h`, ту же функцию, что и `createElement`:

```ts
import { h, render } from "@fiberfx/hyperscript";

const note = h("p", { class: "note" }, "Saved ", h("strong", null, "3"), " lessons.");

const app = document.getElementById("app");
if (app) render(note, app);
```

Аргументы — тип, свойства или `null`, затем произвольное число дочерних значений. Дочерним значением может быть элемент, строка, число или bigint; `true`, `false`, `null` и `undefined` ничего не отображают, что позволяет писать `{ready && <Done />}`.

## JSX

Обычно вы не вызываете `h` напрямую, а пишете JSX. Компилятор превращает каждый тег в вызов автоматической среды выполнения JSX, `@fiberfx/hyperscript/jsx-runtime`. Пакеты Mercury задают это один раз в `fiberfx/tsconfig.base.json`:

```json
{ "compilerOptions": { "jsx": "preserve", "jsxImportSource": "@fiberfx/hyperscript" } }
```

Эта настройка предназначена для TypeScript и редактора. При работе с `mx` прагма в файле не нужна: Hypercompiler закрепляет среду выполнения за `@fiberfx/hyperscript` и отклоняет любой комментарий-прагму `@jsx` ([компиляция модуля](/ru/mx/compile)). Когда источник импортов задан, самому файлу не нужны импорты для JSX: `jsx`, `jsxs` и `jsxDEV` импортирует сгенерированный компилятором код.

## Функциональные компоненты

Функциональный компонент принимает свойства и возвращает дочернее содержимое. Вот `Badge` из Mercury UI целиком:

```tsx
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { cx } from "@fiberfx/core";

export type BadgeVariant = "brand" | "negative" | "positive" | "caution" | "info";
export interface BadgeProps {
  children: ComponentChildren;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
}
export function Badge({ children, variant = "negative", size = "md" }: BadgeProps) {
  return <span class={cx("mx-badge", `mx-badge--${variant}`, size !== "md" && `mx-badge--${size}`)}>{children}</span>;
}
```

Три приёма из примера:

- **Задавайте дочернему содержимому тип `ComponentChildren`.** Это тип любого значения, которое может отобразить компонент: одного дочернего значения или массива.
- **Деструктурируйте свойства и задавайте значения по умолчанию там же.** При отсутствии `variant` используется `"negative"`.
- **Пишите `class`.** Hyperscript следует DOM, поэтому атрибут называется `class`, а не переименованным свойством. Полные правила — в [контракте DOM](/ru/hyperscript/dom).

Тип компонента — `FunctionComponent<P>`. Свойства приходят как `RenderableProps<P>`, добавляющий `children`, `key` и `ref` к вашим свойствам.

## Дочернее содержимое, фрагменты и ключи

Компонент возвращает одно дочернее значение, их массив или `Fragment`, объединяющий содержимое без добавления элемента. В JSX `<>…</>` — это `Fragment`.

При отображении списка задавайте каждому пункту `key`, чтобы повторный рендеринг сопоставил новые пункты с ранее отображёнными элементами. Пример `Checklist` из Mercury UI:

```tsx
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { cx } from "@fiberfx/core";

export interface ChecklistItem {
  label: ComponentChildren;
  met: boolean;
}

export interface ChecklistProps {
  items: ChecklistItem[];
  class?: string;
}

export function Checklist({ items, class: classes }: ChecklistProps) {
  return (
    <ul class={cx("mx-checklist", classes)}>
      {items.map((item, i) => (
        <li key={i} class={cx("mx-checklist__item", item.met && "is-met")}>
          <span class="mx-checklist__mark" aria-hidden="true">
            {item.met ? "✓" : "○"}
          </span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

Пункты этого списка не меняют порядок, поэтому индекс служит стабильным ключом. Если список допускает перестановку, вставку или удаление, ключ должен браться из самого пункта, например из его id. `key` не попадает в компонент как свойство: Hyperscript извлекает его из props при создании элемента.

## Ссылки ref

Ссылка ref предоставляет DOM-узел, отображённый элементом. `createRef()` создаёт объект `{ current: null }`, а свойство `ref` элемента заполняет его после появления узла в DOM. Ссылка также может быть функцией, вызываемой с узлом; она может вернуть функцию очистки. Внутри компонента для хранения ссылки обычно используют `useRef` из [хуков](/ru/hyperscript/hooks).

Функциональный компонент получает `ref` как обычное свойство: Hyperscript извлекает `ref` из props только у элемента, чей тип — имя тега. Поэтому компонент передаёт ссылку дальше обычным свойством, как `VisuallyHidden` из Mercury UI:

```tsx
export const VisuallyHidden = function VisuallyHidden(
  { class: classes, ref, ...rest }: VisuallyHiddenProps & { ref?: Ref<HTMLSpanElement> },
) {
  return <span ref={ref} class={cx("mx-visually-hidden", classes)} {...rest} />;
};
```

## Классовые компоненты

`Component` — базовый класс компонента с собственным экземпляром. Вы реализуете `render(props, state, context)`, храните состояние в `this.state`, меняете его через `this.setState(update, callback?)` и при необходимости добавляете методы жизненного цикла: `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`, `shouldComponentUpdate`, `getSnapshotBeforeUpdate`, `componentDidCatch` и другие.

```tsx
import { Component, render } from "@fiberfx/hyperscript";

class Clock extends Component<{}, { now: Date }> {
  state = { now: new Date() };
  timer = 0;
  componentDidMount() {
    this.timer = window.setInterval(() => this.setState({ now: new Date() }), 1000);
  }
  componentWillUnmount() {
    window.clearInterval(this.timer);
  }
  render() {
    return <time>{this.state.now.toLocaleTimeString()}</time>;
  }
}

const app = document.getElementById("app");
if (app) render(<Clock />, app);
```

Все компоненты Mercury UI — функции с хуками; ни один компонент в `fiberfx/ui/src` не наследует `Component`.

## Монтирование через render

`render(vnode, parent)` отображает дерево в DOM-узел. Повторный вызов для того же родителя сравнивает новое дерево с последним отображённым и меняет только различия. `render(null, parent)` удаляет отображённое содержимое. Если родитель — `Document`, рендеринг идёт в его `documentElement`.

`hydrate(vnode, parent)` — вариант `render` для родителя, уже содержащего серверный HTML этого дерева: он сравнивает дерево с существующим DOM, не создавая его заново. Эта пара разобрана в [HS4 «Рендеринг на сервере»](/ru/hyperscript/server).

## Клиентский корень

`@fiberfx/hyperscript/client` оборачивает обе операции в объект корня для кода, которому удобно один раз сохранить контейнер:

```tsx
import { createRoot } from "@fiberfx/hyperscript/client";

const app = document.getElementById("app");
if (app) {
  const root = createRoot(app);
  root.render(<p>Loading…</p>);
  root.render(<p>Ready.</p>);
  root.unmount();
}
```

`root.render(children)` отображает содержимое в контейнер, `root.unmount()` очищает его, а `hydrateRoot(container, children)` гидратирует серверную разметку и возвращает такой же объект корня.
