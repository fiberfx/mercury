Форма в Mercury UI строится из двух семейств. Семейство forms отвечает за композицию: задаёт элементу управления подпись, пояснение и ошибку, объединяет элементы в группы и выводит список проблем формы. Семейство inputs содержит сами элементы управления. Их связывает один явно передаваемый объект привязки.

## Field и привязка элемента управления

`Field` размещает `Label`, `Description` и `FieldError` вокруг одного элемента управления и передаёт ему привязку, атрибуты которой нужно явно развернуть на элементе. Field не клонирует дочерние элементы и не заменяет их обработчики событий: без разворачивания атрибутов элемент управления ничего не получает.

| Свойство | Назначение |
|---|---|
| `id` | идентификатор элемента управления; явно заданный используется без изменений, иначе генерируется стабильный |
| `name` | имя элемента в форме и ключ, по которому ErrorSummary адресует проблему |
| `label` | выводит `Label` для элемента управления |
| `hint` | выводит `Description` |
| `error` | выводит `FieldError` и помечает поле как невалидное |
| `required`, `disabled`, `readOnly` | состояния элемента управления |
| `invalid` | по умолчанию определяется наличием `error` |
| `focusTarget` | для составного элемента: элемент, на который ссылка ErrorSummary переводит фокус |
| `children` | элемент управления либо функция, получающая привязку |

Привязка содержит `id` и `name` элемента управления, стабильные идентификаторы его частей (`labelId`, `descriptionId`, `errorId`: соответственно `<id>-label`, `<id>-description` и `<id>-error`), состояния, `focus()` и `getControlProps()`.

`getControlProps(own?)` возвращает нужные элементу атрибуты: `id`, а остальные — только при наличии значения: `name`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `required`, `disabled` и `readOnly`. Собственные `aria-describedby` или `aria-labelledby` идут первыми, затем добавляются ссылки на пояснение и ошибку, каждая по одному разу. На отсутствующую часть ссылка не создаётся, поэтому после удаления ошибки не остаётся ссылки на несуществующий идентификатор.

Любой потомок может прочитать привязку через `useFieldContext()`; вне Field результат равен `null`. Некоторые элементы Mercury делают это сами: `SearchField`, `TokenField`, `CheckboxGroup`, `Combobox`, `CustomSelect` и `ListBox` получают состояния и ссылки от окружающего Field.

## Label, Description и FieldError

- **`Label`:** подпись. `required` добавляет звёздочку, скрытую от вспомогательных технологий (смысл передаёт нативный атрибут `required` элемента); `optional` добавляет «(optional)». Также доступны `size` (`sm`, `md`, `lg`), `disabled`, `accent` и строка `hint`.
- **`Description`:** пояснение, выведенное приглушённым цветом.
- **`FieldError`:** ошибка рядом с полем, выведенная цветом отрицательного состояния.

Ни `Description`, ни `FieldError` не являются live region. Ошибка не объявляется при каждом нажатии клавиши; о ней сообщают перевод фокуса и ErrorSummary. Field и Fieldset выводят обе части из `hint` и `error`; при отдельном использовании задайте каждой `id` и укажите ссылки самостоятельно.

## Input и Textarea

`Input` — текстовое поле. У него могут быть собственные `label`, `hint` и `error`, а также дополнения `leading` и `trailing`; при наличии `error` он устанавливает `aria-invalid` и выводит сообщение. Все остальные атрибуты поля передаются в `<input>`.

`Textarea` принимает `label`, `hint`, `error`, `resizable` и `size` (`sm`, `md`, `lg`).

Задавайте подпись либо Field, либо самому элементу управления. Внутри Field с `label` не задавайте собственный `label` у Input и разверните на нём атрибуты привязки. Input с собственной подписью по-прежнему может получать ошибку от Field.

## Fieldset, Legend и FormSection

- **`Fieldset`:** нативный `<fieldset>` с `legend`, `hint` и `error`. Сохраняет нативную семантику группы: роль `group`, имя из легенды, поведение `disabled` и `name` соответствует HTML. ErrorSummary переводит фокус на первый доступный элемент группы либо на элемент, возвращённый `focusTarget`.
- **`Legend`:** нативный `<legend>`, первый дочерний элемент fieldset, по которому браузер определяет имя группы. Fieldset выводит его из свойства `legend`.
- **`FormSection`:** сворачиваемая часть формы на основе `Collapsible`. Принимает `title`, `open` вместе с `onOpenChange` либо `defaultOpen`, а также `bordered`, `accent` и `width`. Содержимое закрытой секции инертно, поэтому скрытые поля не получают фокус. Если ссылка ErrorSummary или `focus()` у Field указывает на поле внутри неё, сначала открывается эта секция и все окружающие её секции.

## Form и ErrorSummary

