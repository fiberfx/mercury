Hyperscript следует DOM: написанные имена — имена DOM, получаемые события — события DOM. Ниже описано поведение среды выполнения; первые пять правил закреплены в `test/browser/dom-contract.test.jsx`, который запускается в Chromium без интерфейса. У каждой проверки есть контрольный случай, который должен провалиться.

## class и for

Пишите `class` и `for` в HTML и SVG:

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

`className` тоже работает как свойство DOM, но для написания используйте `class`. Mercury UI везде пишет `class`, а при приёме этого свойства компонентом деструктурирует его как `class: classes`.

## Input и change

В текстовом input или textarea `onInput` срабатывает при каждом вводе, а `onChange` — по событию DOM `change`, когда значение подтверждено, не позднее потери фокуса. В select и checkbox `onChange` срабатывает при каждом выборе или переключении. `onChange` никогда не перенаправляется на события input.

Поэтому поле, которое отслеживает каждый ввод, слушает `onInput`. Так `DataGrid` из Mercury UI редактирует ячейку:

```tsx
onInput={(event) => setEditing({ ...editing, draft: event.currentTarget.value })}
```

## Атрибуты SVG

Атрибуты сохраняют имена SVG: `stroke-width`, `fill-rule`, `clip-path`. `href` работает без `xlink`. Hyperscript не преобразует camelCase-варианты вроде `strokeWidth`: пишите имя SVG.

```tsx
export function Tick() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" />
    </svg>
  );
}
```

## Всплывающие события фокуса

В DOM `focus` и `blur` не всплывают, поэтому `onFocus` родителя не срабатывает, когда фокус получает потомок. Чтобы отслеживать вход фокуса в группу и выход из неё, используйте всплывающие `onFocusIn` и `onFocusOut`:

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

## Пользовательские элементы

Пользовательский элемент получает объект как DOM-свойство, а строку — как атрибут. События подключаются через `on<name>`: `onmy-event` слушает `my-event`, а `onionChange` — `ionChange`. Как и для встроенных событий, имя, начинающееся с заглавной буквы после `on`, переводится в нижний регистр.

## Числовые стили

Число для размерного свойства записывается в пикселях: `style={{ width: 10 }}` даёт `width: 10px` как на клиенте, так и в HTML от `./server`. Безразмерные свойства, например `opacity`, `zIndex`, `flex`, `lineHeight` и номера линий сетки, а также пользовательские свойства вроде `--gap`, записываются без преобразования. Список и правило находятся в одном модуле `src/style.js`, который импортируют оба рендерера.

```tsx
export function Bar({ percent }: { percent: number }) {
  return <div class="bar" style={{ width: percent * 2, opacity: percent > 0 ? 1 : 0.4, "--bar-hue": 210 }} />;
}
```

## Управляемые поля ввода

`<input>`, `<textarea>` или `<select>` со свойством `value` либо `checked` отображает значение этого свойства. После собственного обработчика `onInput` или `onChange` и всех поставленных им в очередь рендерингов значение `value` или `checked`, которое ни один рендеринг не записал, восстанавливается из свойства. Поэтому `<input value="a" onInput={() => {}} />` остаётся `a`, а checkbox с `checked={false}` и обработчиком, игнорирующим щелчок, остаётся неотмеченным.

- **Принятая правка не затрагивается,** включая каретку: её рендеринг уже записал новое значение.
- **Отклонённая текстовая правка** возвращает каретку к месту редактирования.
- **Отклонённый щелчок по radio** восстанавливает управляемые переключатели группы, сохраняя прежний выбор.
- **Во время композиции обратной записи нет.** Событие ввода между `compositionstart` и `compositionend` относится к композиции; метод ввода сохраняет текст до подтверждения.
- **Неуправляемый элемент не несёт этих затрат:** элемент с `defaultValue`, `defaultChecked` или без обоих свойств не ставит обратную запись в очередь.

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

Буква, введённая в `DigitsOnly`, отклоняется: ни один рендеринг её не записывает, поэтому поле возвращается к `code`, а каретка — к прежнему месту.
