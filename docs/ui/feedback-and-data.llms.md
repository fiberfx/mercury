# UI5, feedback and data display — Mercury LMS

> Mercury UI's feedback (`Alert`, `Toast` and its parts, `Progress`) and data display (`Card`, `Table`, `DataGrid`), with the rest of both families. All presentational: the application owns timers, sorting, selection state and removal.

## Read this when

You tell a reader something happened, show progress, or show records in a card, a table or an editable grid.

## The contract (tier: Shipped — @fiberfx/ui 4.0.0 on npm since 2026-11-05)

- `Alert`: `tone` `info` (default) | `success` | `warning` | `danger`; `title` (an h4), children, `actions`, `dismissible` + `onDismiss`. `danger` is `role="alert"`, the rest `role="status"`. It never removes itself.
- `Toast`: `tone`, `priority` (`urgent` | `normal`; default urgent for danger), `onDismiss(reason: "close" | "swipe")`, `closeLabel` ("Dismiss"), `swipeDirection` (`left | right | up | down`), `swipeThreshold` (50). Always renders a close control. Owns no timer.
- Toast parts: `ToastViewport` (`label`, default "Notifications"; you position it), `ToastTitle`, `ToastDescription`, `ToastAction` (`altText` required: the other way to do it).
- `Progress`: `value`, `min` (0), `max` (100), clamped; `indeterminate` states no value; `label` or `aria-labelledby`; `valueText`; `variant` `brand | positive | negative | caution | info`; `size` `sm | md | lg`. Pass the final value: completion is never inferred.
- `Card`: `variant` `flat | raised | floating`, `padding` (20), `title`, `actions`.
- `Table`: `columns: Column<Row>[]` (`key`, `label`, `align`, `render`, `sortable`, `resizable`, `required`, widths), `data`, `getRowKey` (index otherwise), `caption`, `striped`, `emptyState` ("No results"), `loading`; `sort` + `onSortChange` (the table never reorders data); `selectionMode` `none | single | multiple`, `selectedKeys`, `onSelectionChange` (controls disabled without it), `isRowDisabled`, `getRowLabel`; `keyboardNavigation`; `columnOrder`, `hiddenColumns`, `columnWidths`, `onColumnWidthsChange`; `expansion` (`detail` or `treegrid`), `expandedKeys`, `onExpandedChange`.
- `DataGrid`: `columns` (`key`, `label`, `editable`, `getValue`, `render`, `align`), `rows` (the window), `getRowKey` (required), `startIndex`/`getRowIndex`, `total` (`null` = unknown), `onCellCommit({ rowKey, column, value })`, `caption`. Arrows, Home/End (Ctrl: first/last row); Enter or F2 edits; Enter commits; Escape cancels. No built-in virtualizer.

## Minimal example

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

## Never emit

A Toast with a built-in timeout prop (there is none); a Toast whose only dismissal is a swipe; `ToastAction` without `altText`; `danger` for emphasis; a Table expected to sort or filter `data` itself; a DataGrid without `getRowKey`; `total` guessed instead of `null`; an import from any UI framework other than `@fiberfx/hyperscript`.

## Next

- The course: /ui/llms.txt
- UI6, navigation: /ui/navigation/llms.txt
- This companion: /ui/feedback-and-data/llms.txt

## Navigation

- [Read this page in the browser](/ui/feedback-and-data)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/ui/llms.txt)
