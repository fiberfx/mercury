Hypergraph — ядро управления состоянием Mercury, пакет `@fiberfx/hypergraph`. Если вы писали на Effector, модель уже знакома: хранилища (store), события (event) и эффекты (effect), связанные через `sample`, выполняются в изолированных областях состояния (scope). Руководство объясняет, где теперь находится каждое понятие Effector и у каких понятий аналога нет.

## Правило именования

Hypergraph сохраняет имя, если контракт не изменился, и меняет его, если изменился контракт или вид единицы Hypergraph (unit) в промежуточном представлении Mercury. Это правило объясняет все различия:

- **Конструкторы единиц получают имена своих видов.** `createStore`, `createEvent` и `createEffect` становятся `store`, `event` и `effect`. Аргументы знакомы; `effect` также принимает объявленную спецификацию вместо обработчика.
- **Композиция сохраняет имена.** `sample`, `combine`, `split`, `attach`, `merge` и `restore` остаются с прежними именами и задаются теми же векторами соответствия. То же относится к методам единиц `on`, `reset`, `map`, `filter`, `filterMap`, `prepend` и `watch`.
- **Область сохраняет `fork`, `allSettled` и `scopeBind`** и работает с кадрами состояния (frame): `serialize` становится `snapshot`, `hydrate` — `apply`; `diff` и `dispose` добавлены.
- **Несколько имён удалены:** домены, `guard`, `forward`, `createApi`, `is` и `withFactory`. Для каждого есть замена среди сохранённых имён либо её нет вовсе; соответствие указано ниже.

## Та же модель для сравнения

Счётчик на Effector — хранилище, созданное через `createStore`, событие, созданное через `createEvent`, и связь `.on` между ними. В Hypergraph меняются только конструкторы:

```ts
import { event, sample, store } from "@fiberfx/hypergraph";

export const increment = event<number>();
export const reset = event();

export const $count = store(0, { name: "$count" })
  .on(increment, (count, by) => count + by)
  .reset(reset);

export const $isPositive = $count.map((count) => count > 0);

export const saved = event<number>();
sample({ clock: increment, source: $count, target: saved });
```

## Таблица соответствий

Каждая строка проверена по обоим пакетам. «Без изменений» означает, что имя и аргументы сохраняются, если в строке не указано ограничение.

| В Effector | В Hypergraph | Примечание |
|---|---|---|
| `createStore(init, config)` | `store(init, config)` | конфигурация: `name`, `sid`, `serialize`, `updateFilter`, `skipVoid` и новый `schema` |
| `createEvent()` | `event()` | принимает необязательный `{name}` |
| `createEffect(handler)` | `effect(handler)` | либо `effect(spec)`: объявленный запрос, канал или таймер |
| `sample`, `combine`, `split`, `attach`, `merge`, `restore` | имена сохраняются; restore поддерживает только форму с одной единицей, без объекта или массива | также экспортируются функции `on`, `reset`, `map`, `filter`, `filterMap`, `prepend` |
| `store.on`, `.reset`, `.map`, `.getState`, `.updates`, `.watch` | без изменений | |
| `event.map`, `.filter`, `.filterMap`, `.prepend`, `.watch` | без изменений | |
| `effect.done`, `.doneData`, `.fail`, `.failData`, `.finally`, `.pending`, `.inFlight` | без изменений | |
| `fork({values, handlers})` | `fork({values, handlers, performers})` | `values` также принимает кадр `snapshot` |
| `allSettled(unit, {scope, params})`, `allSettled(scope)` | без изменений | |
| `scopeBind(unit, {scope, safe})` | `scopeBind(fn, {scope, safe})` | привязывает функцию |
| `serialize(scope)` | `snapshot(scope)` | возвращает кадр: читайте `.values[sid].value` |
| `hydrate(scope, {values})` | `apply(scope, frame)` | возвращает записи, которые не удалось применить |
| нет аналога | `diff(scope, since)`, `dispose(scope)` | кадр изменений; завершение области |
| `createWatch({unit, fn, scope})` | `watch(unit, fn, {scope})` | одна единица, позиционные аргументы |
| `is.store(x)`, `is.scope(x)`, … | `kindOf(x) === "store"`, … | возвращает `store`, `event`, `effect`, `scope` или `null` |
| `guard` | `sample` с `filter` | |
| `forward({from, to})` | `sample({clock, target})` | |
| `createApi($store, handlers)` | по одному `event` и `.on` на ключ | |
| `inspect` | `inspect` из `@fiberfx/hypergraph/inspect` | обратный вызов получает `Observation` |
| `inspectGraph` | `inspect` с `kinds: ["declare"]` | |
| `useUnit`, `Provider` (effector-react) | пока не экспортируются | см. [Фреймворки](/ru/hypergraph/coming-from-effector/frameworks) |

## Что не имеет аналога

У этих имён Effector нет соответствия в Hypergraph. Использующий их код нужно переписать, а не просто переименовать:

- **Домены:** `createDomain`, хуки домена, `fork(domain)` и `hydrate(domain)`. Границей служит область, а идентичность единицы задаёт компилятор, поэтому домену нечем управлять.
- **`withFactory` и `withRegion`.** Компилятор составляет идентичность экземпляра фабрики.
- **Низкоуровневый граф:** `createNode`, `launch`, `step`, `clearNode`.
- **`fromObservable`, `setStoreName`.**
- **У единиц:** `store.setState`, `store.off`, `store.reinit` и `effect.use` отсутствуют в API.
- **Дополнения effector-react:** `useStoreMap`, `useList`, `useGate`, `createGate`, `createComponent`, `connect`.

## Куда двигаться дальше

- [Единицы и связи](/ru/hypergraph/coming-from-effector/units-and-wiring): подробно о хранилищах, событиях, эффектах и `sample`, с заменами удалённых имён.
- [Области и тестирование](/ru/hypergraph/coming-from-effector/scopes-and-testing): `fork`, обработчики в тестах, кадры для серверного рендеринга и сохранение области через `await`.
- [Фреймворки](/ru/hypergraph/coming-from-effector/frameworks): что заменяет effector-react в Mercury Hyperscript.
- [Курс Hypergraph](/ru/hypergraph): ядро в его собственных понятиях.
