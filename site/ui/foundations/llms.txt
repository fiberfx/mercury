# UI1, where a subtree lives — Mercury LMS

> Mercury UI's environment: one inherited context (from `@fiberfx/core`) that every component reads for its portal host, owner document and window, direction, locale, reduced motion, focus fallback and id prefix. `EnvironmentProvider`, `DirectionProvider` and `LocaleProvider` set it and render no DOM; `Portal` reads the host.

## Read this when

Mercury renders inside an iframe, an embedded editor or an island on someone else's page; a section runs right to left; you localize labels, numbers, dates or plurals.

## The contract (tier: Shipped — @fiberfx/ui 4.0.0 on npm since 2026-11-05)

- `EnvironmentProvider` props: `portalContainer`, `ownerDocument`, `ownerWindow` (each nullable), `direction` (`"ltr" | "rtl"`), `locale` (BCP 47), `reducedMotion` (`"user" | "always" | "never"`, default `"user"`), `focusFallback`, `idPrefix`, `children`.
- Merge rule: an omitted prop inherits from the enclosing provider; `null` means unavailable and is never defaulted. No provider: global `document`, its `body`, `ltr`.
- A disposed or `null` host: overlays render nothing; focus moves to `focusFallback`. On a server every resource is `null`, so portals render nothing.
- Several islands on one page: give each root its own `idPrefix`.
- `Portal({ children, container? })`: `container` wins, else the environment's `portalContainer`; no host renders `null`. Context follows the component tree; DOM events bubble through the host.
- `DirectionProvider({ dir })`, `dir` required; `useDirection()` → `"ltr" | "rtl"`.
- `LocaleProvider({ locale, direction?, catalogs?, fallbackLocales? })`: `locale` required; `direction: "auto"` derives from the script; omitted `catalogs` and `fallbackLocales` inherit.
- `useLocale()` → `{ locale, direction, explicit }`.
- `useLocaleFormatters({ timeZone, numberOptions, dateOptions, listOptions, collationOptions })` → `formatNumber`, `formatDate`, `formatList`, `plural`, `pluralCategory`, `compare`, `contains`, `startsWith`, `endsWith`.
- `useMessageFormatter()` → `format(key, values)`, `resolve(key, values)` (with `source`: `catalog | fallback | bundled | missing`), `missing()`. Chain: locale, its parents, each fallback and its parents, then Mercury's bundled English for `mercury.close`, `mercury.clear`, `mercury.loading`, `mercury.moreActions`, `mercury.selectedCount`. An unknown key renders as the key.
- Also exported: `createLocaleFormatters`, `createMessageFormatter`, `localeDirection`, type `MessageCatalogs`.

## Minimal example

```tsx
import { LocaleProvider, useLocaleFormatters, useMessageFormatter } from "@fiberfx/ui";
import type { MessageCatalogs } from "@fiberfx/ui";

const catalogs: MessageCatalogs<"cart.items"> = {
  en: { "cart.items": (v, f) => f.plural(Number(v.count), { one: "# item", other: "# items" }) },
};

function CartLine({ count, total }: { count: number; total: number }) {
  const f = useLocaleFormatters({ numberOptions: { style: "currency", currency: "EUR" } });
  const t = useMessageFormatter();
  return <p>{t.format("cart.items", { count })}, {f.formatNumber(total)}</p>;
}

export const Cart = () => (
  <LocaleProvider locale="en-GB" catalogs={catalogs}>
    <CartLine count={3} total={42.5} />
  </LocaleProvider>
);
```

## Never emit

A second locale store or direction context; a provider expected to set `lang` or `dir` (the application sets both on its own root element); `UiEnvironmentContext.Provider` by hand (render `EnvironmentProvider`, which merges); `ReactNode`, `createPortal` from `react-dom`, or any `react` or `effector` import.

## Next

- The course: /ui/llms.txt
- UI0, tokens and themes: /ui/tokens-and-themes/llms.txt
- This companion: /ui/foundations/llms.txt (the page as Markdown, `/ui/foundations.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/ui/foundations)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/ui/llms.txt)
