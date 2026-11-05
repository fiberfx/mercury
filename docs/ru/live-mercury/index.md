Live Mercury размещает компоненты Mercury на страницах, которые рендерит Phoenix. Сервер создаёт один элемент и указывает LiveView не менять его содержимое; клиентский хук монтирует в него компонент Mercury Hyperscript, передаёт свойства с сервера и обновляет их при изменении assigns в LiveView.

## Что такое Live Mercury

**Остров** — элемент серверной страницы, содержимым которого управляет клиентский компонент. Вокруг него — HEEx, внутри — Mercury Hyperscript. LiveView не применяет патчи внутри острова, поскольку элемент имеет `phx-update="ignore"`. Свойства передаются в атрибутах элемента, а обновления — патчами через уже открытый сокет LiveView.

Поэтому страница читается без JavaScript, сервер сохраняет управление данными, а клиентский код выполняется только там, где нужен.

## Две части

| Часть | Где находится | Что предоставляет |
|---|---|---|
| серверная | `echo/apps/live_mercury`, модуль `LiveMercury` | `mercury/1` — функциональный компонент, выводящий элемент острова и его свойства |
| браузерная | `fiberfx/live-mercury`, пакет `@fiberfx/live-mercury` 4.0.0 | `getHooks` и `createMercuryHook` (жизненный цикл `MercuryHook`), `useLiveMercury`, `Link` и кодеки патчей |

`@fiberfx/hyperscript` — peer-зависимость браузерной части, поэтому остров использует единую среду Hyperscript страницы.

Доска KAN использует обе части. Её LiveView выводит остров:

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

Бандл регистрирует компонент под тем же именем и открывает сокет:

```ts
const liveSocket = new LiveSocket("/live", Socket, {
  params: { _csrf_token: csrfToken },
  hooks: getHooks({ KanBoard, SeatsExplorer, SquadsExplorer, KanAdmin }) as never,
});
liveSocket.connect();
```

`name="KanBoard"` на сервере и ключ `KanBoard` в карте `getHooks` связывают обе части.

## Два варианта размещения в репозитории

Курс рассматривает двух реальных потребителей с разными способами монтирования островов:

- **Представления KAN в echd_os** (`kan_board_live.ex`, `kan_seats_live.ex`, `kan_squads_live.ex`, `kan_admin_live.ex`) выводят `<LiveMercury.mercury>`. Один бандл, `kan.mjs`, регистрирует четыре компонента через `getHooks` и открывает LiveSocket страницы по пути `/live`.
- **Острова курсов EDU** выводят `EchoEduWeb.Island.island/1` с хуком `CourseIsland`. У каждого острова свой бандл. Загрузчик EDU импортирует его по URL и передаёт обратные вызовы LiveView в `hook` бандла — жизненный цикл Live Mercury, созданный через `courseIsland(component)`.

Оба варианта используют один жизненный цикл, `createMercuryHook`. Различаются источники свойств и тот, кто импортирует компонент.

## Курс

- **LM0, [Острова](/ru/live-mercury/islands):** что такое остров, какой элемент выводит каждый вариант размещения и как клиент его монтирует.
- **LM1, [Остров в LiveView](/ru/live-mercury/liveview):** путь сокета, четыре обратных вызова хука и события в обоих направлениях.
- **LM2, [Сборка островов через mx](/ru/live-mercury/building):** `mx build --lib`, пять сборок для островов EDU и этап сборки образа без Node.
- **LM3, [Свойства и потоки](/ru/live-mercury/props-and-streams):** `data-props-diff` и `data-streams-diff`, компактный формат патчей, `upsert`, `limit` и пути `$$<id>`.
- **LM4, [Серверный рендеринг](/ru/live-mercury/server-rendering):** флаг `ssr`, отключённый по умолчанию, `LiveMercury.SSR` и причины замены серверной разметки вместо гидратации.
- **LM5, [Тестирование островов](/ru/live-mercury/testing):** `LiveMercury.Test.get_mercury/2`, проверка событий острова, тесты хука и `check_hosts/3` в EDU.
- **LM6, итоговое задание, запланировано:** остров в LiveView, собранный без Node. Оно зависит от H3–H5 эпика 24 и отказа от Vite в бандле представлений KAN: `kan.mjs` пока собирается с pnpm и Vite.

## Что уже поставляется

Острова EDU собираются через mx внутри образа на этапе, который проверяет отсутствие `node` в PATH. Бандл представлений KAN, `kan.mjs`, там не собирается: он хранится в Git в `priv/static` приложения echd_os и собирается вне образа, как показано в [уроке о сборке](/ru/live-mercury/building). Версия `@fiberfx/live-mercury` в его `package.json` — 4.0.0.
