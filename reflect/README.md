<!-- Published by scripts/package_readmes.py from fiberfx/reflect/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# Mercury Reflect

`@fiberfx/reflect` binds [Hypergraph](../hypergraph) models to [Hyperscript](../hyperscript) views. A view stays an
ordinary component; Reflect supplies its reactive props, scoped callbacks and composition.

```tsx
import {event, store} from "@fiberfx/hypergraph";
import {reflect} from "@fiberfx/reflect";
import {Input} from "@fiberfx/ui";

const nameChanged = event<string>();
const $name = store("").on(nameChanged, (_, name) => name);

const Name = reflect({
  view: Input,
  bind: {
    value: $name,
    onInput: (event: Event) => nameChanged((event.currentTarget as HTMLInputElement).value),
  },
});
```

Use the control's actual callback shape. Mercury Input's `onInput` receives a native event; Checkbox's `onChange`
receives a boolean. Reflect does not reinterpret arguments. A function in `bind` runs in the nearest
`Provider` from `@fiberfx/hypergraph/hyperscript`. Render under that Provider to isolate a page or request;
`setScopeMode("required")` in the shared binding refuses accidental fallback outside a scope.

If an action takes no payload, bind `onClick: () => submitted()` (or prepend an explicit argument mapper).
An event that expects a string is not a native event handler merely because both are callable.

| Mercury control | Bound callback | Payload |
|---|---|---|
| Input | `onInput: changed.prepend((e: Event) => (e.currentTarget as HTMLInputElement).value)` | Native input event |
| Textarea | `onInput: changed.prepend((e: Event) => (e.currentTarget as HTMLTextAreaElement).value)` | Native textarea event |
| Select | `onChange: changed.prepend((e: Event) => (e.currentTarget as HTMLSelectElement).value)` | Native select event |
| Checkbox, Switch | `onChange: event<boolean>()` | Boolean checked state |
| Radio | `onChange: event<string>()` | The radio's string value |
| Toggle | `onPressedChange: event<boolean>()` | Boolean pressed state |

| Operator | Result |
|---|---|
| `reflect({view, bind, mapProps?, hooks?})` | A component with reactive stores, scoped callbacks and bound defaults |
| `createReflect(view)(bind, options?)` | The same binding with its view fixed |
| `variant({source, cases, default?, ...})` | The component named by a string store; unknown cases use the fallback |
| `variant({if, then, else?, ...})` | A boolean choice, with the same bindings, mappings and hooks |
| `list({source, view, getKey?, mapItem?, bind?, mapProps?, hooks?})` | Keyed reflected rows from an array store |
| `fromTag(tag)` | A view of one native element, retaining the known tag's prop types |

## Derived props

`mapProps` accepts a store, an object of stores, or a tuple of stores. Its function receives resolved values and
the bound/incoming props. Source types are inferred. It does not create graph nodes while rendering.

```tsx
const Label = reflect({
  view: (props: {prefix: string; text: string}) => <span>{props.text}</span>,
  bind: {prefix: "Name"},
  mapProps: {
    text: {source: $name, fn: (name, props) => `${props.prefix}: ${name}`},
  },
});
// <Label prefix="Account" /> derives text; <Label text="Override" /> skips its projection.
```

Explicit instance props win, including an explicit `undefined`. A prop cannot be both bound and mapped.
This includes spread objects: `<Label {...{text: undefined}} />` clears the default and skips its projection.
Omit that key when you want the bound or derived value to remain active.
Each projection sees the same bound/incoming props, not the outputs of other projections; mapped keys are
therefore optional in that input type. Projections must be
pure and synchronous; put effects in the model. Returned function values are ordinary props: use `bind` for a
scope-bound callback. Ref, children, class, style and event props follow the view's native contract; Reflect
does not merge classes or chain an overridden event handler.

Only definitely present defaults make a required view prop optional. An annotated binding such as
`{title?: string}` still requires the caller to provide `title`; use `satisfies BindProps<Props>` when you want
validation without erasing which keys your literal supplies. Union views retain each branch's required fields.
A default discriminator only supplies the compatible branch; selecting another branch requires an explicit
override. A dynamic or mapped discriminator conservatively requires an explicit branch choice.

## Collections

```tsx
const $items = store([{id: "first", title: "Read the contract"}]);
const Item = (props: {label: string}) => <li>{props.label}</li>;

const Items = list({
  source: $items,
  view: Item,
  getKey: item => item.id,
  mapItem: {label: (item, index) => `${index + 1}. ${item.title}`},
});
```

