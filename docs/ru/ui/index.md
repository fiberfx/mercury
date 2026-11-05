Mercury UI — библиотека компонентов дизайн-системы: пакет `@fiberfx/ui`, версия 4.0.0. Компоненты написаны на Mercury Hyperscript; цвета, типографика, отступы, радиусы и тени берутся из единой таблицы токенов.

## Что такое Mercury UI

Пакет содержит 139 компонентов, по одному каталогу на компонент в `fiberfx/ui/src/components/<family>/<Name>/`. Каждый каталог объединяет три файла:

- **`<Name>.tsx`:** компонент — функция на `@fiberfx/hyperscript`. Его JSX компилируется для среды выполнения Hyperscript.
- **`<Name>.prompt.md`:** контракт, написанный вручную: назначение, свойства, допустимые значения перечислений, из чего компонент состоит и где используется, примеры и примечания. Такой файл есть у каждого из 139 компонентов.
- **`index.ts`:** одна строка `export * from "./<Name>"`, которую подхватывает общий файл экспортов пакета.

У `@fiberfx/ui` две peer-зависимости той же версии: `@fiberfx/hyperscript` выполняет рендеринг, а `@fiberfx/core` содержит то, у чего нет собственной разметки: `cx`, форматирование дат и локалей, управление фокусом и окружение UI.

## Импорт

Всё импортируется из одной точки входа, `@fiberfx/ui`:

```tsx
import { Button, Card } from "@fiberfx/ui";

export function SaveCard() {
  return (
    <Card variant="raised" title="Draft">
      <Button variant="primary">Save</Button>
    </Card>
  );
}
```

Для опубликованной версии 4.0.0 подключайте стили явно. В нативном приложении добавьте `import "@fiberfx/ui/styles.css"`; в [браузерном HTML](/ru/start/browser) используйте link на закреплённую таблицу стилей. Исходная точка входа `src/index.ts` содержит импорт CSS, но это не основание считать импорт опубликованного JavaScript достаточным для оформления. Подпути CSS:

| Подпуть | Содержимое |
|---|---|
| `@fiberfx/ui` | все компоненты, а также `cx`, форматтеры и хуки локали и фокуса, реэкспортированные из `@fiberfx/core` |
| `@fiberfx/ui/styles.css` | полная таблица стилей: токены, затем правила компонентов |
| `@fiberfx/ui/tokens.css` | только токены: шрифты, цветовые шкалы, семантические токены, типографика, радиусы, отступы и тени |

## Десять семейств

| Семейство | Число | Компоненты |
|---|---|---|
| actions | 3 | Button, IconButton, Link |
| foundations | 19 | AccessibleIcon, CloseButton, DataInteractive, DirectionProvider, Divider, EnvironmentProvider, Focusable, FocusRing, FocusScope, Group, Heading, Icon, LocaleProvider, Portal, Pressable, Separator, Slot, Text, VisuallyHidden |
| inputs | 32 | AuthCode, Autocomplete, Calendar, ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, ColorSwatchPicker, ColorThumb, ColorWheel, DateField, DatePicker, DateRangeField, DateRangePicker, DateTimeField, DropZone, FileTrigger, FileUpload, Input, Label, MoneyInput, PasswordField, RangeCalendar, Search, SearchField, Select, Textarea, TimeField, TimeZonePicker, TokenField, TokenPicker |
| forms | 8 | Description, ErrorSummary, Field, FieldError, Fieldset, Form, FormSection, Legend |
| selection | 15 | Checkbox, CheckboxCards, CheckboxGroup, Combobox, CustomSelect, EntityPicker, ListBox, Radio, RadioCards, RadioGroup, Segmented, Slider, Switch, TagGroup, Toggle |
| feedback | 8 | Alert, Callout, Meter, PasswordStrength, Progress, Skeleton, Spinner, Toast |
| data-display | 17 | Avatar, Badge, Blockquote, Card, Chart, Checklist, Chip, Code, DataGrid, DataList, GridList, Kbd, ListRow, Stat, Table, Tag, Virtualizer |
| navigation | 11 | Accordion, Breadcrumbs, Menubar, NavigationMenu, NavigationTree, Pagination, TabNav, Tabs, Toolbar, Tree, TreeDestinationPicker |
| overlay | 11 | AlertDialog, ContextMenu, Dialog, Dropdown, HoverCard, LinkPreview, Modal, Popover, PreviewTrigger, Sheet, Tooltip |
| layout | 15 | AspectRatio, AuthLayout, Box, Center, Cluster, Collapsible, Container, Flex, Grid, GridItem, ScrollArea, Section, Sidebar, Spacer, Stack |

Каждое имя в таблице соответствует каталогу; он экспортирует компонент и его типы. Некоторые каталоги экспортируют несколько имён: Sheet — единый компонент и его части, PreviewTrigger — также связанные части Preview.

## Свойства с перечислениями и токены

Оформление компонента задаётся свойствами с перечислениями, а не именами его классов. `Button` принимает `variant` (`primary`, `secondary`, `outline`, `ghost`, `destructive`, `inverse`) и `size` (`sm`, `md`, `lg`); `Card` — `variant` (`flat`, `raised`, `floating`). Каждое значение выбирает внутренние классы компонента, а они читают семантические токены, поэтому все компоненты следуют теме.

Классы `mx-btn`, `mx-card` и остальные — внутренние для пакета: приложение их не пишет. Собственная раскладка приложения оформляется теми же токенами через `rgb(var(--token))`. Таблица токенов разобрана в UI0.

## Главы

| Глава | Маршрут | Содержание |
|---|---|---|
| UI0 | [/ru/ui/tokens-and-themes](/ru/ui/tokens-and-themes) | таблица токенов и классы светлой и тёмной темы |
| UI1 | [/ru/ui/foundations](/ru/ui/foundations) | провайдеры окружения поддерева: среда, направление и локаль |
| UI2 | [/ru/ui/actions-and-layout](/ru/ui/actions-and-layout) | действия и раскладка: Button, IconButton, Link и компоненты композиции — Box, Stack, Flex, Grid и составные компоненты |
| UI3 | [написана](/ru/ui/inputs-and-forms) | ввод и формы: Field, Label, Description, FieldError, текстовые поля, даты и цвета |
| UI4 | [написана](/ru/ui/selection) | выбор: Checkbox, Radio, Switch, ListBox, Combobox и группы |
| UI5 | [написана](/ru/ui/feedback-and-data) | обратная связь и отображение данных: Alert, Toast, Progress, Card, Table, DataGrid |
| UI6 | [написана](/ru/ui/navigation) | навигация: Tabs, Tree, NavigationTree, Breadcrumbs, Menubar, Toolbar |
| UI7 | запланирована | наложения и итоговое задание: заново собрать поле поиска и боковую панель этого сайта |

## Что поставляется

139 компонентов и их контракты входят в `@fiberfx/ui`. Версия 4.0.0 доступна в npm с 2026-11-05. Главы UI0–UI6 написаны; UI7 запланирована и пока не имеет страницы.
