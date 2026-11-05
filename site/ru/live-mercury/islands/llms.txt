# Острова: элемент и его монтирование — Mercury LMS

> LM0. Остров — один серверный элемент с `phx-update="ignore"` и `phx-hook`, в который монтируется компонент Mercury Hyperscript. Два варианта: `LiveMercury.mercury/1` (хук `MercuryHook`, поиск компонента по имени) и `EchoEduWeb.Island.island/1` (хук `CourseIsland`, поиск по URL бандла).

## Когда читать

Когда вы выводите остров из HEEx, регистрируете его компонент на клиенте или выясняете, почему остров не монтируется.

## Контракт

- `<.mercury name="X" ...>` (`import LiveMercury`). Зарезервированные assigns: `name` (обязателен), `id` (по умолчанию `"X-<n>"`, счётчик процесса), `class`, `ssr` (по умолчанию `config :live_mercury, :ssr`, `false`), `diff` (по умолчанию `:enable_props_diff`, `true`), `socket` (только определяет неподключённый первый рендеринг). Остальные assigns — свойства; assign `%Phoenix.LiveView.LiveStream{}` — поток; слот по умолчанию `:inner_block` становится `children`. Свойства кодируются протоколом `LiveMercury.Encoder`.
- Атрибуты элемента: `data-name`, `data-props` (компактный JSON), `data-props-diff`, `data-use-diff`, `data-streams-diff`, `data-slots` (слот по умолчанию в base64), `data-ssr`, `phx-update="ignore"`, `phx-hook="MercuryHook"`.
- Клиент: `getHooks(components)` → `{ MercuryHook }`; `createMercuryHook(resolve)` принимает `el => Component | Promise<Component>`. Компонент получает `{...props, ...streams, pushEvent, pushEventTo, handleEvent, removeHandleEvent, upload, uploadTo}` и слот как дочернее содержимое внутри `LiveMercuryProvider`. При `data-ssr` первый клиентский рендеринг очищает серверную разметку; гидратации нет.
- EDU: `<.island id bundle props>`; `id` и `bundle` обязательны, `props` — карта (по умолчанию `%{}`), слот — серверная разметка, сохраняемая до монтирования и восстанавливаемая в `destroyed`. Свойства находятся в первом дочернем `<script type="application/json">`, `<` записывается как `\u003c`. URL: `EchoEduWeb.Island.bundle_url(name)` → `/_edu/assets/edu-island-<name>.js`.
- Бандл EDU экспортирует `default` (компонент) и `hook = courseIsland(Component)` из `@echd/edu-boot/island`. Компонент дополнительно получает `islandId` — id элемента; свойства EDU имеют приоритет перед ключами Live Mercury.

## Минимальный пример

```ts
import { courseIsland } from "@echd/edu-boot/island";
import { DemoIsland } from "./DemoIsland";

export default DemoIsland;
export const hook = courseIsland(DemoIsland);
```

## Ошибки

- `MercuryHook` вызывает исключение, если у элемента нет `data-name` или в карте `getHooks` отсутствует компонент с таким именем.
- `CourseIsland` записывает `data-island-error`: `no-bundle`, `import`, `no-hook`, `props` (дочерний JSON не разбирается), `render` (`mounted` бандла вызвал исключение). При успехе устанавливается `data-island-mounted="true"`.
- При сборке `EchoEduWeb.Island.check_hosts/3` (вызывается из `mix edu.gen`) отклоняет элемент `CourseIsland` вне body, без уникального id, без `phx-update="ignore"`, с `data-bundle`, который не является путём или URL http(s), либо без первого дочернего элемента с разбираемым JSON.

## Не выдавать

`phx-hook="ReactHook"` и импорты из `react`. `<.mercury>` без `name`.

## Дальше

- LM1, остров в LiveView: /ru/live-mercury/liveview (/ru/live-mercury/liveview/llms.txt)
- Эта текстовая версия: /ru/live-mercury/islands/llms.txt

## Навигация

- [Страница в браузере](/ru/live-mercury/islands)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/live-mercury/llms.txt)
