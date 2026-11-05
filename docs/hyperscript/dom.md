Hyperscript follows the DOM: the names you write are the DOM's names, and the events you get are the DOM's events. Each rule below is what the runtime does, and the first five are pinned by `test/browser/dom-contract.test.jsx`, which runs in headless Chromium with a control for every probe that must fail.

## class and for

Write `class` and `for`, on HTML and on SVG:

```tsx
export function EmailField() {
  return (
    <div class="field">
      <label class="field__label" for="email">Email</label>
      <input id="email" class="field__input" type="email" />
    </div>
  );
}
```

`className` also works, because it is a DOM property, but `class` is the name to write. Mercury UI writes `class` throughout, and destructures it as `class: classes` when a component takes one.

## Input and change

On a text input or a textarea, `onInput` fires on every keystroke, and `onChange` fires on the DOM's `change` event, which comes when the value is committed, at the latest on blur. On a select or a checkbox, `onChange` fires once per selection or toggle. `onChange` is never mapped to input events.

So a field that follows each keystroke listens to `onInput`. Mercury UI's `DataGrid` edits a cell this way:

```tsx
onInput={(event) => setEditing({ ...editing, draft: event.currentTarget.value })}
```

## SVG attributes

SVG attributes keep their SVG names: `stroke-width`, `fill-rule`, `clip-path`. `href` works without `xlink`. Hyperscript doesn't translate camelCase spellings such as `strokeWidth`, so write the SVG name.

```tsx
export function Tick() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" />
    </svg>
  );
}
```

## Focus that bubbles

`focus` and `blur` don't bubble in the DOM, so a parent's `onFocus` doesn't fire when a descendant gains focus. To know when focus enters or leaves a group, use `onFocusIn` and `onFocusOut`, which do bubble:

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";

export function Toolbar() {
  const [active, setActive] = useState(false);
  return (
    <div class={active ? "toolbar is-active" : "toolbar"} onFocusIn={() => setActive(true)} onFocusOut={() => setActive(false)}>
      <button>Bold</button>
      <button>Italic</button>
    </div>
  );
}
```

## Custom elements

A custom element receives an object prop as a property and a string prop as an attribute. Its events attach through `on<name>`: `onmy-event` listens to `my-event`, and `onionChange` to `ionChange`. As with built-in events, a name that starts with a capital after `on` is lowercased.

## Numeric styles

A number on a length is written in pixels: `style={{ width: 10 }}` writes `width: 10px`, on the client and in `./server`'s HTML alike. Properties without a unit, such as `opacity`, `zIndex`, `flex`, `lineHeight` and grid line numbers, and custom properties such as `--gap`, are written as given. One module, `src/style.js`, holds the list and the rule, and both renderers import it.

```tsx
export function Bar({ percent }: { percent: number }) {
  return <div class="bar" style={{ width: percent * 2, opacity: percent > 0 ? 1 : 0.4, "--bar-hue": 210 }} />;
}
```

## Controlled inputs

An `<input>`, `<textarea>` or `<select>` with a `value` or `checked` prop shows its prop. After the element's own `onInput` or `onChange` handler runs, and every render it queued has run, a `value` or `checked` that no render wrote is written back. So `<input value="a" onInput={() => {}} />` stays `a`, and a checkbox with `checked={false}` and a handler that ignores the click stays unchecked.

- **An accepted edit is untouched,** caret included, because its render already wrote the new value.
- **A refused text edit** puts the caret back where the edit was made.
- **A refused radio click** restores the group's controlled radios, so the checked one stays checked.
- **No write-back during composition.** An input event between `compositionstart` and `compositionend` is composing, and an input method keeps its text until it commits.
- **No cost to an uncontrolled element:** an element with `defaultValue`, `defaultChecked` or neither prop never queues a write-back.

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";

export function DigitsOnly() {
  const [code, setCode] = useState("");
  return (
    <input
      inputMode="numeric"
      value={code}
      onInput={(event) => {
        const next = event.currentTarget.value;
        if (/^\d{0,6}$/.test(next)) setCode(next);
      }}
    />
  );
}
```

A letter typed into `DigitsOnly` is refused: no render writes it, so the input is written back to `code` and the caret returns to where it was.
