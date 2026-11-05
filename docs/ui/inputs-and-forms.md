A form in Mercury UI is built from two families. The forms family composes: it gives a control its label, help text and error, groups controls, and lists a form's problems. The inputs family holds the controls themselves. The two meet through one explicit binding.

## Field and its binding

`Field` places a `Label`, a `Description` and a `FieldError` around one control, and gives the control a binding to spread on itself. It never clones its children and never replaces their events: nothing reaches the control unless you spread it.

| Prop | What it does |
|---|---|
| `id` | the control's id; given explicitly, it is used unchanged; otherwise a stable one is generated |
| `name` | the control's form name, and the key an ErrorSummary issue uses |
| `label` | renders a `Label` for the control |
| `hint` | renders a `Description` |
| `error` | renders a `FieldError` and makes the field invalid |
| `required`, `disabled`, `readOnly` | the control's states |
| `invalid` | defaults to whether `error` is present |
| `focusTarget` | for a composite control: the element an ErrorSummary link focuses |
| `children` | the control, or a function that receives the binding |

The binding has the control's `id` and `name`, the stable ids of its parts (`labelId`, `descriptionId`, `errorId`, which are `<id>-label`, `<id>-description` and `<id>-error`), its states, `focus()`, and `getControlProps()`.

`getControlProps(own?)` returns the attributes the control needs: `id`, and only when they carry a value, `name`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `required`, `disabled` and `readOnly`. Pass your own `aria-describedby` or `aria-labelledby` and they come first, then the hint and the error, each once. A part that is not rendered is not referenced, so a removed error leaves no dangling id.

Any descendant can read the binding with `useFieldContext()`, which is `null` outside a Field. Several Mercury controls do this themselves: `SearchField`, `TokenField`, `CheckboxGroup`, `Combobox`, `CustomSelect` and `ListBox` take their states and references from an enclosing Field.

## Label, Description and FieldError

