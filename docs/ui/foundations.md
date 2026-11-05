Some facts about a component are not its props but its surroundings: which document it lives in, where its popover should mount, whether text runs left or right, which language its labels speak. Mercury UI keeps all of them in one inherited environment. A component reads it, and three providers set it.

## One environment

The environment is a context from `@fiberfx/core`, and `EnvironmentProvider` from `@fiberfx/ui` is the way to set it. Two rules make it predictable:

- **Overrides merge.** A provider sets only the fields you pass. An omitted field inherits from the enclosing provider; `null` is a value, meaning the resource is unavailable, and it is never replaced by a default.
- **No provider, no change.** Without one, Mercury keeps its single-document defaults: the global `document`, its `body` as the portal host, and `ltr`.

None of the three providers renders an element. They change what the components below them read, and nothing else.

## EnvironmentProvider's fields

| Prop | Type | Without it |
|---|---|---|
| `portalContainer` | `HTMLElement \| null` | the owner document's `body` |
| `ownerDocument` | `Document \| null` | the container's document, else the window's, else the global one |
| `ownerWindow` | `Window \| null` | the owner document's `defaultView`, else the global one |
| `direction` | `"ltr" \| "rtl"` | `"ltr"` |
| `locale` | `string` (BCP 47) | the runtime's own |
| `reducedMotion` | `"user" \| "always" \| "never"` | `"user"`: follows `prefers-reduced-motion` in the owner window |
| `focusFallback` | an element, a ref to one, or `null` | none |
| `idPrefix` | `string` | none |

Reach for it when Mercury renders somewhere other than the page's own document: an embedded editor, a preview iframe, an island inside another app's page.

- **The host follows the document.** Dismissal and focus listeners attach to the document that owns the overlay. Replace `portalContainer` while an overlay is open, and the former document's listeners are removed before the new one's are attached.
- **A host can go away.** When it is disposed, the overlay renders nothing, never in the parent document, and if its return target went with it, focus moves to `focusFallback` rather than nowhere.
- **Two roots, one page.** Each island is its own render root, and ids are numbered per root, so two islands on one page would number from the same start. Give each root its own `idPrefix` and their ids, and the ARIA relationships built on them, never collide.
- **A server render touches no browser global.** Every resource resolves to `null` there, so a portal renders nothing.

## Portal reads the host

`Portal` mounts its children in another container, so a floating surface escapes the `overflow` and stacking context of the place it is declared. It takes `children` and an optional `container`:

- with `container`, it mounts there; `container={null}` renders nothing;
- without it, it mounts in the environment's `portalContainer`;
- with no host at all, as on a server, it renders nothing.

The portalled content keeps its place in the component tree, so it still reads its logical parent's providers, the environment included. Its DOM events are native, though: they bubble through the host's DOM, not to the logical parent. Mercury's overlays already portal, so you use `Portal` directly only for an overlay of your own.

Mercury's showcase island shows the pattern. It renders a portal host inside its own element, wraps its stories in `<EnvironmentProvider portalContainer={portalHost}>`, and puts its theme class on that element rather than on the host page's `<html>`, so its overlays keep the island's tokens instead of landing unstyled in the host's `body`.

## DirectionProvider

`DirectionProvider` is the shorthand for direction alone: `<DirectionProvider dir="rtl">` is an `EnvironmentProvider` with `direction="rtl"`, inheriting every other field. `dir` is required, `"ltr"` or `"rtl"`.

`useDirection()` returns the direction in effect: the nearest provider's, else `"ltr"`. Components that mirror, such as arrow-key navigation and placement, read it.

Context crosses a portal where a DOM `dir` attribute does not, which is why direction lives in the environment: a popover portalled into `body` still knows it is in a right-to-left section.

## LocaleProvider

`LocaleProvider` sets the subtree's locale in the same environment and adds message catalogs. There is no second locale store, so a portalled overlay reads the same locale as its parent.

| Prop | Type | Notes |
|---|---|---|
| `locale` | `string` | required, so server and client render the same text |
| `direction` | `"ltr" \| "rtl" \| "auto"` | omitted: inherited, so a locale change never reverses it; `"auto"`: derived from the locale's script |
| `catalogs` | `MessageCatalogs` | messages by locale; omitted: the enclosing provider's |
| `fallbackLocales` | `string[]` | tried after the locale's own chain; omitted: the enclosing provider's |

`useLocale()` returns `{ locale, direction, explicit }`. `explicit` is `false` when no provider set a locale, and the runtime's own locale is in use; that one can differ between a server and a client.

Nest providers for a local override: the inner one wins for its subtree only.

## Messages and formatters

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

export function Cart() {
  return (
    <LocaleProvider locale="en-GB" catalogs={catalogs}>
      <CartLine count={3} total={42.5} />
    </LocaleProvider>
  );
}
```

`useLocaleFormatters(options)` returns a formatter set for the effective locale: `formatNumber`, `formatDate`, `formatList`, `plural`, `pluralCategory`, `compare`, `contains`, `startsWith` and `endsWith`. Its options are `timeZone`, `numberOptions`, `dateOptions`, `listOptions` and `collationOptions`; comparison defaults to `sensitivity: "base"`. Pass `timeZone` whenever a server and a client could differ.

`useMessageFormatter()` returns `format(key, values)`, `resolve(key, values)` and `missing()`:

- **A message** is a plain string, or a function `(values, formatters) => string`. In `plural`, `#` stands for the formatted count.
- **The chain:** the exact locale, its parents (`en-GB`, then `en`), then each fallback and its parents. In the example, `en-GB` finds nothing and `en`, the locale's own language, answers.
- **Mercury's own text:** the library's keys, `mercury.close`, `mercury.clear`, `mercury.loading`, `mercury.moreActions` and `mercury.selectedCount`, have bundled English when no catalog has them.
- **A missing key** resolves to the key itself, never an empty label, with a warning in development. `resolve` says where each message came from: `catalog`, `fallback`, `bundled` or `missing`.

The pure factories `createLocaleFormatters` and `createMessageFormatter` do the same outside a component, and `localeDirection(locale)` answers `"ltr"` or `"rtl"` for a tag.

## What the application still sets

A provider renders no element, so it can't set attributes. The application sets `lang` and `dir` on its own root element, so the browser's bidirectional layout and CSS logical properties agree with what the components read.
