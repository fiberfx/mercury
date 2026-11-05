Tabs, Toolbar, Menubar and Tree share a keyboard model: one primary Tab stop, arrow keys inside, and mirrored direction for right-to-left text. Breadcrumbs and NavigationTree keep native link and button navigation. Mercury renders real links and does not perform application routing for you.

## One tab stop, arrows inside

- **One stop:** Tabs, Toolbar, Menubar and Tree each put exactly one element in the Tab order, the one with focus last, so Tab moves past the whole widget.
- **Arrows inside:** arrows move focus between the widget's items; Home and End jump to the ends.
- **Mirrored:** in a right-to-left context, Left and Right swap. Each widget takes a `dir` prop; without it, Tabs reads the computed direction and Tree, Toolbar and Menubar read the UI environment, as set by `DirectionProvider`.
- **Focus is not selection:** moving focus never commits a choice unless the component says so (automatic Tabs, `selectionFollowsFocus` on a Tree).

## Tabs

`Tabs` is the facade: give it `tabs` and the selected `value`, and it calls `onChange(value)` when a tab is chosen.

- **A tab** is `{ label, value, disabled?, content?, panelId? }`. With `content`, Tabs renders that tab's panel; with `panelId`, the tab controls a panel you render elsewhere.
- **`activationMode`:** `automatic` (the default) selects the tab focus lands on; `manual` moves focus only, and Enter, Space or a click selects.
- **`orientation`:** `horizontal` (default) uses Left and Right; `vertical` uses Up and Down.
- **`loop`:** the arrows wrap from the last tab to the first, `true` by default.
- **`keepMounted`:** keeps unselected panels' content mounted, still hidden. By default an unselected panel's content isn't rendered.
- **`variant`:** `underline` (default) or `pills`.

## The Tabs parts

For a layout the facade doesn't give, compose `TabsRoot` › `TabsList` › `TabsTrigger`, with one `TabsPanel` per trigger, matched by `value`. The root takes `value` or `defaultValue` and `onValueChange`, which is a request a controlled owner may refuse, plus the same `orientation`, `dir`, `activationMode`, `loop` and `keepMounted` as the facade. `TabsList` takes the `variant`.

## Breadcrumbs

`Breadcrumbs` shows the current page's ancestry: a `nav` landmark, named "Breadcrumbs" by default, holding an ordered list of native links. Its children are `Breadcrumb` items.

- **Exactly one item is current,** marked `aria-current="page"`: the last one, unless an item sets `current`.
- **A `disabled` item** is an ancestor that was deleted or is unavailable: it renders as text, never as a link, with an optional `disabledReason` beside it.
- **`maxItems`** collapses the middle: it keeps the first item, an overflow button and the last `maxItems - 2` items, with 3 as the minimum. The button opens a nonmodal panel of the hidden links, in order.
- **`renderLink`** renders each ancestor through your router's link, which must render an `<a href>`.
- **Also:** `separator` (a chevron that mirrors in right-to-left by default), `truncate` for long names, and `overflowLabel` and `overflowPanelLabel` to name the overflow parts.

Mercury never navigates, never prevents a click and never touches history: the links stay links.

## Tree

`Tree` is a controlled hierarchy of entities, the WAI-ARIA tree view. It keeps four states apart: focus (the active node), selection, expansion and loading.

- **Nodes:** each `TreeNodeData` has an `id`, a `label`, `children`, `disabled`, and a `kind`: `leaf`, `branch`, or `lazy` for children the host hasn't loaded. A failed load never turns a lazy node into a leaf.
- **Expansion:** `expandedIds` is controlled; `onExpandedChange(ids, change)` requests a change. A lazy node calls `loadChildren(id)` first, and a rejected load leaves the node expandable with a Retry.
- **Selection:** `selectionMode` is `none` by default, or `single` or `multiple`, with `selectedIds` and `onSelectionChange`. `selectionFollowsFocus` makes keyboard focus select, in single mode.
- **Keys:** Up, Down, Home and End move focus; Right expands a node, then moves into its first child; Left collapses it, then moves to its parent; Space selects; Enter calls `onActivate(id)`, which opens the node and is separate from both expansion and selection.
- **Focus:** `activeId`, `defaultActiveId` and `onActiveChange`. When the host removes the focused node, focus moves to its surviving parent, else a neighbour.
- **Per node:** `renderLabel` and `renderActions`. A `TreeItemAction` (rename, delete) is in the Tab order only while its node is the active one, and the arrows and Enter on the node never press it.

