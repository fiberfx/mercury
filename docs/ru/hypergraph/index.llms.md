# Hypergraph, ядро управления состоянием — Mercury LMS

> `@fiberfx/hypergraph` 4.0.0 — ядро управления состоянием Mercury. Планировщик и исполнитель графа единиц Hypergraph (unit) в модели — хранилищ (store), событий (event), эффектов (effect) — и их связей, с изолированными областями состояния (scope), эффектами и единым интерфейсом наблюдения. Без зависимостей и React.

## Когда читать

Если вы создаёте или меняете состояние приложения Mercury: хранилище, событие, эффект, их связи либо область состояния для теста или серверного рендеринга. Это вводная страница курса; описание API по именам последует в справочнике.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- Единицы: `store(init, config?)`, `event()`, `effect(handler)`.
- Связи: `sample({clock, source, filter, fn, target})`, `combine`, `split`, `attach`, `merge`, `restore`, а также `on`, `reset`, `map`, `filter`, `filterMap`, `prepend`.
- Области состояния: `fork`, `allSettled`, `scopeBind`, `snapshot`, `apply`, `diff`, `dispose`.
- `watch(unit, fn, {scope})`, `kindOf(x)`, `setCarrier`, `HypergraphError`.
- Пути экспорта: `@fiberfx/hypergraph`, `@fiberfx/hypergraph/node` (`nodeCarrier`), `@fiberfx/hypergraph/inspect` (`inspect`, `describe`). `/hyperscript` и `/hmr` запланированы и не экспортируются.

## Минимальный пример

```ts
import { event, store } from "@fiberfx/hypergraph";

const increment = event<number>();
export const $count = store(0, { name: "$count" }).on(increment, (count, by) => count + by);
```

## Никогда не генерируйте

`createStore`, `createEvent`, `createEffect`, `createDomain`, `guard`, `forward`, `createApi`, `withFactory`, `is` и любые импорты из `effector` или `effector-react`. Это не имена Mercury.

## Ошибки

Отказ представлен `HypergraphError` с полем `code`: `pure-call`, `derived-call`, `derived-target`, `disposed-scope`, `reset-reason`.

## Дальше

- Главы по порядку: /ru/hypergraph/units/llms.txt, /ru/hypergraph/wiring/llms.txt, /ru/hypergraph/scopes/llms.txt, /ru/hypergraph/observing/llms.txt, /ru/hypergraph/errors/llms.txt, /ru/hypergraph/hot-replacement/llms.txt, /ru/hypergraph/server-rendering/llms.txt, /ru/hypergraph/testing/llms.txt, /ru/hypergraph/models/llms.txt, /ru/hypergraph/capstone/llms.txt
- Переход с Effector, по порядку: /ru/hypergraph/coming-from-effector/llms.txt, /ru/hypergraph/coming-from-effector/units-and-wiring/llms.txt, /ru/hypergraph/coming-from-effector/scopes-and-testing/llms.txt, /ru/hypergraph/coming-from-effector/frameworks/llms.txt
- Сайт: /llms.txt
- Эта версия страницы для агентов: /ru/hypergraph/llms.txt (страница в Markdown, `/hypergraph.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hypergraph)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)

### Текстовые версии глав

- [/ru/hypergraph/capstone](/ru/hypergraph/capstone/llms.txt)
- [/ru/hypergraph/coming-from-effector](/ru/hypergraph/coming-from-effector/llms.txt)
- [/ru/hypergraph/coming-from-effector/frameworks](/ru/hypergraph/coming-from-effector/frameworks/llms.txt)
- [/ru/hypergraph/coming-from-effector/scopes-and-testing](/ru/hypergraph/coming-from-effector/scopes-and-testing/llms.txt)
- [/ru/hypergraph/coming-from-effector/units-and-wiring](/ru/hypergraph/coming-from-effector/units-and-wiring/llms.txt)
- [/ru/hypergraph/errors](/ru/hypergraph/errors/llms.txt)
- [/ru/hypergraph/hot-replacement](/ru/hypergraph/hot-replacement/llms.txt)
- [/ru/hypergraph/models](/ru/hypergraph/models/llms.txt)
- [/ru/hypergraph/observing](/ru/hypergraph/observing/llms.txt)
- [/ru/hypergraph/scopes](/ru/hypergraph/scopes/llms.txt)
- [/ru/hypergraph/server-rendering](/ru/hypergraph/server-rendering/llms.txt)
- [/ru/hypergraph/testing](/ru/hypergraph/testing/llms.txt)
- [/ru/hypergraph/units](/ru/hypergraph/units/llms.txt)
- [/ru/hypergraph/wiring](/ru/hypergraph/wiring/llms.txt)
