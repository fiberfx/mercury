`renderDocument` — единый путь превращения документа страницы в разметку. Он только читает: не загружает, не сохраняет и не отправляет данные; окружающий провайдер ему не нужен.

## Вызов

```ts
import { parseDocument } from "@fiberfx/schema";
import { contentSchema, renderDocument } from "@fiberfx/content";

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

if (parsed.ok) {
  const { element, report } = renderDocument(parsed.document, { mode: "publication", revision: 1, lang: "en" });
  console.log(report); // { unsupported: [], publishable: true }
}
```

Функция принимает `MercuryDocument`, который `parseDocument` возвращает при `ok`. Сам документ она не проверяет: сначала разбор, затем рендеринг.

Результат — `{ element, report }`. `element` — это `VNode` из `@fiberfx/hyperscript`; `report` сообщает, что не удалось показать.

## Параметры

| Параметр | Обязателен | Назначение |
|---|---|---|
| `mode` | да | `"preview"` либо `"publication"`: какое представление запросило рендеринг. Разметка от него не зависит, блоки его не видят. |
| `revision` | да | показываемая локальная ревизия, число; записывается в корень как `data-revision` |
| `theme` | нет | `"light"` (по умолчанию) либо `"dark"` |
| `lang` | нет | язык содержимого, независимо от локали интерфейса редактора |
| `dir` | нет | `"ltr"` либо `"rtl"` |
| `registry` | нет | реестр рендереров; по умолчанию `contentRegistry()` со всеми блоками каталога |
| `resolved` | нет | результаты разрешения ссылок окружением, с ключами `<kind>:<id>`, например `asset:hero` |
| `capabilities` | нет | разрешённые политикой содержимого возможности: `"embed"`, `"form"`; по умолчанию ни одной |
| `allowUnsupported` | нет | по умолчанию `true`; при `false` любой неподдерживаемый блок делает документ непригодным для публикации в отчёте |

**`mode` намеренно недоступен блоку.** Блок получает контекст с темой, возможностями окружения, `resolve` и `slot`, но без режима. Блок не различает предпросмотр и публикацию, поэтому не может создавать расхождение между ними. Тест пакета рендерит документ обоими способами и проверяет равенство разметки.

**`resolved` — ответ окружения, а не загрузка данных.** Каждая запись может содержать `src`, `href`, `title`, `items` (разрешённую коллекцию) либо `error`. Блок вызывает `context.resolve(prop)` и получает запись по ключу ссылки либо `undefined`, если окружение ничего не разрешило. Приложение сайта Mercury разрешает ресурс каждого изображения в его адрес:

```ts
import { renderDocument, type ResolvedReference } from "@fiberfx/content";
import type { MercuryDocument } from "@fiberfx/schema";

function show(document: MercuryDocument) {
  const resolved: { [key: string]: ResolvedReference } = { "asset:hero": { src: "/images/hero.png" } };
  return renderDocument(document, { mode: "publication", revision: 0, resolved });
}
```

## Корневой элемент

Всё выводится внутри одного `div`:

- `class`: `mx-content`, затем `light-theme` либо `dark-theme` согласно `theme`;
- `data-document`: `id` документа;
- `data-revision`: параметр `revision` в виде строки;
- `lang` и `dir`: из параметров.

Тема находится на этой обёртке, а не на окружающей странице. Приложение сайта Mercury передаёт тему, прочитанную из `<html>`, а при изменении цветовой схемы читателя переключает `dark-theme` и `light-theme` на каждом корне `.mx-content`.

## Что получает блок

Каждый узел рендерится записью реестра для его `type`, вызываемой с `{ node, props, context }`:

- `props`: свойства узла, в которых каждое адаптивное значение разрешено до **базового**;
- `node`: узел в том виде, в каком хранится; если блоку нужны переопределения точек перелома, он читает их из `node.props`;
- `context.slot(node, name)`: отрендеренные потомки одного слота в порядке документа.

Если слот содержит идентификатор, для которого в `nodes` нет узла, в этой позиции ничего не выводится. В разобранном документе такого быть не может: `parseDocument` отклоняет `unknown-child`.

## Неподдерживаемые блоки и отчёт

Узел, для чьего `type` нет записи в реестре, не вызывает ошибку. Вместо него выводится заглушка — `div` с классом `mx-content-unsupported`, значением типа в `data-unsupported` и `role="note"`, содержащий фразу «This content can't be shown here.». Слоты по-прежнему выводятся внутри, поэтому содержимое, обёрнутое более новым блоком, остаётся читаемым.

Идентификатор узла попадает в `report.unsupported` в порядке документа. `report.publishable` равен `true`, если неподдерживаемых блоков нет либо `allowUnsupported` не равен `false`. Разрешать ли публикацию страницы с неподдерживаемым содержимым — решение окружения; параметр позволяет его выразить:

```ts
import { renderDocument } from "@fiberfx/content";
import type { MercuryDocument } from "@fiberfx/schema";

function check(document: MercuryDocument): boolean {
  const { report } = renderDocument(document, { mode: "preview", revision: 1, allowUnsupported: false });
  return report.publishable; // false when any block is unsupported
}
```

Рендеринг не меняет сам документ, в том числе неподдерживаемые узлы.

## Монтирование элемента

`render(element, container)` из `@fiberfx/hyperscript` монтирует результат. Приложение сайта заменяет начальную разметку контейнера, монтирует элемент и записывает количество неподдерживаемых блоков:

```ts
import { render } from "@fiberfx/hyperscript";
import { renderDocument } from "@fiberfx/content";
import type { MercuryDocument } from "@fiberfx/schema";

function mount(document: MercuryDocument, main: HTMLElement) {
  const { element, report } = renderDocument(document, { mode: "publication", revision: 0 });
  main.replaceChildren();
  render(element, main);
  if (report.unsupported.length > 0) main.dataset.unsupported = String(report.unsupported.length);
}
```
