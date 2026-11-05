# UI3, inputs and forms — Mercury LMS

> Mercury UI's form composition (`Form`, `Field`, `Label`, `Description`, `FieldError`, `Fieldset`, `Legend`, `FormSection`, `ErrorSummary`) and its inputs (`Input`, `Textarea`, `DateField`, `ColorField` and the rest). A Field hands its control one explicit binding; a Form lets an ErrorSummary find its Fields.

## Read this when

You build a form: label, help text and error around a control, a group of controls, a summary of problems after a failed submit, or a date or color entry.

## The contract (tier: Shipped — @fiberfx/ui 4.0.0 on npm since 2026-11-05)

- `Field` props: `id`, `name`, `label`, `hint`, `error`, `required`, `invalid` (default: `error` present), `disabled`, `readOnly`, `focusTarget`, `class`, `style`, `children` (elements, or `(field) => ...`).
- The binding (`FieldContextValue`): `id`, `name`, `labelId`, `descriptionId`, `errorId` (`<id>-label|-description|-error`), `invalid`, `required`, `disabled`, `readOnly`, `focus()`, `getControlProps(own?)`.
- `getControlProps({ "aria-describedby"?, "aria-labelledby"? })` → `id` plus, only when set, `name`, `aria-labelledby`, `aria-describedby` (yours first, then hint, then error), `aria-invalid: true`, `required`, `disabled`, `readOnly`. No event handlers. Spread it on the control.
- `useFieldContext()` → the binding, or `null`. Read by `SearchField`, `TokenField`, `CheckboxGroup`, `Combobox`, `CustomSelect`, `ListBox`.
- One label: on the Field or on the control, never both.
- `Description`, `FieldError`: not live regions; give an `id` when used alone.
- `Input`: `label`, `hint`, `error`, `leading`, `trailing`, plus input attributes. `Textarea`: `label`, `hint`, `error`, `resizable`, `size`.
- `Fieldset`: `legend`, `hint`, `error`, `invalid`, `focusTarget`; a native fieldset. `FormSection`: `title`, `open`/`onOpenChange` or `defaultOpen`; closed content is inert; opened before a focus lands inside.
- `Form`: a native form, everything forwarded; `noValidate` is yours to pass; Fields register under `name` and `id`.
- `ErrorSummary`: `title` (required), `issues: { field, message, target? }[]`, `focusRequest` (failed-submit counter; each new positive value focuses once), `headingLevel` (2). Empty issues render nothing.
- `DateField`: `value`, `defaultValue`, `onChange(date | undefined)`, `onValidityChange` (`empty | incomplete | impossible | unavailable | before-min | after-max | valid`), `minValue`, `maxValue`, `isDateUnavailable`, `name` (submits an ISO date), `readOnly`, `locale` ("en"), `label`. Values: `parseDate("2026-11-30")` or `new CalendarDate(y, m, d)` from `@fiberfx/core`.
- `ColorField`: parses on Enter or blur; accepts `#hex`, `rgb()`, `hsl()`, `hsb()`, `color(display-p3 …)`; `editorStates` (`inherit`, `unset`); `tokens` (`{token-id}`); `onChange(value, { reason: commit | token | detach | reset | text })`.

## Minimal example

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";
import { Field, Input } from "@fiberfx/ui";

export function TitleField({ error }: { error?: string }) {
  const [title, setTitle] = useState("");
  return (
    <Field name="title" label="Title" hint="Shown in lists" error={error} required>
      {(field) => <Input {...field.getControlProps()} value={title} onInput={(event) => setTitle(event.currentTarget.value)} />}
    </Field>
  );
}
```

## Never emit

A `label` on both the Field and its Input; cloning children to inject ids; an `aria-live` on a FieldError; a `focusRequest` bumped on every keystroke; a `Date` object as a DateField value; a form-state library inside `Form`; any `react` or `effector` import.

## Next

- The course: /ui/llms.txt
- UI4, selection: /ui/selection/llms.txt
- This companion: /ui/inputs-and-forms/llms.txt (the page as Markdown, `/ui/inputs-and-forms.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/ui/inputs-and-forms)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/ui/llms.txt)
