These two families tell a reader what is happening and show what there is. Their components share one rule: they present and announce, and the application keeps the state. Nothing in this chapter starts a timer, sorts a list or removes itself.

## Alert

`Alert` is an inline message in one of four tones:

| `tone` | Glyph | Role |
|---|---|---|
| `info` (default) | `i` | `status` |
| `success` | `✓` | `status` |
| `warning` | `!` | `status` |
| `danger` | `×` | `alert` |

`danger` is the only assertive tone: assistive technology announces it at once, while the other three are announced politely. Choose `danger` for a real error, not for emphasis.

It takes a `title`, which renders as an `h4`, the message as children, and an `actions` row beneath it. `dismissible` renders a close button named "Dismiss", which calls `onDismiss`. The Alert doesn't remove itself: your handler does.

## Toast and its parts

`Toast` is one notification. It has the Alert's tones and glyphs, plus:

- **`priority`:** `urgent` is announced assertively (`role="alert"`), `normal` politely (`role="status"`). It defaults to `urgent` for `danger` and to `normal` for the rest.
- **`onDismiss(reason)`:** called with `close` from its close control, or `swipe` from a completed swipe. The close control is always rendered, so a swipe is never the only way to dismiss. Name it with `closeLabel`, "Dismiss" by default.
- **`swipeDirection`, `swipeThreshold`:** let a pointer swipe dismiss the toast in one direction, after 50 px by default. A swipe that starts on a button, link or field is that control's press, not a drag.

**It owns no timer.** When a toast expires, and whether hovering pauses it, is the application's model; the Toast only reports a dismissal.

Compose it from its parts:

- **`ToastViewport`:** the notifications region, named "Notifications" by default and focusable as a whole, so a shortcut can move focus to it. Position it yourself.
- **`ToastTitle`, `ToastDescription`:** the heading and the message.
- **`ToastAction`:** one optional action, a small secondary `Button` by default. Its `altText` is required: it says how to do the same thing without the toast, for assistive technology and for when the toast has already gone, such as "Undo from the History panel".

## Progress

`Progress` is a bar, determinate or not.

- **`value`, `min`, `max`:** the bounds default to 0 and 100, and the value is clamped between them. The bar states its own bounds, so assistive technology computes the percentage. `valueText` gives a spoken value, such as "3 of 10 files".
- **`indeterminate`:** the total is unknown, so the bar states no current value at all, rather than a misleading 0 or 100.
- **`label`** or **`aria-labelledby`:** its name, such as the file a transfer belongs to.
- **`variant`:** `brand` (default), `positive`, `negative`, `caution` or `info`; **`size`:** `sm`, `md` or `lg`.

Completion is never inferred: you pass the final value. A Progress given no value and not marked indeterminate states 0 and reports a diagnostic in development, as do invalid bounds.

## Card

`Card` is a surface. `variant` is `flat` (the default), `raised` or `floating`; `padding` defaults to 20. Give it a `title` or `actions`, and it renders a header row with them above its children; give it neither, and there is no header.

## Table

`Table` renders records as a native table. Each entry of `columns` is a `Column`:

- **`key`** names the field, and a cell shows `row[key]` unless the column has a **`render(row)`**;
- **`label`** is the header; **`align`** is `left` or `right`;
- **`sortable`** puts a sort button in the header; **`resizable`** adds a resizer, with `minWidth`, `maxWidth` and `defaultWidth` (48, 960 and 160 px by default);
- **`required`** keeps the column visible whatever `hiddenColumns` says.

The table takes `data`, a `caption`, `striped`, `getRowKey` (rows are keyed by their index without it), `emptyState` ("No results" by default) and `loading`, which marks the table busy, disables its controls and shows "Loading…" in an empty body.

Beyond that, every feature is opt-in:

- **Columns:** `columnOrder`, `hiddenColumns`, and widths controlled by `columnWidths` or seeded by `defaultColumnWidths`. `onColumnWidthsChange` is called once per resize, when it is committed.
- **Keyboard:** `keyboardNavigation` makes the table a `grid` with arrow keys between body cells.
- **Expansion:** `expansion` takes `{ mode: "detail", renderDetail }` for a region under a row, or `{ mode: "treegrid", getChildren, hasChildren?, loadChildren? }` for nested records with levels; a rejected `loadChildren` leaves the row expandable with a Retry. `expandedKeys` and `onExpandedChange` control which rows are open.

