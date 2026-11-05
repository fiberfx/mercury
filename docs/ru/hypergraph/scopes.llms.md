# Области состояния: создать, завершить работу, передать — Mercury LMS

> Изолированная область состояния (scope) — отдельная копия состояния модели в `@fiberfx/hypergraph`. `fork` создаёт область, `allSettled` выполняет в ней работу, `scopeBind` привязывает функцию, `snapshot`/`diff`/`apply` передают кадры состояния (frame) по sid с описанием структуры (shape) каждого значения, `dispose` завершает работу области.

## Когда читать

Если вы пишете тест, выполняете серверный рендеринг, передаёте состояние с сервера клиенту или запускаете код из таймера либо обратного вызова внутри области.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- `Scope` = `{id, gen}`; дескриптор переживает горячую замену и перепривязывается к зафиксированному поколению.
- `fork({values?, handlers?, performers?})`. `values`: `[[store, v], …]`, `{sid: v}` или `Snapshot`. `handlers`: `[[effect, fn | effect], …]`, действуют только в этой области.
- `allSettled(unit, {scope, params?})` → завершается, когда выполняющейся работы не остаётся; для эффекта (effect) — `{status: 'done' | 'fail', value}`. `allSettled(scope)` ожидает выполняющуюся работу.
- `scopeBind(fn, {scope?, safe?})`: привязывает к `scope` или к области вызывающей стороны; без области и без `safe` выбрасывает ошибку. Чтение значения: `scopeBind(() => $s.getState(), {scope})()`.
- `snapshot(scope, {ignore?})` → `{format: 'mhg-scope/1', gen, values: {sid: {shape, schema?, value}}}`: изменяемые хранилища (store) с sid, которым область задала значения или которые изменила; `serialize: 'ignore'` исключается.
- `diff(scope, since)` → `{format, gen, from, changed, removed}`.
- `apply(scope, snapshot | diff)` → `Miss[]` `{unit: sid, reason: {kind: 'removed'} | {kind: 'shape', from, to}}`; запись принимается только при совпадении sid и структуры. Неприменённые записи также поступают в `inspect` как `reset`.
- Пока компилятор не выдаёт структуру: `runtime:<structure>` (например, `runtime:number`); при заданной `schema` — `<id>@<version>`.
- `dispose(scope)`: останавливает работу и наблюдателей области, завершает ожидающий `allSettled`; последующий `allSettled` или вызов эффекта в ней отклоняет промис с `HypergraphError` и кодом `disposed-scope`.
- Хранилищу нужен `sid`, чтобы передаваться в кадре.

## Минимальный пример

```ts
import { allSettled, event, fork, scopeBind, snapshot, store } from "@fiberfx/hypergraph";

const increment = event();
const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);

export async function run() {
  const scope = fork({ values: [[$count, 3]] });
  await allSettled(increment, { scope });
  return { now: scopeBind(() => $count.getState(), { scope })(), frame: snapshot(scope) };
}
```

## Никогда не генерируйте

`serialize`, `hydrate`, `fork(domain)`, `createDomain` и любые импорты из `effector`. Используйте `snapshot` и `apply`.

## Дальше

- Наблюдение и инспекция: /ru/hypergraph/observing (/ru/hypergraph/observing/llms.txt)
- Эта версия страницы для агентов: /ru/hypergraph/scopes/llms.txt (страница в Markdown, `/hypergraph/scopes.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hypergraph/scopes)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
