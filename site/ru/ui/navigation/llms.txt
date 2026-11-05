# UI6, навигация — Mercury LMS

> Навигация Mercury UI: `Tabs` (фасад и `TabsRoot`/`TabsList`/`TabsTrigger`/`TabsPanel`), `Breadcrumbs`, `Tree`, `NavigationTree`, `Menubar` (фасад и составные части), `Toolbar` с его частями. Tabs, Toolbar, Menubar и Tree используют одну основную остановку Tab и стрелки внутри, с зеркальным направлением в RTL. Breadcrumbs и NavigationTree сохраняют нативную навигацию по ссылкам и кнопкам; Mercury не выполняет маршрутизацию приложения.

## Когда читать

Когда вы строите вкладки, хлебные крошки, дерево сущностей, боковую панель ссылок на маршруты, строку меню настольного типа или панель инструментов редактора.

## Контракт (уровень готовности: опубликован — @fiberfx/ui 4.0.0 в npm с 2026-11-05)

- `Tabs`: `tabs: { label, value, disabled?, content?, panelId? }[]`, `value`, `onChange(value)`, `activationMode` (`automatic` по умолчанию | `manual`), `orientation`, `dir`, `loop` (true), `keepMounted` (false), `variant` (`underline` | `pills`).
- Части Tabs: `TabsRoot` (`value`/`defaultValue`/`onValueChange`, те же режимы) › `TabsList` (`variant`) › `TabsTrigger` (`value`), плюс `TabsPanel` (`value`, `keepMounted`).
- `Breadcrumbs` (`label` "Breadcrumbs", `maxItems` ≥ 3, `separator`, `renderLink`, `truncate`, `overflowLabel`, `overflowPanelLabel`) › `Breadcrumb` (`href`, `current` (по умолчанию последний), `disabled`, `disabledReason`, `id`). Ровно один `aria-current="page"`.
- `Tree`: `nodes: TreeNodeData[]` (`id`, `label`, `kind` `leaf | branch | lazy`, `children`, `disabled`), `expandedIds` (управляемый) + `onExpandedChange`, `loadChildren`, `selectionMode` (по умолчанию `none`), `selectedIds`, `onSelectionChange`, `selectionFollowsFocus`, `activeId`/`onActiveChange`, `onActivate` (Enter), `renderLabel`, `renderActions`, `dir`. `TreeItemAction` (`label`) — действия узла.
- `NavigationTree`: `label` (обязателен), `nodes: { id, label, href?, target?, rel?, download?, children? }[]`, `currentId`, `expandedIds`/`defaultExpandedIds` (по умолчанию предки текущего маршрута), `onExpandedChange`, `onNavigate(href, event)` (приложение маршрутизирует и вызывает `preventDefault`), `renderLabel`, `dir`.
- `Menubar`: `menus: { label, icon?, items: { type?, label, id?, group?, value?, checked?, shortcut?, icon?, onSelect?, disabled? }[] }[]`, `accent`, `dir`. Составная форма: `MenubarRoot` › `MenubarMenuRoot` › `MenubarTrigger` + `MenubarContent` с `MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarItemIndicator`, `MenubarGroup`, `MenubarLabel`, `MenubarSeparator`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`.
- `Toolbar`: `orientation`, `dir`, `loop` (true), `size` (`sm | md`), `variant` (`surface | plain`), `focusableWhenDisabled`. Части: `ToolbarButton`, `ToolbarLink`, `ToolbarGroup`, `ToolbarSeparator`, `ToolbarToggleGroup` (`type: "single"` с `value: string` либо `"multiple"` с `value: string[]`) › `ToolbarToggleItem` (`value`).

## Минимальный пример

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

## Чего не генерировать

Tree для ссылок на маршруты (используйте NavigationTree); ожидание выбора от узла NavigationTree; вызов маршрутизатора из Breadcrumbs (он не выполняет переходы); две текущие хлебные крошки; `maxItems` меньше 3; остановку Tab на каждой кнопке Toolbar; предположение, что раскрытие Tree выбирает узел; импорт из любого UI-фреймворка, кроме `@fiberfx/hyperscript`.

## Далее

- Курс: /ru/ui/llms.txt
- UI5, обратная связь и отображение данных: /ru/ui/feedback-and-data/llms.txt
- Эта версия для агентов: /ru/ui/navigation/llms.txt

## Навигация

- [Страница в браузере](/ru/ui/navigation)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/ui/llms.txt)