`Form` — нативный `<form>`. Все атрибуты и обработчики передаются без изменений, поэтому отправка, сброс и браузерная проверка ограничений работают как у самого элемента. Чтобы отключить проверку, явно передайте `noValidate`. Form не подключает библиотеку состояния. Единственное дополнение — реестр, в котором вложенные Field регистрируются по `name` или `id`.

`ErrorSummary` перечисляет проблемы формы после неудачной отправки:

- **`issues`:** упорядоченный список элементов `{ field, message, target? }`. `field` — это `name` или `id` поля Field; текст сообщения должен совпадать с ошибкой рядом с полем. При пустом списке ничего не выводится.
- **`title`:** обязательный заголовок; `headingLevel` задаёт его уровень, по умолчанию `2`.
- **`focusRequest`:** счётчик неудачных отправок. Каждое новое положительное значение один раз переводит фокус на сводку; обновление валидации без изменения счётчика фокус не перемещает.

Каждая проблема — ссылка. При её активации открывается FormSection поля, а фокус переходит на элемент управления, найденный в реестре Form. Вне Form фокус получает элемент с идентификатором `target`, а если он не задан — `field`.

## Полный пример формы

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

Приложение отвечает за валидацию: определяет проблемы и передаёт одинаковое сообщение в `error` поля Field и в сводку. Mercury отвечает за ссылки, фокус и раскрытие секций.

## Даты

`DateField` — поле даты с отдельными сегментами: месяц, день и год представлены сегментами spinbutton, порядок и разделители которых зависят от `locale` (по умолчанию `"en"`). Значение имеет тип `DateValue` из `@fiberfx/core`; создать его можно через `parseDate("2026-11-30")` или `new CalendarDate(2026, 11, 30)`.

- **`value` / `defaultValue` / `onChange`:** `onChange` получает дату при каждом подтверждённом изменении и `undefined`, если черновой ввод не является допустимой датой.
- **`onValidityChange`:** сообщает причину: `empty`, `incomplete`, `impossible` (31 февраля сохраняется как введено и не нормализуется), `unavailable`, `before-min`, `after-max` или `valid`.
- **`minValue`, `maxValue`, `isDateUnavailable`:** границы и недопустимые даты.
- **`name`:** одно скрытое поле отправляет подтверждённое значение в формате ISO, `2026-11-30`; сегменты не отправляются.
- **`readOnly`:** сегменты остаются доступны для фокуса и навигации, но не принимают изменения.

Части сегментированного ввода, `DateInput` (роль `group`) и `DateSegment` (один `spinbutton`), экспортируются и используются также в `TimeField`, `DateRangeField`, `DatePicker`, `DateRangePicker` и `DateTimeField`.

## Цвета

`ColorField` — текстовое поле одного цветового значения. Оно хранит введённый черновик отдельно от подтверждённого значения: Enter или потеря фокуса запускают разбор. Неподдерживаемая запись отклоняется с сообщением и `aria-invalid`, но черновик остаётся доступен для редактирования; Escape восстанавливает подтверждённый текст. Поддерживаются `#hex`, `rgb()`, `hsl()`, `hsb()` и `color(display-p3 …)`, а также `inherit` и `unset` при включении `editorStates` и ссылки `{token-id}` при передаче `tokens`.

`onChange(value, details)` сообщает причину изменения: `commit`, `token`, `detach` (токен заменён литералом), `reset` или `text`. Связанный компонент `ColorChannelField` — числовое поле одного `channel` цвета: то же изменение, что при перетаскивании, но через ввод числа.

## Остальные компоненты семейства

| Компонент | Назначение |
|---|---|
| `Search` | поиск со встроенным значком и очисткой |
| `SearchField` | поиск с отдельными эффектами изменения черновика, отправки и очистки |
| `PasswordField` | поле пароля с переключателем видимости |
| `MoneyInput` | поле денежной суммы |
| `AuthCode` | ввод одноразового кода по отдельным позициям |
| `TokenField` | текст и токены со стабильной идентичностью и явным подтверждением |
| `TimeField` | сегментированное время без даты |
| `DatePicker` | поле даты со всплывающим календарём |
| `DateRangeField` / `DateRangePicker` | два вводимых конца диапазона; тот же ввод с календарём диапазона |
| `DateTimeField` | время публикации с часовым поясом |
| `TimeZonePicker` | именованный часовой пояс |
| `Calendar` / `RangeCalendar` | сетка месяца; непрерывный диапазон дней |
| `ColorPicker` | управляет транзакцией изменения одного цветового поля |
| `ColorArea`, `ColorSlider`, `ColorWheel` | два канала на плоскости, один на шкале, оттенок на кольце |
| `ColorSwatch` / `ColorSwatchPicker` | именованный образец цвета; выбор одного из образцов |
| `ColorThumb` | общий ползунок поверхностей выбора цвета |
| `TokenPicker` | выбор дизайн-токена по идентификатору |
