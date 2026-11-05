Каталог определяет, что может выразить документ страницы. Каждый блок — одна запись в реестре `@fiberfx/content`; `contentRegistry()` содержит их все.

## Каталог

`CATALOG` — таблица каталога: девять групп и 51 имя в них. `catalogEntries()` возвращает сами зарегистрированные записи, добавляя одну внутреннюю часть `Column`, из которой строится `Columns`.

Каждая запись содержит пример, а `exampleDocument(entry)` превращает его в документ страницы с одним блоком. Проверка каталога в пакете разбирает каждый пример по `contentSchema()` и рендерит его; ни один результат не должен быть пустым или неподдерживаемым. Тот же обход можно выполнить самостоятельно:

```ts
import { catalogEntries, contentSchema, exampleDocument, renderDocument } from "@fiberfx/content";
import { parseDocument } from "@fiberfx/schema";

for (const entry of catalogEntries().filter((entry) => entry.group !== "Internal")) {
  const parsed = parseDocument(exampleDocument(entry), contentSchema());
  if (!parsed.ok) throw new Error(`${entry.name}: ${parsed.code} at ${parsed.path}`);
  const { report } = renderDocument(parsed.document, { mode: "preview", revision: 1 });
  console.log(entry.group, entry.name, entry.type, report.unsupported.length);
}
```

## Что объявляет запись

`BlockEntry` содержит:

- `name`: имя в каталоге, например `RichText display`;
- `group`: одну из девяти групп либо `Internal`;
- `type`: тип блока, используемый документами, например `rich-text`;
- `definition`: схему, по которой проверяет `@fiberfx/schema`;
- `capabilities`: разрешения окружения, `embed` либо `form`; большинству блоков они не нужны;
- `render`: рендерер, вызываемый с `{ node, props, context }`;
- `example`: свойства и дочерние элементы слотов для проверки каталога.

В таблицах ниже `?` отмечает необязательное свойство, число после текстового свойства — максимальную длину. Блок без слотов не содержит потомков.

## Структура

| Блок | type | Свойства | Слоты | Результат |
|---|---|---|---|---|
| Page | `page` | `title` (200) | `content` | `<main>` страницы с именем из заголовка |
| Section | `section` | `background?`: `default`, `muted` либо `primary`, адаптивное | `content` | `Section` с `py="48"` и классом фона |
| Container | `container` | `size?`: `sm`–`xl` | `content` | `Container` с `center`, по умолчанию `lg` |
| Columns | `columns` | `count`: 2–4; `reverse?`, адаптивное | `columns`: только `column`, 2–4 | `Grid` с количеством столбцов `count` |
| Grid | `grid` | `cols`: 1–6 | `items` | `Grid` |
| Stack | `stack` | `gap?`: `sm`–`xl` | `content` | `Stack`, по умолчанию `md` |
| Divider | `divider` | `label?` (80) | | `Divider` |
| Spacer | `spacer` | `size`: `sm`–`xl` | | `Spacer`, скрытый от вспомогательных технологий |
| Column (внутренний) | `column` | | `content` | `Stack` |

Размеры задают отступы: `sm` — 12, `md` — 24, `lg` — 48, `xl` — 72. У `Columns` свойство `reverse` записывается в атрибуты `data-reverse` (по одному на переопределение точки перелома), которые может читать таблица стилей; DOM сохраняет порядок документа. Пока ни одна таблица стилей репозитория не читает эти атрибуты, поэтому сам по себе `reverse` раскладку не меняет; подробнее — в [уроке о ссылках](/ru/content/references).

## Текст

| Блок | type | Свойства | Результат |
|---|---|---|---|
| Heading | `heading` | `text` (200), `level`: 1–6, `size?`: 1–9 | `h1`–`h6` по `level`, с идентификатором узла в `id` |
| Paragraph | `paragraph` | `text` (5000) | `<p>` |
| RichText display | `rich-text` | `content`: до 500 фрагментов `{ text, marks?, href? }` | `<p>` из фрагментов, обёрнутых в `strong`, `em` либо `code` согласно меткам; ссылка создаётся при безопасном `href` |
| List | `list` | `items`: до 200 строк; `ordered?` | `<ol>` при `ordered`, иначе `<ul>` |
| Quote | `quote` | `text` (2000), `cite?` (200) | `Blockquote` |
| Code | `code` | `code` (20000), `language?` (40) | блочный `Code` в обёртке с `data-language` |

