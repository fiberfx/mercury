# Рендеринг документа: renderDocument — Mercury LMS

> `renderDocument(document, options)` из `@fiberfx/content` 4.0.0 превращает разобранный документ страницы в `{ element, report }`: один VNode `@fiberfx/hyperscript` и список неподдерживаемых блоков. Без загрузки данных, хранения и провайдера; предпросмотр и публикация дают одинаковую разметку.

## Когда читать

Когда вы показываете документ страницы, выбираете параметры рендеринга, передаёте результаты разрешения ссылок окружением или решаете, можно ли публиковать страницу с неизвестными блоками.

## Контракт

- `renderDocument(document: MercuryDocument, options: RenderOptions): { element: VNode, report: { unsupported: NodeId[], publishable: boolean } }`. Передавайте `parsed.document` из `parseDocument`; функция не выполняет валидацию.
- Обязательны: `mode: "preview" | "publication"` (блоки его не видят, разметка от него не зависит), `revision: number` (записывается как `data-revision`).
- Необязательны: `theme: "light" | "dark"` (по умолчанию `light`), `lang`, `dir: "ltr" | "rtl"`, `registry` (по умолчанию `contentRegistry()`), `resolved: { ["<kind>:<id>"]: { src?, href?, title?, items?, error? } }`, `capabilities: ("embed" | "form")[]` (по умолчанию пусто), `allowUnsupported` (по умолчанию `true`).
- Корень: `<div class="mx-content light-theme|dark-theme" data-document=<id> data-revision=<revision> lang dir>`.
- Блоки получают `{ node, props, context }`: `props` содержит базовые адаптивные значения; `node.props` сохраняет переопределения; `context` — `{ theme, capabilities, resolve, slot }`.
- Незарегистрированный тип: `<div class="mx-content-unsupported" data-unsupported=<type> role="note">` с фразой "This content can't be shown here." и отрендеренными слотами внутри; идентификатор добавляется в `report.unsupported` в порядке документа.
- `report.publishable` равен `false` только при наличии неподдерживаемого содержимого и `allowUnsupported: false`.
- Монтирование: `render(element, container)` из `@fiberfx/hyperscript`.

## Минимальный пример

```ts
import { render } from "@fiberfx/hyperscript";
import { parseDocument } from "@fiberfx/schema";
import { contentSchema, renderDocument } from "@fiberfx/content";

const main = document.querySelector<HTMLElement>("[data-page]");
const response = await fetch("/page.json", { headers: { accept: "application/json" } });
const parsed = parseDocument(await response.text(), contentSchema());
if (main && parsed.ok) {
  const { element, report } = renderDocument(parsed.document, { mode: "publication", revision: 0, lang: "en", theme: "light" });
  render(element, main);
  if (report.unsupported.length > 0) main.dataset.unsupported = String(report.unsupported.length);
}
```

## Чего не генерировать

`fetch` внутри блока для получения его данных: передавайте ответы окружения в `resolved`. Ветвление по `mode` внутри блока: он его не видит. `throw` для неподдерживаемого блока: он отражается в отчёте и не является ошибкой.

## Далее

- Каталог блоков: /ru/content/blocks (/ru/content/blocks/llms.txt)
- Документы страниц: /ru/content/documents (/ru/content/documents/llms.txt)
- Эта версия для агентов: /ru/content/rendering/llms.txt

## Навигация

- [Страница в браузере](/ru/content/rendering)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/content/llms.txt)
