Единицы Hypergraph (unit) объявляются один раз на уровне модуля, а каждое значение живёт в области. Поэтому тест легко изолировать: каждый тест создаёт собственную область, и его действия не затрагивают другие тесты или работу вне всех областей.

## Зачем каждому тесту своя область

- **Изоляция.** Запуск в области обновляет только её. Это задаёт вектор `fork.scope-isolated-from-global`: `allSettled` дожидается эффекта (effect), запущенного в области, и тот обновляет значение хранилища (store) области до `1`, тогда как снаружи оно остаётся равным `0`.
- **Код сброса не нужен.** Новый `fork()` читает начальное значение каждого хранилища, даже если вызов вне всех областей уже изменил его там (вектор `fork.no-scope-event-before-fork`). Между тестами нечего очищать, кроме завершения использованной области через `dispose`.
- **Обработчики для каждой области.** Тест задаёт эффекту нужный обработчик только в своей области, без подмены модулей.

## Запуск тестов через mx test

`mx test` запускает тестовые файлы участника рабочей области, в том числе `*.test.ts` и `*.spec.ts`, в браузере без интерфейса, который mx запускает сам. Импорт `vitest` направляется в собственную среду выполнения mx с `describe`, `test`, `it`, `expect` и обычными проверками. Код выхода — `0`, если прошли все тесты; `1`, если хотя бы один не прошёл или не запустился ни один; `3`, если браузер не удалось запустить.

Тесты выполняются в браузере, поэтому `@fiberfx/hypergraph/node` для них не подходит: область ведёт себя так же, как в браузере.

## Первый тест

Модель:

```ts
import { event, store } from "@fiberfx/hypergraph";

export const increment = event();
export const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);
```

Тест читает хранилище в области через `scopeBind` — тот же помощник, которым пользуются тесты самого пакета:

```ts
import { describe, expect, test } from "vitest";
import { allSettled, fork, scopeBind, type Scope, type Store } from "@fiberfx/hypergraph";
import { $count, increment } from "./counter";

const read = <T>(store: Store<T>, scope: Scope): T => scopeBind(() => store.getState(), { scope })();

describe("counter", () => {
  test("counts in its own scope", async () => {
    const scope = fork();
    await allSettled(increment, { scope });
    await allSettled(increment, { scope });
    expect(read($count, scope)).toBe(2);
  });

  test("starts from a given value", async () => {
    const scope = fork({ values: [[$count, 10]] });
    await allSettled(increment, { scope });
    expect(read($count, scope)).toBe(11);
  });
});
```

## Замена эффектов

`fork({handlers})` принимает пары `[effect, handler]`, где обработчик — функция или другой эффект. Для эффекта `allSettled` возвращает `{status, value}`, поэтому тест может проверить оба исхода без `try`:

```ts
import { expect, test } from "vitest";
import { allSettled, effect, fork } from "@fiberfx/hypergraph";

const loadUser = effect(async (id: number) => {
  const response = await fetch(`/api/users/${id}`);
  return (await response.json()) as { name: string };
});

test("loads a user", async () => {
  const scope = fork({ handlers: [[loadUser, async (id: number) => ({ name: `user ${id}` })]] });
  expect(await allSettled(loadUser, { scope, params: 7 })).toEqual({ status: "done", value: { name: "user 7" } });
});

test("reports a failure", async () => {
  const offline = new Error("offline");
  const scope = fork({ handlers: [[loadUser, async () => { throw offline; }]] });
  expect(await allSettled(loadUser, { scope, params: 7 })).toEqual({ status: "fail", value: offline });
});
```

## Проверка кадра состояния

`snapshot(scope)` сразу возвращает все изменённые хранилища с sid — удобно для проверки состояния целой страницы. Каждая запись кадра состояния (frame) имеет вид `{shape, value}`:

```ts
import { expect, test } from "vitest";
import { allSettled, fork, snapshot } from "@fiberfx/hypergraph";
import { increment } from "./counter";

test("the frame holds what changed", async () => {
  const scope = fork();
  expect(snapshot(scope).values).toEqual({});
  await allSettled(increment, { scope });
  expect(snapshot(scope).values.count).toMatchObject({ shape: "runtime:number", value: 1 });
});
```

## Проверки через inspect

`inspect` из `@fiberfx/hypergraph/inspect` показывает ход выполнения, а не только итог: каждое обновление в порядке запуска, каждый шаг, остановленный фильтром, каждую функцию, выбросившую исключение. Подпишитесь на область перед запуском работы и отпишитесь после:

```ts
import { expect, test } from "vitest";
import { allSettled, fork } from "@fiberfx/hypergraph";
import { inspect, type Observation } from "@fiberfx/hypergraph/inspect";
import { increment } from "./counter";

test("one update per launch, no failures", async () => {
  const scope = fork();
  const seen: Observation[] = [];
  const stop = inspect({ scope, kinds: ["update", "fail"], fn: (o) => seen.push(o) });
  await allSettled(increment, { scope });
  stop();
  expect(seen.filter((o) => o.type === "fail")).toHaveLength(0);
  expect(seen.filter((o) => o.unit === "count").map((o) => o.value)).toEqual([1]);
});
```

Особенно следите за `fail`. Исключение функции, которую выполняет граф, никогда не выходит за границы запуска: ошибка попадает в `console.error` и в наблюдение `fail`. Поэтому тест, который проверяет только значения, может пройти, даже если редьюсер завершается ошибкой.

## Как читать векторы

Векторы соответствия в `specs/mercury/vectors/hypergraph/` задают поведение ядра данными, которые выполняет каждая среда, управляющая областью. Если вы не уверены, как поведёт себя модель, найдите вектор с нужным правилом.

- **Файл семейства** имеет вид `{"format": "hgv/1", "family": …, "vectors": […]}`, а идентификатор вектора — `<family>.<name>`, например `kernel.diamond-one-update-per-launch`.
- **Вектор** содержит `units` (хранилища, события, эффекты), `wiring` (рёбра, например `on`, `map`, `combine`, `sample`, `watch`), `steps` (`call`, `fork`, `allSettled`, `check`, …) и `expect`.
- **`expect.trace`** — полный упорядоченный список пар `[unit, value]`, записанных наблюдателями всех единиц; порядок внутри запуска входит в контракт. Остальные ключи — `state` (вне всех областей), `scopes`, `spies`, `errors` и `inspected`.
- **Функции представлены данными** в формате hgx/1: `{"arg": 0}` — первый аргумент, `{"op": "add", "args": [{"arg": 0}, 1]}` прибавляет единицу. Ни одному исполнителю не нужен JavaScript, чтобы их прочитать.
- **Значения представлены JSON**, где `{"$undef": true}` обозначает `undefined`, а `{"$error": message}` — выброшенную ошибку. Ошибка проверяется по переносимому коду, `{"code": "derived-call"}`, а не по тексту сообщения.
- **Откуда взялся вектор.** У вектора есть `source` — тестовый случай, который он выражает, — либо `observed`, `{by, rule, why}`, для правила, заданного проектным решением. Так `protocol.json` хранит собственные правила Hypergraph: поколения, кадры, слоты, сбросы.

Исполнители самого пакета прогоняют векторы `hgv/1` и `protocol.json` дважды: непосредственно на ядре и через публичный API, который вы импортируете. Векторы замены `hmr.json` проверяют её сравнение ([горячая замена](/ru/hypergraph/hot-replacement)).

## От вектора к тесту

Сокращённый `kernel.diamond-one-update-per-launch`:

```json
{
  "units": [{"id": "trigger", "kind": "event"}, {"id": "A", "kind": "store", "init": 1}],
  "wiring": [
    {"op": "on", "store": "A", "clock": "trigger", "fn": {"op": "add", "args": [{"arg": 0}, 1]}},
    {"op": "map", "from": "A", "fn": {"op": "add", "args": [{"arg": 0}, 1]}, "as": "B"},
    {"op": "map", "from": "B", "fn": {"op": "add", "args": [{"arg": 0}, 1]}, "as": "C"},
    {"op": "map", "from": "A", "fn": {"op": "add", "args": [{"arg": 0}, 1]}, "as": "D"},
    {"op": "combine", "stores": ["C", "D"], "variadic": true, "fn": {"op": "arr", "args": [{"arg": 0}, {"arg": 1}]}, "as": "E"},
    {"op": "watch", "unit": "E"}
  ],
  "steps": [{"call": "trigger"}],
  "expect": {"trace": [["E", [3, 2]], ["E", [4, 3]]]}
}
```

То же правило как тест собственной модели в области:

```ts
import { expect, test } from "vitest";
import { allSettled, combine, event, fork, store, watch } from "@fiberfx/hypergraph";

const trigger = event();
const $a = store(1).on(trigger, (a) => a + 1);
const $c = $a.map((a) => a + 1).map((b) => b + 1);
const $d = $a.map((a) => a + 1);
const $e = combine($c, $d, (c, d) => [c, d]);

test("the diamond updates once per launch", async () => {
  const scope = fork();
  const seen: number[][] = [];
  const stop = watch($e, (e) => seen.push(e), { scope });
  await allSettled(trigger, { scope });
  stop();
  expect(seen).toEqual([[4, 3]]);
});
```

Трасса вектора начинается с `[3, 2]`, поскольку его `watch` сразу записывает состояние. `watch` с областью сообщает только об обновлениях, поэтому тест видит единственное обновление `[4, 3]` и никогда не видит частично обновлённое `[4, 2]`.