Use a stable `getKey` when rows insert, remove or reorder. The same key preserves the row's component, DOM and
local state; its current item and index still update. Duplicate keys, non-finite numeric keys and non-array
state refuse. With no `getKey`, positions identify rows; choose that only when positional identity is intended.

The source may hold a readonly array: Reflect never mutates the collection. Without `mapItem`, every possible
object item type must supply the required row props. With it, its mapping replaces those item props and must supply
every required prop not provided by `bind` or `mapProps`. Row props override bound defaults. A key cannot be in
both `mapItem` and `mapProps`. Functions produced by `mapItem` run in the current Provider's scope, including
after Provider replacement. Compose loading, error and empty views with `variant`.

`mapItem` takes a single view-prop shape. For a discriminated union view, pass complete object items directly,
or adapt the view to receive the correlated union in one `item` prop. Independent per-field mappers cannot
prove that a discriminator and its payload agree.

## Custom components without a slot descriptor

Use a normal component prop for a replaceable part. Keep its constructor in a registry outside render and
store the selection's identifier. `mapProps` returns the selected component unchanged; an empty source object
means the projection depends only on the row's incoming props.

```tsx
import type {ComponentType} from "@fiberfx/hyperscript";
import {store} from "@fiberfx/hypergraph";
import {list} from "@fiberfx/reflect";
import {CompactRow, DetailedRow} from "./rows"; // Your application components.

type Item = {id: string; kind: "compact" | "detailed"; label: string};
type LeafProps = {item: Item};
const rowViews: Record<Item["kind"], ComponentType<LeafProps>> = {
  compact: CompactRow,
  detailed: DetailedRow,
};
const $items = store<Item[]>([{id: "first", kind: "compact", label: "Read the contract"}]);
const Row = ({item, RowView}: {item: Item; RowView: ComponentType<LeafProps>}) => <RowView item={item} />;
const Rows = list({
  source: $items,
  view: Row,
  getKey: item => item.id,
  mapItem: {item: item => item},
  mapProps: {
    RowView: {source: {}, fn: (_, props) => rowViews[props.item.kind]},
  },
});
```

Function and class components both work. A stable row key **and the same selected constructor** preserve the
child's DOM and local state through reorder and replacement item objects. Selecting a different constructor
intentionally replaces that child and resets its local state. Do not create a new component function inside
the projection. Validate untrusted identifiers before lookup; use an explicit fallback or reject unknown
names with an own-property check, rather than accepting inherited names such as `constructor`.

For one choice shared by all rows, use `source: $rowKind, fn: kind => rowViews[kind]` instead. A projected
component reads context where it is rendered, so a nested Hypergraph `Provider` governs its own `useUnit`
actions. Passing a callback already bound by an outer Reflect view does not rebind it to the nested scope.

The distinction is intentional: plain functions in `bind` and `mapItem` are scope-bound actions; functions
returned by `mapProps` are values. Use projections for component constructors or callback refs whose exact
identity matters. A stable projected ref does not detach merely because its keyed row moves. An event or
effect returned by a projection also keeps its identity and methods, but is **not** scope-bound; use `bind`
or the rendered component's `useUnit` for actions. Keep these callable values out of serialized item data.

## Lifecycle and server rendering

`hooks.mounted` receives resolved props after mount; `hooks.unmounted` receives the props captured at that mount.
Each hook may be a callback, event or effect. Hooks are scoped, do not run during server rendering, and do not
rerun merely because an existing row moves. A scope replacement releases the previous hook lifetime and starts
the next one. These are the existing hook semantics; resource lifecycle descriptors, selectors, named slots and
preset APIs in the customization plan are proposals, not exports of this foundation.

## Build and verification

Peers are `@fiberfx/hypergraph` and `@fiberfx/hyperscript` at the same Mercury version. Development uses the mx
workspace. Runtime compilation is a direct native command; there is no Node build wrapper:

```sh
MXWORK=off mx build --lib src/index.ts --out dist/index.js \
  --external @fiberfx/hypergraph --external @fiberfx/hyperscript \
  --require-export reflect --require-export createReflect --require-export list \
  --require-export variant --require-export fromTag
```

This command builds JavaScript only. A complete package build, including native declaration emission and public
entry verification, awaits the native library-build capability owned by mx-mercury. No package `build` script
is registered until that capability is qualified. Do not add a Node or TypeScript-emitter wrapper as a substitute.

Run `mx test` for real-browser behavior and `tsc -p tsconfig.types.json` for independent positive/negative consumer
type checks; that check does not produce release artifacts.
Native `mx pack` packs Reflect together with its built peers; building the runtime alone does not establish a
complete release. See the agent contract and [the source notice](NOTICE.txt).
