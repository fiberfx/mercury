Курс заканчивается там, где используются его компоненты: в представлениях KAN системы EchdOS, в `node/apps/echd-os/src/kan/`. Глава берёт один компонент, формулирует его обещания и проверяет каждое средствами предыдущих шести глав.

## Компонент

`KindFilter` из `node/apps/echd-os/src/kan/common.tsx` — строка меток видов записей над хронологией команд и просмотром сообщений: по одному переключателю со счётчиком на вид записи и кнопка «All kinds», сбрасывающая выбор. Для итогового задания он подходит по трём причинам:

- **Его используют два острова KAN.** `SquadsExplorer` отображает его в `squads.tsx`, а представление сообщений `KanBoard` — в `messages.tsx`, поэтому тест покрывает оба представления.
- **Это чистая функция свойств.** В `common.tsx` это указано для всех общих компонентов: чтения хранилищ нет. Острова держат `picked` в собственных хранилищах и передают его с двумя обработчиками, поэтому тест может владеть состоянием через `useState`.
- **Он построен из Mercury UI.** Каждый переключатель содержит `Chip`, действие сброса — `Button`. Тест проверяет способ композиции `@fiberfx/ui` в представлениях KAN.

Окружающие представления хранят модели в хранилищах островов, построенных на слое состояния вне этого курса. Поэтому глава ограничивается представлением.

## Его контракт

```tsx
export function KindFilter({
  kinds,
  picked,
  onToggle,
  onClear,
}: {
  kinds: readonly SquadKindCount[] | null | undefined;
  picked: readonly string[];
  onToggle: (kind: string) => void;
  onClear: () => void;
}) {
  const list = kinds ?? [];
  if (!list.length) return null;
  return (
    <div class="kan-kinds" role="group" aria-label="Filter by kind">
      {list.map((k) => (
        <button key={k.kind} type="button" class="kan-kind" data-kind={k.kind} aria-pressed={picked.includes(k.kind)} onClick={() => onToggle(k.kind)}>
          <Chip size="sm" variant={kindTone(k.kind)} selected={picked.includes(k.kind)}>
            {k.kind} <b class="kan-kind__n">{k.count ?? 0}</b>
          </Chip>
        </button>
      ))}
      {picked.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onClear()}>
          All kinds
        </Button>
      )}
    </div>
  );
}
```

`SquadKindCount` — это `{ kind: string; count: number | null }`. Из исходников следуют шесть обещаний:

1. **Нет видов — нет фильтра.** `null`, `undefined` или пустой список ничего не отображают.
2. **Именованная группа.** Переключатели находятся в `div` с `role="group"` и меткой "Filter by kind".
3. **Одна нативная кнопка на вид,** с ключом и атрибутом вида (`data-kind`), именем и счётчиком. Счётчик `null` отображается как `0`.
4. **Нажатое состояние определяется свойствами.** `aria-pressed` кнопки и оформление её метки как выбранной определяются наличием вида в `picked`. Собственного состояния у компонента нет.
5. **Щелчок сообщает, а не решает.** Щелчок по виду вызывает `onToggle(kind)`. Значение переключения определяет владелец.
6. **Сброс виден, только когда есть что сбрасывать.** Кнопка "All kinds" отображается при непустом `picked` и вызывает `onClear()`.

Особенно важно защитить обещание 4. Вариант с собственным нажатым состоянием разойдётся с хранилищем острова после серверного обновления.

## Рендеринг внутри act

Тест владеет `picked`, как остров, через небольшую обёртку и монтирует её клиентским корнем внутри `act`. Он мог бы находиться рядом с `common.tsx` в `kind-filter.test.tsx`; такого файла в репозитории пока нет.

