# Связи: из единиц в граф — Mercury LMS

> Как `@fiberfx/hypergraph` связывает единицы Hypergraph (unit): `sample` (единый примитив композиции), `combine` (хранилища (store) через барьер), `split`, `attach`, `merge`, `restore`, а также `on`, `reset`, `map`, `filter`, `filterMap`, `prepend` в виде функций. Один запуск выполняется до состояния покоя, без промежуточных несогласованных значений.

## Когда читать

Если вы связываете единицы: вычисляете производное значение, направляете данные по ветвям, пропускаете обновление по условию из хранилища или вызываете эффект (effect) с параметрами из состояния.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- `sample({clock?, source?, filter?, fn?, target?, batch?})` — выборка по сигналу (sample). `filter`: `Store<boolean>` или `(source, clock) => boolean`; `fn: (source, clock) => out`. При наличии `target` возвращает цель, иначе — новую производную единицу. Поле `source`, не являющееся единицей, считается константой.
- Производная единица в качестве `target` вызывает `HypergraphError` с кодом `derived-target`.
- `combine([..] | {..}, fn?, {skipVoid?}?)` или `combine(a, b, …, fn?)` → производный `Store`. Один запуск обновляет его один раз (вектор `kernel.diamond-one-update-per-launch`).
- `split({source, clock?, match, cases})` → `void`; `match` — это `Store<string>`, `(v) => caseName` или `{case: predicate | Store<boolean>}`. `split(source, {case: predicate})` → `{case: Event, …, __: Event}` (`__` — ни одна ветвь не подошла).
- `attach({effect, source?, mapParams?: (params, source) => q})` → новый `Effect`; `effect` может быть `(source, params) => result`.
- `merge(units[])` → `Event`. `restore(unit, init)` → `StoreWritable` последних данных; поддерживается только форма с одной единицей.
- `on(store, clock, fn)`, `reset(store, ...clocks)`, `map(unit, fn)`, `filter(event, fn)`, `filterMap(event, fn)`, `prepend(event, fn)` соответствуют методам единиц.
- Единицы двух поколений нельзя связывать друг с другом.

## Минимальный пример

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

## Никогда не генерируйте

`guard`, `forward`, `createApi`, `restore({...})` или `restore([...])`, `withFactory` и любые импорты из `effector`. Используйте `sample` и `.on`.

## Дальше

- Области состояния: /ru/hypergraph/scopes (/ru/hypergraph/scopes/llms.txt)
- Эта версия страницы для агентов: /ru/hypergraph/wiring/llms.txt (страница в Markdown, `/hypergraph/wiring.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hypergraph/wiring)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
