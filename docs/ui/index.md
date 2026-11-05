Mercury UI is the design system's component library: the package `@fiberfx/ui`, version 4.0.0. Its components are written on Mercury Hyperscript, and they take their colours, type, spacing, radii and shadows from one sheet of tokens.

## What Mercury UI is

The package holds 139 components, one folder each, under `fiberfx/ui/src/components/<family>/<Name>/`. Each folder keeps three things together:

- **`<Name>.tsx`:** the component, a function on `@fiberfx/hyperscript`. Its JSX compiles against Hyperscript's runtime, not any other.
- **`<Name>.prompt.md`:** its hand-written contract: what it is for, its props, its enum language, what it composes and what composes it, examples and notes. Each of the 139 components has one.
- **`index.ts`:** one line, `export * from "./<Name>"`, which the package's barrel picks up.

`@fiberfx/ui` depends on two peers at the same version: `@fiberfx/hyperscript`, which renders it, and `@fiberfx/core`, which holds what has no markup of its own: `cx`, the date and locale formatters, focus management and the UI environment.

## Importing it

Everything comes from one entry, `@fiberfx/ui`:

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

For published 4.0.0, load styles explicitly. In a native app, add `import "@fiberfx/ui/styles.css"`; in [browser HTML](/start/browser), link the pinned stylesheet. The source entry `src/index.ts` imports CSS, but that is not a guarantee that importing the published JavaScript loads styling. The CSS subpaths are:

| Subpath | What it is |
|---|---|
| `@fiberfx/ui` | every component, plus `cx`, the formatters and the locale and focus hooks re-exported from `@fiberfx/core` |
| `@fiberfx/ui/styles.css` | the whole stylesheet: tokens, then the components' rules |
| `@fiberfx/ui/tokens.css` | the token sheet alone: fonts, colour scales, semantic tokens, type, radii, spacing and shadows |

## The ten families

| Family | Count | Components |
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

Each name in the table is a folder, and the folder's exports are the component and its types. Some folders export more than one name: Sheet exports its facade and parts, and PreviewTrigger exports the Preview parts beside it.

## Enum props and tokens

A component is styled through its enum props, never by its class names. `Button` takes `variant` (`primary`, `secondary`, `outline`, `ghost`, `destructive`, `inverse`) and `size` (`sm`, `md`, `lg`); `Card` takes `variant` (`flat`, `raised`, `floating`). Each value selects the component's own classes, and those classes read the semantic tokens, so every component follows the theme.

Those classes, `mx-btn`, `mx-card` and the rest, are private to the package: an application never writes them. Your own layout styles itself with the same tokens, as `rgb(var(--token))`. Chapter UI0 covers the sheet.

## The chapters

| Chapter | Route | What it teaches |
|---|---|---|
| UI0 | [/ui/tokens-and-themes](/ui/tokens-and-themes) | the token sheet and the light and dark theme classes |
| UI1 | [/ui/foundations](/ui/foundations) | the providers that tell a subtree where it lives: environment, direction and locale |
| UI2 | [/ui/actions-and-layout](/ui/actions-and-layout) | actions and layout: Button, IconButton, Link and the composition tier (Box, Stack, Flex, Grid and the composites) |
| UI3 | [written](/ui/inputs-and-forms) | inputs and forms: Field, Label, Description, FieldError and the text, date and color inputs |
| UI4 | [written](/ui/selection) | selection: Checkbox, Radio, Switch, ListBox, Combobox and their groups |
| UI5 | [written](/ui/feedback-and-data) | feedback and data display: Alert, Toast, Progress, Card, Table, DataGrid |
| UI6 | [written](/ui/navigation) | navigation: Tabs, Tree, NavigationTree, Breadcrumbs, Menubar, Toolbar |
| UI7 | planned | overlays, and the capstone: rebuild this site's search field and sidebar |

## What is shipped

The 139 components and their contracts are built inside `@fiberfx/ui`. Version 4.0.0 is on npm since 2026-11-05. Chapters UI0 to UI6 are written; UI7 is planned, and a planned chapter has no page yet.
