# Контракт DOM — Mercury LMS

> HS2 Mercury Hyperscript. Hyperscript использует имена атрибутов и события самого DOM. Правила 1–5 проверяются в Chromium без интерфейса (`fiberfx/hyperscript/test/browser/dom-contract.test.jsx`, mercury.63); правила 6–7 — особенности среды выполнения Mercury (`README.md` H0e, H0f).

## Когда читать

При написании атрибутов, обработчиков событий, SVG, встроенных стилей или поля формы в компоненте Mercury, а также при переносе разметки из другой библиотеки.

## Контракт

1. `class` и `for` в HTML и SVG. `className`/`htmlFor` работают как свойства DOM, но пишите `class`/`for`.
2. Текстовый input/textarea: `onInput` при каждом вводе; `onChange` по событию DOM `change` при подтверждении, не позднее потери фокуса. Select/checkbox: `onChange` при выборе или переключении. `onChange` не перенаправляется на input.
3. Имена SVG как написаны: `stroke-width`, `fill-rule`, `clip-path`; `href` без `xlink`. `strokeWidth` не преобразуется.
4. Всплывающий фокус: `onFocusIn` / `onFocusOut`. `onFocus` родителя не срабатывает для потомка.
5. Пользовательские элементы: объект → свойство, строка → атрибут; события через `on<name>` (`onmy-event` → `my-event`, `onionChange` → `ionChange`); заглавная буква после `on` приводит к переводу имени в нижний регистр.
6. Числовые стили: размерное число получает `px` (`width: 10` → `10px`), одинаково на клиенте и в `./server`; безразмерные свойства (`opacity`, `zIndex`, `flex`, `lineHeight`, линии сетки…) и свойства `--custom` записываются как заданы.
7. Управляемые поля: при `value` или `checked` после обработчика и его рендерингов незаписанное значение восстанавливается из свойства. Принятые правки не затрагиваются; отклонённые текстовые правки восстанавливают каретку; отклонённые щелчки radio восстанавливают группу. Во время композиции IME обратной записи нет, как и для неуправляемых элементов (`defaultValue`, `defaultChecked` или без свойства).

## Минимальный пример

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

## Не выдавать

- `className`, `htmlFor` в новом коде; `strokeWidth`, `fillRule`, `clipPath`, `xlinkHref` в SVG.
- `onChange` для отслеживания каждого введённого символа.
- `onFocus`/`onBlur` на контейнере для отслеживания фокуса внутри него.

## Далее

- Компоненты и render: /ru/hyperscript/components/llms.txt
- Хуки: /ru/hyperscript/hooks/llms.txt
- Эта текстовая версия: /ru/hyperscript/dom/llms.txt (страница в Markdown, `/hyperscript/dom.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hyperscript/dom)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hyperscript/llms.txt)