Свойство `level` заголовка задаёт его уровень в структуре. Визуальный `size` не выбирает этот уровень; если размер не задан, он следует уровню. Форматированный текст содержит только фрагменты и метки, без сырого HTML.

## Медиа

| Блок | type | Свойства | Результат |
|---|---|---|---|
| Image | `image` | `asset` (ссылка на ресурс), `alt` (500) | `<img>` с разрешённым адресом и ленивой загрузкой |
| Figure | `figure` | `asset`, `alt`, `caption` (1000) | `<figure>` с изображением и `<figcaption>` |
| Gallery | `gallery` | `images`: до 48 `{ asset, alt }` | список изображений |
| Video | `video` | `title`, `asset`, `captions?` (ресурс), `transcript?` | `<figure>` с `<video controls>` после разрешения, дорожкой субтитров и расшифровкой в `<details>` |
| Audio | `audio` | `title`, `asset`, `transcript?` | то же с `<audio controls>` |
| Embed | `embed` | `url` (2000), `title` (200) | при разрешённом `embed`: `<iframe>` в песочнице; иначе ссылка |

Изображение не запрашивает свой ресурс. Если окружение не разрешило адрес, вместо изображения показывается текст `alt` с `role="img"`; декоративное изображение (пустой `alt`) без разрешённого адреса ничего не выводит. Встраивание во фрейм допускается только для абсолютного URL `https`, только при разрешённом окружением `embed`, с `sandbox="allow-scripts"` и без предоставления origin окружения. Если хотя бы одно из двух условий не выполнено, заголовок выводится ссылкой.

## Навигация

| Блок | type | Свойства | Слоты | Результат |
|---|---|---|---|---|
| SiteHeader | `site-header` | `brand` (120) | `navigation`: только `navigation`, не более 1 | `<header>` с брендом |
| Navigation | `navigation` | `label`, `links`: до 40 `{ label, href }` | | именованный `<nav>` со списком ссылок |
| Breadcrumbs | `breadcrumbs` | `items`: до 12 `{ label, href? }` | | `<nav aria-label="Breadcrumb">` с упорядоченным списком |
| Footer | `footer` | `text?` (500) | `content` | `<footer>` |
| AnchorLinks | `anchor-links` | `label`, `links`: до 40 `{ label, target }` | | именованный `<nav>` со ссылками `#target` |

Хлебные крошки — статическая разметка. Последний элемент обозначает текущую страницу (`aria-current="page"`) и не бывает ссылкой.

## Композиция

| Блок | type | Свойства | Слоты | Результат |
|---|---|---|---|---|
| Button | `button` | `label` (80), `href`, `variant?`: `primary`, `secondary` либо `ghost` | | ссылка, оформленная как кнопка |
| ButtonGroup | `button-group` | | `buttons`: только `button`, 1–4 | группа кнопок |
| Hero | `hero` | `title`, `subtitle?` | `actions`: `button` либо `button-group`, не более 1 | `<section>` с `h1` |
| CTASection | `cta-section` | `title`, `text?` | `actions`: как у Hero | `<section>` с `h2` |
| Card | `card` | `title`, `text?`, `href?` | | `Card` с `h3`, со ссылкой при безопасном `href` |
| CardGrid | `card-grid` | `columns?`: 1–4 | `cards`: только `card` | `Grid`, по умолчанию 3 столбца |
| FeatureList | `feature-list` | `items`: до 24 `{ title, text }` | | список, в каждом пункте `h3` и абзац |
| LogoList | `logo-list` | `label`, `logos`: до 24 `{ name, asset? }` | | именованная `<section>`; каждый логотип — изображение после разрешения, иначе имя |
| Testimonials | `testimonials` | `items`: до 24 `{ quote, author, role? }` | | `Stack` цитат с авторами |

Button остаётся `<a>`: автор задаёт переход, поэтому это ссылка, выглядящая как кнопка.

## Интерактивное содержимое

