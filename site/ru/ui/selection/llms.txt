# UI4, выбор значений — Mercury LMS

> Компоненты выбора Mercury UI: `Checkbox`, `Switch`, `Radio` (нативные поля с частями Root/Control/Indicator), `CheckboxGroup`, `RadioGroup`, коллекция `ListBox` с частями элементов и секций, а также `Combobox` — текстовое поле со списком подсказок ListBox и виртуальным фокусом.

## Когда читать

Когда читателю нужно выбрать флаг, один или несколько вариантов из небольшого набора, один или несколько из большого списка либо ввести текст и выбрать подсказку.

## Контракт (уровень готовности: опубликован — @fiberfx/ui 4.0.0 в npm с 2026-11-05)

- Общее правило состояния: управляемые значения (`checked`, `value`, `selectedKeys`) имеют приоритет; начальное значение задаёт неуправляемое состояние и восстанавливается при сбросе формы.
- `Checkbox`: `checked`, `defaultChecked` (допускает `"mixed"`), `onChange(checked)`, `indeterminate`, `label`, `name`, `value`, `disabled`, `required`, `readOnly`, `invalid`, `id`, `form`. Смешанное состояние отправляется как неотмеченный флажок.
- `Switch`: те же свойства состояния; нативный флажок с `role="switch"`.
- `Radio`: `value` (обязателен), `checked`, `onChange(value)`, `label`, `name`, `disabled`, `required`, `invalid`, `id`, `form`.
- Части: `CheckboxRoot` › `CheckboxControl` + `CheckboxIndicator`; `SwitchRoot` › `SwitchControl` + `SwitchIndicator`; `RadioGroupRoot` › `RadioGroupItem` › `RadioGroupControl` + `RadioGroupIndicator`. Индикаторы декоративны; части несут `data-state` (`checked | unchecked`).
- `RadioGroup`: `items: { value, label?, disabled? }[]`, `value`/`defaultValue`, `onChange(value)`, `orientation`, `accent`, `name`, `required`, `disabled`, `readOnly`, `invalid`, `form`, `aria-label`/`aria-labelledby`.
- `CheckboxGroup`: те же `items`, `value`/`defaultValue: string[]`, `onChange(keys)`; внутри Field имя берётся из его подписи.
- `ListBox`: `selectionMode` (`single` по умолчанию | `multiple` | `none`), `selectionBehavior` (`toggle` | `replace`), `selectedKeys` (`null` = управляемый пустой выбор), `defaultSelectedKeys`, `onSelectionChange(keys)`, `disabledKeys`, `disallowEmptySelection`, `focusMode` (`dom` | `virtual`), `focusedKey`, `onFocusedKeyChange`, `shouldFocusWrap`, `autoFocus`, `escapeKeyBehavior`, `disallowTypeAhead`, `name` (скрытое поле для каждого выбранного ключа), `renderEmptyState`. Ключи имеют тип `CollectionKey` (`string | number`).
- Части ListBox: `ListBoxItem` (`id` обязателен, `textValue`, `disabled`, дочернее содержимое либо `(state) => ...`), `ListBoxItemText`, `ListBoxItemDescription`, `ListBoxSelectionIndicator`, `ListBoxSection`, `ListBoxLabel`, `ListBoxSeparator`. `getListBoxOptionId(listBoxId, key)`.
- `Combobox` › `ComboboxInput` + `ComboboxContent` › элементы `ListBoxItem`. `selectedKey`/`defaultSelectedKey`, `onSelectionChange` (только при подтверждении: Enter либо нажатие), `inputValue`/`defaultInputValue`/`onInputChange`, `open`/`onOpenChange(open, details)`, `menuTrigger` (`input` | `focus` | `manual`), `actionKeys` + `onAction`, `clearInputOnCommit`, `allowsEmptyCollection`, `getKeyLabel`, `name`.
- Combobox не подтверждает выбор при Tab или потере фокуса (восстанавливает подтверждённый текст) и не фильтрует: выводите нужные подсказки сами.
- Внутри Field компоненты ListBox, CheckboxGroup и Combobox получают его состояния и ссылки; поле ввода Combobox получает идентификатор и подпись Field.

## Минимальный пример

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

## Чего не генерировать

`ListBoxItem` без `id`; подтверждение выбора из `onInputChange` или `onFocusedKeyChange`; `aria-label` у `ComboboxInput` внутри Field с подписью; перевод фокуса во всплывающий список Combobox; индикатор перед его элементом управления; `RangeSlider` (нужен `Slider` со значением из двух чисел); любые импорты `react` или `effector`.

## Далее

- Курс: /ru/ui/llms.txt
- UI3, поля ввода и формы: /ru/ui/inputs-and-forms/llms.txt
- Эта версия для агентов: /ru/ui/selection/llms.txt (страница в Markdown, `/ui/selection.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/ui/selection)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/ui/llms.txt)
