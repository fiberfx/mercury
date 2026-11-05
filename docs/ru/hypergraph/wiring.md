Связи модели — это данные: каждый приведённый ниже вызов преобразуется в одно ребро графа, который выполняет ядро. Всё здесь импортируется из `@fiberfx/hypergraph`.

## Граф выполняется до состояния покоя

Вызов события (event) начинает **запуск (launch)**. Ядро выполняет все достижимые в этом запуске единицы по фазам из одной очереди, пока работы не останется. Барьеры ожидают в куче, упорядоченной по фазам; при равенстве порядок никогда не меняется. В пределах одного запуска единица, получающая данные по двум путям, обновляется один раз, после обоих, и никогда не видит обновлённой лишь одну половину. Именно это здесь означает *отсутствие промежуточных несогласованных значений (glitch-free)*; поведение закреплено вектором.

`kernel.diamond-one-update-per-launch` задаёт ромб: `A` передаёт данные в `C` через `B`, а в `D` — напрямую; `E` объединяет `C` и `D`.

```ts
import { combine, event, store } from "@fiberfx/hypergraph";

const trigger = event();
const $a = store(1).on(trigger, (a) => a + 1);
const $b = $a.map((a) => a + 1);
const $c = $b.map((b) => b + 1);
const $d = $a.map((a) => a + 1);
export const $e = combine($c, $d, (c, d) => [c, d]);
```

Наблюдатель `$e` видит `[3, 2]` (текущее состояние), а после одного `trigger()` — ровно одно обновление: `[4, 3]`. Промежуточного `[4, 2]` нет.

## sample

`sample({clock, source, filter, fn, target})` — единый примитив композиции, выполняющий выборку по сигналу (sample). При обновлении `clock` он читает `source`, сохраняет обновление только с разрешения `filter`, преобразует его через `fn` и передаёт результат в `target`.

- `clock`: единица или список единиц.
- `source`: единица, список или объект единиц. Поле, не являющееся единицей, считается константой.
- `filter`: `Store<boolean>` или функция от `(source, clock)`.
- `fn`: функция от `(source, clock)`.
- `target`: единица или список. Если задан `target`, `sample` возвращает его; иначе возвращает новую производную единицу, передающую результат.

Производная единица не может быть `target`: ядро отклоняет её с кодом `derived-target`.

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

const submit = event();
const $text = store("");
export const $sent = store<string[]>([]);

sample({
  clock: submit,
  source: { text: $text, sent: $sent },
  filter: ({ text }) => text.length > 0,
  fn: ({ text, sent }) => [...sent, text],
  target: $sent,
});
```

## combine

`combine` создаёт производное хранилище из нескольких хранилищ. Он принимает список или объект хранилищ, затем необязательные функцию и настройки; либо хранилища отдельными аргументами, а затем функцию. Поле, не являющееся хранилищем, считается константой. Настройки принимают `skipVoid`.

Обновления одного запуска поступают в объединённое хранилище вместе, через барьер: это показано ромбом выше.

```ts
import { combine, store } from "@fiberfx/hypergraph";

const $first = store("Ada");
const $last = store("Lovelace");

export const $full = combine($first, $last, (first, last) => `${first} ${last}`);
export const $both = combine({ first: $first, last: $last });
```

## split

`split` направляет каждое обновление источника в одну из ветвей.

- `split({source, clock?, match, cases})` передаёт обновление единицам из `cases`. `match` — это `Store<string>`, функция, возвращающая имя ветви, или объект предикатов (функций либо `Store<boolean>`). Ничего не возвращает.
- `split(source, match)` с объектом предикатов возвращает по новому событию на каждую ветвь, а также `__` для значения, которому не соответствует ни одна ветвь.

```ts
import { event, split } from "@fiberfx/hypergraph";

const listed = event<string[]>();
export const { empty, one, __: many } = split(listed, {
  empty: (list: string[]) => list.length === 0,
  one: (list: string[]) => list.length === 1,
});
```

Это вектор `split.shape-default-case`: `[]` направляется в `empty`, а `["foo", "bar"]` — в `__`.

## attach

`attach({effect, source, mapParams})` создаёт новый эффект (effect), который вызывает другой эффект с параметрами, сформированными из источника. Их строит `mapParams(params, source)`. `effect` также может быть функцией от `(source, params)`.

```ts
import { attach, effect, store } from "@fiberfx/hypergraph";

const $token = store("secret");
const request = effect(async ({ url, token }: { url: string; token: string }) =>
  fetch(url, { headers: { authorization: token } }),
);

export const authorized = attach({
  effect: request,
  source: $token,
  mapParams: (url: string, token: string) => ({ url, token }),
});
```

## merge и restore

`merge(units)` создаёт одно событие для обновлений нескольких единиц: оно передаёт данные любой из них. `restore(from, init)` создаёт изменяемое хранилище последних данных единицы, начиная с `init`. `restore` принимает одну единицу; формы с объектом или списком у него нет.

```ts
import { event, merge, restore } from "@fiberfx/hypergraph";

const saved = event<string>();
const loaded = event<string>();

export const changed = merge([saved, loaded]);
export const $last = restore(changed, "");
```

## Операторы единиц в виде функций

`on`, `reset`, `map`, `filter`, `filterMap` и `prepend` также экспортируются как функции от единицы — для кода, который задаёт связи снаружи: `on(store, clock, fn)` соответствует `store.on(clock, fn)`, `map(unit, fn)` — `unit.map(fn)`, и так далее.

```ts
import { event, map, on, store } from "@fiberfx/hypergraph";

const add = event<number>();
export const $total = store(0);
on($total, add, (total, n) => total + n);
export const $label = map($total, (total) => `${total} items`);
```

## Связи только внутри одного поколения

Каждая единица принадлежит поколению кода, который её создал. Связывать единицы двух поколений запрещено (`units of two generations cannot be wired together`): при горячей замене код нового поколения связывает только свои единицы.
