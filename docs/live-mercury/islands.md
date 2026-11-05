An island is one element of a server-rendered page that a client component owns. This lesson takes the element apart: what the server writes, what the client reads, and what happens when the two disagree.

## What an island is

Three things make an element an island:

- **`phx-update="ignore"`.** LiveView patches the page around the element and never inside it, so what the component renders survives every LiveView update.
- **`phx-hook`.** LiveView calls the named hook's `mounted`, `updated`, `reconnected` and `destroyed` with the element as `this.el`. The hook is where the component mounts.
- **The props on the element.** The component's input is written into the element by the server, so the first render needs no request of its own.

This repository has two hosts that make such an element: `LiveMercury.mercury/1`, whose hook is `MercuryHook`, and EDU's `EchoEduWeb.Island.island/1`, whose hook is `CourseIsland`.

## The LiveView host, LiveMercury.mercury/1

`mercury/1` is a function component. Every assign is a prop except the reserved ones:

| Assign | What it does |
|---|---|
| `name` | the component's name in the client's `getHooks` map; required |
| `id` | the element's id; when omitted, `"<name>-<n>"` from a counter in the LiveView process |
| `class` | classes for the element |
| `ssr` | server-render the first, dead render; defaults to `config :live_mercury, :ssr`, which is `false` |
| `diff` | send changed props as a patch; defaults to `config :live_mercury, :enable_props_diff`, `true` |
| `socket` | only decides whether the very first render is dead |

An assign holding a stream made with `Phoenix.LiveView.stream/4` is sent as a stream, not a prop, and the default `:inner_block` slot is passed to the component as its children. Props are encoded with the `LiveMercury.Encoder` protocol: plain maps, lists and primitives work as they are; a struct needs a protocol implementation, derived with `@derive` or written explicitly.

```elixir
~H"""
<.mercury name="Card" title={@title}>
  <p>Rendered by LiveView, passed to the component as children.</p>
</.mercury>
"""
```

The element it renders carries everything the client needs:

- `data-name`: the component's name;
- `data-props`: the full props, as compact JSON;
- `data-props-diff` and `data-use-diff`: the changed props as a patch, and whether the client should read it;
- `data-streams-diff`: the streams' changes as a patch;
- `data-slots`: the default slot's HTML;
- `data-ssr`: whether the element already holds a server render;
- `phx-update="ignore"` and `phx-hook="MercuryHook"`.

## How the client mounts it

The page's bundle registers its components by name:

```ts
import { getHooks } from "@fiberfx/live-mercury";

const hooks = getHooks({ KanBoard, SeatsExplorer, SquadsExplorer, KanAdmin });
```

`getHooks(components)` returns `{ MercuryHook }`. When LiveView mounts the element, the hook reads `data-name`, finds `components[name]` and renders it:

1. The props are `data-props`, decoded with `decodeCompactJson` (`{}` when the attribute is absent). The streams start from `data-streams-diff`, applied to an empty object.
2. The component receives one props object: the props, then the streams, then the hook's six functions (`pushEvent`, `pushEventTo`, `handleEvent`, `removeHandleEvent`, `upload`, `uploadTo`). The slot's HTML, if any, is its child.
3. It renders inside `LiveMercuryProvider`, so any component below it can reach the same functions with `useLiveMercury()`.
4. With `data-ssr` set, the first paint clears the server's markup and renders afresh. There is no hydration.

`getHooks` is a map in front of `createMercuryHook(resolve)`, which takes any function from the element to its component, or to a promise of it. A component that arrives late still sees every update that came first: the props and streams keep applying, and its first render shows them as they stand.

## The EDU host, EchoEduWeb.Island.island/1

EDU's pages load each island as its own bundle, by URL. Its host takes three attributes, `id` and `bundle` (both required) and `props` (a map, `%{}` by default), and a slot for the server render:

```elixir
~H"""
<.island id={@island_id} bundle={@bundle} props={%{title: "The demo island"}}>
  <p class="mx-text mx-text--muted">The island mounts here when JavaScript runs.</p>
</.island>
"""
```

It renders `phx-hook="CourseIsland"`, `phx-update="ignore"` and `data-bundle`, and puts the props in a `<script type="application/json">` first child rather than an attribute. `props_json/1` writes every `<` as `\u003c`, so a value can never close the script element. The slot stays inside the element, so the page reads without JavaScript.

The bundle meets the boot through two exports:

```ts
import { courseIsland } from "@echd/edu-boot/island";
import { DemoIsland } from "./DemoIsland";

export default DemoIsland;

export const hook = courseIsland(DemoIsland);
```

EDU's boot, `edu-boot.js`, defines `CourseIsland`. On `mounted` it imports the URL in `data-bundle`, checks that the module's `hook` has the four callbacks, sets the server render aside (all but the props child), and calls the bundle's `hook.mounted`. On `destroyed` it calls the bundle's hook and puts the server render back.

`courseIsland(component)` is `createMercuryHook` with EDU's rules: it reads the JSON child once, renders the component inside a `data-island-root` element, and passes it the hook's functions, the props, and `islandId`, the element's id. EDU's props win over any key Live Mercury carries.

## When an island cannot mount

The two hosts report failure differently.

- **`MercuryHook`** throws: `"the island has no data-name attribute"` when the element has none, or `getHooks's map has no component named "<name>"`. A component that was a promise and rejected is logged to the console.
- **`CourseIsland`** writes a code to the element's `data-island-error` and logs it: `no-bundle` (no `data-bundle`), `import` (the bundle did not load), `no-hook` (no valid `hook` export), `props` (the JSON child does not parse) or `render` (the bundle's `mounted` threw). On `props` and `render` the server render is put back.

EDU also checks hosts at build time. `EchoEduWeb.Island.check_hosts/3`, which `mix edu.gen` uses, requires that each `CourseIsland` host lies in the body, has an id no other element has, carries `phx-update="ignore"` and a `data-bundle` that is a path or an http(s) URL, and has a JSON script first child that parses and holds no raw `<`.

## Which host to use

| | `LiveMercury.mercury/1` | `EchoEduWeb.Island.island/1` |
|---|---|---|
| hook | `MercuryHook` | `CourseIsland` |
| component found by | `data-name`, in the page bundle's `getHooks` map | `data-bundle`, a URL the boot imports |
| props | `data-props`, updated by patches as assigns change | a JSON child, read once at mount |
| server render | `ssr`, off by default; cleared at first paint | the slot, kept until the island mounts and restored after |
| in this repository | echd_os's four KAN views | the demo island, and the KAN course's pages under `html/kan`, which write the same host in HTML |

Use `mercury/1` when the island's props follow a LiveView's assigns. Use EDU's host for a self-contained island on a course page, whose props are fixed when the page renders and whose events go through the page's LiveView, as the [next lesson](/live-mercury/liveview) shows.
