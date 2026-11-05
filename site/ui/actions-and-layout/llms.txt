# UI2, actions and layout — Mercury LMS

> Mercury UI's actions, `Button`, `IconButton` and `Link`, and the layout composition tier, `Box`, `Stack`, `Flex`, `Grid`, `Container`, `Spacer`, `GridItem`, `Center`, `Sidebar`, `Cluster`, `Section`, whose spacing and radius props name token-scale steps.

## Read this when

You place a press, an icon-only control or an inline link, or lay out a screen without writing CSS for spacing.

## The contract (tier: Shipped — @fiberfx/ui 4.0.0 on npm since 2026-11-05)

- `Button`: `variant` primary (default) | secondary | outline | ghost | destructive | inverse; `size` sm | md (default) | lg; `loading` (disables, `aria-busy`, spinner replaces the leading icon); `fullWidth`; `leading`; `trailing`; `type` defaults to `"button"`.
- `IconButton`: `icon` and `label` required (`label` → `aria-label` and `title`); `variant` primary | secondary (default) | outline | ghost | destructive; `size` sm | md | lg; `shape` circle (default) | square.
- `Icon` glyphs (38): arrow, arrow-up-right, arrow-down-left, check, close, plus, minus, search, star, bell, cog, user, users, home, list, mail, wallet, credit-card, shield, globe, help-circle, chevron-right, chevron-down, alert, info, download, upload, trash, refresh, copy, pause, play, repeat, trending-up, bank, bolt, flow, batch. `IconName` accepts any string: an unknown name draws nothing.
- `Link`: `<a>` when `href` is set and not `disabled`, else `<button>`; `size` sm | md; `muted`; `leading`; `trailing`; `onClick`; `target`; `rel`.
- Scales (exported types): `SpaceScale` "2".."128" → `var(--space-*)`; `RadiusScale` "2".."32" | "full"; `Align` start | center | end | stretch | baseline; `Justify` start | center | end | between | around | evenly.
- `Box`: `p`/`px`/`py`/`pt`/`pr`/`pb`/`pl`, `bg` primary | secondary | tertiary | brand | brand-subtle | elevated, `radius`, `border`, `shadow` "100".."600".
- `Stack`: `gap`, `align`, `justify`. `Flex`: `direction`, `gap`, `align`, `justify`, `wrap`. `Grid`: `cols`, `rows` (a number = equal tracks, a string = template), `gap`, `flow`, `align`, `justify`.
- Every tier component takes `as` and passes other attributes through.

## Minimal example

```tsx
import { Box, Button, Flex, IconButton } from "@fiberfx/ui";

export const Bar = () => (
  <Box p="16" bg="secondary" radius="8" border>
    <Flex gap="8" align="center" justify="between">
      <IconButton icon="trash" label="Discard" variant="ghost" />
      <Button variant="primary">Save</Button>
    </Flex>
  </Box>
);
```

## Never emit

Scale props as numbers or pixels (`gap={12}`, `gap="12px"`: use `gap="12"`); an `IconButton` without `label`; an icon name outside the set; `<Link disabled href>` expecting an anchor; inline `style` spacing where a scale prop exists; any `react` or `effector` import.

## Next

- The course: /ui/llms.txt
- UI1, foundations: /ui/foundations/llms.txt
- This companion: /ui/actions-and-layout/llms.txt (the page as Markdown, `/ui/actions-and-layout.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/ui/actions-and-layout)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/ui/llms.txt)
