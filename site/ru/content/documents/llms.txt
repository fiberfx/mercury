# Документы страниц: узлы, схема и parseDocument — Mercury LMS

> Документ страницы Mercury (`@fiberfx/schema` 4.0.0) — JSON: `format`, `id`, `kind`, упорядоченные `roots` и плоский объект `nodes`. `parseDocument(input, registry)` возвращает `{ ok: true, document }` либо ровно один отказ и не выбрасывает исключений.

## Когда читать

Когда вы пишете, генерируете или храните документ страницы, строите реестр схем либо обрабатываете отклонённый документ.

## Контракт

- Документ: `{ format: 1, id: string, kind: "page" | "fragment" | "template", roots: NodeId[], nodes: { [id]: DocumentNode } }`. Неизвестные поля сохраняются; они должны быть совместимы с JSON.
- Узел: `{ id, type, version, props, slots }`. `id` совпадает с ключом в `nodes`. `version` — целое число от 1. `props` содержит только JSON. `slots` сопоставляет имени слота упорядоченный список идентификаторов потомков.
- Ссылка в свойстве: `{ "$ref": "asset" | "route" | "entity" | "fragment", "id": string }`; разрешается вне документа.
- `createSchemaRegistry({ blocks, limits?, breakpoints?, tokens? })`. Выбрасывает `TypeError` при повторном типе, версии ниже 1, разрыве миграций или начальных значениях, нарушающих схему.
- `BlockDefinition`: `{ type, version, props, defaults?, slots?, migrations? }`. Виды свойств: `string`, `number`, `boolean`, `reference`, `token`, `list`, `record`, `json`; каждое может быть `optional` или `responsive`. Слот: `{ allow?, min?, max? }`.
- `DEFAULT_LIMITS`: `maxDepth` 32, `maxBytes` 1048576 (компактный JSON), `maxNodes` 10000, `maxPropDepth` 16.
- Документы каталога: `parseDocument(input, contentSchema())`, где `contentSchema` импортируется из `@fiberfx/content`; точки перелома: `sm`, `md`, `lg`, `xl`.
- `parseDocument(input: unknown, registry)` → `{ ok: true, document }` (сам входной документ, без приведения типов и подстановки значений) либо `{ ok: false, code, path, reason, subject: "document", node? }`.
- Порядок проверок, до первого отказа: форма данных (`malformed`, `newer-format`, `too-many-nodes`, `not-json-safe`, `too-deep`) → размер (`too-large`) → структура (`unknown-child`, `multiple-parents`, `cycle`, `too-deep`, `orphan`) → каждый известный узел (`unknown-slot`, `slot-cardinality`, `slot-not-allowed`, `unknown-prop`, `missing-prop`, `invalid-prop`) → фрагмент со ссылкой на себя (`cycle`).
- Неизвестный тип блока или более новая версия: узел сохраняется без проверки по определению. Более старая версия: `outdated-block`; сначала миграция.

## Минимальный пример

```ts
import { parseDocument } from "@fiberfx/schema";
import { contentSchema } from "@fiberfx/content";

const parsed = parseDocument(
  {
    format: 1,
    id: "hello",
    kind: "page",
    roots: ["page"],
    nodes: {
      page: { id: "page", type: "page", version: 1, props: { title: "Hello" }, slots: { content: ["intro"] } },
      intro: { id: "intro", type: "paragraph", version: 1, props: { text: "A first page." }, slots: {} },
    },
  },
  contentSchema(),
);
if (!parsed.ok) console.log(parsed.code, parsed.path, parsed.reason);
```

## Чего не генерировать

Вложенное дерево узлов внутри `props` или `slots`: потомки представлены идентификаторами в слотах. Функцию, элемент или DOM-дескриптор в свойствах. `try`/`catch` вокруг `parseDocument` вместо проверки `parsed.ok`.

## Далее

- Рендеринг документа: /ru/content/rendering (/ru/content/rendering/llms.txt)
- Курс: /ru/content (/ru/content/llms.txt)
- Эта версия для агентов: /ru/content/documents/llms.txt

## Навигация

- [Страница в браузере](/ru/content/documents)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/content/llms.txt)