## Sorting and selection belong to the caller

A sortable header shows the column's state with `aria-sort`, and its button calls `onSortChange` with the next sort: ascending first, then descending. **The table never reorders `data`.** It shows rows in the order you pass them, so the application sorts, and may sort on the server.

Selection works the same way. With `selectionMode="single"` each row gets a radio; with `multiple`, a checkbox, plus a "select all rows on this page" checkbox in the header. `selectedKeys` is the selection and `onSelectionChange(keys)` reports a change; without `onSelectionChange` the controls are disabled. `isRowDisabled` takes a row out, and `getRowLabel` names each row's control.

## DataGrid

`DataGrid` is an interactive grid over a window of rows, for editing in place.

- **Columns:** a `DataGridColumn` has `key`, `label` (also the accessible name of the cell's editor), `align`, `render`, `editable`, and `getValue` for the editor's starting text.
- **Navigation mode:** the arrow keys move between cells (left and right are mirrored when the cell's direction is right-to-left), Home and End move to the first and last column, and with Ctrl to the first and last row.
- **Edit mode:** Enter or F2 on an editable cell opens a text editor, which takes every key until Enter commits it through `onCellCommit({ rowKey, column, value })` or Escape cancels it. Focus then returns to the cell.
- **A window, not a list:** `rows` is the rendered window, `startIndex` or `getRowIndex` gives each row its place in the whole collection, and `total` is the whole count, or `null` when the host doesn't know. No virtualizer is built in: the caller supplies the window. When the focused row disappears, focus moves to the same column of the next surviving row.

`getRowKey` is required, because the grid follows rows by identity across windows.

## A table of uploads

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";
import { Progress, Table } from "@fiberfx/ui";
import type { Column, TableSort } from "@fiberfx/ui";

type Upload = { id: string; name: string; size: number; done: number };

const columns: Column<Upload>[] = [
  { key: "name", label: "File", sortable: true },
  { key: "size", label: "Size (KB)", align: "right", sortable: true },
  { key: "done", label: "Progress", render: (row) => <Progress value={row.done} label={`${row.name} upload`} size="sm" /> },
];

export function Uploads({ uploads }: { uploads: Upload[] }) {
  const [sort, setSort] = useState<TableSort | null>(null);
  const rows = sort === null ? uploads : [...uploads].sort((a, b) => {
    const x = a[sort.key as keyof Upload];
    const y = b[sort.key as keyof Upload];
    const order = x < y ? -1 : x > y ? 1 : 0;
    return sort.direction === "ascending" ? order : -order;
  });
  return <Table columns={columns} data={rows} getRowKey={(row) => row.id} caption="Uploads" sort={sort} onSortChange={setSort} />;
}
```

The Table reports which column and direction the reader asked for; the component above sorts. Each bar is named for its file, so a screen reader can tell twenty of them apart.

## The rest of both families

| Component | What it is |
|---|---|
| `Callout` | an inline emphasis block |
| `Meter` | a named, bounded quantity |
| `PasswordStrength` | a labelled password-strength meter |
| `Skeleton` | a pulsing content placeholder |
| `Spinner` | an indeterminate loading indicator |
| `Avatar` | a user image or an initials disc |
| `Badge` | a count or status marker |
| `Blockquote` | a quotation set off by a leading rule |
| `Chart` | a token-driven SVG curve or area |
| `Checklist` | a list of met and unmet requirements |
| `Chip` | a compact, status-toned label pill |
| `Code` | inline or block monospace code |
| `DataList` | key and value pairs in a description list |
| `GridList` | interactive item collections with nested actions |
| `Kbd` | a keyboard keycap |
| `ListRow` | a horizontal item row |
| `Stat` | a metric tile |
| `Tag` | a dotted status label |
| `Virtualizer` | bounded windows over large collections, keyed by identity |
