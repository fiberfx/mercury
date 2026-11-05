Всё на этой странице импортируется из `@fiberfx/hypergraph`. Знания о единицах (unit) Effector и их связях остаются применимы. Отличаются имена конструкторов, несколько удалённых методов и вторая форма эффекта.

## Хранилища

`createStore(init, config)` становится `store(init, config)`. Конфигурация принимает знакомые ключи `name`, `sid`, `serialize`, `updateFilter` и `skipVoid`, а также новый ключ `schema`, который задаёт имя структуры хранилища (store) для кадров состояния (frame).

```ts
import { event, store } from "@fiberfx/hypergraph";

export const added = event<string>();
export const cleared = event();

export const $todos = store<string[]>([], { name: "$todos" })
  .on(added, (todos, text) => [...todos, text])
  .reset(cleared);

export const $count = $todos.map((todos) => todos.length);
```

Что сохраняется, а что нет:

- **Без изменений:** `.on`, `.reset`, `.map`, `.getState`, `.updates` и `.watch`. `.getState()` читает изолированную область состояния (scope) вызывающей стороны: наблюдателя, обработчика или привязанного вызова; иначе — состояние вне всех областей.
- **Удалены из API:** `.setState`, `.off` и `.reinit`. Записывайте хранилище через событие и `.on`; сбрасывайте через `.reset(event)`.
- **По замыслу `sid` должен назначать компилятор, но пока это не так.** Сегодня проход компилятора, назначающий sid, обрабатывает только вызовы прежнего фасада. Поэтому единица Hypergraph имеет sid, только если вы задали его явно; без него она получает идентификатор времени выполнения `api:<n>`. Задавайте `sid` хранилищу, которое нужно повторно найти после правки или при серверном рендеринге.
- **Два способа наблюдения.** `$store.watch(fn)` вызывается с текущим состоянием, затем при каждом обновлении. Функция `watch($store, fn)`, преемник `createWatch`, вызывается только при обновлениях.

## События

`createEvent()` становится `event()` с необязательным `{name}`. Событие (event) вызывается как функция; `.map`, `.filter`, `.filterMap`, `.prepend` и `.watch` не изменились. `.filter` принимает функцию напрямую либо `{fn}`, как в Effector.

Производное событие, созданное через `.map` или `.filter`, вызвать нельзя: Hypergraph отклоняет вызов с кодом `derived-call`, а производную единицу как цель `sample` — с `derived-target`.

## Эффекты

`createEffect(handler)` становится `effect(handler)`. Члены эффекта (effect) прежние: `done`, `doneData`, `fail`, `failData`, `finally`, `pending` и `inFlight`.

```ts
import { effect, store } from "@fiberfx/hypergraph";

type User = { id: number; name: string };

export const fetchUserFx = effect<number, User>(async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

export const $user = store<User | null>(null).on(fetchUserFx.doneData, (_, user) => user);
export const $loading = fetchUserFx.pending;
```

Есть два различия:

- **`effect.use` удалён.** Чтобы заменить обработчик, например в тесте, передайте его в `fork({handlers})`; см. [Области и тестирование](/ru/hypergraph/coming-from-effector/scopes-and-testing). Эффект, созданный без обработчика, завершается ошибкой при вызове, пока обработчик области его не заменит.
- **Эффект можно объявить вместо написания обработчика.** `effect({request})`, `effect({channel})` или `effect({timer})` описывает работу данными, а исполнитель области выполняет её. Обработчик-функция помечается как доступный только в JavaScript; объявленный эффект, чьи слоты — переносимые выражения, может выполняться в любой среде, управляющей областью. Исполнители ещё не реализованы, поэтому сегодня объявленный эффект завершается ошибкой, если область не создана с `performers`: сообщение указывает, что область "has no request performer for a declared effect".

## sample

`sample` — тот же примитив с той же конфигурацией: `clock`, `source`, `filter`, `fn`, `target` и `batch`. При наличии `target` возвращается цель, без неё — новая единица.

```ts
import { effect, event, sample, store } from "@fiberfx/hypergraph";

export const fetchUserFx = effect<number, string>(async (id) => `user ${id}`);
export const $enabled = store(true);
export const opened = event<number>();

sample({ clock: opened, filter: $enabled, target: fetchUserFx });
```

## combine, split, attach, merge и restore

Все пять сохраняют имена. Функция restore поддерживает только форму с одной единицей; формы с объектом и массивом не поддерживаются.

```ts
import { attach, combine, effect, event, split, store } from "@fiberfx/hypergraph";

// combine: an object or a list of stores, or one argument per store, then a function.
const $first = store("Ada");
const $last = store("Lovelace");
export const $fullName = combine({ first: $first, last: $last }, ({ first, last }) => `${first} ${last}`);

// split without cases: one event per case, and __ for the rest.
const received = event<{ type: string; text: string }>();
export const { text, image, __ } = split(received, {
  text: (message) => message.type === "text",
  image: (message) => message.type === "image",
});

// attach: an effect with a source and mapParams.
const $token = store("");
const loadFx = effect<{ id: number; token: string }, string>(async ({ id, token }) => `${id}:${token}`);
export const loadWithTokenFx = attach({
  effect: loadFx,
  source: $token,
  mapParams: (id: number, token: string) => ({ id, token }),
});
```

`split({source, clock, match, cases})` направляет данные в заданные ветви, как в Effector. `merge([a, b])` объединяет обновления нескольких единиц в одно событие, а `restore(event, init)` создаёт хранилище с последними данными события или последним результатом эффекта.

Методы единиц также экспортируются как функции под теми же именами: `on($store, clock, fn)`, `reset($store, clock)`, `map`, `filter`, `filterMap` и `prepend`.

## Замены guard, forward и createApi

Эти три функции были устаревшими или избыточными в Effector, и в Hypergraph их нет. Каждая выражается строкой с сохранёнными именами:

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

const submitted = event<string>();
const saved = event<string>();
const $valid = store(true);

// guard({clock: submitted, filter: $valid, target: saved})
sample({ clock: submitted, filter: $valid, target: saved });

// forward({from: submitted, to: saved})
sample({ clock: submitted, target: saved });

// createApi($volume, {up, down}): one event and one .on per key
export const $volume = store(5);
export const up = event();
export const down = event();
$volume.on(up, (volume) => volume + 1).on(down, (volume) => volume - 1);
```

## Отказы

Hypergraph обозначает каждый отказ через `HypergraphError` и переносимый `code`. Поэтому тест может проверять код, а не формулировку, и другая среда выполнения может описать тот же код своими словами:

| Код | Когда |
|---|---|
| `pure-call` | чистая функция вызывает единицу; вместо этого выразите вызов связью через `sample` |
| `derived-call` | вызвана производная единица; вызывайте единицу, от которой она получена |
| `derived-target` | производная единица указана как цель `sample`; укажите хранилище или событие |
| `disposed-scope` | вызов единицы или ожидание `allSettled` в завершённой области |
| `reset-reason` | порту HMR передана причина, которая не является причиной сброса |
