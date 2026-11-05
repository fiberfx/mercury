The actions family is small on purpose: `Button` for a press, `IconButton` for a press with only an icon, and `Link` for the inline text affordance. The layout tier sits beside it: plain functions whose spacing and radius props name steps of the token scales.

## Button

| Prop | Values | Default |
|---|---|---|
| `variant` | `primary`, `secondary`, `outline`, `ghost`, `destructive`, `inverse` | `primary` |
| `size` | `sm`, `md`, `lg` | `md` |
| `loading` | `boolean` | `false` |
| `fullWidth` | `boolean` | `false` |
| `leading`, `trailing` | children rendered before and after the label | none |
| `type` | `button`, `submit`, `reset` | `button` |

`Button` renders a native `<button>` and passes every other button attribute through. Its `type` defaults to `button`, so a Button inside a form submits only when you ask it to with `type="submit"`.

While `loading` is set, the button is disabled and marked `aria-busy`, a spinner takes the place of the leading icon, and the trailing icon is hidden. The label stays, so the button keeps its name.

## IconButton

`IconButton` is a button that carries only an icon, so its name is required:

| Prop | Values | Default |
|---|---|---|
| `icon` | a glyph name from `Icon`'s set | required |
| `label` | `string` | required |
| `variant` | `primary`, `secondary`, `outline`, `ghost`, `destructive` | `secondary` |
| `size` | `sm`, `md`, `lg` (a 16, 18 or 20 px glyph) | `md` |
| `shape` | `circle`, `square` | `circle` |

`label` becomes the button's `aria-label` and its `title`, so an icon-only control always has an accessible name. The glyph itself is hidden from assistive technology. `Icon`'s set holds 38 glyphs, among them `check`, `close`, `plus`, `minus`, `search`, `chevron-right`, `chevron-down`, `copy`, `trash`, `download` and `upload`. The type `IconName` accepts any string, so check a name against the set: an unknown one draws an empty glyph.

## Link

`Link` is the inline text affordance of forms and flows: "Forgot password?", "Back to sign in". It renders an `<a>` when `href` is set, and a `<button>` otherwise, so one affordance covers navigation and in-app actions. A disabled Link is always a `<button>`, so it can't be followed.

Its props are `href`, `onClick`, `disabled`, `size` (`sm` or `md`), `muted` (the tertiary colour instead of the brand colour), `leading`, `trailing`, `type`, `target`, `rel`, `class` and `aria-label`. It is presentational: the caller owns the navigation or the click.

## Layout on the token scales

The layout tier takes its sizes from the token sheet by name:

- **`SpaceScale`:** `"2"` to `"128"`, the steps of `--space-*`. `gap="12"` is `var(--space-12)`.
- **`RadiusScale`:** `"2"` to `"32"` and `"full"`, the steps of `--radius-*`.
- **`Align`:** `start`, `center`, `end`, `stretch`, `baseline`, for `align-items`.
- **`Justify`:** `start`, `center`, `end`, `between`, `around`, `evenly`.

The four types are exported from `@fiberfx/ui`, so your own components can take the same scale. Each of the eleven components below is a plain function that accepts `as` to render another element, and passes its other attributes through. The family's other four, `AspectRatio`, `AuthLayout`, `Collapsible` and `ScrollArea`, are not part of this tier.

## Box, Stack, Flex and Grid

- **`Box`:** one padded surface. `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl` take a space step; `bg` takes a surface (`primary`, `secondary`, `tertiary`, `brand`, `brand-subtle`, `elevated`); `radius` a radius step; `border` draws the secondary hairline; `shadow` takes `100` to `600`.
- **`Stack`:** a vertical flow, children top to bottom, with `gap`, `align` and `justify`.
- **`Flex`:** one line in any `direction` (`row`, `column`, `row-reverse`, `column-reverse`), with `gap`, `align`, `justify` and `wrap`.
- **`Grid`:** two dimensions. `cols` and `rows` take a count, which makes that many equal tracks, or a string used as the template as written; `flow` takes `row`, `column`, `dense`, `row dense` or `column dense`; with `gap`, `align` and `justify`.

## The composites

Seven more complete the tier:

- **`Container`:** a max-width reading column, centred by default.
- **`Spacer`:** flexible empty space inside a flex row or column.
- **`GridItem`:** a placement child for `Grid`, spanning columns or rows.
- **`Center`:** centres its child on both axes.
- **`Sidebar`:** a fixed-width rail beside a growing main column.
- **`Cluster`:** a horizontal group that wraps.
- **`Section`:** a semantic, padded page block, a vertical `Stack`.

## Putting them together

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

Nothing in it is a literal: every space, radius, surface and border is a step of the token sheet, so the bar follows the theme with the rest of the page.
