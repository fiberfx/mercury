# Каталог блоков: девять групп, один реестр — Mercury LMS

> Каталог `@fiberfx/content` 4.0.0: 51 блок в девяти группах и внутренний `column`, все в `contentRegistry()`. Каждая запись объявляет тип блока (`type`), схему, необходимые возможности окружения (`embed`, `form` либо ни одной), рендерер и пример.

## Когда читать

Когда вы создаёте узел определённого типа, выясняете свойства и слоты блока либо то, что он выводит и требует от окружения.

## Контракт

- `CATALOG`: `{ group, names }[]`, девять групп, 51 имя. `catalogEntries()`: все `BlockEntry` (добавляет `Column` из группы `Internal`). `exampleDocument(entry)`: документ страницы с одним блоком из примера записи.
- `BlockEntry`: `{ name, group, type, definition, capabilities, render, example }`.
- Типы по группам (`?` — необязательное свойство):
  - Structure: `page` {title; слот content}, `section` {background? default|muted|primary, адаптивное; content}, `container` {size? sm–xl; content}, `columns` {count 2–4, reverse? адаптивное; columns: только `column`, 2–4}, `grid` {cols 1–6; items}, `stack` {gap? sm–xl; content}, `divider` {label?}, `spacer` {size sm–xl}, внутренний `column` {content}.
  - Text: `heading` {text, level 1–6, size? 1–9}, `paragraph` {text}, `rich-text` {content: [{text, marks? strong|em|code, href?}] ≤500}, `list` {items ≤200, ordered?}, `quote` {text, cite?}, `code` {code, language?}.
  - Media: `image` {asset — ссылка, alt}, `figure` {asset, alt, caption}, `gallery` {images ≤48 [{asset, alt}]}, `video` {title, asset, captions? — ресурс, transcript?}, `audio` {title, asset, transcript?}, `embed` {url, title} (возможность `embed`).
  - Navigation: `site-header` {brand; navigation: только `navigation`, ≤1}, `navigation` {label, links ≤40 [{label, href}]}, `breadcrumbs` {items ≤12 [{label, href?}]}, `footer` {text?; content}, `anchor-links` {label, links ≤40 [{label, target}]}.
  - Composition: `button` {label, href, variant? primary|secondary|ghost}, `button-group` {buttons: только `button`, 1–4}, `hero` {title, subtitle?; actions: button|button-group ≤1}, `cta-section` {title, text?; actions}, `card` {title, text?, href?}, `card-grid` {columns? 1–4; cards: только `card`}, `feature-list` {items ≤24 [{title, text}]}, `logo-list` {label, logos ≤24 [{name, asset?}]}, `testimonials` {items ≤24 [{quote, author, role?}]}.
  - Interactive content: `accordion` {items ≤30 [{title, text}]}, `tabs` {label?, items ≤12 [{label, text}]}, `disclosure` {summary, text}, `carousel` {label?, autoAdvance?, slides ≤20 [{text}]}.
  - Form content: `form` {label, action — ссылка на маршрут; fields} (возможность `form`), `field-group` {legend; fields}, `field` {kind text|email|tel|number|url|textarea|checkbox|select, name, label, required?, options? ≤50}, `form-submit` {label, success?, error?, state? idle|success|error} (возможность `form`).
  - Data-backed content: `collection-feed`, `article-list`, `related-content` {title, collection — ссылка на сущность}; `author-card` {name, bio?, href?}.
  - Editorial page: `article-header` {title, subtitle?, author?, published?}, `article-body` {content}, `table-of-contents` {label?, items ≤50 [{label, target}]}, `metadata` {items ≤20 [{label, value}]}, `related-articles` {title, collection — ссылка на сущность}.
- Поведение: изображения и медиа не запрашивают данные; неразрешённое изображение показывает alt с `role="img"`. `embed` создаёт фрейм только для абсолютного https при разрешении `embed`, с `sandbox="allow-scripts"`; иначе — ссылка. Все панели и слайды есть в статической разметке; Tabs и Carousel получают интерактивное поведение после монтирования. Форма отправляется нативно только при разрешении `form` и разрешённой ссылке на маршрут; иначе отключена и сообщает об этом. Блоки на основе данных выводят `data-state` `error`, `unavailable`, `empty` либо `ready` из снимка окружения. Авторские href проходят `safeHref`: относительные, `#`, `?`, http, https, mailto, tel; всё остальное выводится без href.

## Минимальный пример

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

## Чего не генерировать

Имя каталога как `type` узла (`"RichText display"`): документы используют тип (`"rich-text"`). Сырой HTML во фрагменте форматированного текста. `level`, выбранный ради визуального размера: задайте `size`. Потомка, чей тип исключён свойством `allow` слота (`slot-not-allowed`).

## Далее

- Рендеринг документа: /ru/content/rendering (/ru/content/rendering/llms.txt)
- Курс: /ru/content (/ru/content/llms.txt)
- Эта версия для агентов: /ru/content/blocks/llms.txt

## Навигация

- [Страница в браузере](/ru/content/blocks)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/content/llms.txt)
