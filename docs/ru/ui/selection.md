Семейство selection охватывает все способы выбора: один флаг, один или несколько вариантов из небольшого набора, один или несколько из большого списка, а также ввод с подсказками. Элементы управления делятся на два вида. Флажок, переключатель и радиокнопка — нативные поля, оформленные с помощью токенов. ListBox — собственная коллекция Mercury; на ней построены Combobox, нестандартный select и компоненты выбора.

## Единый контракт состояния

Checkbox, Switch, RadioGroup и CheckboxGroup используют один контракт состояния:

- **Управляемое состояние имеет приоритет.** Передайте `checked` или `value`, и элемент покажет именно это значение.
- **Начальное значение лишь задаёт неуправляемое состояние** через `defaultChecked` или `defaultValue`; оно же восстанавливается при сбросе формы.

В основе каждого компонента — нативное поле, поэтому форма отправляет его `name` и `value`, а браузерные клавиши, фокус и сброс продолжают работать.

## Checkbox, Switch и Radio

| Элемент управления | Состояние | Изменение | Примечания |
|---|---|---|---|
| `Checkbox` | `checked`, `defaultChecked` | `onChange(checked)` | `indeterminate` показывает смешанное состояние; `defaultChecked="mixed"` задаёт его изначально; смешанное состояние отправляется как неотмеченный флажок |
| `Switch` | `checked`, `defaultChecked` | `onChange(checked)` | нативный флажок с `role="switch"` |
| `Radio` | `checked` | `onChange(value)` | `value` обязателен |

Все три принимают `label`, `name`, `value`, `disabled`, `required`, `invalid`, `id` и `form` — идентификатор формы, к которой относится поле, если оно выведено вне неё. Checkbox и Switch также принимают `readOnly`: элемент сохраняет состояние, но остаётся доступен для фокуса и объявляется с `aria-readonly`.

## Составные части фасадов

`Checkbox` и `Switch` — фасады, каждый над тремя частями. Эти части позволяют получить раскладку, которой нет у фасада:

- **`CheckboxRoot` › `CheckboxControl` + `CheckboxIndicator`** и **`SwitchRoot` › `SwitchControl` + `SwitchIndicator`**. Корень — `<label>`, который хранит состояние и принимает соответствующие свойства фасада; control — нативное поле; indicator — нарисованный флажок или дорожка.
- **Индикатор декоративен:** скрыт от вспомогательных технологий, не получает фокус и не отправляется с формой.
- **Каждая часть несёт `data-state`**, `checked` или `unchecked`, для ваших стилей.

RadioGroup устроен так же, но на уровень глубже: `RadioGroupRoot` › `RadioGroupItem` › `RadioGroupControl` + `RadioGroupIndicator`. Выводите элемент управления перед индикатором.

## CheckboxGroup и RadioGroup

Оба компонента принимают `items` — список `{ value, label?, disabled? }` — и располагают элементы согласно `orientation` (`vertical` или `horizontal`), с заданным `accent`.

- **`RadioGroup`:** одно значение. `value` либо `defaultValue`, `onChange(value)`. Это именованная группа `radiogroup` нативных радиокнопок, поэтому стрелки, одна остановка Tab, имя и значение формы, а также сброс работают средствами браузера.
- **`CheckboxGroup`:** упорядоченное множество уникальных ключей. `value` либо `defaultValue` типа `string[]`, `onChange(keys)`. Если владелец состояния сохраняет ключ недоступного элемента, тот остаётся отмеченным и, как любое отключённое поле, не отправляется.

Оба принимают `name`, `form`, `disabled`, `readOnly` и `invalid`; RadioGroup также принимает `required`. Задайте имя группы через `aria-label` или `aria-labelledby` либо поместите CheckboxGroup в Field: подпись Field станет именем группы, а его пояснение и ошибка будут описывать каждый флажок.

## ListBox

`ListBox` — коллекция, на которой построены более сложные способы выбора Mercury. Её ключи имеют тип `CollectionKey`: `string` либо `number`.

- **Выбор:** `selectionMode` по умолчанию равен `single`, также доступны `multiple` и `none`. `selectionBehavior` по умолчанию равен `toggle`; `replace` при нажатии выбирает только этот вариант и позволяет выбору следовать за стрелками. Управляйте выбором через `selectedKeys` (где `null` означает управляемый пустой выбор) и `onSelectionChange(keys)`, который получает весь запрошенный набор в порядке первого выбора элементов. Начальное состояние задаёт `defaultSelectedKeys`; его восстанавливает сброс формы. `disallowEmptySelection` отклоняет нажатие, после которого не осталось бы выбранных элементов.
- **Доступность:** `disabledKeys` отмечает видимые, но недоступные варианты. `disabled` делает недоступными все варианты; `readOnly` позволяет перемещать фокус, но запрещает менять выбор.
- **Формы:** при наличии `name` для каждого выбранного доступного ключа отправляется одно скрытое поле.
- **Клавиши:** стрелки, Home, End, PageUp, PageDown и поиск по вводимому префиксу перемещают фокус по секциям, пропуская недоступные варианты; Space, Enter и нажатие выбирают; Shift расширяет диапазон. `shouldFocusWrap` замыкает переход от последнего к первому; Escape очищает выбор, если не задано `escapeKeyBehavior="none"`; `disallowTypeAhead` отключает поиск по префиксу.
- **Пустой список:** `renderEmptyState` рисует содержимое, которое видно при отсутствии вариантов.

