## kindOf

`kindOf(x)` определяет вид значения: `"store"`, `"event"`, `"effect"`, `"scope"` или `null` для всего остального, включая значение, которое похоже на единицу, но создано не этим модулем.

```ts
import { effect, event, fork, kindOf, store } from "@fiberfx/hypergraph";

export const kinds = [kindOf(store(0)), kindOf(event()), kindOf(effect(() => 1)), kindOf(fork()), kindOf(42)];
// ["store", "event", "effect", "scope", null]
```

## setCarrier и nodeCarrier

Область должна сохраняться вдоль асинхронной цепочки: код после `await` в обработчике должен по-прежнему выполняться в его области. Способ задаётся через `setCarrier(carrier)`.

- **Без переносчика** (`setCarrier(null)`, значение по умолчанию и вариант для браузера, пока в платформе нет асинхронного контекста): вызванный в области эффект (effect) по завершении возвращает вызывающую сторону в эту область. Посторонний вызов во время ожидания тоже может попасть в неё.
- **Переносчик** вместо этого передаёт область по цепочке, поэтому посторонний вызов к ней не присоединяется. `Carrier` имеет вид `{current(), run(scope, fn)}`.

На сервере JavaScript такой переносчик создаёт `nodeCarrier()` из `@fiberfx/hypergraph/node`, построенный на `AsyncLocalStorage`. Он вынесен в отдельную точку входа, чтобы браузерный код не импортировал серверные модули. Задайте его один раз при запуске сервера:

```ts
import { setCarrier } from "@fiberfx/hypergraph";
import { nodeCarrier } from "@fiberfx/hypergraph/node";

setCarrier(nodeCarrier());
```

## HypergraphError

Отказ — это `HypergraphError`, подкласс `Error` с `name` `"HypergraphError"` и полем `code`. Именно **код** является контрактом: вектор проверки соответствия проверяет `{"code": …}`, и каждая среда выполнения, содержащая область, использует те же коды. Текст сообщения выбирается конкретным ядром и может меняться.

```ts
import { HypergraphError, event } from "@fiberfx/hypergraph";

const typed = event<string>();
const trimmed = typed.map((text) => text.trim());

export function callDerived() {
  try {
    (trimmed as unknown as (text: string) => void)(" hi ");
  } catch (error) {
    return error instanceof HypergraphError ? error.code : "unexpected"; // "derived-call"
  }
}
```

В типе производного события (event) нет сигнатуры вызова, поэтому для самой возможности такой ошибки в примере нужно приведение типа; ядро всё равно отклоняет вызов. Это вектор `derived.map-event-refuses-call`.

## Коды и способы их получения

| `code` | Нарушенное правило | Как проявляется | Что делать |
|---|---|---|---|
| `derived-call` | производная единица вызвана напрямую | исключение передаётся вызывающей стороне | вызвать исходную единицу |
| `derived-target` | производная единица указана как цель `sample` или ветвь `split` | исключение при создании связей | выбрать целью хранилище (store) или событие |
| `pure-call` | единица вызвана внутри чистой функции, например редьюсера или `map` | ошибка сообщается, но не выбрасывается за пределы запуска (ниже) | задать вызов связью через `sample` |
| `disposed-scope` | работа начата в завершённой области | промис `allSettled` или вызова эффекта отклоняется | создать новую область |
| `reset-reason` | причина сброса не входит в `removed`, `shape`, `renamed`, `positional`, `new` | исключение из интерфейса горячей замены | указать одну из допустимых причин |

`reset-reason` защищает интерфейс горячей замены, которым будет управлять запланированный путь экспорта `/hmr`; код приложения не сообщает о сбросах.

```ts
import { HypergraphError, allSettled, dispose, event, fork } from "@fiberfx/hypergraph";

const ping = event();

export async function afterDispose() {
  const scope = fork();
  dispose(scope);
  try {
    await allSettled(ping, { scope });
  } catch (error) {
    return error instanceof HypergraphError ? error.code : "unexpected"; // "disposed-scope"
  }
}
```

## Исключение внутри графа

Функция, выполняемая графом, например редьюсер, `map`, фильтр или наблюдатель, никогда не выбрасывает исключение за пределы запуска. Исключение записывается в `console.error`, останавливает только эту ветвь и поступает в `inspect` как наблюдение `fail` ([наблюдение](/ru/hypergraph/observing)).

Поэтому `pure-call` сообщается, а не выбрасывается вашему коду. Вектор `impure.store-on-refuses-call` задаёт редьюсер, вызывающий событие: вызов отклоняется и сообщается с кодом `pure-call`, событие не запускается, хранилище сохраняет состояние.

```ts
import { event, store } from "@fiberfx/hypergraph";

const hit = event();
const trigger = event();

// Refused: a reducer must not call a unit. Wire it with sample({clock: trigger, target: hit}) instead.
export const $x = store(0).on(trigger, (x) => {
  hit();
  return x;
});
```

## Ошибки, не являющиеся отказами

Некоторые ошибки представлены обычным `Error` без кода: они относятся к самому API JavaScript и не описаны векторами:

- связывание единиц двух поколений;
- передача значения, не являющегося единицей этого модуля, вместо ожидаемой единицы;
- `scopeBind` без явно заданной области и без области вызывающей стороны, если не указано `safe: true`;
- `allSettled` для производной единицы;
- декларативный эффект в области без подходящего исполнителя.

Проверяйте отказ по `code`, а не по тексту сообщения.