```tsx
import { afterEach, expect, it } from "vitest";
import { createRoot } from "@fiberfx/hyperscript/client";
import { useState } from "@fiberfx/hyperscript/hooks";
import { act } from "@fiberfx/hyperscript/test-utils";
import { KindFilter } from "./common";
import type { SquadKindCount } from "./types";

const KINDS: SquadKindCount[] = [
  { kind: "ask", count: 1 },
  { kind: "answer", count: 1 },
  { kind: "fyi", count: null },
];

function Harness({ kinds }: { kinds: SquadKindCount[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <KindFilter
      kinds={kinds}
      picked={picked}
      onToggle={(kind) => setPicked((p) => (p.includes(kind) ? p.filter((k) => k !== kind) : [...p, kind]))}
      onClear={() => setPicked([])}
    />
  );
}

const cleanups: Array<() => void> = [];
afterEach(() => cleanups.splice(0).forEach((cleanup) => cleanup()));

function mount(kinds: SquadKindCount[]) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  act(() => root.render(<Harness kinds={kinds} />));
  cleanups.push(() => {
    act(() => root.unmount());
    el.remove();
  });
  return el;
}

const button = (el: Element, kind: string) => el.querySelector<HTMLButtonElement>(`.kan-kind[data-kind='${kind}']`);
```

`act` возвращается только после завершения рендеринга и эффектов, поэтому следующая строка видит готовый DOM. `root.unmount()` очищает контейнер, затем тест удаляет его. Наборы тестов KAN делают то же через `render(...)` и `render(null, el)` внутри `act`; `createRoot` оборачивает эту же пару в объект корня.

## Щелчок

Щелчок нативный: `HTMLElement.click()` отправляет событие `click`, которое получает `onClick` кнопки. Внутри `act` вызванное щелчком обновление состояния успевает отрендериться до возврата из `act`.

```tsx
const click = (target: HTMLElement | null) => {
  if (!target) throw new Error("nothing to click");
  act(() => target.click());
};
```

Так `squads.test.tsx` нажимает те же кнопки через `SquadsExplorer`.

## Проверки DOM

Каждая проверка соответствует одному обещанию контракта. Комментарий после неё указывает источник ожидаемого значения.

```tsx
it("renders one toggle per kind, pressed by the props", () => {
  const el = mount(KINDS);
  expect(el.querySelector("[role='group']")?.getAttribute("aria-label")).toBe("Filter by kind"); // promise 2, from the source; not run
  expect(el.querySelectorAll(".kan-kind")).toHaveLength(3); // promise 3; squads.test.tsx:112 checks the same count through SquadsExplorer
  expect(button(el, "ask")?.textContent).toBe("ask 1"); // promise 3; squads.test.tsx:113 reads "ask 1"
  expect(button(el, "fyi")?.textContent).toBe("fyi 0"); // promise 3, null count; from the source; not run
  expect(button(el, "ask")?.getAttribute("aria-pressed")).toBe("false"); // promise 4; not run

  click(button(el, "ask"));
  expect(button(el, "ask")?.getAttribute("aria-pressed")).toBe("true"); // promise 4; squads.test.tsx:128 reads "true"
  expect(button(el, "ask")?.querySelector(".mx-chip")?.classList.contains("is-selected")).toBe(true); // promise 4, Chip.tsx:20; not run

  const clear = [...el.querySelectorAll("button")].find((b) => b.textContent === "All kinds") ?? null;
  expect(clear).not.toBeNull(); // promise 6; squads.test.tsx:135 finds it by this text
  click(clear);
  expect(button(el, "ask")?.getAttribute("aria-pressed")).toBe("false"); // promises 4 and 6; not run
  expect([...el.querySelectorAll("button")].some((b) => b.textContent === "All kinds")).toBe(false); // promise 6; not run
});

it("renders nothing without kinds", () => {
  const el = mount([]);
  expect(el.innerHTML).toBe(""); // promise 1, from the source; not run
});
```

Текст "ask 1" получается потому, что `Chip` не добавляет содержимое вокруг потомков: он отображает `span` со своими классами, затем вид, пробел и счётчик полужирным.

## Наблюдение фиксации

`@fiberfx/hyperscript/inspect` сообщает о работе рендерера без вмешательства. Тест может оценить цену щелчка: здесь ожидается, что одно переключение фиксирует корень и не перемонтирует кнопки.

