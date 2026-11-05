# The DOM contract — Mercury LMS

> HS2 of Mercury Hyperscript. Hyperscript writes the DOM's own attribute names and fires the DOM's own events. Rules 1–5 are probed in headless Chromium (`fiberfx/hyperscript/test/browser/dom-contract.test.jsx`, mercury.63); rules 6–7 are Mercury's runtime departures (`README.md` H0e, H0f).

## Read this when

You write attributes, event handlers, SVG, inline styles or a form field in a Mercury component, or you port markup written for another library.

## The contract

1. `class` and `for` on HTML and SVG (`className`/`htmlFor` work as DOM properties; write `class`/`for`).
2. Text input/textarea: `onInput` per keystroke; `onChange` on the DOM `change` event (on commit, at latest blur). Select/checkbox: `onChange` per selection/toggle. `onChange` is never mapped to input.
3. SVG names as written: `stroke-width`, `fill-rule`, `clip-path`; `href` without `xlink`. `strokeWidth` is not translated.
4. Bubbling focus: `onFocusIn` / `onFocusOut`. A parent's `onFocus` doesn't fire for a descendant.
5. Custom elements: object prop → property, string → attribute; events via `on<name>` (`onmy-event` → `my-event`, `onionChange` → `ionChange`); a capital after `on` is lowercased.
6. Numeric styles: a number on a length gains `px` (`width: 10` → `10px`), client and `./server` alike; unitless properties (`opacity`, `zIndex`, `flex`, `lineHeight`, grid lines…) and `--custom` properties as given.
7. Controlled inputs: with a `value` or `checked` prop, after the handler and its queued renders, an unwritten value is written back to the prop. Accepted edits untouched; refused text edits restore the caret; refused radio clicks restore the group; nothing during IME composition; nothing for uncontrolled elements (`defaultValue`, `defaultChecked`, or no prop).

## Minimal example

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";

export function NameField() {
  const [name, setName] = useState("");
  return (
    <div class="field">
      <label for="name">Name</label>
      <input id="name" value={name} onInput={(e) => setName(e.currentTarget.value)} style={{ maxWidth: 320 }} />
    </div>
  );
}
```

## Never emit

- `className`, `htmlFor` in new code; `strokeWidth`, `fillRule`, `clipPath`, `xlinkHref` on SVG.
- `onChange` to follow each keystroke of a text field.
- `onFocus`/`onBlur` on a container to track focus inside it.

## Next

- Components and render: /hyperscript/components/llms.txt
- Hooks: /hyperscript/hooks/llms.txt
- This companion: /hyperscript/dom/llms.txt (the page as Markdown, `/hyperscript/dom.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hyperscript/dom)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hyperscript/llms.txt)
