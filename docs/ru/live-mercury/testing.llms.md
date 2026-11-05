# Тестирование островов: по обе стороны элемента — Mercury LMS

> LM5. Сервер: `LiveMercury.Test.get_mercury/2` декодирует элемент `<.mercury>`; `Phoenix.LiveViewTest` предоставляет `render_hook/3` и `assert_push_event/3` для проверки событий острова. Клиент: `MercuryHook` вызывается с подставным хуком в Vitest. EDU: тесты страниц ConnCase, тесты `courseIsland` и загрузчика, проверки готовых бандлов, проверка страницы в headless Chrome и `check_hosts/3` при генерации.

## Когда читать

Когда пишете тест острова, его LiveView или страницы курса EDU с островом.

## Контракт

- `LiveMercury.Test.get_mercury(view | html, opts \\ [])`; `Phoenix.LiveViewTest.View` сначала рендерится. Нужен `{:floki, ">= 0.30.0", only: :test}`. Находятся только элементы `[phx-hook='MercuryHook']`.
- Возвращает `%{component, id, props, props_diff, streams_diff, slots, ssr, use_diff, class}`. `props_diff`/`streams_diff`: списки `[op, path]` (remove) или `[op, path, value]`; nonce отброшен. `slots`: декодированы из base64, например `%{"default" => "…"}`. `ssr`: присутствует `data-ssr`.
- Опции `name:` / `id:`; нет совпадения → исключение `No Mercury component found with name="…". Available components: Name#id, …`; другая опция → `ArgumentError`; нет острова → `No Mercury components found in the rendered HTML`.
- При включённом `diff` значение `:props` после обновления с активным подключением по-прежнему содержит первый снимок; проверяйте `:props_diff` либо задайте `config :live_mercury, enable_props_diff: false` в тестовой конфигурации (время компиляции).
- Моделирование повторного рендеринга: вызов `LiveMercury.mercury(assigns)` с `__changed__: %{}` и `assign/3`; подключённый сокет для разниц потоков: `%Phoenix.LiveView.Socket{transport_pid: self()}`.
- События: `render_hook(view, "event", params)` имитирует `pushEvent` острова; `assert_push_event(view, "event", payload)` видит то, что получил бы его `handleEvent`.
- Тесты хука (`fiberfx/live-mercury/src/hooks.test.ts`): `createLiveViewHook(attrs)` (в `src/test/`, не экспортируется) создаёт настоящий элемент и шпионы; `getHooks({ TestComponent })`; вызов `definition[step].call(hook)`; изменение атрибутов через `el.setAttribute` между `mounted` и `updated`.
- `EchoEduWeb.Island.check_hosts(source, masked, {body_at, body_len})` → `:ok` или `{:error, reason}`: `:no_id`, `{:outside_body, id}`, `{:duplicate_id, id}`, `{:not_ignored, id}`, `{:no_bundle, id}`, `{:bundle, id}`, `{:props, id}`. `EchoEdu.Gen.split/1` оборачивает отказ в `{:error, {:island_host, reason}}`.
- Браузер: `node scripts/edu/island-check.mjs <page-url> [screenshot.png]` (по умолчанию демонстрационная страница) проверяет монтирование, один сокет `/_edu/live`, полный обмен после щелчка, разметку без JS и отсутствие ошибок.

## Минимальный пример

```elixir
test "renders component with correct props" do
  html = render_component(&simple_component/1)
  island = LiveMercury.Test.get_mercury(html)

  assert island.component == "MyComponent"
  assert island.props == %{"firstName" => "john", "lastName" => "doe"}
end
```

## Чего не создавать

`island.handlers` (описан в документации модуля `LiveMercury.Test`, но отсутствует в возвращаемой карте); вызов `get_mercury/2` для страницы EDU с `CourseIsland`; проверку `:props` после обновления при включённых разницах.

## Ограничения

Тесты хука, `island-check.mjs`, `f1-gate.mjs` и проверки готовых бандлов требуют Node. Проходят ли тесты хука под `mx test`, не зафиксировано. Браузерная проверка острова `<.mercury>` не найдена.

## Далее

- К курсу: /ru/live-mercury/llms.txt
- Этот справочник: /ru/live-mercury/testing/llms.txt

## Навигация

- [Страница в браузере](/ru/live-mercury/testing)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/live-mercury/llms.txt)
