# Islands: the element and its mount — Mercury LMS

> LM0. An island is one server-rendered element with `phx-update="ignore"` and a `phx-hook`, into which a Mercury hyperscript component mounts. Two hosts: `LiveMercury.mercury/1` (hook `MercuryHook`, component by name) and `EchoEduWeb.Island.island/1` (hook `CourseIsland`, component by bundle URL).

## Read this when

You render an island from HEEx, register its component on the client, or debug an island that does not mount.

## The contract

- `<.mercury name="X" ...>` (`import LiveMercury`). Reserved assigns: `name` (required), `id` (default `"X-<n>"`, per-process counter), `class`, `ssr` (default `config :live_mercury, :ssr`, `false`), `diff` (default `:enable_props_diff`, `true`), `socket` (only decides the first render is dead). Every other assign is a prop; a `%Phoenix.LiveView.LiveStream{}` assign is a stream; the default `:inner_block` slot becomes `children`. Props encode via the `LiveMercury.Encoder` protocol.
- Element attributes: `data-name`, `data-props` (compact JSON), `data-props-diff`, `data-use-diff`, `data-streams-diff`, `data-slots` (base64 default slot), `data-ssr`, `phx-update="ignore"`, `phx-hook="MercuryHook"`.
- Client: `getHooks(components)` → `{ MercuryHook }`; `createMercuryHook(resolve)` takes `el => Component | Promise<Component>`. The component gets `{...props, ...streams, pushEvent, pushEventTo, handleEvent, removeHandleEvent, upload, uploadTo}` and the slot as a child, inside `LiveMercuryProvider`. With `data-ssr`, the first paint clears the server markup (no hydration).
- EDU: `<.island id bundle props>`; `id` and `bundle` required, `props` a map (default `%{}`), slot = the server render, kept until mount and restored at `destroyed`. Props go in a `<script type="application/json">` first child, `<` written as `\u003c`. URL: `EchoEduWeb.Island.bundle_url(name)` → `/_edu/assets/edu-island-<name>.js`.
- An EDU bundle exports `default` (its component) and `hook = courseIsland(Component)` from `@echd/edu-boot/island`. Its component also gets `islandId`, the element's id; EDU's props win over Live Mercury's keys.

## Minimal example

```ts
import { courseIsland } from "@echd/edu-boot/island";
import { DemoIsland } from "./DemoIsland";

export default DemoIsland;
export const hook = courseIsland(DemoIsland);
```

## Errors

- `MercuryHook` throws when the element has no `data-name`, or when `getHooks`'s map has no component of that name.
- `CourseIsland` writes `data-island-error`: `no-bundle`, `import`, `no-hook`, `props` (JSON child does not parse), `render` (the bundle's `mounted` threw). Success sets `data-island-mounted="true"`.
- Build time: `EchoEduWeb.Island.check_hosts/3` (run by `mix edu.gen`) refuses a `CourseIsland` host outside the body, without a unique id, without `phx-update="ignore"`, with a `data-bundle` that is not a path or http(s) URL, or without a parsing JSON first child.

## Never emit

`phx-hook="ReactHook"`, or an import from `react`. A `<.mercury>` without `name`.

## Next

- LM1, the island in a LiveView: /live-mercury/liveview (/live-mercury/liveview/llms.txt)
- This companion: /live-mercury/islands/llms.txt

## Navigation

- [Read this page in the browser](/live-mercury/islands)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/live-mercury/llms.txt)