```tsx
import { inspect } from "@fiberfx/hyperscript/inspect";
import type { NodeRecord } from "@fiberfx/hyperscript/inspect";

it("commits once per click, without remounting the toggles", () => {
  const el = mount(KINDS);
  const records: NodeRecord[] = [];
  const stop = inspect({ root: el, phases: ["commit", "unmount"], fn: (record) => records.push(record) });
  click(button(el, "answer"));
  stop();
  expect(records.filter((r) => r.kind === "commit").length).toBeGreaterThan(0); // a commit per commit, inspect/index.js:150-157; count not run
  expect(records.filter((r) => r.kind === "unmount" && r.type === "button")).toHaveLength(0); // keys keep the buttons; not run
});
```

Собственный набор тестов Hyperscript закрепляет следующее: рендеринг выдаёт записи `root`, `render`, `diffed` и `commit`, каждая заморожена и содержит только числа, строки и `null`; подписчик с `root` видит записи только этого корня. Число фиксаций от этого щелчка и отсутствие размонтирования `button` — ожидания по исходникам, которые ещё не проверены тестом.

## Серверный и клиентский рендеринг

Острова KAN не гидратируют разметку. Live Mercury отображает каждый остров через `render`; если элемент содержит серверный результат (`data-ssr`), первая отрисовка заменяет его. До неё читатель видит серверную разметку, поэтому несовпадение проявится как изменение на экране. Тест может защитить от этого сравнением двух рендерингов с одинаковыми свойствами:

```tsx
import { renderToString } from "@fiberfx/hyperscript/server";

it("renders the same markup on the server as in the browser", () => {
  const props = { kinds: KINDS, picked: ["ask"], onToggle: () => {}, onClear: () => {} };
  const el = document.createElement("div");
  const root = createRoot(el);
  act(() => root.render(<KindFilter {...props} />));
  expect(renderToString(<KindFilter {...props} />)).toBe(el.innerHTML); // not run
  act(() => root.unmount());
});
```

Обработчики щелчков не попадают в строку: сервер исключает свойства-функции, поэтому сравнивается только разметка. Собственный набор тестов Hyperscript закрепляет такое свойство для дерева компонентов с `useId`: после гидратации `innerHTML` контейнера равен строковому рендерингу. Для `KindFilter` с логическими `aria-pressed` и вложенными `Chip` и `Button` Mercury UI такой тест ещё не выполнялся. Запустите его перед тем, как полагаться на это свойство.

## Что проверено, а что нет

| Утверждение | Свидетельство |
|---|---|
| Одна кнопка `.kan-kind` на вид; текст "ask 1"; `aria-pressed` "true" после щелчка; кнопка "All kinds", найденная по тексту | `squads.test.tsx:112-135`, через `SquadsExplorer`, который отображает `KindFilter` |
| `createRoot` рендерит, повторно использует тот же узел и размонтирует до пустого контейнера | `client.test.jsx:18-30` |
| `act` завершает работу синхронного обработчика до возврата | `test-utils/index.js:173-186` (исходник) |
| Рендеринг выдаёт замороженные простые записи фиксации; фильтр корня видит один корень | `inspect.test.jsx:52-91` |
| Строковый рендеринг совпадает с гидратированным DOM для деревьев `useId` | `useId.test.jsx:204-275` |
| Метка группы, `0` для пустого счётчика, класс выбранной метки, сброс, пустой результат без видов | По `common.tsx` и `Chip.tsx`; **не выполнялось** |
| Одна фиксация на щелчок, ни одна кнопка не размонтирована, серверная разметка `KindFilter` равна клиентской | **Не выполнялось** |

Ни один тест репозитория не рендерит `KindFilter` отдельно, и ничто в `node/apps/echd-os/src/kan` не вызывает `createRoot`, `inspect` или `renderToString`. Тест из главы — заготовка для добавления рядом с `common.tsx` и запуска. До этого строки «не выполнялось» остаются ожиданиями, а не результатами.
