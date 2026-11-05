Остров тестируется с обеих сторон его элемента. На сервере проверяем, что LiveView записал в элемент. В браузере — что хук отрисовал из этих данных. Урок следует существующим тестам репозитория: каждый приведённый подход уже где-то используется.

## Две стороны, один элемент

| Сторона | Что проверяется | Инструмент |
|---|---|---|
| сервер, `<.mercury>` | имя элемента, свойства, разницы, слоты, `data-ssr` | `LiveMercury.Test.get_mercury/2` |
| сервер, LiveView | события от острова и обратно | `Phoenix.LiveViewTest`: `render_hook/3`, `assert_push_event/3` |
| клиент, `MercuryHook` | что хук отрисовывает для элемента и его обновлений | подставной хук на настоящем элементе в Vitest |
| EDU | форма контейнера, передача вызовов загрузчиком, `courseIsland` | тесты ConnCase, Vitest, `check_hosts/3` |

## LiveMercury.Test.get_mercury/2

`get_mercury(view_or_html, opts \\ [])` находит остров в отрендеренном HTML и декодирует его. Функция принимает либо `Phoenix.LiveViewTest.View`, который сначала рендерит, либо строку HTML. В тестовом окружении нужен Floki; без него функция вызывает исключение и указывает зависимость, которую нужно добавить: `{:floki, ">= 0.30.0", only: :test}`.

```elixir
def simple_component(assigns) do
  ~H"""
  <.mercury name="MyComponent" firstName="john" lastName="doe" />
  """
end

test "renders component with correct props" do
  html = render_component(&simple_component/1)
  island = LiveMercury.Test.get_mercury(html)

  assert island.component == "MyComponent"
  assert island.props == %{"firstName" => "john", "lastName" => "doe"}
end
```

Возвращается карта со следующими ключами:

| Ключ | Источник |
|---|---|
| `:component` | `data-name` |
| `:id` | `id` |
| `:props` | `data-props`, декодированный из компактного JSON |
| `:props_diff`, `:streams_diff` | `data-props-diff`, `data-streams-diff` в виде списков: `[op, path]` для удаления, `[op, path, value]` для остальных операций; nonce отброшен |
| `:slots` | `data-slots`, каждый слот декодирован из base64, например `%{"default" => "Simple content"}` |
| `:ssr` | `true`, если присутствует `data-ssr` |
| `:use_diff` | `data-use-diff == "true"` |
| `:class` | `class` |

Если на странице несколько островов, возвращается первый либо выбранный опцией:

```elixir
island = LiveMercury.Test.get_mercury(html, name: "UserCard")
island = LiveMercury.Test.get_mercury(html, id: "card-1")
```

Если имя или id ни с чем не совпало, вызывается исключение со списком найденных островов в виде пар `Name#id`. Любая другая опция вызывает `ArgumentError`, а страница без острова — `"No Mercury components found in the rendered HTML"`.

**Свойства после обновления.** При включённом `diff` повторный рендеринг с активным подключением отправляет только `data-props-diff`, поэтому в тесте LiveView `:props` по-прежнему содержит снимок первого рендеринга, а изменение находится в `:props_diff`. Проверяйте `:props_diff` либо задайте `config :live_mercury, enable_props_diff: false` в тестовой конфигурации. Документация `LiveMercury.Test` рекомендует второй вариант: тогда `:props` всегда содержит полное состояние. Настройка читается при компиляции.

Собственные тесты разниц приложения live_mercury напрямую рендерят `LiveMercury.mercury/1` и сами задают `__changed__`: так повторный рендеринг моделируется без LiveView.

```elixir
assigns = %{username: "John", age: 30, __changed__: %{}}
assigns = assign(assigns, :username, "Jane")

island =
  assigns
  |> LiveMercury.mercury()
  |> Phoenix.HTML.html_escape()
  |> Phoenix.HTML.safe_to_string()
  |> LiveMercury.Test.get_mercury()

assert ["replace", "/username", "Jane"] in island.props_diff
```

