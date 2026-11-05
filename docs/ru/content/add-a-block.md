Каталог устроен так же, как ваш собственный блок: каждый блок каталога — `BlockEntry`, а `contentRegistry()` создаётся с помощью `createRendererRegistry` из этих записей. Итоговое задание — добавить ещё один блок.

## Запись

У `BlockEntry` семь полей:

| Поле | Что указать |
|---|---|
| `name` | отображаемое название блока |
| `group` | одну из девяти групп каталога либо `"Internal"`; других значений тип не допускает |
| `type` | тип блока, используемый в документах, например `"callout"` |
| `definition` | схему: `type` (ту же строку), `version`, `props` и `slots`, если есть дочерние узлы |
| `capabilities` | что должно разрешить окружение: `[]`, `["embed"]` либо `["form"]` |
| `render` | `({ node, props, context }) => …`, возвращающую результат рендеринга |
| `example` | свойства и дочерние узлы слотов, которые отображает проверка примера |

Рендерер получает `props` с базовыми значениями адаптивных свойств, `node` в сохранённом виде и `context` с `theme`, `capabilities`, `resolve` и `slot`. Режим рендеринга ему не передаётся, поэтому он не может отображать предпросмотр иначе, чем публикацию.

## Напишите блок

Сделаем callout — примечание с заголовком и дочерними узлами. Блоки `@fiberfx/content` — файлы `.tsx`, компилируемые с `@fiberfx/hyperscript` как источником JSX; ваш блок может быть таким же.

```tsx
import { renderToStaticMarkup } from "@fiberfx/hyperscript/server";
import { parseDocument } from "@fiberfx/schema";
import { catalogEntries, createRendererRegistry, exampleDocument, renderDocument, schemaFor, type BlockEntry } from "@fiberfx/content";

const callout: BlockEntry = {
  name: "Callout",
  group: "Composition",
  type: "callout",
  definition: {
    type: "callout",
    version: 1,
    props: { tone: { kind: "string", enum: ["note", "warning"] }, title: { kind: "string", maxLength: 120 } },
    slots: { content: {} },
  },
  capabilities: [],
  render: ({ node, props, context }) => (
    <aside class={`callout callout--${props.tone === "warning" ? "warning" : "note"}`} role="note">
      <p class="callout__title">{typeof props.title === "string" ? props.title : ""}</p>
      {context.slot(node, "content")}
    </aside>
  ),
  example: {
    props: { tone: "note", title: "Before you start" },
    slots: { content: [{ type: "paragraph", props: { text: "Inside the callout." } }] },
  },
};

const registry = createRendererRegistry([...catalogEntries(), callout]);
const schema = schemaFor(registry);

const parsed = parseDocument(exampleDocument(callout), schema);
if (!parsed.ok) throw new Error(`${parsed.code} at ${parsed.path}: ${parsed.reason}`);
const { element, report } = renderDocument(parsed.document, { mode: "publication", revision: 1, registry });
const markup = renderToStaticMarkup(element);
if (report.unsupported.length > 0 || !markup.includes("Inside the callout.")) throw new Error("the callout did not render");
```

Рендерер проверяет тип каждого свойства, хотя разбор уже проверил его. Каталог делает то же самое, чтобы документ, созданный без разбора, всё равно отображался в читаемом виде.

## Реестр рендереров

`createRendererRegistry(entries)` индексирует записи по `type`. Разверните `catalogEntries()` в список, чтобы сохранить все блоки каталога, как делает тест пакета, и передайте свой реестр в `renderDocument` через параметр `registry`. Без этого параметра `renderDocument` использует `contentRegistry()`, где нет `callout`, поэтому ваш узел выводится как неподдерживаемый.

## Схема из реестра

`schemaFor(registry)` создаёт реестр схем для проверки документов этого реестра: определения всех записей с объявленными `BREAKPOINTS`. Выполняйте разбор с ним, а не с `contentSchema()`.