| Блок | type | Свойства | Результат |
|---|---|---|---|
| Accordion | `accordion` | `items`: до 30 `{ title, text }` | нативный `<details>` для каждого пункта |
| Tabs | `tabs` | `label?`, `items`: до 12 `{ label, text }` | все панели под своими заголовками; после монтирования — компонент из `@fiberfx/ui` — `Tabs` |
| Disclosure | `disclosure` | `summary`, `text` | нативный `<details>` |
| Carousel | `carousel` | `label?`, `autoAdvance?`, `slides`: до 20 `{ text }` | все слайды; после монтирования — по одному с кнопками перехода назад и вперёд |

Все панели и слайды входят в статическую разметку, поэтому страница читается целиком без JavaScript. Tabs и Carousel сначала выводят ту же статическую форму, чтобы первый клиентский рендеринг совпадал. Карусель с `autoAdvance` переключается каждые 6 секунд и имеет переключатель паузы; при предпочтении уменьшенного движения она изначально приостановлена.

## Формы

| Блок | type | Свойства | Слоты | Требуется | Результат |
|---|---|---|---|---|---|
| Form | `form` | `label`, `action` (ссылка на маршрут) | `fields` | `form` | `<form method="post">` на разрешённый маршрут |
| FieldGroup | `field-group` | `legend` | `fields` | | `<fieldset>` с легендой |
| поддерживаемые простые поля | `field` | `kind`, `name`, `label`, `required?`, `options?` (до 50) | | | подпись и элемент управления |
| отправка и состояния успеха/ошибки | `form-submit` | `label`, `success?`, `error?`, `state?`: `idle`, `success` либо `error` | | `form` | кнопка отправки и сообщение для текущего состояния |

Свойство `kind` поля принимает `text`, `email`, `tel`, `number`, `url`, `textarea`, `checkbox` либо `select`. Форма отправляется нативно и только если окружение разрешило `form` и разрешило ссылку на маршрут. Иначе она сообщает «This form can't be sent from here.», отключает все поля и отклоняет отправку: ничего не загружается, не сохраняется и не имитируется. Состояние отправки `state` задаёт окружение после реальной отправки: сообщение об успехе имеет роль status, об ошибке — alert.

## Содержимое на основе данных

| Блок | type | Свойства | Результат |
|---|---|---|---|
| CollectionFeed | `collection-feed` | `title` (120), `collection` (ссылка на сущность) | разрешённые элементы списком, каждый — ссылка при безопасном `href`, с описанием при его наличии |
| ArticleList | `article-list` | как у CollectionFeed | как у CollectionFeed |
| RelatedContent | `related-content` | как у CollectionFeed | как у CollectionFeed |
| AuthorCard | `author-card` | `name`, `bio?`, `href?` | `Card` с именем, со ссылкой при безопасном `href` |

Блок на основе данных показывает снимок сущности, разрешённый окружением, и не запрашивает его сам. Под заголовком отображается одно из четырёх состояний, записанное в `data-state`:

- `error`: сообщение об ошибке окружения с ролью alert;
- `unavailable`: ничего не разрешено — «This list isn't available right now.»;
- `empty`: в снимке нет элементов — «Nothing here yet.»;
- `ready`: элементы.

## Редакционная страница

| Блок | type | Свойства | Слоты | Результат |
|---|---|---|---|---|
| ArticleHeader | `article-header` | `title`, `subtitle?`, `author?`, `published?` | | `<header>` с `h1`, затем строка автора и даты `published` в `<time>`, если она задана |
| ArticleBody | `article-body` | | `content` | содержимое статьи |
| TableOfContents | `table-of-contents` | `label?`, `items`: до 50 `{ label, target }` | | `<nav>` со ссылками `#target`, по умолчанию с именем «Contents» |
| Metadata | `metadata` | `items`: до 20 `{ label, value }` | | список описаний |
| RelatedArticles | `related-articles` | `title`, `collection` (ссылка на сущность) | | четыре состояния содержимого на основе данных; готовое состояние — список ссылок |

## Ссылки автора

Каждый `href`, введённый автором (у кнопки, фрагмента форматированного текста, карточки, пункта навигации или хлебных крошек), проходит одну проверку; то же относится к каждому `href` в разрешённой коллекции. Относительные пути, фрагменты, запросы и ссылки `http`, `https`, `mailto` и `tel` сохраняются. Любая другая схема, адрес без схемы вида `//host` либо ссылка с управляющим символом отбрасываются; подпись выводится без `href`.
