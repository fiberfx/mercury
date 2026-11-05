# Наблюдение: watch, inspect, describe — Mercury LMS

> Как код и инструменты наблюдают модель `@fiberfx/hypergraph`. `watch(unit, fn, {scope})` следит за обновлениями единицы Hypergraph (unit) и принадлежит её поколению; `inspect` и `describe` из `@fiberfx/hypergraph/inspect` образуют единый интерфейс наблюдения.

## Когда читать

Если вы реагируете на обновления вне графа, пишете тест, проверяющий произошедшее, или создаёте журнал, панель поверх страницы либо представление модели в DevTools.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- `watch(unit, fn, {scope?})` → `Subscription` (вызываемая функция; `.unsubscribe()` делает то же самое). Только обновления: текущее состояние хранилища (store) НЕ передаётся сразу. При заданном `scope` видны только обновления этой изолированной области состояния (scope); без него — работа вне всех областей. Наблюдение прекращается при остановке работы области или завершении её поколения — что произойдёт раньше.
- `$store.watch(fn)` отличается: вызывается с текущим состоянием, затем при каждом обновлении.
- `inspect({scope?, kinds?, fn})` из `@fiberfx/hypergraph/inspect` → `Subscription`. В области — только эта область; вне области — никакой работы внутри областей. Последняя отписка прекращает запись.
- `Observation`: `{type, unit, scope, gen, value, cause}`, где `unit` — sid или идентификатор времени выполнения; дополнительные поля: `fresh?` (declare), `owner?`, `reason?` (reset), `at?` (perform, settle).
- `Kind`: `update`, `skip` (фильтр, равное значение или undefined при обновлении, отказ updateFilter), `fail` (ошибка пользовательской функции), `declare` (значение: `Declaration {unit, kind, sid?, name?, derived?, owner?, gen}`; только инспекторы вне областей), `perform`, `settle`, `reset`.
- Объявление с пометкой `fresh` означает новое хранилище: информация, а не сброс.
- `describe(reason)` → `removed` | `shape changed from <from> to <to>` | `renamed (a hint, not applied: it may now be <to>)` | `positional` | `new`.
- Типы из `/inspect`: `Observation`, `Declaration`, `Kind`, `ResetReason`.

## Минимальный пример

```ts
import { allSettled, event, fork, store, watch } from "@fiberfx/hypergraph";
import { inspect } from "@fiberfx/hypergraph/inspect";

const increment = event();
const $count = store(0, { sid: "count" }).on(increment, (n) => n + 1);

export async function run() {
  const scope = fork();
  const stop = watch($count, (n) => console.log("count", n), { scope });
  const sub = inspect({ scope, kinds: ["update", "skip"], fn: (o) => console.log(o.type, o.unit) });
  await allSettled(increment, { scope });
  stop();
  sub.unsubscribe();
}
```

## Никогда не генерируйте

`createWatch`, `inspectGraph`, `inspectObserverFailures`, тип `Message` и любые импорты из `effector` или `effector/inspect`.

## Дальше

- Виды и ошибки: /ru/hypergraph/errors (/ru/hypergraph/errors/llms.txt)
- Эта версия страницы для агентов: /ru/hypergraph/observing/llms.txt (страница в Markdown, `/hypergraph/observing.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hypergraph/observing)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
