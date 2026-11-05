Live Mercury puts Mercury components on pages that Phoenix renders. The server writes one element and tells LiveView to leave it alone; a client hook mounts a Mercury hyperscript component into it, gives it the server's props, and keeps it current as the LiveView's assigns change.

## What Live Mercury is

An **island** is one element on a server-rendered page that a client component owns. Everything around it is HEEx; the island is Mercury hyperscript. LiveView never patches inside it, because the element carries `phx-update="ignore"`. The props travel in the element's attributes, and updates travel as patches over the LiveView socket the page already holds.

So a page reads without JavaScript, the server stays the owner of the data, and only the part that needs a client runs one.

## The two halves

| Half | Lives in | What it gives you |
|---|---|---|
| server | `echo/apps/live_mercury`, module `LiveMercury` | `mercury/1`, the function component that renders the island's element and its props |
| browser | `fiberfx/live-mercury`, package `@fiberfx/live-mercury` 4.0.0 | `getHooks` and `createMercuryHook` (the `MercuryHook` lifecycle), `useLiveMercury`, `Link`, and the patch codecs |

`@fiberfx/hyperscript` is a peer of the browser half, so an island renders with the page's one hyperscript runtime.

The KAN board is both halves at once. Its LiveView renders the island:

```elixir
def render(assigns) do
  ~H"""
  <EchdOSWeb.KanLayouts.nav active={:board} />
  <LiveMercury.mercury
    name="KanBoard"
    id="kan-board"
    socket={@socket}
    source={@source}
    now={@now}
    lanes={@lanes}
    rungs={@rungs}
    messages={@messages}
  />
  """
end
```

and its bundle registers the component under the same name and opens the socket:

```ts
const liveSocket = new LiveSocket("/live", Socket, {
  params: { _csrf_token: csrfToken },
  hooks: getHooks({ KanBoard, SeatsExplorer, SquadsExplorer, KanAdmin }) as never,
});
liveSocket.connect();
```

`name="KanBoard"` on the server and the `KanBoard` key in `getHooks`'s map are the one link between them.

## Two hosts in this repository

The course follows two real consumers, and they mount islands two ways:

- **echd_os's KAN views** (`kan_board_live.ex`, `kan_seats_live.ex`, `kan_squads_live.ex`, `kan_admin_live.ex`) render `<LiveMercury.mercury>`. One bundle, `kan.mjs`, registers four components with `getHooks` and opens the page's LiveSocket on `/live`.
- **EDU's course islands** render `EchoEduWeb.Island.island/1`, a host named `CourseIsland`. Each island is its own bundle; EDU's boot imports it by URL and hands LiveView's callbacks to the bundle's `hook`, which is Live Mercury's lifecycle built by `courseIsland(component)`.

Both end in the same lifecycle, `createMercuryHook`. They differ in where the props come from and in who imports the component.

## The course

- **LM0, [Islands](/live-mercury/islands):** what an island is, the element each host renders, and how the client mounts it.
- **LM1, [An island in a LiveView](/live-mercury/liveview):** the socket path, the hook's four callbacks, and events in both directions.
- **LM2, [Building islands with mx](/live-mercury/building):** `mx build --lib`, the five builds behind EDU's islands, and the image stage that has no Node.
- **LM3, [Props and streams](/live-mercury/props-and-streams):** `data-props-diff` and `data-streams-diff`, the compact patch format, `upsert`, `limit` and `$$<id>` paths.
- **LM4, [Server rendering](/live-mercury/server-rendering):** the `ssr` flag, off by default, `LiveMercury.SSR`, and why the client replaces server markup instead of hydrating it.
- **LM5, [Testing islands](/live-mercury/testing):** `LiveMercury.Test.get_mercury/2`, testing an island's events, the hook tests, and EDU's `check_hosts/3`.
- **LM6, the capstone, is planned:** an island in a LiveView built with no Node. It waits on epic 24's H3–H5 and on the KAN views' bundle leaving Vite, since `kan.mjs` is still built with pnpm and Vite today.

## What is shipped

EDU's islands are built by mx in the image, in a stage that checks there is no `node` on its PATH. The KAN views' bundle, `kan.mjs`, is not built there: it is committed in echd_os's `priv/static` and built outside the image, which [building](/live-mercury/building) shows. `@fiberfx/live-mercury` is version 4.0.0 in its `package.json`.