## Элементы, секции и фокус

Дочерние элементы составляют структуру списка:

- **`ListBoxItem`:** один вариант. `id` — его обязательный ключ; `textValue` — текст для поиска по префиксу; `disabled` исключает вариант из взаимодействия. Дочернее содержимое может быть функцией состояния: `isSelected`, `isFocused`, `isDisabled`, `selectionMode` и `optionId`.
- **`ListBoxItemText`, `ListBoxItemDescription`:** подпись варианта и вторая строка.
- **`ListBoxSelectionIndicator`:** отметка выбранного варианта.
- **`ListBoxSection`, `ListBoxLabel`, `ListBoxSeparator`:** группа, её подпись и разделитель между группами.

Для построения списка из данных передайте `items` и дочернюю функцию.

Фокус и выбор разделены: `focusedKey` и `onFocusedKeyChange` относятся к подсвеченному варианту, а не к выбранному. `focusMode` определяет, где находится клавиатурный фокус. В режиме `dom`, используемом по умолчанию, фокус получают сами варианты с перемещаемым tab index. В режиме `virtual` они не получают фокус: его сохраняет текстовое поле владельца, которое указывает подсвеченный вариант через `aria-activedescendant`; `getListBoxOptionId(listBoxId, key)` возвращает идентификатор этого варианта. Так работает Combobox.

## Combobox

`Combobox` — текстовое поле со списком подсказок ListBox. Ввод, стрелки и Escape лишь позволяют просматривать варианты; значение подтверждается Enter на активной подсказке либо нажатием, и только тогда вызывается `onSelectionChange(key)`. Структура: `Combobox` › `ComboboxInput` + `ComboboxContent`, внутри содержимого — части `ListBoxItem`.

- **Значение и текст разделены:** `selectedKey` либо `defaultSelectedKey` — подтверждённый ключ; `inputValue`, `defaultInputValue` и `onInputChange` — текст.
- **Открытие:** `menuTrigger` по умолчанию равен `input` (ввод открывает список); также доступны `focus` и `manual` (только ArrowDown). `open`, `defaultOpen` и `onOpenChange(open, details)` управляют открытием; details содержит причину.
- **Клавиши:** ArrowDown и ArrowUp открывают список, затем перемещают активную подсказку; Alt+ArrowDown открывает без перемещения. Enter подтверждает. Escape закрывает; второе нажатие Escape восстанавливает подтверждённый текст; если отменять нечего, Escape передаётся окружающему слою, например диалогу. Незавершённый ввод IME никогда не подтверждает выбор.
- **Уход не подтверждает выбор:** Tab и потеря фокуса закрывают список и восстанавливают подтверждённый текст.
- **Фокус:** DOM-фокус остаётся в поле ввода, а `aria-activedescendant` указывает только на смонтированный вариант.
- **Дополнительно:** `actionKeys` вместе с `onAction` задают варианты вроде «создать» или «загрузить ещё», которые выполняют действие вместо подтверждения выбора; `clearInputOnCommit`; `allowsEmptyCollection` сохраняет всплывающий список для состояний загрузки, пустого результата и ошибки; `getKeyLabel` задаёт подпись подтверждённого ключа, чей вариант сейчас не выведен; `name` отправляет подтверждённый ключ.

`ComboboxContent` размещает всплывающий список (`placement`, по умолчанию `bottom-start`; `sideOffset`; `collisionPadding`; `container`) и принимает `header`, `footer`, `renderEmptyState` и `busy`.

Combobox не фильтрует данные: приложение решает, какие подсказки вывести для введённого текста.

## Combobox внутри Field

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

Внутри Field компонент Combobox получает его состояния и `name`, а `ComboboxInput` — идентификатор, подпись и пояснение Field, поэтому собственный `aria-label` полю не нужен. Фильтр использует правила сравнения строк текущей локали, чтобы диакритика и регистр не мешали найти имя.

## Остальные компоненты семейства

| Компонент | Назначение |
|---|---|
| `CheckboxCards`, `RadioCards` | сетка флажков-карточек с множественным выбором; сетка радиокнопок-карточек с выбором одного варианта |
| `CustomSelect` | нестандартный select в дополнение к нативному `Select` |
| `EntityPicker` | выбор связи с одной или несколькими сущностями поверх Combobox, со статусами элементов и повторной попыткой |
| `TagGroup` | интерактивные теги с выбором, именованным удалением и командами перемещения |
| `Toggle`, `ToggleGroup` | кнопка с двумя состояниями (`pressed`, `defaultPressed`, `onPressedChange`) и группа таких кнопок, `single` либо `multiple` |
| `Segmented` | встроенный в строку переключатель с одним выбранным вариантом: `segments`, `value`, `onChange` |
| `Slider` | одно число на шкале либо два ползунка со значением `[number, number]`; `onChange` и `onValueCommit` |