При использовании `contentSchema()` узел `callout` имеет неизвестный тип. Он сохраняется без проверки, поэтому неверный `tone` пройдёт разбор. При использовании `schemaFor(registry)` узел проверяется по вашему определению, и `tone` со значением `"loud"` отклоняется как `invalid-prop` по пути `#/nodes/<its id>/props/tone` с причиной «expected one of note, warning».

## Проверка примера

Пакет проверяет каждую запись каталога одинаково:

1. `type` определения равен `type` записи;
2. `capabilities` — список, а `render` — функция;
3. `exampleDocument(entry)` успешно разбирается;
4. рендеринг даёт непустую разметку без `data-unsupported`.

`exampleDocument(entry)` создаёт документ страницы с вашим блоком как единственным корнем, идентификаторами узлов `<type>-1`, `<type>-2` и так далее и дочерними узлами примера в соответствующих слотах. Код выше выполняет шаги 3 и 4 для callout с вашей схемой и реестром. Проверка самого каталога выполняет разбор с `contentSchema()`, где нет `callout`.

## Что вызывает исключения

Ошибки в записи — ошибки программирования, поэтому исключение возникает при создании реестра, до рендеринга страниц.

`createRendererRegistry` вызывает `Error`:

```ts
import { catalogEntries, createRendererRegistry, type BlockEntry } from "@fiberfx/content";

const page = catalogEntries()[0]!;
const renamed: BlockEntry = { ...page, type: "page-v2" };

try {
  createRendererRegistry([...catalogEntries(), page]);
} catch (error) {
  console.log((error as Error).message); // block type "page" is registered twice
}
try {
  createRendererRegistry([renamed]);
} catch (error) {
  console.log((error as Error).message); // "Page" declares type "page-v2" but its definition is "page"
}
```

`schemaFor` вызывает `TypeError` из `createSchemaRegistry`, если:

- `version` определения меньше 1;
- в миграциях есть пропуск либо они заканчиваются раньше объявленной версии;
- `defaults` не проходят схему свойств блока;
- `kind` свойства неизвестен пакету схем;
- есть свойство `token`. `schemaFor` не объявляет наборы токенов, поэтому любой набор оказывается необъявленным.

```ts
import { catalogEntries, createRendererRegistry, schemaFor, type BlockEntry } from "@fiberfx/content";

const badge: BlockEntry = {
  ...catalogEntries()[0]!,
  name: "Badge",
  type: "badge",
  definition: { type: "badge", version: 1, props: { tone: { kind: "token", set: "tone" } } },
};

try {
  schemaFor(createRendererRegistry([badge]));
} catch (error) {
  console.log((error as Error).message); // block "badge" prop "tone" names the token set "tone", which the registry does not declare
}
```

## Ограничения

- **Версии в примерах.** `exampleDocument` берёт версию каждого узла из `contentRegistry()`, а для отсутствующего типа записывает 1. Поэтому собственный блок версии 2 получает пример версии 1, который ваша схема отклоняет как `outdated-block`. Начните новый блок с версии 1 либо составьте документ примера вручную.
- **Проверки ссылок не экспортируются.** `safeHref` и `httpsUrl` остаются внутри `@fiberfx/content`, поэтому блок с авторской ссылкой должен проверять её сам. [Урок о ссылках](/ru/content/references) перечисляет, что каталог сохраняет и отбрасывает.
- **Проверять разрешения должен ваш блок.** Объявление `["form"]` или `["embed"]` само по себе ничего не ограничивает. Рендерер читает `context.capabilities` и сам выбирает поведение при отсутствии разрешения, как форма и встраивание из каталога.
- **Интерактивный блок сначала выводит статическую разметку.** Интерактивные блоки каталога выводят статическую форму на сервере и при первом клиентском рендеринге, затем после монтирования включают интерактивность с хуками из `@fiberfx/hyperscript/hooks`. Такой блок целиком читается без JavaScript.

За пределами урока остаётся подключение вашего блока к страницам самого сайта Mercury. Приложение сайта выполняет разбор с `contentSchema()` и рендеринг без параметра `registry`, поэтому в этой версии отображает только блоки каталога.
