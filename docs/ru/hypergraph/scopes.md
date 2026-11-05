Область — изолированная копия состояния модели. Единицы Hypergraph (unit) объявляются один раз; каждая область хранит собственные значения для них. Сервер создаёт область на каждый запрос, тест — на каждый случай, страница содержит один корень.

## Что такое область состояния

`Scope` — небольшой дескриптор `{id, gen}`, где `gen` — текущее зафиксированное поколение графа. Дескриптор переживает горячую замену: когда фиксируется новое поколение, все действующие области переходят к нему, переносят каждое значение с совпадающими sid и структурой и сообщают о том, что перенести не удалось. Код продолжает пользоваться тем же дескриптором области.

## fork

`fork(config?)` создаёт область зафиксированного поколения. В настройках можно задать:

- `values`: начальные значения как пары `[store, value]`, как запись с ключами sid или как снимок (snapshot) в формате кадра;
- `handlers`: пары `[effect, handler]`, заменяющие обработчики эффектов (effect) только в этой области; обработчиком может быть функция или другой эффект;
- `performers`: исполнители декларативных эффектов в этой области (предварительная версия; см. [единицы](/ru/hypergraph/units)).

```ts
import { effect, fork, store } from "@fiberfx/hypergraph";

const $count = store(0, { sid: "count" });
const loadUser = effect(async (id: number) => ({ id, name: "from the network" }));

export const scope = fork({
  values: [[$count, 3]],
  handlers: [[loadUser, async (id: number) => ({ id, name: "Ada" })]],
});
```

## allSettled

`allSettled(unit, {scope, params})` запускает `unit` в области и завершается, когда там не остаётся выполняющейся работы, включая эффекты, начатые этим запуском. Для эффекта результат — `{status: 'done' | 'fail', value}`. Вызов `allSettled(scope)` без единицы ждёт уже выполняющуюся работу.

```ts
import { allSettled, effect, fork, store } from "@fiberfx/hypergraph";

const loadUser = effect(async (id: number) => ({ id, name: "from the network" }));
export const $name = store("", { sid: "name" }).on(loadUser.doneData, (_, user) => user.name);

export async function testLoad() {
  const scope = fork({ handlers: [[loadUser, async (id: number) => ({ id, name: "Ada" })]] });
  const result = await allSettled(loadUser, { scope, params: 1 });
  return result; // { status: "done", value: { id: 1, name: "Ada" } }
}
```

## scopeBind и чтение значения

`scopeBind(fn, {scope?, safe?})` возвращает `fn`, привязанную к области, поэтому даже вызов извне, например из таймера, выполняется в ней. Без `scope` функция привязывается к области вызывающей стороны — наблюдателя или обработчика. Если такой области нет, выбрасывается ошибка, если только не задано `safe: true`. Привязка определяется при каждом вызове, поэтому функция, привязанная до горячей замены, после неё работает в области, на которую указывает дескриптор.

Метод хранилища (store) `.getState()` читает область вызывающей стороны, поэтому привязанный вызов позволяет коду вне графа прочитать значение в области:

```ts
import { allSettled, event, fork, scopeBind, store } from "@fiberfx/hypergraph";

const increment = event();
const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);

export async function twice() {
  const scope = fork();
  await allSettled(increment, { scope });
  await allSettled(increment, { scope });
  return scopeBind(() => $count.getState(), { scope })(); // 2
}
```

## snapshot, diff и apply

**Кадр** представляет значения области данными: `{format: 'mhg-scope/1', gen, values}`, где `values` сопоставляет sid с записью `{shape, schema?, value}`. Ключами служат sid, поэтому кадр из одной сборки можно применить в другой.

- `snapshot(scope, {ignore?})` возвращает кадр области: каждое изменяемое хранилище с sid, которому область задала значение или которое изменила, его значение, записанное через `serialize` хранилища, и его структуру. Хранилище с `serialize: 'ignore'` или перечисленное в `ignore` не включается.
- `diff(scope, since)` возвращает кадр изменений относительно прежнего снимка: `{format, gen, from, changed, removed}`.
- `apply(scope, frame)` приводит область к снимку или применяет изменения. Запись принимается только при совпадении sid хранилища и структуры. Каждая неприменённая запись возвращается как `Miss`, `{unit, reason}`, с причиной `{kind: 'removed'}` (ни одно хранилище не использует sid) или `{kind: 'shape', from, to}`. Каждая такая запись также сообщается в `inspect` как `reset`.

Пока компилятор не выдаёт структуры, структура хранилища определяется по его значению в виде `runtime:<structure>`: `runtime:number`, `runtime:string`, `runtime:object{a:number}`. Объявленная `schema` вместо этого задаёт `<id>@<version>`.

```ts
import { apply, diff, fork, snapshot, store } from "@fiberfx/hypergraph";

const $count = store(0, { sid: "count" });

export function handOver() {
  const server = fork({ values: [[$count, 3]] });
  const frame = snapshot(server); // values: { count: { shape: "runtime:number", value: 3 } }
  const client = fork();
  const misses = apply(client, frame); // []
  const since = snapshot(client);
  return { misses, changes: diff(client, since) };
}
```

## dispose

`dispose(scope)` завершает работу области. Она больше не принимает работу, привязанные к ней наблюдатели останавливаются, а ожидающий её `allSettled` завершается. После этого `allSettled` для области и вызванный в ней эффект отклоняют промис с ошибкой `HypergraphError` и кодом `disposed-scope`.

```ts
import { dispose, fork } from "@fiberfx/hypergraph";

const scope = fork();
dispose(scope);
```

## Что фиксируют тестовые векторы

- `fork.scope-isolated-from-global`: `allSettled` дожидается асинхронного эффекта, начатого запуском в области; эффект обновляет только эту область, а вне её хранилище остаётся прежним.
- `fork.serialize-skips-unchanged`: кадр содержит только изменённое областью; до первого обновления он пуст.
- `fork.serialize-sidless-omitted`: хранилище с пустым sid принимает значения в области, но не включается в кадр.
