Эта глава объединяет материал курса. Модель и каждое число взяты из собственного теста публичного API пакета — `a typed model composes from the exports, and runs`, — который пакет проверяет на уровне типов и выполняет. Здесь использована модель этого теста без единиц, которые его проверки никогда не читают. Ниже тест адаптирован для `mx test`; в этой форме он здесь не запускался. Последний раздел указывает источник каждого ожидаемого значения.

## Цель

1. Собрать модель из экспортов `@fiberfx/hypergraph`.
2. Запустить её в отдельной изолированной области состояния (scope), чтобы не затронуть работу вне всех областей.
3. Получить кадр состояния (frame) области через `snapshot`.
4. Применить кадр к новой области.
5. Проверить, что новая область содержит то же состояние, и поддерживать её актуальность через `diff`.

## Модель

Счётчик с подписью, производной суммой и эффектом (effect), сохраняющим текущее значение счётчика при каждом событии `add` (событие `reset` меняет счётчик без сохранения). Только у `$count` есть sid, поэтому только `$count` передаётся кадром; всё остальное вычисляется из него или восстанавливается эффектом.

```ts
import { combine, effect, event, restore, sample, store } from "@fiberfx/hypergraph";

export const add = event<number>();
export const reset = event();

export const $count = store(0, { sid: "count" })
  .on(add, (n, by) => n + by)
  .reset(reset);

export const $label = $count.map((n) => `count ${n}`);
export const $both = combine({ count: $count, label: $label });
export const $sum = combine($count, $count, (a: number, b: number) => a + b);

export const saveFx = effect(async (n: number) => `saved ${n}`);
export const $saved = restore(saveFx.doneData, "");

sample({ clock: add, source: $count, fn: (count: number) => count, target: saveFx });
```

Здесь представлены все виды единиц Hypergraph (unit) и большинство связей: изменяемое хранилище (store) с `.on` и `.reset`, производное хранилище через `.map`, обе формы `combine`, эффект, `restore` его `doneData` и `sample` от события к эффекту.

## Запуск в отдельной области

```ts
import { allSettled, fork, scopeBind, type Scope, type Store } from "@fiberfx/hypergraph";
import { $both, $saved, $sum, add } from "./model";

const read = <T>(store: Store<T>, scope: Scope): T => scopeBind(() => store.getState(), { scope })();

const scope = fork();
await allSettled(add, { scope, params: 3 });

read($both, scope).label; // "count 3"
read($sum, scope);        // 6
read($saved, scope);      // "saved 3"
```

`allSettled` ждёт завершения всей работы, начатой запуском, включая эффект, вызванный через `sample`, поэтому `$saved` уже содержит результат эффекта.

## Получение кадра

```ts
import { snapshot } from "@fiberfx/hypergraph";

const frame = snapshot(scope);
frame.values.count; // { shape: "runtime:number", value: 3 }
```

Кадр содержит только `count`: это единственное изменяемое хранилище с sid. `$label`, `$both` и `$sum` — производные; они вычисляются заново там, где применяется кадр.

## Применение к новой области

`fork({values: frame})` создаёт новую область и применяет к ней кадр одним вызовом:

```ts
import { diff, fork } from "@fiberfx/hypergraph";
import { $count } from "./model";

const replica = fork({ values: frame });
read($count, replica);         // 3
diff(replica, frame).changed;  // {}
```

`diff(replica, frame)` сравнивает текущий кадр реплики с переданным ей кадром. Его `changed` содержит каждую новую запись и каждую запись с другим описанием структуры (shape) или значением. Пустой `changed` означает отсутствие новых и изменённых записей. Поле `removed` перечисляет записи переданного кадра, которых нет в реплике; для совпадения записей оба поля должны быть пусты, как в этом примере.

Реплика — такая же область, как любая другая. Вызов вне всех областей, `add(5)`, меняет глобальное значение `$count` на `5`, а `diff` реплики относительно кадра остаётся пустым.

## Обновление реплики

Те же кадры поддерживают реплику в актуальном состоянии — как страницу после следующего изменения на сервере. Измените оригинал, получите `diff` относительно первого кадра и примените разницу:

```ts
import { allSettled, apply, diff } from "@fiberfx/hypergraph";

await allSettled(add, { scope, params: 1 });
apply(replica, diff(scope, frame));
read($count, replica); // 4
```

## Полный тест

```ts
import { describe, expect, test } from "vitest";
import { allSettled, apply, diff, fork, scopeBind, snapshot, type Scope, type Store } from "@fiberfx/hypergraph";
import { $both, $count, $saved, $sum, add } from "./model";

const read = <T>(store: Store<T>, scope: Scope): T => scopeBind(() => store.getState(), { scope })();

describe("the capstone model", () => {
  test("runs in a fork and round-trips its frame", async () => {
    const scope = fork();
    await allSettled(add, { scope, params: 3 });
    expect(read($both, scope).label).toBe("count 3");
    expect(read($sum, scope)).toBe(6);
    expect(read($saved, scope)).toBe("saved 3");

    const frame = snapshot(scope);
    expect(frame.values.count).toEqual({ shape: "runtime:number", value: 3 });

    const replica = fork({ values: frame });
    expect(read($count, replica)).toBe(3);
    expect(diff(replica, frame).changed).toEqual({});
    expect(diff(replica, frame).removed).toEqual([]);

    add(5);
    expect($count.getState()).toBe(5);
    expect(diff(replica, frame).changed).toEqual({});

    await allSettled(add, { scope, params: 1 });
    apply(replica, diff(scope, frame));
    expect(read($count, replica)).toBe(4);
  });
});
```

## Откуда взято каждое ожидаемое значение

| Проверка | Источник |
|---|---|
| `"count 3"`, `6`, `"saved 3"` после `add(3)` | тест пакета, `api-types.test.ts:52-54` |
| `frame.values.count` равно `{shape: "runtime:number", value: 3}` | тот же тест, `:51` |
| реплика возвращает `3` | тот же тест, `:61` |
| `diff(replica, frame).changed` равно `{}` до и после `add(5)`; глобальное значение `$count` равно `5` | тот же тест, `:62-64` |
| реплика возвращает `4` после применения `diff` | тот же тест, `:65-67` |
| `diff(replica, frame).removed` равно `[]` | **не запускалось:** прочитано в сравнении кадров ядра (`port.ts:371`), которое перечисляет только sid переданного кадра, отсутствующие в реплике |

Векторы задают ту же передачу и восстановление через ядро: `protocol.restored-value-serializes` (восстановленное значение принадлежит области и включается в следующий снимок) и `protocol.apply-brings-a-replica-to-the-frame` (реплика, восстановленная из одного кадра и получившая разницу до следующего, содержит следующий кадр).

Тест пакета также связывает фильтрованный `sample`, `merge`, `split` и `attach` и задаёт исполнителя объявленному эффекту таймера в своей области (`fork({performers})`). Приведённые выше проверки ничего из этого не читают, поэтому здесь они опущены; объявленные эффекты и их исполнители имеют уровень готовности Preview.
