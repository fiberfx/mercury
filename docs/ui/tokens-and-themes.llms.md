# UI0, tokens and themes — Mercury LMS

> Mercury UI's one token sheet, `fiberfx/ui/src/styles/tokens.css` (also `@fiberfx/ui/tokens.css`), holds every colour, type, radius, spacing and shadow value. The theme is the class `.light-theme` or `.dark-theme` on `<html>`; light is the default on `:root`.

## Read this when

You style your own layout in a Mercury app, pick a colour for a state, or switch or set the theme.

## The contract (tier: Shipped — @fiberfx/ui 4.0.0 on npm since 2026-11-05)

- Colour tokens are RGB triplets: always `rgb(var(--token))`. Scrims carry alpha already (`--bg-hover: 28 32 36 / 0.06`), still `rgb(var(--bg-hover))`.
- Everything else is a complete value: `var(--space-16)`, `var(--radius-8)`, `var(--shadow-200)`, `var(--font-primary)`, `var(--text-body-300-size)`.
- Read semantic tokens, not scales: `--bg-*`, `--fg-*`, `--border-*`, `--ring-focus`, `--ring-negative`. Naming: `<role>-<intent>-<variant>-<state>`.
- Surfaces: `--bg-primary` page, `--bg-secondary` raised, `--bg-tertiary` sunken, `--bg-elevated` popover/modal. Text: `--fg-primary`, `--fg-secondary`, `--fg-tertiary`. Hairline: `--border-primary`. Text on a solid: `--fg-on-<intent>`.
- Scales: `--slate-1..12`, `--iris-1..12` (brand), `--indigo-1..12` (active, info, link); `--green-`, `--red-`, `--orange-`, `--plum-` at 3, 9, 11.
- Spacing `--space-2..128`; radii `--radius-2..32`, `--radius-full`; type `--text-body-100..500`, `--text-heading-100..500` (`-size`, `-lh`); weights `--fw-regular|medium|semi-bold|bold|black`; shadows `--shadow-100..600`.
- Focus ring: `box-shadow: 0 0 0 3px rgb(var(--ring-focus))`.
- Theme: toggle `dark-theme` / `light-theme` on `document.documentElement`, before first paint. A `.dark-theme` wrapper deeper in the page also works: it re-declares the semantic tokens.

## Minimal example

```css
.panel {
  background: rgb(var(--bg-secondary));
  border: 1px solid rgb(var(--border-primary));
  border-radius: var(--radius-8);
  padding: var(--space-16);
}
```

```ts
document.documentElement.classList.toggle("dark-theme", dark);
document.documentElement.classList.toggle("light-theme", !dark);
```

## Never emit

A literal colour, size, space or radius where a token exists; `var(--bg-brand)` without `rgb()`; `rgb(var(--shadow-200))`; `<html data-theme>` as a substitute for Mercury UI theme classes (the documentation shell has a separate data-theme contract); an authored `.mx-*` class.

## Limits

In the light theme, `--fg-on-brand` text on `--green-9`, `--orange-9` and `--red-9`, and a glyph on `--orange-9`, are known to fail WCAG AA (`fiberfx/ui/scripts/check-contrast.mjs` LIGHT_DEFECTS). The documentation shell already uses an HttpOnly `theme` cookie, a POST/303 form and server-rendered `data-theme`; with no cookie, CSS follows the system preference. Its switch needs no script. Mercury UI applications use the theme classes described above.

## Next

- The course: /ui/llms.txt
- UI1, foundations: /ui/foundations/llms.txt
- This companion: /ui/tokens-and-themes/llms.txt (the page as Markdown, `/ui/tokens-and-themes.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/ui/tokens-and-themes)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/ui/llms.txt)