## NavigationTree, a tree of links

`NavigationTree` is not a Tree. Its nodes are routes, and its value is where the reader is, not a selection.

- **Each node** is `{ id, label, href?, target?, rel?, download?, children? }`. A node with `href` is a real anchor; one without is a heading for its children.
- **Each branch** has its own toggle button, named "Toggle" and the node's label, with `aria-expanded`. A toggle only expands; a link only navigates.
- **`currentId`** marks the current route with `aria-current="page"`. By default the current route's ancestors start expanded, so the route is visible on arrival; `expandedIds` or `defaultExpandedIds` and `onExpandedChange` control it.
- **`label`** is required and names the `nav` landmark.
- **`onNavigate(href, event)`** lets a client router take a plain, primary, same-tab click; the host routes and calls `event.preventDefault()` itself. Modified clicks, other tabs and downloads stay native.

## Menubar

`Menubar` is a desktop-style strip of menus. The facade takes `menus`, each `{ label, icon?, items }`, with `accent` and `dir`. An item has a `type`: `item` (the default), `check`, `radio`, `label` or `separator`. Rows take `label`, `shortcut`, `icon`, `onSelect` and `disabled`; a `check` row needs an `id`; `radio` rows share a `group` and each has a `value`; `checked` sets the starting state.

Its source documents the keyboard: Left and Right move between the triggers, and inside an open menu they open the neighbouring one. Enter, Space and ArrowDown open a menu on its first row, ArrowUp on its last. Escape, choosing a row, and Tab close it, with focus back on its trigger.

The compound form is `MenubarRoot` with one `MenubarMenuRoot` per menu, each holding a `MenubarTrigger` and a `MenubarContent`. The content takes the same parts as `Dropdown`'s: `MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarItemIndicator`, `MenubarGroup`, `MenubarLabel`, `MenubarSeparator`, and `MenubarSub` with `MenubarSubTrigger` and `MenubarSubContent`.

## Toolbar

`Toolbar` is one keyboard entry over a row or column of controls. Tab enters it and leaves it; the arrows move between its controls and Home and End jump to the ends. An input, textarea or select inside keeps its own editing keys. A Toolbar inside another renders as a `group`, and the outer one manages focus.

- **Props:** `orientation` (`horizontal` or `vertical`), `dir`, `loop` (`true` by default), `size` (`sm` or `md`), `variant` (`surface` draws the bar, `plain` only lays it out).
- **Disabled controls:** with `focusableWhenDisabled`, a disabled part stays focusable, marked `aria-disabled`, so a tooltip explaining why stays reachable. A part's own setting wins.
- **Parts:** `ToolbarButton` (a `type="button"` by default), `ToolbarLink`, `ToolbarGroup`, `ToolbarSeparator`, and `ToolbarToggleGroup` with `ToolbarToggleItem`s. A toggle group with `type="single"` is an exclusive choice, a `radiogroup` with a `string` value; with `type="multiple"` it is a group of independent pressed buttons with a `string[]` value.

Mercury's `Toggle` joins a Toolbar's set too: it reads the Toolbar's context.

## A page header

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";
import { Breadcrumb, Breadcrumbs, Tabs } from "@fiberfx/ui";

type View = "lesson" | "companion";

export function LessonHeader() {
  const [view, setView] = useState<View>("lesson");
  return (
    <header>
      <Breadcrumbs>
        <Breadcrumb href="/">Mercury</Breadcrumb>
        <Breadcrumb href="/ui">UI</Breadcrumb>
        <Breadcrumb href="/ui/navigation">Navigation</Breadcrumb>
      </Breadcrumbs>
      <Tabs<View>
        value={view}
        onChange={setView}
        tabs={[
          { label: "Lesson", value: "lesson", content: <p>The page.</p> },
          { label: "For agents", value: "companion", content: <p>The companion.</p> },
        ]}
      />
    </header>
  );
}
```

The last breadcrumb is the current page without being told. The tabs render their own panels, and only the selected one's content is mounted.

## The rest of the family

| Component | What it is |
|---|---|
| `Accordion` | a stack of collapsible disclosures |
| `NavigationMenu` | website navigation with link panels |
| `Pagination` | a page-stepper control |
| `TabNav` | link-styled navigation tabs |
| `TreeDestinationPicker` | the "Move to…" route over a tree |
