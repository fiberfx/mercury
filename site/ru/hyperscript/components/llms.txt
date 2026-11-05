# Компоненты и render — Mercury LMS

> HS0 Mercury Hyperscript (`@fiberfx/hyperscript` 4.0.0). Элементы — VNode, создаваемые JSX с источником импортов `@fiberfx/hyperscript` или через `h(type, props, ...children)`; функциональный компонент возвращает `ComponentChildren`; `render(vnode, parent)` монтирует дерево и обновляет его сравнением.

## Когда читать

При написании компонента, отображении списка, передаче ref или монтировании дерева на страницу.

## Контракт

- `h(type, props | null, ...children): VNode` — `h` совпадает с `createElement`. `type` — имя тега или компонент.
- `ComponentChild` = `VNode | object | string | number | bigint | boolean | null | undefined`; `ComponentChildren` — одно значение или массив. `null`, `undefined` и логические значения ничего не отображают.
- JSX: `jsxImportSource: "@fiberfx/hyperscript"` в `fiberfx/tsconfig.base.json` для TypeScript и редакторов. Прагма в файле не нужна: Hypercompiler закрепляет среду выполнения и отклоняет любой комментарий `@jsx` (/ru/mx/compile). Не импортируйте `jsx`/`jsxs`/`jsxDEV` вручную.
- `FunctionComponent<P>`: `(props: RenderableProps<P>, context?) => ComponentChildren`. Задавайте `children` тип `ComponentChildren`.
- `Fragment` (в JSX `<>…</>`) группирует содержимое без элемента.
- `key` удаляется из props; пунктам списка нужен стабильный ключ, например id при возможном перемещении.
- `createRef<T>()` → `{ current: T | null }`; ref может быть обработчиком, возвращающим функцию очистки. Функциональный компонент получает `ref` как обычное свойство и передаёт его дальше; только элементы с именем тега извлекают `ref`.
- `class X extends Component<P, S>`: `render(props?, state?, context?)`, `this.state`, `this.setState(update, callback?)`, `this.forceUpdate(callback?)`, необязательные методы жизненного цикла (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`, `shouldComponentUpdate`, `getSnapshotBeforeUpdate`, `componentDidCatch`). Mercury UI ими не пользуется: предпочитайте функции с хуками.
- `render(vnode, parent)`: монтирование; повторный вызов для того же родителя сравнивает деревья; `render(null, parent)` очищает. `hydrate(vnode, parent)` сравнивает с серверным HTML, уже находящимся в `parent`.
- `@fiberfx/hyperscript/client`: `createRoot(container)` → `{ render(children), unmount() }`; `hydrateRoot(container, children)` → корень.

## Минимальный пример

```tsx
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { render } from "@fiberfx/hyperscript";

function Badge({ children }: { children: ComponentChildren }) {
  return <span class="mx-badge">{children}</span>;
}

const app = document.getElementById("app");
if (app) render(<ul>{["a", "b"].map((id) => <li key={id}><Badge>{id}</Badge></li>)}</ul>, app);
```

## Не выдавать

- `className` или `htmlFor` в новом коде: пишите `class` и `for`.
- `forwardRef`: он не экспортируется; передавайте `ref` через свойства.
- Монтирование из другой библиотеки: используйте `render`, `hydrate` или `@fiberfx/hyperscript/client`.

## Далее

- Хуки: /ru/hyperscript/hooks/llms.txt
- Контракт DOM: /ru/hyperscript/dom/llms.txt
- Эта текстовая версия: /ru/hyperscript/components/llms.txt (страница в Markdown, `/hyperscript/components.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hyperscript/components)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hyperscript/llms.txt)
