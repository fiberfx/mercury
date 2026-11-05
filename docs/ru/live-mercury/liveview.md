Остров внутри LiveView — экземпляр хука. LiveView управляет сокетом, элементом и моментами вызова; остров управляет содержимым элемента и обращается к LiveView через функции хука. Урок рассматривает две реальные страницы: доску KAN в echd_os и демоостров EDU.

## Один LiveSocket, один путь

Каждый endpoint размещает сокет LiveView по своему пути, а загрузчик страницы открывает по нему ровно один `LiveSocket`:

| Приложение | Endpoint | Загрузчик |
|---|---|---|
| echd_os | `socket "/live", Phoenix.LiveView.Socket` | `kan.mjs`: `new LiveSocket("/live", Socket, …)` |
| echo_edu | `socket "/_edu/live", Phoenix.LiveView.Socket` | `edu-boot.js`: путь из `<meta name="edu-live-socket">`, иначе `"/live"` |

```ts
const csrfToken = document.querySelector<HTMLMetaElement>("meta[name='csrf-token']")?.getAttribute("content") ?? "";

const liveSocket = new LiveSocket("/live", Socket, {
  params: { _csrf_token: csrfToken },
  hooks: getHooks({ KanBoard, SeatsExplorer, SquadsExplorer, KanAdmin }) as never,
});
liveSocket.connect();
window.liveSocket = liveSocket;
```

Страница использует один Socket: все модули импортируют `@fiberfx/phoenix` и `@fiberfx/phoenix_live_view` по имени пакета, а карта импортов направляет каждое имя на одну обслуживаемую копию. В EDU `Island.head/1` записывает head страницы курса: метатег пути сокета, две предзагрузки модулей, карту импортов и `edu-boot.js` как один модульный скрипт.

Загрузчик EDU регистрирует один хук, `CourseIsland`, и передаёт каждый обратный вызов собственному хуку бандла. Бандл KAN регистрирует `MercuryHook` напрямую через `getHooks`.

## Четыре обратных вызова хука

`MercuryHook` реализует четыре обратных вызова LiveView. В каждом экземпляр хука доступен как `this`, а элемент острова — как `this.el`:

- **`mounted()`** находит компонент, декодирует свойства и потоки и рендерит.
- **`updated()`** выполняется после обновления атрибутов элемента LiveView. При `data-use-diff="true"` применяет `data-props-diff` к сохранённым свойствам; иначе читает `data-props` целиком. Применяет `data-streams-diff` к потокам и повторяет рендеринг.
- **`reconnected()`** читает `data-props` целиком и заново строит потоки. После переподключения процесс LiveView новый, поэтому diff был бы пуст независимо от изменений состояния; полный снимок содержит актуальные данные.
- **`destroyed()`** сразу рендерит `null` в элемент и удаляет все подписки `handleEvent`, созданные островом через хук, чтобы события не приходили уже удалённому компоненту.

При каждом рендеринге создаётся новый объект свойств верхнего уровня. Компонент может сравнить идентичность props, чтобы обнаружить обновление; вложенные значения на путях, не затронутых патчами, сохраняют идентичность.

## Свойства следуют за assigns

LiveView доски KAN не обращается к острову напрямую. Он обновляет assigns, а `mercury/1` передаёт изменения:

```elixir
@impl true
def mount(_params, _session, socket) do
  snap = if connected?(socket), do: Feed.subscribe(), else: Feed.snapshot()
  {:ok, socket |> assign(page_title: "Kanboard") |> put_snapshot(snap)}
end

@impl true
def handle_info({:kan_feed, snap}, socket), do: {:noreply, put_snapshot(socket, snap)}
```

Когда `put_snapshot/2` задаёт новые `lanes`, `rungs` или `messages`, LiveView заново рендерит `<LiveMercury.mercury name="KanBoard" …>`. При включённом `diff` (по умолчанию) `mercury/1` берёт только assigns, помеченные LiveView как изменённые, и записывает JSON Patch в `data-props-diff`: `replace` по `/<key>`, если прежнего значения для сравнения нет, иначе результат `Jsonpatch.diff` старого и нового значений под `/<key>`. Хук применяет его в `updated()`. Формат патчей и потоки описаны в [LM3](/ru/live-mercury/props-and-streams).

## События на сервер — pushEvent

Функции хука доступны компоненту двумя способами: через свойства и через `useLiveMercury()` для любого компонента внутри острова. Вне острова `useLiveMercury()` возвращает `null`.

| Функция | Сигнатура |
|---|---|
| `pushEvent` | `(event, payload?, onReply?)` |
| `pushEventTo` | `(phxTarget, event, payload?, onReply?)` |
| `handleEvent` | `(event, callback)`, возвращает ссылку |
| `removeHandleEvent` | `(ref)` |
| `upload` | `(name, files)` |
| `uploadTo` | `(target, name, files)` |

Доска KAN получает `pushEvent` из свойств и отправляет `refresh`:

```tsx
const push = props.pushEvent;
const refresh = push ? () => void push("refresh", {}) : undefined;
```

Её LiveView обрабатывает его как обычное событие:

```elixir
@impl true
def handle_event("refresh", _params, socket) do
  Feed.refresh()
  {:noreply, socket}
end
```

Новый снимок приходит тем же путём, что остальные обновления: `Feed` отправляет `{:kan_feed, snap}`, `handle_info/2` обновляет assigns, а вслед за ними — свойства острова.

## События с сервера — push_event

Когда серверу нужно обратиться к самому острову, а не изменить его свойства, он отправляет событие. Демоостров EDU показывает полный цикл. Компонент отправляет нажатие и слушает одно имя события:

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

LiveView отвечает через `push_event/3`:

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

Страницы EDU используют одно имя события, `"edu:island"` (`SERVER_EVENT`), с сообщением `{id, event, payload}`. Его получает каждый остров страницы, поэтому каждый оставляет только сообщения с идентификатором своего элемента: `isAddressedTo(payload, id)` возвращает true, если `payload.id` совпадает с непустым id, а `payload.event` — строка. Собственный идентификатор остров получает в свойстве `islandId`, переданном `courseIsland`.

Удаляйте подписку при очистке эффекта, как в примере. Если компонент этого не сделал, `destroyed()` всё равно удалит все подписки, созданные через хук острова.

## Ссылки между LiveView

`Link` выводит ссылку с атрибутами LiveView, поэтому переход из острова проходит через LiveSocket:

| Свойства | Результат |
|---|---|
| только `href` | обычный `href`: браузер загружает страницу |
| `patch` | `data-phx-link="patch"`: вызывается `handle_params/3` текущего LiveView |
| `navigate` | `data-phx-link="redirect"`: переход к другому LiveView в той же `live_session` |
| `replace` | `data-phx-link-state="replace"` вместо `"push"` |

Четыре представления KAN входят в одну `live_session :kan` в маршрутизаторе echd_os (`/kan`, `/kan/seats`, `/kan/squads`, `/kan/admin`), поэтому ссылка из острова на другое представление может использовать `navigate`:

```tsx
import { Link } from "@fiberfx/live-mercury";

const toSeats = <Link navigate="/kan/seats">Seats</Link>;
```
