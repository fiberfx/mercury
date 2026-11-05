# Единицы: store, event и effect — Mercury LMS

> Три вида единиц Hypergraph (unit) из `@fiberfx/hypergraph` 4.0.0: `store(init, config?)`, `event<T>(config?)`, `effect(handler)`. Хранилище (store) содержит значение, событие (event) передаёт данные, эффект (effect) запускает обработчик и завершается.

## Когда читать

Если вы объявляете состояние, сигнал или побочный эффект в модели Mercury либо ищете методы и свойства единицы.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- `store<T>(init: T, config?)` → `StoreWritable<T>`. Настройки: `name`, `sid` (идентификатор, заданный вручную), `skipVoid`, `updateFilter(next, prev)`, `serialize: 'ignore' | {write, read}`, `schema: {id, version}` (описание структуры (shape) принимает вид `<id>@<version>`).
- `StoreWritable`: `.on(clock | clock[], (state, payload) => next)`, `.reset(...clocks)`; оба возвращают хранилище.
- Каждый `Store`: `.getState()` (область состояния (scope) вызывающей стороны, иначе вне какой-либо области), `.map(fn, {skipVoid?})` (производное хранилище), `.updates` (событие), `.watch(fn)` (вызов с текущим состоянием, затем при каждом обновлении).
- Результат редьюсера `undefined` пропускается, если не задано `skipVoid: false` (вектор `store.on-void-skips`).
- `event<T = void>({name?})` → вызываемое событие. `.map`, `.filter(fn | {fn})`, `.filterMap` (отбрасывает результат `undefined`) создают производные события; `.prepend(fn)` создаёт вызываемое событие; `.watch(fn)`.
- `effect<P, D, F = Error>(handler)` → `(params) => Promise<D>`. Свойства: `done {params, result}`, `doneData`, `fail {params, error}`, `failData`, `finally {status, params, result | error}`, `pending: Store<boolean>`, `inFlight: Store<number>`. Без обработчика вызов завершается ошибкой, пока `fork({handlers})` не предоставит обработчик.
- Декларативные эффекты (`{request}`, `{channel, payload?}`, `{timer}`) требуют `fork({performers})`; исполнители появятся в H4.
- Производную единицу нельзя вызвать или указать как цель.

## Минимальный пример

```ts
import { effect, event, store } from "@fiberfx/hypergraph";

const increment = event<number>();
export const $count = store(0, { name: "$count" }).on(increment, (n, by) => n + by);

export const loadUser = effect(async (id: number) => ({ id, name: "Ada" }));
export const $name = store("").on(loadUser.doneData, (_, user) => user.name);
```

## Никогда не генерируйте

`createStore`, `createEvent`, `createEffect`, `store.setState`, `store.off`, `effect.use` и любые импорты из `effector` или `effector-react`.

## Дальше

- Связывание единиц: /ru/hypergraph/wiring (/ru/hypergraph/wiring/llms.txt)
- Эта версия страницы для агентов: /ru/hypergraph/units/llms.txt (страница в Markdown, `/hypergraph/units.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hypergraph/units)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
