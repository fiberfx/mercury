# Добавление блока: итоговое задание — Mercury LMS

> Добавьте собственный блок в документы страниц Mercury (`@fiberfx/content` 4.0.0): опишите `BlockEntry`, включите его в реестр через `createRendererRegistry([...catalogEntries(), entry])`, получите схему с `schemaFor(registry)`, затем разберите и отобразите `exampleDocument(entry)` с этой схемой и реестром.

## Когда читать

Когда нужен блок, которого нет в каталоге, или вы проверяете запись блока до её использования на странице.

## Контракт

- `BlockEntry`: `{ name, group, type, definition, capabilities, render, example }`. `group` — группа каталога либо `"Internal"` (закрытое объединение). `definition.type` должен совпадать с `type`. `capabilities`: `[]`, `["embed"]` либо `["form"]`.
- `render({ node, props, context })`: `props` содержат базовые значения; `context` — `{ theme, capabilities, resolve, slot }`, без режима. Файл `.tsx` с `jsxImportSource: "@fiberfx/hyperscript"`.
- `example`: `{ props, slots?: { [slot]: { type, props, slots? }[] } }`.
- `createRendererRegistry(entries)` вызывает `Error` при повторной регистрации типа (`block type "x" is registered twice`) или несовпадении типов (`"Name" declares type "a" but its definition is "b"`).
- `schemaFor(registry)` → реестр схем (все определения, `BREAKPOINTS`). Вызывает `TypeError` для версии меньше 1, пропуска миграции, неверных значений по умолчанию, неизвестного типа свойства или любого свойства `token` (наборы токенов не объявлены).
- Разбирайте документы с `schemaFor(registry)`. При `contentSchema()` ваш тип неизвестен, поэтому сохраняется без проверки. Рендерите с `{ registry }`, иначе узел будет неподдерживаемым.
- Проверка примера: разберите `exampleDocument(entry)`, отобразите его и проверьте непустую разметку с пустым `report.unsupported`. `exampleDocument` берёт версии из `contentRegistry()`, а при отсутствии типа использует 1, поэтому начинайте новый блок с версии 1.
- `safeHref` и `httpsUrl` не экспортируются; проверяйте авторские ссылки самостоятельно. Объявленные разрешения автоматически не проверяются; читайте `context.capabilities`.

## Минимальный пример

```tsx
import { parseDocument } from "@fiberfx/schema";
import { catalogEntries, createRendererRegistry, exampleDocument, renderDocument, schemaFor, type BlockEntry } from "@fiberfx/content";

const callout: BlockEntry = {
  name: "Callout",
  group: "Composition",
  type: "callout",
  definition: { type: "callout", version: 1, props: { title: { kind: "string", maxLength: 120 } }, slots: { content: {} } },
  capabilities: [],
  render: ({ node, props, context }) => (
    <aside class="callout" role="note">
      <p>{typeof props.title === "string" ? props.title : ""}</p>
      {context.slot(node, "content")}
    </aside>
  ),
  example: { props: { title: "Before you start" }, slots: { content: [{ type: "paragraph", props: { text: "Inside." } }] } },
};

const registry = createRendererRegistry([...catalogEntries(), callout]);
const parsed = parseDocument(exampleDocument(callout), schemaFor(registry));
if (!parsed.ok) throw new Error(`${parsed.code} at ${parsed.path}`);
const { report } = renderDocument(parsed.document, { mode: "preview", revision: 1, registry });
if (report.unsupported.length > 0) throw new Error("callout is unsupported");
```

## Не выдавать

`group` вне девяти групп каталога и `"Internal"`. `definition.type`, отличающийся от `type`. Свойство `token` с `schemaFor`. Разбор документа с вашим блоком через `contentSchema()`. Вызов `renderDocument` для него без `registry`.

## Дальше

- Ссылки, возможности окружения и адаптивные значения: /ru/content/references (/ru/content/references/llms.txt)
- Каталог блоков: /ru/content/blocks (/ru/content/blocks/llms.txt)
- Эта текстовая версия: /ru/content/add-a-block/llms.txt

## Навигация

- [Страница в браузере](/ru/content/add-a-block)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/content/llms.txt)
