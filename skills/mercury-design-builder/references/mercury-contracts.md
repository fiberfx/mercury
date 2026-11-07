# Mercury composition contracts

These are lessons verified against Mercury UI/Hyperscript 4.0.0. Recheck the installed version's exports and types; this is a guide to fragile boundaries, not a replacement API catalog. Facades and lower-level composition parts may expose different callbacks.

## Runtime, styling, and mount

- Import `h`/`render` from `@fiberfx/hyperscript`, hooks from `@fiberfx/hyperscript/hooks`, and components from `@fiberfx/ui`. Use the host's compiler/runtime configuration, without adding React or compatibility imports.
- Load `@fiberfx/ui/styles.css` explicitly through the supported build, or link its pinned published stylesheet on the browser route. Tokens alone do not supply component styles.
- Read the manifest's source and published exports. A module checkout and an installed package can resolve the same import to different files.
- Use an empty mount host for a client-only page. In observed bundles, static loading content remained alongside the rendered application. Remove an intentional fallback before mounting and provide useful failure feedback. Keep `noscript` outside the mount. For server output, follow the host's hydration contract instead of clearing its DOM.
- Style component variants through public props. Use app-owned classes for layout. Do not author or override private `.mx-*` selectors; their presence in generated library output is expected.
- Mercury color tokens contain RGB channels, sometimes with alpha. Use `rgb(var(--bg-primary))`, `rgb(var(--fg-primary))`, and other names verified in the installed token sheet. Do not assume every CSS variable is a color or append a second alpha to a token that already includes one.

## Events are not one universal contract

| Observed control | Controlled boundary |
| --- | --- |
| `Input`, `Textarea` | `value` and native `onInput`; read `event.currentTarget.value` synchronously. |
| `Select` facade | Native change event; read `event.currentTarget.value`. Do not treat the event itself as the selected string. |
| `Checkbox`, `Switch` facades | `checked` and `onChange(checked: boolean)`. |
| `Radio` facade | `checked` derived from selected value; `onChange(value: string)`, not a boolean. |
| `Slider` facade | Numeric value, or a numeric pair in range mode; callback shape follows the mode. |
| `Toggle` | `pressed` and `onPressedChange(boolean)`. |
| `MoneyInput` numeric mode | `numericValue` and `onValueChange(number \| null)`; this is separate from the legacy string/native-input path. |

For example, inside a configured native TSX app:

```tsx
import { useState } from '@fiberfx/hyperscript/hooks';
import { Input, Checkbox } from '@fiberfx/ui';

export function Preferences() {
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(false);
  return (
    <section aria-label="Preferences">
      <Input label="Display name" value={name}
        onInput={event => {
          const next = event.currentTarget.value;
          setName(next);
        }} />
      <Checkbox label="Enable notifications" checked={enabled}
        onChange={setEnabled} />
    </section>
  );
}
```

This demonstrates state contracts, not persistence or a complete starter. Keep hooks at component scope, use immutable updates, and avoid reconstructing the mount on each keystroke. A generic callback adapter that assumes all controls emit either events or values will break this mix.

An omitted optional prop is not necessarily equivalent to `false`, `0`, or an empty string. Inspect defaults before passing values. In an explorer, offer “Component default” by genuinely omitting the prop; keep invalid numeric drafts separate from the last valid preview. Reset both draft/error state and committed state, even when the committed value did not change.

## Reflect composition and identity

When the installed `@fiberfx/reflect` contract exposes `mapProps`, try ordinary component props before adding
a slot abstraction. Source and native-built Reflect consumers verified this pattern; that evidence does not
establish availability in a registry package. Read the installed Reflect prompt and types first.

Keep a stable component registry outside render and store a serializable selection ID. For keyed rows, pass
the whole item through `mapItem: {item: item => item}` and select a component with
`mapProps: {RowView: {source: {}, fn: (_, props) => registry[props.item.kind]}}`. The view owns where it renders
`RowView`. An empty source uses incoming props only; a store source can select one shared component for all rows.
Validate external IDs with an own-property check and an explicit fallback or rejection.

`mapProps` preserves returned function/class constructors and callback refs. Raw functions in `bind` and
`mapItem` are scoped actions, so they are not interchangeable with identity-sensitive component values.
Stable keys plus stable constructors preserve child DOM/local state through reorder and replacement item
objects. Choosing a different constructor intentionally remounts that child. Avoid constructing a new view
function during projection, and test required component props rather than erasing them with `any`.

A projected component uses context where it renders. Its own `useUnit` can act in a nested Provider; a callback
already bound by an outer Reflect view retains the outer scope. Projected raw events/effects keep identity and
methods but are not bound for invocation. Verify reorder/local state/ref behavior, nested scope isolation and
SSR silence at the changed boundary; do not infer a new lifecycle or slot API from a working recipe.

## Overlays and reusable examples

Controlled dialogs need an owner that changes `open`; passing `open={true}` and displaying a close button does not create dismissal. Standalone demonstrations normally start closed with a launch action. Observed `Modal` and `Dialog` facades call `onOpenChange(false)` and then `onClose`; avoid duplicate side effects when wiring both. Verify focus returns to the launch control.

When adapting a story, preserve its render function and state ownership. Some stories ignore incoming args, so an inspector can appear to work while its settings have no effect. Do not claim controls for those props until the rendered example consumes them. Public export aliases and parts require explicit coverage evidence; sharing a source file is not evidence that a scenario mounts each export.

Preserve cancellation and async error behavior when wrapping actions. For a confirmation that depends on an async operation, handle pending/rejection and close only on the intended success path. Honor prevented events; do not let a demonstration initiate an external or destructive operation accidentally.

## DOM and diagrams

Use native app attributes such as `class` and `for`. For SVG use `stroke-width`, `stroke-linecap`, `stroke-dasharray`, and `marker-end`; preserve case-sensitive `viewBox`. In the observed Hyperscript SVG path, `tabIndex` was emitted verbatim: use lowercase `tabindex="0"` and verify actual keyboard focus.

Interactive SVG needs meaningful names, Enter/Space handling, and an equivalent node list or picker. An image role on the whole SVG can hide interactive descendants from assistive technology; choose semantics that preserve those controls. Render source snippets, labels, and user content as text. If embedding JSON in HTML, escape it for that context; do not introduce executable markup through `innerHTML`.
