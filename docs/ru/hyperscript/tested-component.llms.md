# Компонент с тестами — Mercury LMS

> HS6, итоговое задание Mercury Hyperscript. `KindFilter` (`node/apps/echd-os/src/kan/common.tsx`) — метки видов записей в представлениях команд и сообщений KAN — получает письменный контракт и тест: `createRoot` внутри `act`, нативный щелчок, проверки DOM, записи фиксации `./inspect` и сравнение серверной разметки с клиентской. Источник результатов отмечен: существующий тест или «не выполнялось».

## Когда читать

При сквозном тестировании компонента Mercury или изменении `KindFilter` либо другого компонента представлений KAN в `common.tsx`.

## Контракт KindFilter

- Свойства: `kinds: readonly SquadKindCount[] | null | undefined` (`{ kind: string; count: number | null }`), `picked: readonly string[]`, `onToggle(kind)`, `onClear()`. Компонент управляемый, собственного состояния нет.
- Нет видов → возвращается `null`.
- `div.kan-kinds[role=group][aria-label="Filter by kind"]` → по одной `button.kan-kind[data-kind=<kind>][aria-pressed=<picked.includes(kind)>]` на вид, с ключом по виду. Внутри `Chip`: размер `sm`, вариант `kindTone(kind)`, `selected` при выборе; имя вида и счётчик (`null` → `0`).
- Щелчок вызывает `onToggle(kind)`. `Button` варианта ghost с текстом "All kinds" виден только при непустом `picked` и вызывает `onClear()`.
- Используют `SquadsExplorer` (`squads.tsx:91`) и представление сообщений (`messages.tsx:430`), передавая `picked` из хранилища своего острова.

## Порядок теста

- Владейте `picked` в обёртке с `useState`; монтируйте через `createRoot(el)` и `act(() => root.render(...))`. Размонтируйте через `act(() => root.unmount())`.
- Нажимайте через `act(() => button.click())`: нативный щелчок, результат установился к возврату из `act`.
- Проверено через `SquadsExplorer` (`squads.test.tsx:112-135`): одна `.kan-kind` на вид, текст "ask 1", `aria-pressed` "true" после щелчка, кнопка "All kinds" по тексту.
- Не выполнялось: метка группы, `fyi 0`, `is-selected` на метке, сброс, `null` без видов, число фиксаций на щелчок, отсутствие размонтирования кнопки и `renderToString(<KindFilter …/>) === el.innerHTML`.
- `inspect({ root: el, phases: ["commit", "unmount"], fn })` → замороженные простые записи; `stop()` удаляет подписку.
- Острова Live Mercury не гидратируют: результат `data-ssr` заменяется при первой отрисовке (`fiberfx/live-mercury/src/hooks.ts:68-71`). Сравнивайте разметку, а не гидратацию.

## Минимальный пример

```tsx
import { createRoot } from "@fiberfx/hyperscript/client";
import { act } from "@fiberfx/hyperscript/test-utils";
import { KindFilter } from "./common";

const el = document.createElement("div");
const root = createRoot(el);
let toggled = "";
act(() => root.render(<KindFilter kinds={[{ kind: "ask", count: 1 }]} picked={[]} onToggle={(k) => (toggled = k)} onClear={() => {}} />));
act(() => el.querySelector<HTMLButtonElement>(".kan-kind[data-kind='ask']")?.click());
// toggled === "ask" (from the source; not run)
act(() => root.unmount());
```

## Не выдавать

- Нажатое состояние внутри `KindFilter`: `picked` принадлежит владельцу.
- Проверки DOM после щелчка вне `act`.
- Заявленный результат проверки, которую никто не запускал: помечайте «не выполнялось».

## Далее

- Тестирование и наблюдение: /ru/hyperscript/testing/llms.txt
- Рендеринг на сервере: /ru/hyperscript/server/llms.txt
- Эта текстовая версия: /ru/hyperscript/tested-component/llms.txt

## Навигация

- [Страница в браузере](/ru/hyperscript/tested-component)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hyperscript/llms.txt)
