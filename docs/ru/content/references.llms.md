# Ссылки, возможности окружения и адаптивные значения — Mercury LMS

> Что `renderDocument` (`@fiberfx/content` 4.0.0) поручает окружению: запись `resolved` с ключом `<kind>:<id>` для каждой ссылки, разрешения `embed` и `form`, адаптивные свойства с базовыми значениями. Блоки не запрашивают данные; для каждого отсутствующего ответа предусмотрено видимое состояние.

## Когда читать

Когда вы размещаете страницы Mercury и должны передать изображения, маршруты или коллекции, разрешить либо запретить встраивания и формы или прочитать адаптивное свойство в точке перелома.

## Контракт

- Ссылка в свойстве: `{ $ref: "asset" | "route" | "entity" | "fragment", id }`. Ключ: `referenceKey(reference)` → `"<$ref>:<id>"` (`@fiberfx/schema`).
- `renderDocument(document, { resolved })`: `resolved: { [key]: { src?, href?, title?, items?: { title, href?, summary? }[], error? } }`. Пакет не запрашивает данные.
- Читатели: `image`/`figure`/`gallery`/`logo-list`/`audio` читают `src`; `video` читает `src` ресурса и `captions`; `form` читает `href` (при разрешённом `form`); `collection-feed`/`article-list`/`related-content`/`related-articles` читают `items` и `error`. Ни один блок каталога не читает `title`.
- Состояния блоков на основе данных: ключ отсутствует → `unavailable`; `items: []` → `empty`; `error` → `error` (alert); элементы → `ready`.
- `@fiberfx/schema`: `collectReferences(document)` → `{ node, path, reference }[]`; `resolveReferences(document, resolve)` → `Map<key, { status: "resolved" | "unknown" | "unauthorized", reference, details? }>`, один вызов на ключ; `unauthorized` сохраняет только идентичность; любой другой ответ вызывает `TypeError`. Преобразование `Resolution` в `resolved` выполняет окружение.
- `capabilities: ("embed" | "form")[]`, по умолчанию пусто. `renderDocument` не обеспечивает объявленные записью разрешения; каждый блок читает `context.capabilities`.
- `embed`: `<iframe sandbox="allow-scripts">` только при разрешённом `embed` и абсолютном URL https; иначе ссылка. `form`: отправляет данные только при разрешённом `form` и безопасном разрешённом `href`; иначе отключена и показывает «This form can't be sent from here.». `form-submit`: отключён без `form`.
- Сохраняемые авторские `href`: `/`, `./`, `../`, `#`, `?`, `http:`, `https:`, `mailto:`, `tel:`. Отбрасываются с сохранением подписи без href: другие схемы, `//`, `/\`, `\\`, любой управляющий символ. `safeHref` и `httpsUrl` не экспортируются.
- Адаптивное значение: `{ $responsive: { base?, overrides: { [breakpoint]: value | { $removed: true } } } }`, только для свойств с `responsive: true` (в каталоге: `section.background`, `columns.reverse`). `BREAKPOINTS` = `["sm", "md", "lg", "xl"]`. Неизвестное имя переопределения или обёртка у неадаптивного свойства: `invalid-prop`.
- Блоки получают базу в `props`; `node.props` сохраняет переопределения. `section` отображает только базу. `columns` записывает `data-reverse` / `data-reverse-<bp>`; ни одна таблица стилей репозитория их не читает.
- `resolveResponsive(value, breakpoint, BREAKPOINTS)` → `{ state: "explicit" | "inherited" | "removed" | "absent", from?, value? }`.

## Минимальный пример

```ts
import { renderDocument, type ResolvedReference } from "@fiberfx/content";
import { collectReferences, referenceKey, type MercuryDocument } from "@fiberfx/schema";

function show(document: MercuryDocument, sources: { readonly [id: string]: string }) {
  const resolved: { [key: string]: ResolvedReference } = {};
  for (const { reference } of collectReferences(document)) {
    const src = reference.$ref === "asset" ? sources[reference.id] : undefined;
    if (src !== undefined) resolved[referenceKey(reference)] = { src };
  }
  return renderDocument(document, { mode: "publication", revision: 0, resolved, capabilities: ["embed"] });
}
```

## Не выдавать

`fetch` внутри блока для разрешения ссылки. Ключ без типа (`"hero"` вместо `"asset:hero"`). `import { safeHref } from "@fiberfx/content"`: функция не экспортируется. Адаптивную обёртку у свойства, схема которого не объявляет `responsive`.

## Дальше

- Добавление блока: /ru/content/add-a-block (/ru/content/add-a-block/llms.txt)
- Рендеринг документа: /ru/content/rendering (/ru/content/rendering/llms.txt)
- Эта текстовая версия: /ru/content/references/llms.txt

## Навигация

- [Страница в браузере](/ru/content/references)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/content/llms.txt)
