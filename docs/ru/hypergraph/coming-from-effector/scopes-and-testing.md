Модель изолированных областей состояния (scope) Effector переносится целиком: `fork` создаёт изолированную копию состояния графа, `allSettled` запускает в ней единицу Hypergraph (unit) и ждёт завершения работы, а `scopeBind` привязывает к ней обратный вызов. Меняется то, что выходит из области. `serialize` в Effector возвращал обычный объект; `snapshot` в Hypergraph возвращает кадр состояния (frame).

## fork и обработчики

`fork({values, handlers})` принимает те же два ключа, что в Effector, и третий — `performers` — для объявленных эффектов (effect).

- **`values`** задаёт начальное состояние хранилищ (store) в области: список пар `[store, value]`, объект с ключами sid или кадр `snapshot`.
- **`handlers`** заменяет обработчики эффектов в области: список пар `[effect, handler]`, где обработчик — функция или другой эффект.

`fork(domain)` отсутствует: домены не входят в Hypergraph.

## Полный пример теста

Знакомый по Effector шаблон тестирования — область с подставным обработчиком и `allSettled` — работает по-прежнему:

```ts
import { allSettled, effect, fork, scopeBind, store } from "@fiberfx/hypergraph";

const fetchUserFx = effect<number, string>(async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.text();
});
const $user = store<string | null>(null).on(fetchUserFx.doneData, (_, user) => user);

const scope = fork({
  handlers: [[fetchUserFx, async (id: number) => `stub ${id}`]],
});

await allSettled(fetchUserFx, { scope, params: 7 });

const user = scopeBind(() => $user.getState(), { scope })();
// user is "stub 7"; outside the scope, $user.getState() is still null.
```

`allSettled(scope)` без единицы ждёт завершения уже выполняющейся работы этой области.

## Чтение хранилища в области

У области Effector был метод `scope.getState($store)`. У области Hypergraph такого метода нет: она содержит только свой `id` и поколение `gen`. Метод хранилища `getState()` читает область вызывающего кода. Поэтому для чтения хранилища в области вызовите его внутри привязанной к этой области функции, как выше:

```ts
import { scopeBind } from "@fiberfx/hypergraph";

const read = scopeBind(() => $user.getState(), { scope });
read();
```

`scopeBind` привязывает любую функцию, а не только событие или эффект. Без `scope` он привязывает к области вызывающей стороны, например наблюдателя или обработчика; `safe: true` разрешает привязку, когда области нет.

Чтобы следить за хранилищем в области, используйте `watch($user, fn, { scope })`.

## snapshot, apply и diff

Для серверного рендеринга `serialize(scope)` из Effector стал `snapshot(scope)`, а `hydrate(scope, {values})` — `apply(scope, frame)`.

```ts
import { apply, fork, snapshot, store } from "@fiberfx/hypergraph";

// Today a store has a sid only when one is written, as here; the compiler is meant to assign them.
export const $user = store<string | null>(null, { sid: "user" });

// On the server, after the scope has settled:
const serverScope = fork({ values: [[$user, "Ada"]] });
const frame = snapshot(serverScope);
// frame is { format: "mhg-scope/1", gen, values: { user: { shape, value } } }

// In the browser, either fork from the frame...
const clientScope = fork({ values: frame });
// ...or apply it to a scope you already have, and see what it could not take:
const misses = apply(clientScope, frame);
```

Вместо `serialize(scope)[sid]` в коде Effector читайте `snapshot(scope).values[sid].value`. Каждая запись несёт описание структуры (shape) хранилища рядом со значением. Поэтому `apply` принимает запись, только если хранилище использует её sid с той же структурой. Остальные записи он возвращает с причинами: `removed`, если ни одно хранилище не использует sid, или `shape` с указанием обеих структур. `hydrate` в Effector ничего не возвращал.

`snapshot(scope, { ignore: [$secret] })` исключает хранилища, как это делал `serialize` с параметром `ignore`. Параметра `onlyChanges` нет. Собственная конфигурация хранилища `serialize: "ignore"` или `serialize: { write, read }` работает как в Effector.

`diff(scope, since)` — новая функция: кадр изменений относительно более раннего снимка (snapshot) с записями `changed` и `removed`, который также принимает `apply`.

## Завершение области

`dispose(scope)` — новая функция. Она завершает область: её значения перестают принимать работу, наблюдатели останавливаются, а ожидающий её `allSettled` завершается. Вызов единицы в завершённой области отклоняется с кодом `disposed-scope`.

Ядро Hypergraph также может сохранить область при горячей замене модели: имеющаяся у вас область переходит к новому поколению графа, а совпадающие значения переносятся. Механизм замены реализован, но ещё не подключён: `@fiberfx/hypergraph/hmr` не экспортируется, а `mx dev` не доставляет замену. Поэтому сегодня правка перезагружает страницу ([Горячая замена](/ru/hypergraph/hot-replacement#status)).

## Область через await

По умолчанию Hypergraph ведёт себя как Effector: эффект, вызванный в области, при завершении возвращает вызвавший его код в эту область. Поэтому посторонний вызов во время `await`, например из таймера, может попасть в эту область. `scopeBind` позволяет безопасно захватить область для обратного вызова.

На сервере Node один раз установите переносчик контекста (carrier). Тогда область следует по каждой асинхронной цепочке отдельно, и вызов извне цепочки не попадает в приостановленный поток работы:

```ts
import { setCarrier } from "@fiberfx/hypergraph";
import { nodeCarrier } from "@fiberfx/hypergraph/node";

setCarrier(nodeCarrier());
```

Для браузера переносчика пока нет, поэтому там действует поведение по умолчанию.
