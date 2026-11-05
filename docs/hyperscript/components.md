Every Mercury component comes down to two ideas: an element describes a piece of DOM, and a component is a function that returns elements. This chapter covers both, then mounts them.

## Elements

An element is a `VNode`: a plain object with a `type`, its `props` and an optional `key` and `ref`. The `type` is a tag name such as `"button"`, or a component. You build one with `h`, which is the same function as `createElement`:

```ts
import { h, render } from "@fiberfx/hyperscript";

const note = h("p", { class: "note" }, "Saved ", h("strong", null, "3"), " lessons.");

const app = document.getElementById("app");
if (app) render(note, app);
```

The arguments are the type, the props (or `null`), and any number of children after them. A child can be another element, a string, a number or a bigint; `true`, `false`, `null` and `undefined` render nothing, which is what lets you write `{ready && <Done />}`.

## JSX

You don't usually call `h` yourself: you write JSX, and the compiler turns each tag into a call to the automatic JSX runtime, `@fiberfx/hyperscript/jsx-runtime`. The Mercury packages set this once, in `fiberfx/tsconfig.base.json`:

```json
{ "compilerOptions": { "jsx": "preserve", "jsxImportSource": "@fiberfx/hyperscript" } }
```

That setting is for TypeScript and your editor. Under `mx` a file needs no pragma: the Hypercompiler fixes the runtime to `@fiberfx/hyperscript` and refuses any `@jsx` pragma comment ([compiling a module](/mx/compile)). With the import source set, a file doesn't import anything to use JSX: `jsx`, `jsxs` and `jsxDEV` are imported by the compiler's output, never by you.

## Function components

A function component takes its props and returns children. Here is Mercury UI's `Badge`, whole:

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

Three habits it shows:

- **Type the children `ComponentChildren`.** That is the type of anything a component may render: one child or an array of them.
- **Destructure the props and default them there.** A missing `variant` is `"negative"`.
- **Write `class`.** Hyperscript follows the DOM, so the attribute is `class`, not a renamed property. [The DOM contract](/hyperscript/dom) has the full list of rules.

A component's type is `FunctionComponent<P>`. Its props arrive as `RenderableProps<P>`, which adds `children`, `key` and `ref` to your own.

## Children, fragments and keys

A component returns one child, an array of them, or a `Fragment` that groups children without adding an element. In JSX, `<>…</>` is a `Fragment`.

When you render a list, give each item a `key`, so a re-render matches each new item to the element it rendered before. Mercury UI's `Checklist`:

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

The checklist's items never reorder, so their index is a stable key. A list that can reorder, insert or remove items needs a key from the item itself, such as its id. `key` never reaches the component as a prop: Hyperscript takes it out of the props when it builds the element.

## Refs

A ref gives you the DOM node an element rendered. `createRef()` makes one, `{ current: null }`, and the element's `ref` prop fills it after the node is in the DOM. A ref can also be a function, called with the node, and that function may return a cleanup function. Inside a component, `useRef` from the [hooks](/hyperscript/hooks) is the usual way to hold one.

A function component receives `ref` as an ordinary prop: Hyperscript takes `ref` out of the props only for an element whose type is a tag name. So a component forwards a ref by passing it on, as Mercury UI's `VisuallyHidden` does:

```tsx
export const VisuallyHidden = function VisuallyHidden(
  { class: classes, ref, ...rest }: VisuallyHiddenProps & { ref?: Ref<HTMLSpanElement> },
) {
  return <span ref={ref} class={cx("mx-visually-hidden", classes)} {...rest} />;
};
```

## Class components

`Component` is the base class for a component with its own instance. You implement `render(props, state, context)`, keep state in `this.state`, change it with `this.setState(update, callback?)`, and may add the lifecycle methods: `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`, `shouldComponentUpdate`, `getSnapshotBeforeUpdate` and `componentDidCatch`, among others.

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

Mercury UI's components are all functions with hooks; no component under `fiberfx/ui/src` extends `Component`.

## Mounting with render

`render(vnode, parent)` renders a tree into a DOM node. Call it again on the same parent and Hyperscript diffs the new tree against the one it rendered there last, changing only what differs. `render(null, parent)` removes what it rendered. A `Document` as the parent renders into its `documentElement`.

`hydrate(vnode, parent)` is `render` for a parent that already holds the server's HTML for that tree: it diffs the tree against the DOM already there instead of building it again. [HS4, Rendering on the server](/hyperscript/server), covers the pair.

## The client root

`@fiberfx/hyperscript/client` wraps both in a root object, for code that wants to hold its container once:

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

`root.render(children)` renders into the container, `root.unmount()` renders nothing into it, and `hydrateRoot(container, children)` hydrates the server's markup and returns the same kind of root.
