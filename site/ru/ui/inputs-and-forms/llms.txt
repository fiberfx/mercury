# UI3, поля ввода и формы — Mercury LMS

> Композиция форм в Mercury UI (`Form`, `Field`, `Label`, `Description`, `FieldError`, `Fieldset`, `Legend`, `FormSection`, `ErrorSummary`) и поля ввода (`Input`, `Textarea`, `DateField`, `ColorField` и остальные). Field передаёт элементу управления одну явную привязку; Form позволяет ErrorSummary найти свои поля Field.

## Когда читать

Когда вы строите форму: задаёте подпись, пояснение и ошибку элемента управления, объединяете элементы в группу, выводите сводку проблем после неудачной отправки или вводите дату либо цвет.

## Контракт (уровень готовности: опубликован — @fiberfx/ui 4.0.0 в npm с 2026-11-05)

- Свойства `Field`: `id`, `name`, `label`, `hint`, `error`, `required`, `invalid` (по умолчанию — наличие `error`), `disabled`, `readOnly`, `focusTarget`, `class`, `style`, `children` (элементы либо `(field) => ...`).
- Привязка (`FieldContextValue`): `id`, `name`, `labelId`, `descriptionId`, `errorId` (`<id>-label|-description|-error`), `invalid`, `required`, `disabled`, `readOnly`, `focus()`, `getControlProps(own?)`.
- `getControlProps({ "aria-describedby"?, "aria-labelledby"? })` → `id` и, только при наличии значения, `name`, `aria-labelledby`, `aria-describedby` (сначала ваши ссылки, затем пояснение и ошибка), `aria-invalid: true`, `required`, `disabled`, `readOnly`. Обработчиков событий нет. Разверните атрибуты на элементе управления.
- `useFieldContext()` → привязка либо `null`. Её читают `SearchField`, `TokenField`, `CheckboxGroup`, `Combobox`, `CustomSelect`, `ListBox`.
- Одна подпись: у Field либо у самого элемента управления, не у обоих.
- `Description`, `FieldError`: не являются live region; при отдельном использовании задайте `id`.
- `Input`: `label`, `hint`, `error`, `leading`, `trailing` и атрибуты input. `Textarea`: `label`, `hint`, `error`, `resizable`, `size`.
- `Fieldset`: `legend`, `hint`, `error`, `invalid`, `focusTarget`; нативный fieldset. `FormSection`: `title`, `open`/`onOpenChange` либо `defaultOpen`; закрытое содержимое инертно; секция раскрывается до перевода фокуса внутрь.
- `Form`: нативная форма, всё передаётся дальше; `noValidate` задаёте вы; поля регистрируются по `name` и `id`.
- `ErrorSummary`: `title` (обязателен), `issues: { field, message, target? }[]`, `focusRequest` (счётчик неудачных отправок; каждое новое положительное значение один раз переводит фокус), `headingLevel` (2). При пустом списке проблем ничего не выводится.
- `DateField`: `value`, `defaultValue`, `onChange(date | undefined)`, `onValidityChange` (`empty | incomplete | impossible | unavailable | before-min | after-max | valid`), `minValue`, `maxValue`, `isDateUnavailable`, `name` (отправляет дату ISO), `readOnly`, `locale` ("en"), `label`. Значения: `parseDate("2026-11-30")` либо `new CalendarDate(y, m, d)` из `@fiberfx/core`.
- `ColorField`: разбирает ввод при Enter или потере фокуса; принимает `#hex`, `rgb()`, `hsl()`, `hsb()`, `color(display-p3 …)`; `editorStates` (`inherit`, `unset`); `tokens` (`{token-id}`); `onChange(value, { reason: commit | token | detach | reset | text })`.

## Минимальный пример

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

## Чего не генерировать

`label` одновременно у Field и его Input; клонирование дочерних элементов ради внедрения идентификаторов; `aria-live` у FieldError; увеличение `focusRequest` при каждом нажатии клавиши; объект `Date` как значение DateField; библиотеку состояния формы внутри `Form`; любые импорты `react` или `effector`.

## Далее

- Курс: /ru/ui/llms.txt
- UI4, выбор значений: /ru/ui/selection/llms.txt
- Эта версия для агентов: /ru/ui/inputs-and-forms/llms.txt (страница в Markdown, `/ui/inputs-and-forms.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/ui/inputs-and-forms)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/ui/llms.txt)
