В главе [хуки](/ru/hyperscript/hooks) контекст читался через `useContext`. Здесь мы создадим контекст, затем разберём остальные средства работы с деревом из корневой точки входа: порталы, `memo` и функции чтения и преобразования дочернего содержимого.

## Контекст

`createContext(defaultValue)` создаёт контекст. Компонент под его `Provider` читает `value` провайдера; если провайдера выше нет — `defaultValue`.

```tsx
import { createContext } from "@fiberfx/hyperscript";
import { useContext } from "@fiberfx/hyperscript/hooks";

export type Density = "compact" | "comfortable";
export const DensityContext = createContext<Density>("comfortable");

function Row({ children }: { children: string }) {
  const density = useContext(DensityContext);
  return <li class={`row row--${density}`}>{children}</li>;
}

export function Table() {
  return (
    <DensityContext.Provider value="compact">
      <ul>
        <Row>First</Row>
        <Row>Second</Row>
      </ul>
    </DensityContext.Provider>
  );
}
```

Объект контекста сам является провайдером: `DensityContext.Provider` совпадает с `DensityContext`. У него также есть `Consumer`, принимающий функцию как дочернее содержимое и вызывающий её со значением. Это такое же чтение, как `useContext`, но записанное в дереве:

```tsx
<DensityContext.Consumer>{(density) => <span>{density}</span>}</DensityContext.Consumer>
```

Mercury UI читает контексты, например `UiEnvironmentContext` из `@fiberfx/core` и `FormRegistryContext` форм, через `useContext`. Ни один файл в `fiberfx/ui/src` или `fiberfx/core/src` не использует `Consumer`.

## Когда читатели рендерятся снова

Провайдер запоминает читателей. При рендеринге со значением `value`, не равным прежнему (`!=`), каждый читатель рендерится снова, даже если промежуточный компонент вернул `false` из `shouldComponentUpdate` или обёрнут в `memo`. Провайдер с неизменившимся значением никого не запускает.

Поэтому значение провайдера должно сохранять идентичность, пока содержимое прежнее. Объектный литерал `value={{ density, setDensity }}` создаёт новый объект при каждом рендеринге и каждый раз запускает всех читателей. Создавайте его через `useMemo`, как `EnvironmentProvider` из Mercury UI создаёт объединённое окружение.

## Контекст в классе

Классовый компонент читает один контекст через статическое свойство `contextType`: значение доступно в `this.context`, от ближайшего провайдера или по умолчанию.

```tsx
import { Component, createContext } from "@fiberfx/hyperscript";

const DensityContext = createContext<"compact" | "comfortable">("comfortable");

export class DensityLabel extends Component<{}, {}> {
  static contextType = DensityContext;
  render() {
    return <span>Density: {this.context}</span>;
  }
}
```

## Порталы

`createPortal(children, container)` отображает `children` в `container` — DOM-узел в любом месте страницы, сохраняя положение содержимого в дереве компонентов там, где отрендерен портал. Это нужно, когда всплывающая поверхность — popover, меню или диалог — должна выйти за ограничения `overflow` или контекста наложения предка.

Mercury UI оборачивает эту функцию в компонент `Portal`:

```tsx
import { createPortal } from "@fiberfx/hyperscript";
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { useUiEnvironment } from "@fiberfx/core";

export interface PortalProps {
  children: ComponentChildren;
  container?: HTMLElement | null;
}

export function Portal({ children, container }: PortalProps): ComponentChildren {
  const environment = useUiEnvironment();
  const host = container !== undefined ? container : environment.portalContainer;
  if (!host) return null;
  return createPortal(children, host);
}
```

Из положения портала следуют два правила:

- **Контекст следует дереву компонентов.** Потомки портала читают провайдеры над порталом, а не над контейнером.
- **События DOM следуют DOM.** События нативные, поэтому щелчок внутри портала всплывает через предков контейнера, а не через логических родителей портала.

`Portal` берёт целевой узел из ближайшего `EnvironmentProvider`, по умолчанию это `body` документа. Без узла, например при серверном рендеринге, ничего не отображается. `NavigationMenu`, `Combobox` и `CustomSelect` вызывают `createPortal` для панелей напрямую.

## memo

`memo(component)` возвращает компонент, который пропускает рендеринг, если новые свойства поверхностно равны прежним: каждый собственный ключ сравнивается через `!==`. Второй аргумент `comparer(prev, next)` заменяет это сравнение и возвращает `true`, когда свойства **равны**.

```tsx
import { memo } from "@fiberfx/hyperscript";

interface PriceProps {
  amount: number;
  currency: string;
}

function PriceView({ amount, currency }: PriceProps) {
  return <span class="price">{amount.toFixed(2)} {currency}</span>;
}

export const Price = memo(PriceView);
export const RoundedPrice = memo(PriceView, (prev, next) => Math.round(prev.amount) === Math.round(next.amount) && prev.currency === next.currency);
```

- **Изменённый `ref` всегда вызывает рендеринг**, независимо от результата сравнения; прежний ref сначала устанавливается в `null`.
- **Сравниваются только свойства.** Изменения состояния и контекста вызывают рендеринг обычным образом.
- **Имя обёртки отражает обёрнутый компонент:** её `displayName` — `Memo(PriceView)`.

`memo` полезен, только если свойства действительно остаются равными. Обычно это означает, что родитель передаёт значения, стабилизированные через `useMemo` и `useCallback`.

## cloneElement

`cloneElement(element, props?, ...children)` возвращает копию элемента, накладывая `props` на его собственные свойства. `key` или `ref` в `props` заменяют значения элемента; дочерние значения после `props` заменяют его содержимое.

`Slot` из Mercury UI использует это, чтобы отобразить единственного потомка вместо обёртки, объединив с ним свойства слота:

```tsx
export const Slot = function Slot({ children, ref: forwardedRef, ...internal }: SlotProps & { ref?: Ref<HTMLElement> }) {
  const child = isValidElement(children) && children.type !== Fragment ? (children as VNode<Record<string, unknown>>) : null;
  const childRef = child ? getElementRef(child) : undefined;
  const ref = useMemo(() => composeRefs<HTMLElement>(forwardedRef, childRef as Ref<HTMLElement> | undefined), [forwardedRef, childRef]);
  if (!child) {
    // Slot also reports a development diagnostic here (abridged).
    return null;
  }
  return cloneElement(child, { ...mergeSlotProps(internal, child.props), ref });
};
```

`Slot` сам объединяет две ссылки перед клонированием, потому что `ref`, переданный в `cloneElement`, заменяет собственную ссылку потомка.

## Чтение дочернего содержимого

`children` может быть одним значением, массивом, вложенными массивами или сочетанием с `null` и логическими значениями из условий. Две функции превращают это в удобную для обхода форму:

- **`toChildArray(children)`** разворачивает вложенность в один массив элементов, строк и чисел, удаляя `null`, `undefined`, `true` и `false`.
- **`isValidElement(value)`** возвращает true для элемента и сужает тип до `VNode`.

`Breadcrumbs` из Mercury UI так читает дочерние `Breadcrumb`, оставляет только элементы и задаёт каждому ключ из `id`, `key` или позиции:

```tsx
const items = toChildArray(children).filter((child): child is VNode<BreadcrumbProps> => isValidElement(child));
const keys = items.map((item, index) => String(item.props.id ?? item.key ?? index));
```
