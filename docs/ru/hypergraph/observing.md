Модель наблюдают двумя способами: код приложения следит за единицей, а инструмент — например, DevTools, журнал или тест — исследует модель целиком.

## watch

`watch(unit, fn, {scope?})` вызывает `fn` при каждом обновлении `unit` и возвращает `Subscription`: функцию прекращения наблюдения; вызов `.unsubscribe()` делает то же самое.

- При заданном `scope` наблюдатель видит обновления только этой изолированной области состояния (scope), но не за её пределами.
- Без него наблюдатель видит работу вне всех областей.
- Наблюдатель также принадлежит **поколению** кода, которое его создало. Когда горячая замена завершает это поколение, наблюдатель завершается вместе с ним, даже если область продолжает жить.

```ts
import { allSettled, event, fork, store, watch } from "@fiberfx/hypergraph";

const increment = event();
const $count = store(0).on(increment, (n) => n + 1);

export async function seen() {
  const scope = fork();
  const values: number[] = [];
  const stop = watch($count, (n) => values.push(n), { scope });
  await allSettled(increment, { scope });
  increment(); // outside the scope: not seen
  stop();
  return values; // [1]
}
```

Вектор `watch.scoped-store-not-global` фиксирует строку с пометкой *not seen*: наблюдатель области ничего не записывает для вызова вне неё.

## watch и unit.watch

Для хранилища (store) они намеренно различаются:

| | Вызывается с текущим состоянием? |
|---|---|
| `watch($store, fn, {scope?})` | нет, только при обновлениях |
| `$store.watch(fn)` | да, затем при каждом обновлении |

Используйте `watch` для реакции в области. Операция `watch` в тестовом векторе соответствия записывает также текущее состояние, поэтому трасса, например ромба из урока [о связях](/ru/hypergraph/wiring), начинается с состояния каждого хранилища.

## inspect

`inspect` импортируется из отдельной точки входа `@fiberfx/hypergraph/inspect`, поэтому приложение без инспекции не включает его в свой состав.

`inspect({scope?, kinds?, fn})` вызывает `fn` для каждого **наблюдения** и возвращает `Subscription`.

- При заданном `scope` видит только эту область. Без него видит работу вне всех областей и не видит работу внутри них.
- При заданном `kinds` видит только перечисленные виды.
- Когда отписывается последний подписчик, ядро прекращает запись, поэтому после этого инспекция ничего не стоит.

Наблюдение имеет вид `{type, unit, scope, gen, value, cause}`. `unit` — sid единицы либо идентификатор времени выполнения, если компилятор ещё не назначил ей имя. `cause` — ближайшая предшествующая единица в запуске либо `null` для внешнего вызова.

```ts
import { allSettled, event, fork, store } from "@fiberfx/hypergraph";
import { inspect, type Observation } from "@fiberfx/hypergraph/inspect";

const increment = event();
const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);

export async function updates() {
  const scope = fork();
  const seen: Observation[] = [];
  const subscription = inspect({ scope, kinds: ["update"], fn: (o) => seen.push(o) });
  await allSettled(increment, { scope });
  subscription.unsubscribe();
  return seen.filter((o) => o.unit === "count").map((o) => o.value);
}
```

## Виды наблюдений

| `type` | Когда возникает | Дополнительные поля |
|---|---|---|
| `update` | единица приняла значение | |
| `skip` | шаг остановлен: фильтром, равным текущему значению или `undefined` при обновлении хранилища, отказом `updateFilter` | |
| `fail` | пользовательская функция выбросила ошибку; `value` содержит ошибку | |
| `declare` | единица создана; `value` содержит её `Declaration` | `fresh`, если она новая в своём поколении |
| `perform` | эффект запущен | `at`, миллисекунды от начала эпохи |
| `settle` | эффект завершён | `at` |
| `reset` | значение не перенесено при замене или применении кадра состояния (frame) | `reason` |

`skip` — информационное наблюдение, которое можно исключить через `kinds`; оно отвечает на вопрос, почему sample не сработал. `declare` поступает инспекторам вне областей. `Declaration` имеет вид `{unit, kind, sid?, name?, derived?, owner?, gen}`; `owner` пока не задаётся — его должен назначить компилятор.

`declare` с пометкой `fresh` обозначает хранилище, которое есть только в новом поколении: оно начинает с исходного значения, ничего не потеряно, поэтому это информация, а не сброс (вектор `hmr.new-is-information-not-a-reset`).

## describe

`describe(reason)` из той же точки входа формулирует причину сброса для разработчика — для консоли, панели поверх страницы или DevTools:

| `reason` | `describe(reason)` |
|---|---|
| `{kind: "removed"}` | `removed` |
| `{kind: "shape", from, to}` | `shape changed from <from> to <to>` |
| `{kind: "renamed", to}` | `renamed (a hint, not applied: it may now be <to>)` |
| `{kind: "positional"}` | `positional` |
| `{kind: "new"}` | `new` |

```ts
import { describe } from "@fiberfx/hypergraph/inspect";

export const line = describe({ kind: "shape", from: "runtime:number", to: "runtime:string" });
// "shape changed from runtime:number to runtime:string"
```

Типы `Observation`, `Declaration`, `Kind` и `ResetReason` также экспортируются из `@fiberfx/hypergraph/inspect`.
