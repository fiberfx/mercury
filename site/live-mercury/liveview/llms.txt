# An island in a LiveView: socket, hooks and events — Mercury LMS

> LM1. One LiveSocket per page; `MercuryHook`'s `mounted`/`updated`/`reconnected`/`destroyed`; props that follow the LiveView's assigns as patches; events up with `pushEvent` and down with `push_event` + `handleEvent`.

## Read this when

You connect an island to its LiveView: open the socket, send an event from the island, answer it on the server, or push a server event to one island.

## The contract

- Socket paths: echd_os `socket "/live"`; echo_edu `socket "/_edu/live"`, read by EDU's boot from `<meta name="edu-live-socket">` (else `"/live"`).
- One LiveSocket per page: `new LiveSocket(path, Socket, { params: { _csrf_token }, hooks })`. The import map points `@fiberfx/phoenix` and `@fiberfx/phoenix_live_view` at one served copy each.
- `updated()`: `data-use-diff="true"` → `applyPatch(props, data-props-diff)`, else full `data-props`; streams patched from `data-streams-diff`. `reconnected()`: full `data-props`, streams rebuilt from `{}`. `destroyed()`: `render(null)` and every `handleEvent` ref made through the hook removed.
- Each update publishes a new top-level props object; untouched nested values keep identity.
- Server side, `diff` on (default): only assigns LiveView marks changed are sent; a key with no old value → `replace /<key>`, else `Jsonpatch.diff` under `/<key>`.
- Hook functions (props, or `useLiveMercury()`; `null` outside an island): `pushEvent(event, payload?, onReply?)`, `pushEventTo(phxTarget, event, payload?, onReply?)`, `handleEvent(event, cb)` → ref, `removeHandleEvent(ref)`, `upload(name, files)`, `uploadTo(target, name, files)`.
- EDU server events: one name, `"edu:island"` (`SERVER_EVENT`), envelope `%{id, event, payload}`; filter with `isAddressedTo(payload, islandId)` from `@echd/edu-boot/island`.
- `Link`: `patch` → `data-phx-link="patch"`; `navigate` → `"redirect"` (same `live_session`); `replace` → `data-phx-link-state="replace"`; `href` alone → plain link.

## Minimal example

```tsx
import { useEffect } from "@fiberfx/hyperscript/hooks";
import { useLiveMercury } from "@fiberfx/live-mercury";
import { isAddressedTo, SERVER_EVENT } from "@echd/edu-boot/island";

export function Ping(props: { islandId?: string }) {
  const live = useLiveMercury();
  const handleEvent = live?.handleEvent;
  const removeHandleEvent = live?.removeHandleEvent;
  const islandId = props.islandId ?? "";
  useEffect(() => {
    if (!handleEvent || !removeHandleEvent) return;
    const ref = handleEvent(SERVER_EVENT, (payload) => {
      if (isAddressedTo(payload, islandId)) console.log(payload.event, payload.payload);
    });
    return () => removeHandleEvent(ref);
  }, [handleEvent, removeHandleEvent, islandId]);
  return <button type="button" onClick={() => live?.pushEvent("demo:clicked", { count: 1 })}>Ping</button>;
}
```

```elixir
def handle_event("demo:clicked", %{"count" => count}, socket) do
  {:noreply, push_event(socket, "edu:island", %{id: "island-demo", event: "ack", payload: %{count: count}})}
end
```

## Never emit

A second `new LiveSocket(...)` on a page that already has one; `phx-update` other than `"ignore"` on an island; an import from `react`.

## Next

- LM2, building islands with mx: /live-mercury/building (/live-mercury/building/llms.txt)
- Back: /live-mercury/islands/llms.txt
- This companion: /live-mercury/liveview/llms.txt

## Navigation

- [Read this page in the browser](/live-mercury/liveview)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/live-mercury/llms.txt)