- **`Label`:** the caption. `required` adds an asterisk hidden from assistive technology (the control's native `required` carries the meaning); `optional` adds "(optional)"; it also takes `size` (`sm`, `md`, `lg`), `disabled`, `accent` and a `hint` line.
- **`Description`:** help text, in muted ink.
- **`FieldError`:** the inline error, in negative ink.

Neither `Description` nor `FieldError` is a live region. An error is not announced on every keystroke; focus and the ErrorSummary carry it. Field and Fieldset render both from their `hint` and `error`; used alone, give each an `id` and reference it yourself.

## Input and Textarea

`Input` is the text input. It can carry its own `label`, `hint` and `error`, and `leading` and `trailing` adornments; with an `error` it sets `aria-invalid` and shows the message. Every other input attribute passes through to the `<input>`.

`Textarea` takes `label`, `hint`, `error`, `resizable` and `size` (`sm`, `md`, `lg`).

Give the label to the Field or to the control, not both. Inside a Field with a `label`, leave the Input's own `label` out and spread the binding on it; an Input that keeps its own label can still take its error from the Field.

## Fieldset, Legend and FormSection

- **`Fieldset`:** a native `<fieldset>` with its `legend`, `hint` and `error`. It keeps native group semantics: role `group`, named by its legend, with `disabled` and `name` behaving as the HTML attributes do. An ErrorSummary focuses the group's first enabled control, or the element `focusTarget` returns.
- **`Legend`:** the native `<legend>`, rendered first in the fieldset so the browser names the group from it. Fieldset renders it from its `legend` prop.
- **`FormSection`:** a collapsible part of a form, built on `Collapsible`: it takes a `title`, `open` with `onOpenChange` or `defaultOpen`, and `bordered`, `accent` and `width`. While closed its content is inert, so hidden fields take no focus. When an ErrorSummary link or a Field's `focus()` targets a field inside it, the section opens first, with every section around it.

## Form and ErrorSummary

`Form` is a native `<form>`. Every attribute and handler is forwarded unchanged, so submission, reset and the browser's constraint validation behave as the element's own; pass `noValidate` yourself to turn validation off. It installs no state library. Its one addition is a registry the Fields inside it join, under their `name` or `id`.

`ErrorSummary` lists a form's problems after a failed submit:

- **`issues`:** the ordered list, each `{ field, message, target? }`. `field` is the Field's `name` or `id`; use the same words as the inline error. Nothing renders while the list is empty.
- **`title`:** the heading, required; `headingLevel` sets its level, `2` by default.
- **`focusRequest`:** a counter of failed submits. Each new positive value moves focus to the summary once; a validation update that leaves it unchanged never moves focus.

Each issue is a link. Activating it reveals the field's FormSection and focuses its control, found through the Form's registry; outside a Form, it focuses the element whose id is `target`, else `field`.

## A form end to end

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";
import { parseDate } from "@fiberfx/core";
import { Button, DateField, ErrorSummary, Field, Form, Input } from "@fiberfx/ui";
import type { ErrorSummaryIssue } from "@fiberfx/ui";

export function TaskForm() {
  const [title, setTitle] = useState("");
  const [issues, setIssues] = useState<ErrorSummaryIssue[]>([]);
  const [failed, setFailed] = useState(0);
  const titleError = issues.find((issue) => issue.field === "title")?.message;

  return (
    <Form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const found = title.trim() === "" ? [{ field: "title", message: "Enter a title" }] : [];
        setIssues(found);
        if (found.length > 0) setFailed((count) => count + 1);
      }}
    >
      <ErrorSummary title="Fix this before saving" issues={issues} focusRequest={failed} />
      <Field name="title" label="Title" hint="Shown in lists" error={titleError} required>
        {(field) => (
          <Input {...field.getControlProps()} value={title} onInput={(event) => setTitle(event.currentTarget.value)} />
        )}
      </Field>
      <DateField name="due" label="Due date" defaultValue={parseDate("2026-11-30")} />
      <Button type="submit">Save</Button>
    </Form>
  );
}
```

The application owns validation: it decides the issues, and passes the same message to the Field's `error` and to the summary. Mercury owns the references, the focus and the reveal.

## Dates

`DateField` is a segmented date entry: month, day and year are each their own spinbutton segment, ordered and separated for the `locale` (`"en"` by default). Its value is a `DateValue` from `@fiberfx/core`; build one with `parseDate("2026-11-30")` or `new CalendarDate(2026, 11, 30)`.

- **`value` / `defaultValue` / `onChange`:** `onChange` receives the date on each committed edit, and `undefined` whenever the draft is not a valid date.
- **`onValidityChange`:** says why: `empty`, `incomplete`, `impossible` (31 February, kept as typed and never normalised), `unavailable`, `before-min`, `after-max` or `valid`.
- **`minValue`, `maxValue`, `isDateUnavailable`:** the bounds and the refused dates.
- **`name`:** one hidden input submits the committed value as an ISO date, `2026-11-30`; the segments are never submitted.
- **`readOnly`:** the segments stay focusable and navigable but refuse edits.

The segment anatomy, `DateInput` (the `group`) and `DateSegment` (one `spinbutton`), is exported and shared by `TimeField`, `DateRangeField`, `DatePicker`, `DateRangePicker` and `DateTimeField`.

## Colors

`ColorField` is a text field for one color value. It keeps the typed draft apart from the committed value: Enter or blur parses the draft; an unsupported form is refused with a message and `aria-invalid`, and the draft stays editable; Escape restores the committed text. It accepts `#hex`, `rgb()`, `hsl()`, `hsb()` and `color(display-p3 …)`, plus `inherit` and `unset` with `editorStates`, and `{token-id}` references with `tokens`.

`onChange(value, details)` reports why the value changed: `commit`, `token`, `detach` (a token replaced by a literal), `reset` or `text`. Its companion `ColorChannelField` is a number field for one `channel` of a color, the typed equivalent of a drag.

## The rest of the family

| Component | What it is |
|---|---|
| `Search` | a search input with a built-in glyph and clear |
| `SearchField` | a search input whose draft, submit and clear are separate effects |
| `PasswordField` | a password input with a reveal toggle |
| `MoneyInput` | a currency-amount field |
| `AuthCode` | split one-time-code entry |
| `TokenField` | text and tokens, with stable identity and explicit commits |
| `TimeField` | a segmented time, with no date |
| `DatePicker` | a date field with a calendar popup |
| `DateRangeField` / `DateRangePicker` | two typed endpoints of one range, and the same with a range calendar |
| `DateTimeField` | a publication time with its zone |
| `TimeZonePicker` | a named time zone |
| `Calendar` / `RangeCalendar` | a month grid; a contiguous range of days |
| `ColorPicker` | owns one color field's transaction |
| `ColorArea`, `ColorSlider`, `ColorWheel` | two channels on a surface, one on a track, the hue on a ring |
| `ColorSwatch` / `ColorSwatchPicker` | a named preview of one color; one choice among swatches |
| `ColorThumb` | the shared thumb of the color surfaces |
| `TokenPicker` | a design token, chosen by identity |
