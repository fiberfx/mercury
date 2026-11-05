# Content, документы страниц Mercury — Mercury LMS

> `@fiberfx/schema` 4.0.0 содержит формат документа страницы и `parseDocument`; `@fiberfx/content` 4.0.0 — каталог блоков и `renderDocument`. Страница — данные JSON: проверьте их по реестру схем, выполните рендеринг через реестр рендереров, смонтируйте элемент.

## Когда читать

Когда вы показываете, проверяете или создаёте документ страницы Mercury либо выясняете, какой пакет отвечает за каждый шаг. Это вводная страница курса.

## Контракт

- `@fiberfx/schema`: `parseDocument(input, registry)` → `{ ok: true, document }` либо отказ `{ ok: false, code, path, reason, subject, node? }`. Также: `createSchemaRegistry`, `DEFAULT_LIMITS`, `FORMAT_VERSION`, `applyCommand`, `validateCommand`, `migrateDocument`, `inspectDocument`, `resolveReferences`, `resolveResponsive`.
- `@fiberfx/content`: `renderDocument(document, options)` → `{ element, report }`; `contentRegistry()` (все блоки каталога), `contentSchema()` (реестр схем для проверки документов Content), `CATALOG`, `catalogEntries()`, `exampleDocument(entry)`, `createRendererRegistry`, `schemaFor`, `BREAKPOINTS`.
- Peer dependencies пакета `@fiberfx/content`: `@fiberfx/hyperscript`, `@fiberfx/schema`, `@fiberfx/ui`, все версии 4.0.0.
- Порядок: сначала `parseDocument`, затем `renderDocument` для `parsed.document`, затем `render(element, container)` из `@fiberfx/hyperscript`.

## Минимальный пример

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

## Чего не генерировать

Функцию, элемент или DOM-дескриптор в свойствах документа: документ содержит только данные JSON. Вызов `renderDocument` для входных данных, которые не принял `parseDocument`.

## Далее

- Документы страниц: /ru/content/documents (/ru/content/documents/llms.txt)
- Рендеринг документа: /ru/content/rendering (/ru/content/rendering/llms.txt)
- Каталог блоков: /ru/content/blocks (/ru/content/blocks/llms.txt)
- Ссылки, возможности окружения и адаптивные значения: /ru/content/references (/ru/content/references/llms.txt)
- Добавление блока: /ru/content/add-a-block (/ru/content/add-a-block/llms.txt)
- Сайт: /llms.txt
- Эта версия для агентов: /ru/content/llms.txt

## Навигация

- [Страница в браузере](/ru/content)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)

### Текстовые версии глав

- [/ru/content/add-a-block](/ru/content/add-a-block/llms.txt)
- [/ru/content/blocks](/ru/content/blocks/llms.txt)
- [/ru/content/documents](/ru/content/documents/llms.txt)
- [/ru/content/references](/ru/content/references/llms.txt)
- [/ru/content/rendering](/ru/content/rendering/llms.txt)