Для разниц потоков после первого рендеринга тесты также передают `socket: %Phoenix.LiveView.Socket{transport_pid: self()}` — сокет, который считается подключённым, чтобы рендеринг не трактовался как неподключённый.

## Тестирование LiveView и его событий

События острова — обычные события LiveView, поэтому `Phoenix.LiveViewTest` проверяет их без браузера. Тест демонстрационной страницы EDU отправляет событие, которое отправил бы остров, затем проверяет и повторный рендеринг, и ответное событие:

```elixir
test "the island's event reaches the LiveView, and the reply is addressed to the island", %{
  conn: conn
} do
  {:ok, view, _html} = live(conn, @path)

  assert render_hook(view, "demo:clicked", %{"count" => 3}) =~ "Clicks the server has seen: 3"

  assert_push_event(view, "edu:island", %{id: "island-demo", event: "ack", payload: %{count: 3}})
end
```

`render_hook/3` имитирует `pushEvent` острова, а `assert_push_event/3` видит результат `push_event/3`, который получил бы `handleEvent` острова.

## Тестирование хука

Собственные тесты `@fiberfx/live-mercury` запускают `MercuryHook` с подставным объектом вместо `this`, передаваемого LiveView. `createLiveViewHook(attributes)` помещает в документ настоящий элемент с заданными атрибутами и предоставляет шесть функций хука как шпионы Vitest; `handleEvent` возвращает новый `ref-<n>` при каждом вызове, как и LiveView. Вспомогательная функция находится в `src/test/` пакета и не экспортируется из его точки входа.

Тест регистрирует компонент через `getHooks`, сам вызывает обратные вызовы хука и меняет атрибуты так, как это сделал бы патч LiveView:

```ts
it("applies props_diff on update when data-use-diff is true", () => {
	const hook = createLiveViewHook({ "data-name": "TestComponent", "data-props": encodeProps({ title: "Hello" }), "data-use-diff": "true" });
	call(MercuryHook, "mounted", hook);
	hook.el.setAttribute("data-props-diff", encodePatch([["replace", "/title", "World"]]));
	call(MercuryHook, "updated", hook);
	expect(seen?.title).toBe("World");
	expect(hook.el.textContent).toBe("World");
});
```

Это обеспечивают три части тестового файла:

- `const { MercuryHook } = getHooks({ TestComponent })`, где `TestComponent` записывает полученные свойства и результат `useLiveMercury()`;
- `call(definition, step, hook)`, то есть `definition[step].call(hook)`;
- тестовый кодировщик, повторяющий `LiveMercury.Patch.serialize/1` и `encode_object/1`, чтобы тестовые данные собирались из операций, а не вводились вручную в формате передачи.

Тот же файл проверяет ошибки монтирования, позднее появление компонента, новый объект свойств при каждом обновлении, синхронизацию после переподключения, первую отрисовку поверх серверной разметки и очистку: после `destroyed()` элемент пуст, а каждая ссылка `handleEvent`, которую остров ещё хранил, передана в `removeHandleEvent`.

## Тесты островов EDU

EDU тестирует каждый слой контейнера:

- **Страница** (`EchoEduWeb.IslandTest`, тест ConnCase): демонстрационная страница читается без JavaScript, связывает клиент phoenix через одну карту импортов, не записывает cookie, а её элемент содержит `phx-hook="CourseIsland"`, `phx-update="ignore"`, `data-bundle` и свойства в JSON. У `bundle_url/1` и `props_json/1` есть отдельные проверки.
- **`courseIsland`** (`edu-boot/src/island.test.ts`): `readProps` разбирает только непосредственный дочерний JSON-элемент, возвращает `{}` при его отсутствии и вызывает исключение при некорректном JSON; `courseIsland` рендерит содержимое внутри `data-island-root`, передавая свойства из JSON, функции хука и id элемента.
- **Загрузчик** (`edu-boot/src/app.test.ts`): один LiveSocket по пути из meta; `CourseIsland` передаёт `mounted` с тем же `this`, отклоняет бандл без `hook`, временно убирает серверную разметку и восстанавливает те же узлы, а при каждой ошибке записывает `data-island-error`.
- **Готовые бандлы** (`edu-boot/src/built-islands.check.ts`): импортируют собранные файлы островов, а не исходники, чтобы обнаружить бандл, в котором компонент и жизненный цикл работают с двумя копиями hyperscript. `node/apps/edu-boot/scripts/f1-gate.mjs` импортирует каждый бандл и требует функцию в экспорте по умолчанию и `hook` с четырьмя функциями; `--require-export` в mx ([LM2](/ru/live-mercury/building)) — статическая часть той же проверки.
- **Страница в браузере** (`scripts/edu/island-check.mjs`): headless Chrome через протокол DevTools, работающий с запущенной страницей (по умолчанию демонстрационной). Проверяется, что остров смонтирован (`data-island-mounted="true"`) и отображает заголовок, страница открывает ровно один сокет LiveView (`/_edu/live`), щелчок в острове доходит до LiveView и ответ возвращается в остров, текст серверной разметки присутствует при выключенном JavaScript, а ошибок скриптов и консоли нет. Скрипт печатает одну сводку JSON и завершается с кодом 1 при провале проверки.

## check_hosts/3 при сборке

В HTML-дереве страниц курса контейнеры `CourseIsland` пишутся вручную, поэтому EDU проверяет их при генерации страницы, не дожидаясь загрузки в браузере. `EchoEduWeb.Island.check_hosts(source, masked, {body_at, body_len})` возвращает `:ok` либо первый отказ:

| Отказ | Причина |
|---|---|
| `:no_id` | id отсутствует или пуст |
| `{:outside_body, id}` | контейнер находится вне body, где LiveView ничего не монтирует |
| `{:duplicate_id, id}` | другой элемент имеет такой же id |
| `{:not_ignored, id}` | отсутствует `phx-update="ignore"` |
| `{:no_bundle, id}` | `data-bundle` отсутствует или пуст |
| `{:bundle, id}` | `data-bundle` не является путём или URL http(s) |
| `{:props, id}` | первый дочерний элемент не содержит JSON, JSON не разбирается либо содержит неэкранированный `<` |

`EchoEdu.Gen.split/1`, используемый `mix edu.gen`, вызывает эту проверку и оборачивает отказ в `{:error, {:island_host, reason}}`. В тестах контейнеры создаются вспомогательной функцией:

```elixir
test "refuses two hosts with one id" do
  assert {:error, {:island_host, {:duplicate_id, "k-fig"}}} =
           Gen.split(page("<main>#{host()}#{host()}</main>"))
end
```

Тесты закрепляют и случаи, которые упустила бы простая проверка: контейнер с любым синтаксисом атрибутов, принимаемым браузером; текст контейнера внутри скрипта или комментария, который не является контейнером; отклоняемый адрес бандла вроде `//cdn.example/x.js` или `javascript:alert(1)`. Один тест рендерит сам `island/1` со строкой `</script>` в свойствах и проверяет, что результат проходит проверку: компонент и проверка не должны расходиться.

## Чего эти тесты не покрывают

- **В браузере проверяется только демонстрационная страница EDU.** `island-check.mjs` работает со страницей с одним островом курса. При подготовке курса не найдена браузерная проверка острова `<.mercury>`, например в представлениях KAN: ни один проверочный или тестовый скрипт вне пакета не упоминает `MercuryHook`. Для таких островов серверные тесты заканчиваются на элементе, а тесты хука начинаются с него.
- **Этим проверкам нужен Node.** Заголовок файла тестов хука запускает их через `pnpm exec vitest`; `island-check.mjs`, `f1-gate.mjs` и проверки готовых бандлов — скрипты Node. `mx test` запускает тесты модуля в headless-браузере и подменяет `vitest` собственной средой mx, но проходят ли в ней тесты хука `@fiberfx/live-mercury`, здесь не зафиксировано.
- **`get_mercury/2` находит только элементы `MercuryHook`.** Контейнеры `CourseIsland` приложения EDU читаются через LazyHTML в собственных тестах EDU.
