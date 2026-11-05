The [hooks](/hyperscript/hooks) chapter read a context with `useContext`. This chapter makes one, and then covers the root entry's other tree tools: portals, `memo`, and the helpers that read and rewrite children.

## Context

`createContext(defaultValue)` makes a context. A component below its `Provider` reads the provider's `value`; a component with no provider above it reads `defaultValue`.

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

The context object is itself the provider: `DensityContext.Provider` is `DensityContext`. It also has a `Consumer`, which takes a function as its child and calls it with the value. It is the same read as `useContext`, written in the tree:

```tsx
<DensityContext.Consumer>{(density) => <span>{density}</span>}</DensityContext.Consumer>
```

Mercury UI reads its contexts, such as `UiEnvironmentContext` from `@fiberfx/core` and its forms' `FormRegistryContext`, with `useContext`. No file under `fiberfx/ui/src` or `fiberfx/core/src` uses a `Consumer`.

## When readers render again

A provider remembers its readers. When it renders with a `value` that is not equal (`!=`) to the one before, every reader renders again, even if a component between them returned `false` from `shouldComponentUpdate` or is wrapped in `memo`. A provider whose value didn't change wakes nobody.

So a provider's value should keep its identity while its contents stay the same. A value written as an object literal, `value={{ density, setDensity }}`, is a new object on every render, and it renders every reader each time. Build it with `useMemo`, as Mercury UI's `EnvironmentProvider` does with its merged environment.

## Context in a class

A class component reads one context through its static `contextType`: the value is `this.context`, from the nearest provider or else the default.

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

## Portals

`createPortal(children, container)` renders `children` into `container`, a DOM node anywhere on the page, and leaves them in the component tree where the portal was rendered. Use it when a floating surface, such as a popover, a menu or a dialog, has to escape an ancestor's `overflow` or stacking context.

Mercury UI wraps it in its `Portal` component:

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

Two rules follow from where the portal sits:

- **Context follows the component tree.** The portal's children read the providers above the portal, not the providers above the container.
- **DOM events follow the DOM.** Events are native, so a click inside the portal bubbles through the container's ancestors, not through the portal's logical parents.

`Portal` takes its host from the nearest `EnvironmentProvider`, which defaults to the document's `body`. With no host, as in a server render, it renders nothing. `NavigationMenu`, `Combobox` and `CustomSelect` call `createPortal` directly for their panels.

## memo

`memo(component)` returns a component that skips rendering when its new props are shallowly equal to the last ones: every own key compared with `!==`. A second argument, `comparer(prev, next)`, replaces that comparison and returns `true` when the props are **equal**.

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

- **A changed `ref` always renders**, whatever the comparer says, and the old ref is set to `null` first.
- **It only compares props.** State, and a context that changes, render the component as usual.
- **The wrapper is named for what it wraps:** its `displayName` is `Memo(PriceView)`.

`memo` pays only when the props really stay equal, which usually means the parent passes values kept stable with `useMemo` and `useCallback`.

## cloneElement

`cloneElement(element, props?, ...children)` returns a copy of an element with `props` merged over its own. A `key` or `ref` in `props` replaces the element's, and children passed after `props` replace its children.

Mercury UI's `Slot` uses it to render its one child in place of a wrapper, with the slot's props merged onto it:

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

`Slot` composes the two refs itself before cloning, because a `ref` given to `cloneElement` replaces the child's own.

## Reading children

`children` can be one child, an array, nested arrays, or a mix with `null` and booleans from conditions. Two helpers make it something you can loop over:

- **`toChildArray(children)`** flattens it into one array of elements, strings and numbers, and drops `null`, `undefined`, `true` and `false`.
- **`isValidElement(value)`** is true for an element, and narrows the type to `VNode`.

Mercury UI's `Breadcrumbs` reads its `Breadcrumb` children this way, keeps only elements, and keys each by its `id`, its `key`, or its position:

```tsx
const items = toChildArray(children).filter((child): child is VNode<BreadcrumbProps> => isValidElement(child));
const keys = items.map((item, index) => String(item.props.id ?? item.key ?? index));
```
