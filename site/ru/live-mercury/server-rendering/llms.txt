# Серверный рендеринг: что есть и чего пока нет — Mercury LMS

> LM4. `<.mercury ssr={true}>` запрашивает у настроенного модуля `LiveMercury.SSR` HTML острова при первом, неподключённом рендеринге. Во всём umbrella-проекте такой модуль не настроен, SSR выключен по умолчанию, элемент `<.mercury>` изначально пуст, а клиент заменяет серверную разметку, а не гидратирует её.

## Когда читать

Когда требуется серверный рендеринг острова, элемент острова пуст до запуска JavaScript или на элементе есть `data-ssr`.

## Контракт

- Assign `ssr`; значение по умолчанию — `config :live_mercury, :ssr` (время компиляции), `false`. Действует только когда `__changed__` равен `nil`, а сокет не подключён — при первом, неподключённом рендеринге.
- Включён: `LiveMercury.SSR.render(name, encoded_props, slots)`. Исключение `LiveMercury.SSR.NotConfigured` → считается выключенным. Иначе элемент получает `data-ssr` и содержимое из `:html` ответа.
- Поведение `LiveMercury.SSR`: `@callback render(component_name, props, slots) :: render_response | no_return`. Настройка: `config :live_mercury, ssr_module: Mod`. Интервал telemetry `[:live_mercury, :ssr]`, метаданные `%{component, props, slots}`. Строковый ответ разделяется по `<!-- preload -->` на `preloadLinks` (шаблон его не использует) и `html`.
- Без `:ssr_module` функция `render/3` возвращает `%{preloadLinks: "", html: ""}`: `ssr={true}` добавляет `data-ssr` к элементу с пустым HTML (проверено тестом).
- При выключенном SSR элемент `<.mercury>` изначально пуст; свойства находятся в `data-props`, слот по умолчанию — в base64 в `data-slots`; рендеринг выполняет клиент.
- Клиент: при наличии `data-ssr` первая отрисовка очищает элемент, затем рендерит компонент. Гидратации нет. Без `data-ssr` существующие дочерние узлы сохраняются.
- `LiveMercury.SSR.ViteJS` (POST `{:vite_host}/ssr_render`) и `LiveMercury.SSR.NodeJS` (файл `server.js` через пакет `NodeJS`) существуют, здесь не настроены и требуют среду выполнения JavaScript.
- Внутренний блок `<.island>` в EDU — написанная вручную резервная разметка для чтения без JS. Она временно убирается на время работы острова и восстанавливается после. Это не SSR компонента.

## Минимальный пример

```elixir
def ssr_on_component(assigns) do
  ~H"""
  <.mercury name="MyComponent" ssr={true} />
  """
end

# with no :ssr_module configured: data-ssr is set, the element's HTML is empty
assert LiveMercury.Test.get_mercury(render_component(&ssr_on_component/1)).ssr == true
```

## Чего не создавать

`config :live_mercury, ssr: true` без рендерера, возвращающего настоящий HTML; утверждение, что остров гидратируется; вызовы `hydrate` или `hydrateRoot` в бандле острова в расчёте на то, что Live Mercury их использует.

## Далее

- LM5, тестирование островов: /ru/live-mercury/testing (/ru/live-mercury/testing/llms.txt)
- Назад: /ru/live-mercury/props-and-streams/llms.txt
- Этот справочник: /ru/live-mercury/server-rendering/llms.txt

## Навигация

- [Страница в браузере](/ru/live-mercury/server-rendering)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/live-mercury/llms.txt)
