# Переход с Effector — Mercury LMS

> Где находится каждое понятие Effector в Hypergraph (`@fiberfx/hypergraph` 4.0.0), ядре управления состоянием Mercury. Правило: имя меняется только при изменении контракта или вида в промежуточном представлении. Конструкторы единиц переименованы, композиция сохранена, область работает с кадрами состояния, а домены, `guard`, `forward`, `createApi`, `is` и `withFactory` удалены.

## Когда читать

Если вы переносите код или знания об Effector в модель Mercury либо пользователь спрашивает: «Чему соответствует X из Effector в Mercury?» Это единственная страница сайта с именами Effector; никогда не генерируйте их как код.

## Соответствия (Effector → Hypergraph)

| Effector | Hypergraph |
|---|---|
| `createStore(init, cfg)` | `store(init, cfg)`; в конфигурацию добавлен `schema` |
| `createEvent()` | `event({name?})` |
| `createEffect(fn)` | `effect(fn)` или `effect(spec)` |
| `sample` `combine` `split` `attach` `merge` `restore` | те же имена |
| `.on` `.reset` `.map` `.getState` `.updates` `.watch` (хранилище) | без изменений |
| `.map` `.filter` `.filterMap` `.prepend` `.watch` (событие) | без изменений |
| `.done` `.doneData` `.fail` `.failData` `.finally` `.pending` `.inFlight` | без изменений |
| `fork({values, handlers})` | `fork({values, handlers, performers})`; `values` может быть снимком (snapshot) |
| `allSettled` | без изменений: единица Hypergraph (unit) + `{scope, params}` либо только изолированная область состояния (scope) |
| `scopeBind(unit, cfg)` | `scopeBind(fn, cfg)` |
| `serialize(scope)` | `snapshot(scope)` → `{format: "mhg-scope/1", gen, values: {[sid]: {shape, value}}}` |
| `hydrate(scope, {values})` | `apply(scope, frame)` → несовпадения |
| — | `diff(scope, since)`, `dispose(scope)` |
| `createWatch({unit, fn, scope})` | `watch(unit, fn, {scope})` |
| `is.store(x)` и др. | `kindOf(x) === "store"` |
| `guard` | `sample({clock, source, filter, target})` |
| `forward({from, to})` | `sample({clock: from, target: to})` |
| `createApi` | по одному `event` + `.on` на ключ |
| `inspect`, `inspectGraph` | `inspect({scope?, kinds?, fn})` из `@fiberfx/hypergraph/inspect` |
| `useUnit`, `Provider` | ещё не экспортируются; запланированы на `/hyperscript` |

## Без аналога

`createDomain` и хуки домена, `fork(domain)`, `hydrate(domain)`, `withFactory`, `withRegion`, `createNode`, `launch`, `step`, `clearNode`, `fromObservable`, `setStoreName`, `store.setState`, `store.off`, `store.reinit`, `effect.use`, `useStoreMap`, `useList`, `useGate`, `createGate`, `createComponent`, `connect`. Перепишите код; не выдумывайте слой совместимости.

## Минимальный пример

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

const increment = event<number>();
const saved = event<number>();
export const $count = store(0, { name: "$count" }).on(increment, (n, by) => n + by);
sample({ clock: increment, source: $count, target: saved });
```

## Никогда не генерируйте

Любые импорты из `effector`, `effector-react` или `@fiberfx/effector`; `createStore`, `createEvent`, `createEffect`, `createDomain`, `guard`, `forward`, `createApi`, `withFactory`, `is`, `serialize`, `hydrate`, `createWatch`.

## Дальше

- /ru/hypergraph/coming-from-effector/units-and-wiring/llms.txt
- /ru/hypergraph/coming-from-effector/scopes-and-testing/llms.txt
- /ru/hypergraph/coming-from-effector/frameworks/llms.txt
- /ru/hypergraph/llms.txt

## Навигация

- [Страница в браузере](/ru/hypergraph/coming-from-effector)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
