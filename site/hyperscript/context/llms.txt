# Context, portals and memo — Mercury LMS

> HS3 of Mercury Hyperscript (`@fiberfx/hyperscript` 4.0.0). `createContext`, `createPortal`, `memo`, `cloneElement`, `toChildArray` and `isValidElement` come from the root entry; `useContext` comes from `./hooks`.

## Read this when

You pass a value down a tree, render an overlay outside its ancestors' DOM, skip renders with `memo`, or read or rewrite a component's `children`.

## The contract

- `createContext<T>(defaultValue: T): Context<T>`. `Context.Provider` (the context itself) takes `{ value, children }`. `Context.Consumer` takes `{ children: (value: T) => ComponentChildren }`. With no provider above, readers get `defaultValue`.
- A provider re-renders every reader when `value` is `!=` its previous value, through `shouldComponentUpdate` false and `memo`. Memoize object values with `useMemo`.
- Classes: `static contextType = Ctx`, read as `this.context`.
- `createPortal(children, container: ContainerNode): VNode`. Context follows the component tree; native DOM events bubble through the container's DOM. Mercury UI: `<Portal container?>` (from `@fiberfx/ui`) takes its host from `EnvironmentProvider`, and with no host renders nothing.
- `memo(component, comparer?)`: skips a render when the props are shallowly equal (`!==` per key). `comparer(prev, next)` returns `true` when they are EQUAL. A changed `ref` always renders. `displayName` is `Memo(Name)`.
- `cloneElement(vnode, props?, ...children): VNode`: props merge over the element's; `key`/`ref` in props replace its own; children passed replace its children.
- `toChildArray(children): Array<VNode | string | number>`: flattens and drops `null`, `undefined` and booleans. `isValidElement(x): x is VNode`.

## Minimal example

```tsx
import { createContext, createPortal, memo } from "@fiberfx/hyperscript";
import { useContext } from "@fiberfx/hyperscript/hooks";

const Tone = createContext<"neutral" | "danger">("neutral");

const Toast = memo(function Toast({ text }: { text: string }) {
  const tone = useContext(Tone);
  return createPortal(<div role="status" class={`toast toast--${tone}`}>{text}</div>, document.body);
});

export function Page() {
  return <Tone.Provider value="danger"><Toast text="Saved" /></Tone.Provider>;
}
```

## Never emit

- `memo` with a comparer that returns `true` to mean "changed": `true` means equal.
- A provider `value={{ … }}` object literal for a value that is read often: wrap it in `useMemo`.
- A `Children` helper object (`Children.map`, `Children.toArray`): it isn't exported; use `toChildArray`.
- `forwardRef`: a function component receives `ref` as a prop.

## Next

- Hooks: /hyperscript/hooks/llms.txt
- Rendering on the server: /hyperscript/server/llms.txt
- This companion: /hyperscript/context/llms.txt (the page as Markdown, `/hyperscript/context.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hyperscript/context)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hyperscript/llms.txt)
