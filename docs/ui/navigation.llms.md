# UI6, navigation — Mercury LMS

> Mercury UI's navigation: `Tabs` (facade and `TabsRoot`/`TabsList`/`TabsTrigger`/`TabsPanel`), `Breadcrumbs`, `Tree`, `NavigationTree`, `Menubar` (facade and compound parts) and `Toolbar` with its parts. Tabs, Toolbar, Menubar and Tree use one primary Tab stop and arrows inside, mirrored in RTL. Breadcrumbs and NavigationTree keep native link and button navigation; Mercury does not perform application routing.

## Read this when

You build tabs, a breadcrumb trail, an entity tree, a sidebar of route links, a desktop-style menu strip or an editor toolbar.

## The contract (tier: Shipped — @fiberfx/ui 4.0.0 on npm since 2026-11-05)

- `Tabs`: `tabs: { label, value, disabled?, content?, panelId? }[]`, `value`, `onChange(value)`, `activationMode` (`automatic` default | `manual`), `orientation`, `dir`, `loop` (true), `keepMounted` (false), `variant` (`underline` | `pills`).
- Tabs parts: `TabsRoot` (`value`/`defaultValue`/`onValueChange`, same modes) › `TabsList` (`variant`) › `TabsTrigger` (`value`), plus `TabsPanel` (`value`, `keepMounted`).
- `Breadcrumbs` (`label` "Breadcrumbs", `maxItems` ≥ 3, `separator`, `renderLink`, `truncate`, `overflowLabel`, `overflowPanelLabel`) › `Breadcrumb` (`href`, `current` (default: last), `disabled`, `disabledReason`, `id`). Exactly one `aria-current="page"`.
- `Tree`: `nodes: TreeNodeData[]` (`id`, `label`, `kind` `leaf | branch | lazy`, `children`, `disabled`), `expandedIds` (controlled) + `onExpandedChange`, `loadChildren`, `selectionMode` (`none` default), `selectedIds`, `onSelectionChange`, `selectionFollowsFocus`, `activeId`/`onActiveChange`, `onActivate` (Enter), `renderLabel`, `renderActions`, `dir`. `TreeItemAction` (`label`) for per-node actions.
- `NavigationTree`: `label` (required), `nodes: { id, label, href?, target?, rel?, download?, children? }[]`, `currentId`, `expandedIds`/`defaultExpandedIds` (default: the current route's ancestors), `onExpandedChange`, `onNavigate(href, event)` (host routes and calls `preventDefault`), `renderLabel`, `dir`.
- `Menubar`: `menus: { label, icon?, items: { type?, label, id?, group?, value?, checked?, shortcut?, icon?, onSelect?, disabled? }[] }[]`, `accent`, `dir`. Compound: `MenubarRoot` › `MenubarMenuRoot` › `MenubarTrigger` + `MenubarContent` with `MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarItemIndicator`, `MenubarGroup`, `MenubarLabel`, `MenubarSeparator`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`.
- `Toolbar`: `orientation`, `dir`, `loop` (true), `size` (`sm | md`), `variant` (`surface | plain`), `focusableWhenDisabled`. Parts: `ToolbarButton`, `ToolbarLink`, `ToolbarGroup`, `ToolbarSeparator`, `ToolbarToggleGroup` (`type: "single"` with `value: string`, or `"multiple"` with `value: string[]`) › `ToolbarToggleItem` (`value`).

## Minimal example

```tsx
import { Breadcrumb, Breadcrumbs } from "@fiberfx/ui";

export const Trail = () => (
  <Breadcrumbs>
    <Breadcrumb href="/">Mercury</Breadcrumb>
    <Breadcrumb href="/ui">UI</Breadcrumb>
    <Breadcrumb href="/ui/navigation">Navigation</Breadcrumb>
  </Breadcrumbs>
);
```

## Never emit

A Tree used for route links (use NavigationTree); a NavigationTree node expected to select; a router call from Breadcrumbs (it never navigates); two current breadcrumbs; `maxItems` below 3; a Tab stop on every toolbar button; Tree expansion assumed to select; an import from any UI framework other than `@fiberfx/hyperscript`.

## Next

- The course: /ui/llms.txt
- UI5, feedback and data display: /ui/feedback-and-data/llms.txt
- This companion: /ui/navigation/llms.txt

## Navigation

- [Read this page in the browser](/ui/navigation)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/ui/llms.txt)
