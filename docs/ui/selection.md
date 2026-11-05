The selection family covers every way to choose: one flag, one of a few, several of a few, one or several of many, and one typed and suggested. Its controls fall into two kinds. The checkbox, the switch and the radio are native inputs dressed in tokens. The ListBox is Mercury's own collection, and the Combobox, the custom select and the pickers are built on it.

## One state contract

Checkbox, Switch, RadioGroup and CheckboxGroup share one state contract:

- **Controlled state is authoritative.** Pass `checked` or `value` and the control shows exactly that.
- **A default only seeds uncontrolled state,** through `defaultChecked` or `defaultValue`, and it is what a form reset restores.

Because each is a native input underneath, a form submits its `name` and `value`, and the browser's own keys, focus and reset keep working.

## Checkbox, Switch and Radio

| Control | State | Change | Notes |
|---|---|---|---|
| `Checkbox` | `checked`, `defaultChecked` | `onChange(checked)` | `indeterminate` shows the mixed state; `defaultChecked="mixed"` starts in it; a mixed checkbox submits as unchecked |
| `Switch` | `checked`, `defaultChecked` | `onChange(checked)` | a native checkbox with `role="switch"` |
| `Radio` | `checked` | `onChange(value)` | `value` is required |

All three take `label`, `name`, `value`, `disabled`, `required`, `invalid`, `id` and `form`, the id of a form the input belongs to when it is rendered outside it. Checkbox and Switch also take `readOnly`: the control keeps its state but stays focusable and announced, as `aria-readonly`.

## The parts beneath the facades

`Checkbox` and `Switch` are facades over three parts each, for a layout the facade doesn't give:

- **`CheckboxRoot` › `CheckboxControl` + `CheckboxIndicator`**, and **`SwitchRoot` › `SwitchControl` + `SwitchIndicator`**. The root is a `<label>` that owns the state and takes the facade's state props; the control is the native input; the indicator is the drawn box or track.
- **The indicator is decorative:** hidden from assistive technology, never focusable, never submitted.
- **Each part carries `data-state`,** `checked` or `unchecked`, for your own styling hooks.

RadioGroup has the same shape one level deeper: `RadioGroupRoot` › `RadioGroupItem` › `RadioGroupControl` + `RadioGroupIndicator`. Render the control before the indicator.

## CheckboxGroup and RadioGroup

Both take `items`, a list of `{ value, label?, disabled? }`, and lay them out by `orientation` (`vertical` or `horizontal`) with an `accent`.

- **`RadioGroup`:** one value. `value` or `defaultValue`, `onChange(value)`. It is a named `radiogroup` of native radios, so the arrow keys, the single tab stop, the form's name and value and reset are the browser's own.
- **`CheckboxGroup`:** an ordered set of unique keys. `value` or `defaultValue` as `string[]`, `onChange(keys)`. A key the owner keeps for a disabled item stays checked and, like any disabled control, is not submitted.

Both take `name`, `form`, `disabled`, `readOnly` and `invalid`; RadioGroup also takes `required`. Name a group with `aria-label` or `aria-labelledby`, or put a CheckboxGroup in a Field: it takes the Field's label as its name, and its hint and error describe every checkbox.

## ListBox

`ListBox` is the collection beneath Mercury's richer choices. Its keys are `CollectionKey`s, a `string` or a `number`.

- **Selection:** `selectionMode` is `single` by default, or `multiple` or `none`. `selectionBehavior` is `toggle` by default; `replace` makes a press select only that option and lets selection follow the arrows. Control it with `selectedKeys` (where `null` is a controlled empty selection) and `onSelectionChange(keys)`, which receives the whole requested selection in first-selected order. Seed it with `defaultSelectedKeys`, which a form reset restores. `disallowEmptySelection` refuses a press that would leave nothing selected.
- **Availability:** `disabledKeys` marks options that are visible but unavailable. `disabled` makes every option unavailable; `readOnly` lets focus move while the selection can't change.
- **Forms:** with `name`, one hidden input per selected, enabled key is submitted.
- **Keys:** the arrows, Home, End, PageUp, PageDown and typeahead move focus in order across sections, skipping disabled options; Space, Enter and a press select; Shift extends a range. `shouldFocusWrap` wraps from last to first; Escape clears the selection unless `escapeKeyBehavior="none"`; `disallowTypeAhead` turns typeahead off.
- **Empty:** `renderEmptyState` draws the content shown while there are no options.

## Items, sections and focus

The children are parts:

- **`ListBoxItem`:** one option. `id` is its key and is required; `textValue` is the text typeahead matches; `disabled` takes it out. Its children can be a function of its state: `isSelected`, `isFocused`, `isDisabled`, `selectionMode` and `optionId`.
- **`ListBoxItemText`, `ListBoxItemDescription`:** an option's label and its secondary line.
- **`ListBoxSelectionIndicator`:** the check that shows a selected option.
- **`ListBoxSection`, `ListBoxLabel`, `ListBoxSeparator`:** grouping, the group's label, and a rule between groups.

Pass `items` and a function child to render from data instead.

Focus and selection are kept apart: `focusedKey` and `onFocusedKeyChange` are the highlighted option, not the chosen one. `focusMode` decides where keyboard focus lives. With `dom`, the default, the options themselves take focus with a roving tab index. With `virtual`, the options take none: an owner's text input keeps focus and names the highlighted option through `aria-activedescendant`, and `getListBoxOptionId(listBoxId, key)` gives that option's id. That is how Combobox works.

## Combobox

`Combobox` is a text input with a suggestion ListBox. Typing, the arrows and Escape only explore; a value is committed by Enter on the active suggestion or by a press, and `onSelectionChange(key)` is called only then. Its anatomy is `Combobox` › `ComboboxInput` + `ComboboxContent`, with `ListBoxItem` parts inside the content.

- **Value and text, apart:** `selectedKey` or `defaultSelectedKey` is the committed key; `inputValue`, `defaultInputValue` and `onInputChange` are the text.
- **Opening:** `menuTrigger` is `input` by default (typing opens), or `focus` or `manual` (only ArrowDown). `open`, `defaultOpen` and `onOpenChange(open, details)` control it; the details name the reason.
- **Keys:** ArrowDown and ArrowUp open, and then move the active suggestion; Alt+ArrowDown opens without moving. Enter commits. Escape closes; a second Escape restores the committed text; with nothing to undo, Escape is left to an enclosing layer such as a dialog. A composing IME never commits.
- **Leaving commits nothing:** Tab and blur close the list and restore the committed text.
- **Focus:** DOM focus stays in the input, and `aria-activedescendant` names only an option that is mounted.
- **More:** `actionKeys` with `onAction` for options such as "create" or "load more" that run instead of committing; `clearInputOnCommit`; `allowsEmptyCollection` to keep the popup for busy, empty and failed states; `getKeyLabel` for a committed key whose option isn't rendered; `name` submits the committed key.

`ComboboxContent` places the popup (`placement`, `bottom-start` by default; `sideOffset`; `collisionPadding`; `container`) and takes a `header`, a `footer`, `renderEmptyState` and `busy`.

The Combobox does not filter: the application decides which suggestions to render for the text.

## A Combobox in a Field

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";
import { Combobox, ComboboxContent, ComboboxInput, Field, ListBoxItem, useLocaleFormatters } from "@fiberfx/ui";
import type { CollectionKey } from "@fiberfx/ui";

const authors = [
  { id: "ada", label: "Ada Lovelace" },
  { id: "alan", label: "Alan Turing" },
  { id: "grace", label: "Grace Hopper" },
];

export function AuthorPicker() {
  const [author, setAuthor] = useState<CollectionKey | null>(null);
  const [text, setText] = useState("");
  const { contains } = useLocaleFormatters();
  const shown = authors.filter((entry) => contains(entry.label, text));

  return (
    <Field name="author" label="Author" hint="Type to narrow the list">
      <Combobox selectedKey={author} onSelectionChange={setAuthor} onInputChange={setText}>
        <ComboboxInput />
        <ComboboxContent>
          {shown.map((entry) => <ListBoxItem key={entry.id} id={entry.id}>{entry.label}</ListBoxItem>)}
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
```

Inside a Field, the Combobox takes its states and its `name` from the Field, and `ComboboxInput` takes the Field's id, label and hint, so the input needs no `aria-label` of its own. The filter uses the locale's collation, so accents and case don't stand between a reader and a name.

## The rest of the family

| Component | What it is |
|---|---|
| `CheckboxCards`, `RadioCards` | a multi-select grid of card-shell checkboxes; an exclusive grid of card-shell radios |
| `CustomSelect` | the custom select, beside the native `Select` |
| `EntityPicker` | a relation picker for one or many entities, over Combobox, with item statuses and Retry |
| `TagGroup` | interactive tags with selection, named removal and move commands |
| `Toggle`, `ToggleGroup` | the two-state pressable button (`pressed`, `defaultPressed`, `onPressedChange`), and a group of them, `single` or `multiple` |
| `Segmented` | the inline single-select switch: `segments`, `value`, `onChange` |
| `Slider` | one number on a track, or two thumbs with a `[number, number]` value; `onChange` and `onValueCommit` |
