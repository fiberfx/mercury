# UI4, selection — Mercury LMS

> Mercury UI's selection controls: `Checkbox`, `Switch`, `Radio` (native inputs, with Root/Control/Indicator parts), `CheckboxGroup`, `RadioGroup`, the `ListBox` collection with its item and section parts, and `Combobox`, a text input over a suggestion ListBox in virtual focus.

## Read this when

You let a reader choose: a flag, one of a few, several of a few, one or several of many, or one typed and suggested.

## The contract (tier: Shipped — @fiberfx/ui 4.0.0 on npm since 2026-11-05)

- Shared state rule: controlled (`checked`, `value`, `selectedKeys`) is authoritative; a default seeds uncontrolled state and is what a form reset restores.
- `Checkbox`: `checked`, `defaultChecked` (`"mixed"` allowed), `onChange(checked)`, `indeterminate`, `label`, `name`, `value`, `disabled`, `required`, `readOnly`, `invalid`, `id`, `form`. Mixed submits as unchecked.
- `Switch`: same state props; a native checkbox with `role="switch"`.
- `Radio`: `value` (required), `checked`, `onChange(value)`, `label`, `name`, `disabled`, `required`, `invalid`, `id`, `form`.
- Parts: `CheckboxRoot` › `CheckboxControl` + `CheckboxIndicator`; `SwitchRoot` › `SwitchControl` + `SwitchIndicator`; `RadioGroupRoot` › `RadioGroupItem` › `RadioGroupControl` + `RadioGroupIndicator`. Indicators are decorative; parts carry `data-state` (`checked | unchecked`).
- `RadioGroup`: `items: { value, label?, disabled? }[]`, `value`/`defaultValue`, `onChange(value)`, `orientation`, `accent`, `name`, `required`, `disabled`, `readOnly`, `invalid`, `form`, `aria-label`/`aria-labelledby`.
- `CheckboxGroup`: same `items`, `value`/`defaultValue: string[]`, `onChange(keys)`; inside a Field, named by its label.
- `ListBox`: `selectionMode` (`single` default | `multiple` | `none`), `selectionBehavior` (`toggle` | `replace`), `selectedKeys` (`null` = controlled empty), `defaultSelectedKeys`, `onSelectionChange(keys)`, `disabledKeys`, `disallowEmptySelection`, `focusMode` (`dom` | `virtual`), `focusedKey`, `onFocusedKeyChange`, `shouldFocusWrap`, `autoFocus`, `escapeKeyBehavior`, `disallowTypeAhead`, `name` (hidden input per selected key), `renderEmptyState`. Keys are `CollectionKey` (`string | number`).
- ListBox parts: `ListBoxItem` (`id` required, `textValue`, `disabled`, children or `(state) => ...`), `ListBoxItemText`, `ListBoxItemDescription`, `ListBoxSelectionIndicator`, `ListBoxSection`, `ListBoxLabel`, `ListBoxSeparator`. `getListBoxOptionId(listBoxId, key)`.
- `Combobox` › `ComboboxInput` + `ComboboxContent` › `ListBoxItem`s. `selectedKey`/`defaultSelectedKey`, `onSelectionChange` (on commit only: Enter or a press), `inputValue`/`defaultInputValue`/`onInputChange`, `open`/`onOpenChange(open, details)`, `menuTrigger` (`input` | `focus` | `manual`), `actionKeys` + `onAction`, `clearInputOnCommit`, `allowsEmptyCollection`, `getKeyLabel`, `name`.
- Combobox never commits on Tab or blur (restores the committed text) and does not filter: render the suggestions you want.
- In a Field, ListBox, CheckboxGroup and Combobox take the Field's states and references; the Combobox input takes the Field's id and label.

## Minimal example

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";
import { Combobox, ComboboxContent, ComboboxInput, Field, ListBoxItem, useLocaleFormatters } from "@fiberfx/ui";
import type { CollectionKey } from "@fiberfx/ui";

const authors = [{ id: "ada", label: "Ada Lovelace" }, { id: "grace", label: "Grace Hopper" }];

export function AuthorPicker() {
  const [author, setAuthor] = useState<CollectionKey | null>(null);
  const [text, setText] = useState("");
  const { contains } = useLocaleFormatters();
  return (
    <Field name="author" label="Author">
      <Combobox selectedKey={author} onSelectionChange={setAuthor} onInputChange={setText}>
        <ComboboxInput />
        <ComboboxContent>
          {authors.filter((a) => contains(a.label, text)).map((a) => <ListBoxItem key={a.id} id={a.id}>{a.label}</ListBoxItem>)}
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
```

## Never emit

A `ListBoxItem` without `id`; a selection committed from `onInputChange` or `onFocusedKeyChange`; an `aria-label` on `ComboboxInput` inside a labelled Field; focus moved into the Combobox popup; an indicator part rendered before its control; a `RangeSlider` (it is `Slider` with a two-number value); any `react` or `effector` import.

## Next

- The course: /ui/llms.txt
- UI3, inputs and forms: /ui/inputs-and-forms/llms.txt
- This companion: /ui/selection/llms.txt (the page as Markdown, `/ui/selection.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/ui/selection)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/ui/llms.txt)
