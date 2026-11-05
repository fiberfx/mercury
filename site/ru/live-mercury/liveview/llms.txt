# Остров в LiveView: сокет, хуки и события — Mercury LMS

> LM1. Один LiveSocket на страницу; `MercuryHook` и его `mounted`/`updated`/`reconnected`/`destroyed`; свойства следуют за assigns LiveView через патчи; события на сервер через `pushEvent`, с сервера через `push_event` + `handleEvent`.

## Когда читать

Когда вы связываете остров с его LiveView: открываете сокет, отправляете событие из острова, отвечаете на сервере или направляете серверное событие одному острову.

## Контракт

- Пути сокетов: echd_os — `socket "/live"`; echo_edu — `socket "/_edu/live"`, загрузчик EDU читает его из `<meta name="edu-live-socket">` (иначе `"/live"`).
- Один LiveSocket на страницу: `new LiveSocket(path, Socket, { params: { _csrf_token }, hooks })`. Карта импортов направляет `@fiberfx/phoenix` и `@fiberfx/phoenix_live_view` на одну обслуживаемую копию каждого пакета.
- `updated()`: `data-use-diff="true"` → `applyPatch(props, data-props-diff)`, иначе полные `data-props`; патчи потоков из `data-streams-diff`. `reconnected()`: полные `data-props`, потоки строятся заново из `{}`. `destroyed()`: `render(null)` и удаление каждой ссылки `handleEvent`, созданной через хук.
- Каждое обновление создаёт новый объект свойств верхнего уровня; незатронутые вложенные значения сохраняют идентичность.
- На сервере при включённом `diff` (по умолчанию) отправляются только assigns, помеченные LiveView как изменённые; ключ без старого значения → `replace /<key>`, иначе `Jsonpatch.diff` под `/<key>`.
- Функции хука (свойства либо `useLiveMercury()`; вне острова `null`): `pushEvent(event, payload?, onReply?)`, `pushEventTo(phxTarget, event, payload?, onReply?)`, `handleEvent(event, cb)` → ссылка, `removeHandleEvent(ref)`, `upload(name, files)`, `uploadTo(target, name, files)`.
- Серверные события EDU: одно имя, `"edu:island"` (`SERVER_EVENT`), сообщение `%{id, event, payload}`; фильтрация через `isAddressedTo(payload, islandId)` из `@echd/edu-boot/island`.
- `Link`: `patch` → `data-phx-link="patch"`; `navigate` → `"redirect"` (та же `live_session`); `replace` → `data-phx-link-state="replace"`; только `href` → обычная ссылка.

## Минимальный пример

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

## Не выдавать

Второй `new LiveSocket(...)` на странице, где он уже есть; `phx-update` со значением, отличным от `"ignore"`, на острове; импорт из `react`.

## Дальше

- LM2, сборка островов через mx: /ru/live-mercury/building (/ru/live-mercury/building/llms.txt)
- Назад: /ru/live-mercury/islands/llms.txt
- Эта текстовая версия: /ru/live-mercury/liveview/llms.txt

## Навигация

- [Страница в браузере](/ru/live-mercury/liveview)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/live-mercury/llms.txt)
