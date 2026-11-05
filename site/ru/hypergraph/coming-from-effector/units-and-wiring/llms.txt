# Единицы и связи при переходе с Effector — Mercury LMS

> Единицы (unit) и композиция Effector в Hypergraph (`@fiberfx/hypergraph`): `store`/`event`/`effect` заменяют конструкторы `create*`; `sample`, `combine`, `split`, `attach`, `merge`, `restore` и методы единиц сохраняют имена, но restore поддерживает только форму с одной единицей; `guard`, `forward` и `createApi` переписываются через `sample` и `.on`.

## Когда читать

Если вы переносите единицы или связи модели Effector либо пишете модель, опираясь на привычки из Effector.

## Единицы

| Effector | Hypergraph |
|---|---|
| `createStore(init, {name, sid, serialize, updateFilter, skipVoid})` | `store(init, {…same, schema?})` |
| `$s.on` `.reset` `.map` `.getState` `.updates` `.watch` | без изменений |
| `$s.setState` `.off` `.reinit` | отсутствуют в API: используйте событие + `.on` / `.reset` |
| `createEvent<T>()` | `event<T>({name?})` |
| `ev.filter({fn})` | `ev.filter(fn)` или `ev.filter({fn})` |
| `createEffect(handler)` | `effect<P, D>(handler)` |
| `fx.use(handler)` | отсутствует в API: `fork({handlers: [[fx, handler]]})` |
| — | `effect({request} \| {channel} \| {timer})`: объявленный эффект; до H4 нужен `fork({performers})` |

Примечания: `$s.watch(fn)` вызывается сразу и при обновлениях; `watch($s, fn)` — только при обновлениях. `getState()` читает изолированную область состояния (scope) вызывающей стороны. По замыслу `sid` должен назначать компилятор, но сегодня его проход назначения sid охватывает только прежний фасад: задавайте `sid` хранилищу, которое должно передаваться или сохраняться при правке. Если sid не задан, единица получает идентификатор времени выполнения `api:<n>`.

## Связи

`sample({clock, source, filter, fn, target, batch})` — возвращает `target`, а при его отсутствии — новую единицу.
`combine(shape, fn?)` или `combine($a, $b, fn?)` — поля, которые не являются хранилищами, считаются константами.
`split({source, clock?, match, cases})` либо `split(source, match)` → `{[case]: Event, __: Event}`.
`attach({effect, source?, mapParams?})` — `effect` может быть `(source, params) => …`.
`merge([units])`, `restore(unit, init)`. Также доступны как функции: `on`, `reset`, `map`, `filter`, `filterMap`, `prepend`.

## Замены

| Effector | Hypergraph |
|---|---|
| `guard({clock, filter, target})` | `sample({clock, filter, target})` |
| `forward({from, to})` | `sample({clock: from, target: to})` |
| `createApi($s, {a: fnA, b: fnB})` | `const a = event(); $s.on(a, fnA)` для каждого ключа |

## Минимальный пример

```ts
import { effect, event, sample, store } from "@fiberfx/hypergraph";

const fetchUserFx = effect<number, string>(async (id) => `user ${id}`);
const opened = event<number>();
const $enabled = store(true);
export const $user = store<string | null>(null).on(fetchUserFx.doneData, (_, u) => u);
sample({ clock: opened, filter: $enabled, target: fetchUserFx });
```

## Ошибки

`HypergraphError.code`: `pure-call` (чистая функция вызвала единицу), `derived-call`, `derived-target`, `disposed-scope`, `reset-reason`.

## Никогда не генерируйте

`createStore`, `createEvent`, `createEffect`, `guard`, `forward`, `createApi`, `.setState`, `.use`, `.off`, `.reinit` и любые импорты из `effector`.

## Навигация

- [Страница в браузере](/ru/hypergraph/coming-from-effector/units-and-wiring)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
