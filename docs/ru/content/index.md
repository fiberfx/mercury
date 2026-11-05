Content описывает страницу Mercury в виде данных. Работу делят два пакета: `@fiberfx/schema` отвечает за формат документа и его проверки, а `@fiberfx/content` — за блоки и рендерер. Версия обоих — 4.0.0.

## Два пакета

- **`@fiberfx/schema`** — переносимый формат документа. Документ — версионируемые данные, совместимые с JSON: плоское отображение узлов, каждый из которых указывает тип блока и содержит свойства и слоты. `parseDocument` читает документ с проверкой по реестру схем и возвращает либо документ, либо один отказ. Пакет также содержит слой команд (`applyCommand`, `validateCommand`), миграцию (`migrateDocument`, `inspectDocument`) и вспомогательные функции для ссылок и адаптивных значений.
- **`@fiberfx/content`** — рендерер опубликованных страниц и каталог блоков. `renderDocument` превращает документ в элемент через реестр рендереров; `contentRegistry()` — встроенный реестр со всеми блоками каталога, а `contentSchema()` — реестр схем для проверки их документов. Граф импортов не затрагивает конструктор, историю или движок редактирования: опубликованная страница несёт только то, что нужно для чтения.

Для `@fiberfx/content` пакеты `@fiberfx/hyperscript`, `@fiberfx/schema` и `@fiberfx/ui` являются peer dependencies. Блоки используют компоненты `@fiberfx/ui` и элементы `@fiberfx/hyperscript`.

## Путь страницы

Приложение самого сайта Mercury служит рабочим примером потребителя. Для каждого маршрута оно загружает `page.json`, затем:

1. **Разбирает** текст через `parseDocument(text, contentSchema())`. При отказе обработка останавливается, на экране остаётся начальная разметка, созданная сборкой.
2. **Рендерит** документ через `renderDocument(document, { mode, revision, lang, theme, resolved })`, получая элемент и отчёт.
3. **Монтирует** элемент через `render(element, main)` из `@fiberfx/hyperscript`.

```ts
import { render } from "@fiberfx/hyperscript";
import { parseDocument } from "@fiberfx/schema";
import { contentSchema, renderDocument } from "@fiberfx/content";

const main = document.querySelector<HTMLElement>("[data-page]");
const response = await fetch("/page.json", { headers: { accept: "application/json" } });
const parsed = parseDocument(await response.text(), contentSchema());
if (main && parsed.ok) {
  const { element } = renderDocument(parsed.document, { mode: "publication", revision: 0 });
  render(element, main);
}
```

## Карта курса

- **CT0 [Документы страниц](/ru/content/documents):** устройство документа, его узлы и слоты, реестр схем и результаты `parseDocument`.
- **CT1 [Рендеринг документа](/ru/content/rendering):** параметры `renderDocument`, возвращаемый элемент и отчёт о неподдерживаемых блоках.
- **CT2 [Каталог блоков](/ru/content/blocks):** девять групп, типы, свойства и слоты каждого блока, результат рендеринга.
- **CT3 [Ссылки, возможности окружения и адаптивные значения](/ru/content/references):** что окружение разрешает для блока, возможности `embed` и `form`, проверки ссылок и точки перелома с переопределениями.
- **CT4 [Добавление блока](/ru/content/add-a-block):** итоговая работа. Собственный `BlockEntry`, реестр через `createRendererRegistry`, его схема через `schemaFor` и проверка примера.

## Что реализовано

Оба пакета в этом репозитории имеют версию 4.0.0; приложение сайта Mercury рендерит через них страницы. Каталог содержит все блоки, перечисленные в его девяти группах. Конструктор для редактирования документов в эти пакеты не входит: `@fiberfx/content` читает документы и не редактирует их.
