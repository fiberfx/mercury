# Mercury documentation-interface edition

These notes describe the supplied **Interface edition 1.0, 6 November 2026**. They are a starting point, not a substitute for current source inspection or universal Mercury component contracts.

## Identity and provenance

Use the supplied `mx-mark.svg`, fixed light/dark marks, plugin-style tiles and favicon where available. Preserve the mark's two paths, round caps and aspect ratio. Its inline m inherits text color and x follows `--lms-accent`; fixed-image variants deliberately retain documented blue accents. Do not homogenize these variants to purple. Inspect the color-value shape when inlining: the supplied SVG master expects a complete CSS color, while LMS semantic tokens contain RGB channels. Adapt the application binding to `rgb(var(--lms-accent))` when needed without redrawing the paths or silently changing the distributed master. There is no approved universal clear-space measurement or minimum print size in this edition.

The home link should expose one useful accessible name. Hide decorative SVG from the accessibility tree when the surrounding link already supplies that name; keep the link named when narrow layouts hide the visible wordmark.

## Dated typography and layout defaults

| Role | Edition value |
| --- | --- |
| Prose/display | DM Sans with fallbacks |
| Code | Existing system monospace stack |
| Body | 1rem, 1.75 unitless leading |
| Lead | 1.25rem, 1.6 unitless leading |
| Main heading | 2.5rem / 3rem; small screens 2rem / 2.5rem |
| Section heading | 1.25rem / 1.75rem, weight 700 |
| Reading measure | 68ch |
| Spacing increment | `--lms-baseline: 0.25rem` |
| Shared shell maximum | 80rem |

These are application values. A spacing increment does not guarantee every glyph baseline lands on a grid. Reader font/measure settings are personal overrides, not new brand defaults. DM Sans and measured browser behavior need rechecking when assets, languages or the host change.

## Dated semantic colors

| Token | Light | Dark |
| --- | --- | --- |
| `--bg-primary` | #FFFFFF | #111113 |
| `--bg-secondary` | #FDFDFD | #18191B |
| `--bg-tertiary` | #F5F5F5 | #212225 |
| `--fg-primary` | #000000 | #EDEEF0 |
| `--fg-secondary` | #3D3D3D | #B0B4BA |
| `--fg-tertiary` | #595D62 | #B0B4BA |
| `--lms-accent` | #4E46B4 | #7474DC |
| `--fg-brand` | #4E46B4 | #B1A9FF |

Use text tokens for text and fill tokens for surfaces. Accent-fill suitability does not prove accent-text contrast. Preserve underlined reading links and selected-state cues beyond color. Dark mode maps semantic roles; it is not mechanical inversion.

The edition's PDF is described as an untagged visual companion. Its browser observations are scoped to tested states; they are neither WCAG certification nor proof of a production release. Preserve these limits in derivative presentations.
