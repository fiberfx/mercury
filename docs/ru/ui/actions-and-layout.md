Семейство действий намеренно небольшое: `Button` для нажатия, `IconButton` для кнопки с одной иконкой, `Link` для встроенного текстового действия. Рядом — компоненты раскладки: обычные функции, в которых свойства отступов и радиусов называют ступени шкал токенов.

## Button

| Свойство | Значения | По умолчанию |
|---|---|---|
| `variant` | `primary`, `secondary`, `outline`, `ghost`, `destructive`, `inverse` | `primary` |
| `size` | `sm`, `md`, `lg` | `md` |
| `loading` | `boolean` | `false` |
| `fullWidth` | `boolean` | `false` |
| `leading`, `trailing` | содержимое перед подписью и после неё | нет |
| `type` | `button`, `submit`, `reset` | `button` |

`Button` отображает нативный `<button>` и передаёт остальные атрибуты кнопки без изменений. `type` по умолчанию равен `button`, поэтому внутри формы отправка происходит только при явном `type="submit"`.

При `loading` кнопка отключается и получает `aria-busy`; индикатор загрузки заменяет ведущую иконку, а завершающая скрывается. Подпись остаётся, сохраняя имя кнопки.

## IconButton

`IconButton` содержит только иконку, поэтому имя обязательно:

| Свойство | Значения | По умолчанию |
|---|---|---|
| `icon` | имя символа из набора `Icon` | обязательно |
| `label` | `string` | обязательно |
| `variant` | `primary`, `secondary`, `outline`, `ghost`, `destructive` | `secondary` |
| `size` | `sm`, `md`, `lg` — символ 16, 18 или 20 px | `md` |
| `shape` | `circle`, `square` | `circle` |

`label` становится `aria-label` и `title` кнопки, поэтому элемент с одной иконкой всегда имеет доступное имя. Сам символ скрыт от вспомогательных технологий. Набор `Icon` содержит 38 символов, включая `check`, `close`, `plus`, `minus`, `search`, `chevron-right`, `chevron-down`, `copy`, `trash`, `download` и `upload`. Тип `IconName` принимает любую строку, поэтому сверяйте имя с набором: неизвестное имя даёт пустое изображение.

## Link

`Link` — встроенное текстовое действие в формах и сценариях, например «Забыли пароль?» или «Вернуться ко входу». Он отображает `<a>` при заданном `href`, иначе `<button>`: один компонент покрывает навигацию и действия внутри приложения. Отключённый Link всегда является `<button>`, поэтому переход по нему невозможен.

Свойства: `href`, `onClick`, `disabled`, `size` (`sm` или `md`), `muted` — третичный цвет вместо фирменного, `leading`, `trailing`, `type`, `target`, `rel`, `class`, `aria-label`. Компонент отвечает за представление; навигацией или щелчком управляет вызывающий код.

## Раскладка по шкалам токенов

Компоненты раскладки берут размеры из таблицы токенов по имени:

- **`SpaceScale`:** от `"2"` до `"128"`, ступени `--space-*`. `gap="12"` означает `var(--space-12)`.
- **`RadiusScale`:** от `"2"` до `"32"` и `"full"`, ступени `--radius-*`.
- **`Align`:** `start`, `center`, `end`, `stretch`, `baseline`, для `align-items`.
- **`Justify`:** `start`, `center`, `end`, `between`, `around`, `evenly`.

Четыре типа экспортируются из `@fiberfx/ui`, чтобы ваши компоненты принимали те же шкалы. Каждый из одиннадцати компонентов ниже — обычная функция, принимающая `as` для выбора другого элемента и передающая остальные атрибуты. Ещё четыре компонента семейства — `AspectRatio`, `AuthLayout`, `Collapsible`, `ScrollArea` — в этот уровень композиции не входят.

## Box, Stack, Flex и Grid

- **`Box`:** поверхность с внутренними отступами. `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl` принимают ступень отступа; `bg` — поверхность (`primary`, `secondary`, `tertiary`, `brand`, `brand-subtle`, `elevated`); `radius` — ступень радиуса; `border` рисует вторичную тонкую границу; `shadow` принимает от `100` до `600`.
- **`Stack`:** вертикальный поток сверху вниз с `gap`, `align` и `justify`.
- **`Flex`:** линия в любом `direction` (`row`, `column`, `row-reverse`, `column-reverse`), с `gap`, `align`, `justify`, `wrap`.
- **`Grid`:** два измерения. `cols` и `rows` принимают число равных треков либо строку шаблона без изменений; `flow` принимает `row`, `column`, `dense`, `row dense`, `column dense`; также есть `gap`, `align`, `justify`.

## Составные компоненты

Ещё семь завершают этот уровень:

- **`Container`:** колонка для чтения с максимальной шириной, по умолчанию центрированная.
- **`Spacer`:** гибкое пустое пространство во flex-строке или колонке.
- **`GridItem`:** дочерний элемент `Grid` для размещения на нескольких столбцах или строках.
- **`Center`:** центрирование потомка по обеим осям.
- **`Sidebar`:** боковая колонка фиксированной ширины рядом с расширяющейся основной.
- **`Cluster`:** горизонтальная группа с переносом.
- **`Section`:** семантический блок страницы с отступами, вертикальный `Stack`.

## Совместное использование

```tsx
import { Box, Button, Flex, IconButton, Link, Stack, Text } from "@fiberfx/ui";

export function SaveBar({ saving }: { saving: boolean }) {
  return (
    <Box p="16" bg="secondary" radius="8" border>
      <Stack gap="12">
        <Text>Your draft has unsaved changes.</Text>
        <Flex gap="8" align="center" justify="between">
          <Link href="/drafts" muted>All drafts</Link>
          <Flex gap="8" align="center">
            <IconButton icon="trash" label="Discard draft" variant="ghost" />
            <Button variant="primary" loading={saving}>Save</Button>
          </Flex>
        </Flex>
      </Stack>
    </Box>
  );
}
```

Здесь нет буквальных значений оформления: каждый отступ, радиус, поверхность и граница заданы ступенью таблицы токенов. Поэтому панель следует теме вместе со страницей.
