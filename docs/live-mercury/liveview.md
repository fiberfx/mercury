An island in a LiveView is a hook instance. LiveView owns the socket, the element and the timing; the island owns what renders inside the element and talks to the LiveView through the hook's functions. This lesson follows the two real pages: echd_os's KAN board and EDU's demo island.

## One LiveSocket, one path

Each endpoint mounts the LiveView socket at its own path, and the page's boot opens exactly one `LiveSocket` on it:

| App | Endpoint | Boot |
|---|---|---|
| echd_os | `socket "/live", Phoenix.LiveView.Socket` | `kan.mjs`: `new LiveSocket("/live", Socket, …)` |
| echo_edu | `socket "/_edu/live", Phoenix.LiveView.Socket` | `edu-boot.js`: the path from `<meta name="edu-live-socket">`, else `"/live"` |

```ts
const csrfToken = document.querySelector<HTMLMetaElement>("meta[name='csrf-token']")?.getAttribute("content") ?? "";

const liveSocket = new LiveSocket("/live", Socket, {
  params: { _csrf_token: csrfToken },
  hooks: getHooks({ KanBoard, SeatsExplorer, SquadsExplorer, KanAdmin }) as never,
});
liveSocket.connect();
window.liveSocket = liveSocket;
```

The page holds one Socket because every module on it imports `@fiberfx/phoenix` and `@fiberfx/phoenix_live_view` by bare name, and the page's import map points both names at one served copy. EDU's `Island.head/1` writes that head for a course page: the socket path meta, the two module preloads, the import map, and `edu-boot.js` as one module script.

EDU's boot registers a single hook, `CourseIsland`, and hands each callback to the bundle's own hook. The KAN bundle registers `MercuryHook` directly through `getHooks`.

## The hook's four callbacks

`MercuryHook` implements the four callbacks LiveView calls, each with the hook instance as `this` and the island's element as `this.el`:

- **`mounted()`** finds the component, decodes the props and streams, and paints.
- **`updated()`** runs after LiveView re-renders the element's attributes. With `data-use-diff="true"` it applies `data-props-diff` to the props it holds; otherwise it reads `data-props` in full. It applies `data-streams-diff` to the streams and paints again.
- **`reconnected()`** reads `data-props` in full and rebuilds the streams from scratch. After a reconnect the LiveView process is fresh, so a diff would be empty however far the state moved; the full snapshot is current.
- **`destroyed()`** renders `null` into the element at once and removes every `handleEvent` subscription the island made through the hook, so nothing reaches a component that is gone.

Each paint publishes a new top-level props object. A component can compare props by identity to know an update arrived, while a nested value on a path no patch touched keeps its identity.

## Props that follow the assigns

The KAN board's LiveView never talks to the island directly. It assigns, and `mercury/1` sends what changed:

```elixir
@impl true
def mount(_params, _session, socket) do
  snap = if connected?(socket), do: Feed.subscribe(), else: Feed.snapshot()
  {:ok, socket |> assign(page_title: "Kanboard") |> put_snapshot(snap)}
end

@impl true
def handle_info({:kan_feed, snap}, socket), do: {:noreply, put_snapshot(socket, snap)}
```

When `put_snapshot/2` assigns new `lanes`, `rungs` or `messages`, LiveView re-renders `<LiveMercury.mercury name="KanBoard" …>`. With `diff` on, the default, `mercury/1` takes only the assigns LiveView marks changed and writes them as a JSON Patch into `data-props-diff`: a `replace` at `/<key>` when there is no old value to compare, otherwise `Jsonpatch.diff` of the old and new value under `/<key>`. The hook's `updated()` applies it. [LM3](/live-mercury/props-and-streams) covers the patch format and streams.

## Events to the server, pushEvent

The hook's functions reach the component two ways: as props, and through `useLiveMercury()` for any component below the island. Outside an island `useLiveMercury()` returns `null`.

| Function | Signature |
|---|---|
| `pushEvent` | `(event, payload?, onReply?)` |
| `pushEventTo` | `(phxTarget, event, payload?, onReply?)` |
| `handleEvent` | `(event, callback)`, returns a ref |
| `removeHandleEvent` | `(ref)` |
| `upload` | `(name, files)` |
| `uploadTo` | `(target, name, files)` |

The KAN board reads `pushEvent` from its props and sends `refresh`:

```tsx
const push = props.pushEvent;
const refresh = push ? () => void push("refresh", {}) : undefined;
```

and its LiveView handles it like any LiveView event:

```elixir
@impl true
def handle_event("refresh", _params, socket) do
  Feed.refresh()
  {:noreply, socket}
end
```

The new snapshot comes back the way every update does: `Feed` sends `{:kan_feed, snap}`, `handle_info/2` assigns, and the island's props follow.

## Events from the server, push_event

When the server must address the island itself, not its props, it pushes an event. EDU's demo island is the whole round trip. Its component pushes a click and listens for one event name:

```tsx
const live = useLiveMercury();
const handleEvent = live?.handleEvent;
const removeHandleEvent = live?.removeHandleEvent;
const islandId = props.islandId ?? "";
useEffect(() => {
  if (!handleEvent || !removeHandleEvent) return;
  const ref = handleEvent(SERVER_EVENT, (payload) => {
    if (isAddressedTo(payload, islandId)) setLastEvent({ event: payload.event, payload: payload.payload });
  });
  return () => removeHandleEvent(ref);
}, [handleEvent, removeHandleEvent, islandId]);

const click = () => {
  const next = count + 1;
  setCount(next);
  live?.pushEvent("demo:clicked", { count: next });
};
```

The LiveView answers with `push_event/3`:

```elixir
@impl true
def handle_event("demo:clicked", %{"count" => count}, socket) do
  socket =
    socket
    |> assign(clicks: count)
    |> push_event("edu:island", %{id: @island_id, event: "ack", payload: %{count: count}})

  {:noreply, socket}
end
```

EDU's pages push one event name, `"edu:island"` (`SERVER_EVENT`), with an envelope `{id, event, payload}`. Every island on the page receives it, so each keeps only the envelopes that name its own element: `isAddressedTo(payload, id)` is true when `payload.id` equals a non-empty id and `payload.event` is a string. The island learns its id from the `islandId` prop that `courseIsland` passes.

Unsubscribe in the effect's cleanup, as above. If a component does not, `destroyed()` still removes every subscription made through the island's hook.

## Links between LiveViews

`Link` renders an anchor with LiveView's link attributes, so navigation from inside an island goes through the LiveSocket:

| Props | Renders |
|---|---|
| `href` only | a plain `href`: the browser loads the page |
| `patch` | `data-phx-link="patch"`: the current LiveView's `handle_params/3` runs |
| `navigate` | `data-phx-link="redirect"`: another LiveView in the same `live_session` |
| `replace` | `data-phx-link-state="replace"` instead of `"push"` |

The four KAN views share one `live_session :kan` in echd_os's router (`/kan`, `/kan/seats`, `/kan/squads`, `/kan/admin`), so a link from one island to another view can use `navigate`:

```tsx
import { Link } from "@fiberfx/live-mercury";

const toSeats = <Link navigate="/kan/seats">Seats</Link>;
```
