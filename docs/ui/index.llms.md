# Mercury UI, the design system — Mercury LMS

> `@fiberfx/ui` 4.0.0: Mercury's design system. 139 components in ten families, written on `@fiberfx/hyperscript`, styled through enum props and one token sheet. Each component has a hand-written contract, `<Name>.prompt.md`, beside its source. No React.

## Read this when

You build a screen in a Mercury app and need to know which component exists, where it comes from, and how it is styled. This is the course's landing; the chapters follow.

## The contract (tier: Shipped — @fiberfx/ui 4.0.0 on npm since 2026-11-05)

- Components: `import { Button, Card } from "@fiberfx/ui"`. For published 4.0.0, load CSS explicitly: `import "@fiberfx/ui/styles.css"` in native apps, or link the pinned stylesheet in [browser HTML](/start/browser/llms.txt). A component import alone does not establish that styling is loaded.
- CSS alone: `@fiberfx/ui/styles.css` (everything) or `@fiberfx/ui/tokens.css` (tokens only).
- Peers: `@fiberfx/hyperscript` 4.0.0 and `@fiberfx/core` 4.0.0. JSX compiles against `@fiberfx/hyperscript`.
- Families: actions (3), foundations (19), inputs (32), forms (8), selection (15), feedback (8), data-display (17), navigation (11), overlay (11), layout (15).
- Style a component through its enum props (`variant`, `size`, `tone`); style your own layout with `rgb(var(--token))`.
- The `.mx-*` classes (`mx-btn`, `mx-card`, ...) are private: never write them. A component merges your own classes from its `class` prop.
- Also re-exported from `@fiberfx/core`: `cx`, `createFormatter`, `createTimeFormatter`, `useFocusManager`, `useLocale`, `useLocaleFormatters`, `useMessageFormatter`, `createLocaleFormatters`, `createMessageFormatter`, `localeDirection`.

## Minimal example

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

`Button`: `variant` primary | secondary | outline | ghost | destructive | inverse; `size` sm | md | lg; `loading`, `fullWidth`, `leading`, `trailing`, `type`. `Card`: `variant` flat | raised | floating; `padding`, `title`, `actions`.

## Never emit

An authored `.mx-*` class, a literal colour where a token exists, `npm i`, and any import from `react`, `react-dom` or `effector`.

## Next

- UI0, tokens and themes: /ui/tokens-and-themes/llms.txt
- UI1, foundations: /ui/foundations/llms.txt
- UI2, actions and layout: /ui/actions-and-layout/llms.txt
- UI3 inputs and forms: /ui/inputs-and-forms
- UI4 selection: /ui/selection
- UI5 feedback and data display: /ui/feedback-and-data
- UI6 navigation: /ui/navigation
- UI7 (overlays, and the capstone): planned, no page yet
- This companion: /ui/llms.txt (the page as Markdown, `/ui.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/ui)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)

### Chapter companions

- [/ui/actions-and-layout](/ui/actions-and-layout/llms.txt)
- [/ui/feedback-and-data](/ui/feedback-and-data/llms.txt)
- [/ui/foundations](/ui/foundations/llms.txt)
- [/ui/inputs-and-forms](/ui/inputs-and-forms/llms.txt)
- [/ui/navigation](/ui/navigation/llms.txt)
- [/ui/selection](/ui/selection/llms.txt)
- [/ui/tokens-and-themes](/ui/tokens-and-themes/llms.txt)
