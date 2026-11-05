# UI5, обратная связь и отображение данных — Mercury LMS

> Обратная связь Mercury UI (`Alert`, `Toast` и его части, `Progress`) и отображение данных (`Card`, `Table`, `DataGrid`), а также остальные компоненты обоих семейств. Все отвечают за представление; таймеры, сортировка, состояние выбора и удаление принадлежат приложению.

## Когда читать

Когда нужно сообщить читателю о событии, показать прогресс или записи в карточке, таблице либо редактируемой сетке.

## Контракт (уровень готовности: опубликован — @fiberfx/ui 4.0.0 в npm с 2026-11-05)

- `Alert`: `tone` `info` (по умолчанию) | `success` | `warning` | `danger`; `title` (h4), дочернее содержимое, `actions`, `dismissible` + `onDismiss`. Для `danger` — `role="alert"`, для остальных — `role="status"`. Не удаляет себя.
- `Toast`: `tone`, `priority` (`urgent` | `normal`; по умолчанию urgent для danger), `onDismiss(reason: "close" | "swipe")`, `closeLabel` ("Dismiss"), `swipeDirection` (`left | right | up | down`), `swipeThreshold` (50). Всегда выводит элемент закрытия. Не управляет таймером.
- Части Toast: `ToastViewport` (`label`, по умолчанию "Notifications"; положение задаёте вы), `ToastTitle`, `ToastDescription`, `ToastAction` (`altText` обязателен: другой способ выполнить действие).
- `Progress`: `value`, `min` (0), `max` (100), значение ограничено границами; `indeterminate` не сообщает значение; `label` либо `aria-labelledby`; `valueText`; `variant` `brand | positive | negative | caution | info`; `size` `sm | md | lg`. Передайте конечное значение: завершение не определяется автоматически.
- `Card`: `variant` `flat | raised | floating`, `padding` (20), `title`, `actions`.
- `Table`: `columns: Column<Row>[]` (`key`, `label`, `align`, `render`, `sortable`, `resizable`, `required`, ширины), `data`, `getRowKey` (иначе индекс), `caption`, `striped`, `emptyState` ("No results"), `loading`; `sort` + `onSortChange` (таблица не переставляет данные); `selectionMode` `none | single | multiple`, `selectedKeys`, `onSelectionChange` (без него элементы выбора отключены), `isRowDisabled`, `getRowLabel`; `keyboardNavigation`; `columnOrder`, `hiddenColumns`, `columnWidths`, `onColumnWidthsChange`; `expansion` (`detail` либо `treegrid`), `expandedKeys`, `onExpandedChange`.
- `DataGrid`: `columns` (`key`, `label`, `editable`, `getValue`, `render`, `align`), `rows` (окно), `getRowKey` (обязателен), `startIndex`/`getRowIndex`, `total` (`null` = неизвестно), `onCellCommit({ rowKey, column, value })`, `caption`. Стрелки, Home/End (Ctrl: первая/последняя строка); Enter или F2 открывает редактор; Enter подтверждает; Escape отменяет. Встроенного виртуализатора нет.

## Минимальный пример

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";
import { Table } from "@fiberfx/ui";
import type { Column, TableSort } from "@fiberfx/ui";

type File = { id: string; name: string; size: number };
const columns: Column<File>[] = [{ key: "name", label: "File", sortable: true }, { key: "size", label: "Size", align: "right" }];

export function Files({ files }: { files: File[] }) {
  const [sort, setSort] = useState<TableSort | null>(null);
  const rows = sort ? [...files].sort((a, b) => (a.name < b.name ? -1 : 1) * (sort.direction === "ascending" ? 1 : -1)) : files;
  return <Table columns={columns} data={rows} getRowKey={(f) => f.id} caption="Files" sort={sort} onSortChange={setSort} />;
}
```

## Чего не генерировать

Toast со встроенным свойством тайм-аута (его нет); Toast, закрываемый только смахиванием; `ToastAction` без `altText`; `danger` ради акцента; ожидание, что Table сам сортирует либо фильтрует `data`; DataGrid без `getRowKey`; угаданное `total` вместо `null`; импорт из любого UI-фреймворка, кроме `@fiberfx/hyperscript`.

## Далее

- Курс: /ru/ui/llms.txt
- UI6, навигация: /ru/ui/navigation/llms.txt
- Эта версия для агентов: /ru/ui/feedback-and-data/llms.txt

## Навигация

- [Страница в браузере](/ru/ui/feedback-and-data)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/ui/llms.txt)
