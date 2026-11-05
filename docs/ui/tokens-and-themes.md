Every value Mercury UI paints with, colour, type, spacing, radius and shadow, is a custom property in one file: `fiberfx/ui/src/styles/tokens.css`. The components read it, your own styles read it, and a theme is a different set of values for the same names.

## One sheet

The sheet is safe to import on its own, as `@fiberfx/ui/tokens.css`; the full stylesheet, `@fiberfx/ui/styles.css`, imports it first. It holds, in order:

1. **Fonts**, self-hosted: DM Sans (400, 500 and 700), DM Mono (300, 400 and 500) and DM Serif Display (400), each in normal and italic.
2. **Colour scales:** the raw steps.
3. **Semantic tokens:** the names a component reads, each pointing at a step.
4. **Type, radii, spacing and shadows.**
5. **The dark theme:** new values for the scales, scrims, rings and shadows.
6. **Element styles:** `html`, `body`, `h1` to `h5`, `p`, `small`, `code`, `pre`, `a` and a few classes, all in tokens.

One sheet is the rule for this site too: the token sheet is the only source of values, and a value no token can express is a reason to add a token, not to keep a literal.

## Colour scales

The scales follow a twelve-step pattern. Steps 1 to 3 are backgrounds, 4 to 8 interactive surfaces, step 9 the solid colour, and 10 to 12 text and accents.

| Scale | Role | Steps |
|---|---|---|
| `--slate-*` | neutrals | 1–12 |
| `--iris-*` | brand | 1–12 |
| `--indigo-*` | active, info, link | 1–12 |
| `--green-*` | positive | 3, 9, 11 |
| `--red-*` | negative | 3, 9, 11 |
| `--orange-*` | caution | 3, 9, 11 |
| `--plum-*` | discovery | 3, 9, 11 |

A step's value is an RGB triplet without the `rgb()`, for example `--iris-9: 91 91 214`. That is what lets one token serve both a solid colour and a colour with alpha.

## Semantic tokens

A component never reads a scale. It reads a semantic token, named `<role>-<intent>-<variant>-<state>`:

- **role:** `bg`, `fg`, `border` or `shadow`;
- **intent:** primary, secondary, tertiary, brand, active, positive, negative, caution, discovery, info, inverse, disabled;
- **variant:** solid by default, `subtle` or `muted`;
- **state:** default, `hover`, `pressed` or `disabled`.

The families:

- **Surfaces:** `--bg-primary` (the page), `--bg-secondary` (a raised surface), `--bg-tertiary` (sunken, a code block), `--bg-elevated` (a popover or a modal), `--bg-inverse`, `--bg-disabled`.
- **Brand and active:** `--bg-brand`, `--bg-brand-hover`, `--bg-brand-pressed`, `--bg-brand-subtle`, `--bg-brand-muted`; `--bg-active`, `--bg-active-hover`, `--bg-active-subtle`.
- **Status:** `--bg-positive`, `--bg-negative`, `--bg-caution`, `--bg-discovery`, `--bg-info`, each with a `-subtle` tint.
- **Scrims:** `--bg-hover`, `--bg-pressed`, `--bg-selected`, `--bg-backdrop`, `--bg-overlay`. These carry their own alpha, as `28 32 36 / 0.06`.
- **Text and icons:** `--fg-primary` (body text), `--fg-secondary` (muted), `--fg-tertiary` (placeholder, hint), `--fg-disabled`, `--fg-inverse`; `--fg-on-brand`, `--fg-on-active`, `--fg-on-positive`, `--fg-on-negative`, `--fg-on-caution`, `--fg-on-discovery` for text on a solid; `--fg-brand`, `--fg-active`, `--fg-link`, `--fg-link-hover`, `--fg-link-visited` and one per status.
- **Borders:** `--border-primary` (the default hairline), `--border-secondary`, `--border-strong`, `--border-disabled`, `--border-focus`, `--border-active`, `--border-brand`, `--border-inverse` and one per status.
- **Focus rings:** `--ring-focus` and `--ring-negative`, with alpha.

## Type, radii, spacing and shadows

- **Families:** `--font-primary` (DM Sans), `--font-secondary` (DM Mono), `--font-display` (DM Serif Display). Weights: `--fw-regular` 400, `--fw-medium` 500, `--fw-semi-bold` 600, `--fw-bold` 700, `--fw-black` 900.
- **Type scale:** `--text-body-100` to `--text-body-500` (10 to 18 px) and `--text-heading-100` to `--text-heading-500` (18 to 72 px), each as a `-size` and an `-lh` pair. The classes `.text-body-100` to `.text-body-500` apply a body step; `h1` to `h5` and `.h1` to `.h5` apply the heading steps.
- **Radii:** `--radius-2`, `-4`, `-6`, `-8`, `-12`, `-16`, `-20`, `-24`, `-32` and `--radius-full`.
- **Spacing:** `--space-2` to `--space-128`, in pixels: 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96, 128.
- **Elevation:** `--shadow-100` to `--shadow-600`; 100 to 400 are two layers, 500 and 600 one. These are complete values: use them as `var(--shadow-200)`, without `rgb()`.

## Using a token

A colour token is a triplet, so wrap it in `rgb()`. Everything else is a complete value:

```css
.panel {
  background: rgb(var(--bg-secondary));
  color: rgb(var(--fg-primary));
  border: 1px solid rgb(var(--border-primary));
  border-radius: var(--radius-8);
  padding: var(--space-16);
  box-shadow: var(--shadow-200);
}
.panel:hover { background: rgb(var(--bg-hover)); }
.panel:focus-visible { box-shadow: 0 0 0 3px rgb(var(--ring-focus)); }
```

That is how your own layout is styled. A Mercury UI component is styled through its enum props instead, and its private `.mx-*` rules read the same tokens, so both follow the theme.

## The theme switch

Light is the default: `:root` carries the light values. The theme is one class on `<html>`:

- **`.light-theme`** declares the light values, the same as `:root`.
- **`.dark-theme`** declares the dark values: the scales, the scrims, the focus rings and the shadows change, and every semantic token re-resolves against them.

```ts
export function setTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark-theme", theme === "dark");
  root.classList.toggle("light-theme", theme === "light");
}
```

In an application using Mercury UI, set the theme class before the first paint to avoid a flash of the wrong theme. This documentation site has a separate server-rendered shell: its theme form sends a POST, stores the choice in an HttpOnly `theme` cookie and redirects back to the page. The server writes `<html data-theme>` and the initial background styles; with no cookie, CSS follows `prefers-color-scheme`. The documentation site's switch requires no client-side script.

A theme class also works below `<html>`. Because `.dark-theme` re-declares the semantic tokens as well as the scales, a `.dark-theme` wrapper inside a light page resolves its subtree against the dark scales. `@fiberfx/content` relies on this: it wraps a rendered page document in `.light-theme` or `.dark-theme`.

## Contrast

The sheet carries its contrast measurements with it. `fiberfx/ui/scripts/check-contrast.mjs` measures every pair of `--fg-on-brand` text against the backgrounds it is painted on, and the `--fg-on-active` and `--fg-on-discovery` pairs, in both themes, by WCAG 2.x: 4.5 for text, 3.0 for a glyph.

In the dark theme every pair gates, and the solids under dark ink, `--iris-9`, `--indigo-9` and `--plum-9`, were lightened to reach 4.5. In the light theme four pairs are known to fail today and are listed by name: `--fg-on-brand` text on `--green-9`, `--orange-9` and `--red-9`, and a glyph on `--orange-9`. When one of them starts passing, the check fails until its line is removed, so the list stays the true set.
