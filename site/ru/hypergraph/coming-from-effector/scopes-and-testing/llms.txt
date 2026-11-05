# Области и тестирование при переходе с Effector — Mercury LMS

> Модель изолированных областей состояния (scope) Effector в Hypergraph (`@fiberfx/hypergraph`): `fork`, `allSettled`, `scopeBind` сохраняют имена; `serialize` → `snapshot` (кадр состояния, frame), `hydrate` → `apply` (возвращает несовпадения); `diff` и `dispose` добавлены; доменов нет; `scope.getState` отсутствует.

## Когда читать

Если вы переносите тесты Effector, сериализацию для серверного рендеринга или работу с областями либо читаете значение хранилища в области.

## Соответствия

| Effector | Hypergraph |
|---|---|
| `fork({values, handlers})` | `fork({values, handlers, performers})` |
| `fork(domain, cfg)` | отсутствует: используйте `fork(cfg)` |
| `values: [[$s, v]]` или `{[sid]: v}` | без изменений либо кадр `snapshot` |
| `handlers: [[fx, fn]]` | без изменений: `fn` или другой эффект |
| `allSettled(unit, {scope, params})`, `allSettled(scope)` | без изменений |
| `scope.getState($s)` | `scopeBind(() => $s.getState(), {scope})()` |
| `scopeBind(unit, {scope, safe})` | `scopeBind(fn, {scope, safe})` |
| `serialize(scope, {ignore})` | `snapshot(scope, {ignore})` |
| `serialize(...)[sid]` | `snapshot(...).values[sid].value` |
| `serialize(..., {onlyChanges})` | такого параметра нет |
| `hydrate(scope, {values})` → void | `apply(scope, frame)` → `[{unit, reason: {kind: "removed"} \| {kind: "shape", from, to}}]` |
| — | `diff(scope, since)` → `{format, gen, from, changed, removed}` |
| — | `dispose(scope)`; последующие вызовы → `HypergraphError` `disposed-scope` |
| `createWatch({unit, fn, scope})` | `watch(unit, fn, {scope})` |

Кадр: `{format: "mhg-scope/1", gen, values: {[sid]: {shape, schema?, value}}}`. В него входят только хранилища (store) с sid; сегодня sid задаётся вручную, поскольку проход компилятора, назначающий sid, охватывает только прежний фасад.

## Минимальный пример теста

```ts
import { allSettled, effect, fork, scopeBind, store } from "@fiberfx/hypergraph";

const fetchUserFx = effect<number, string>(async (id) => `real ${id}`);
const $user = store<string | null>(null).on(fetchUserFx.doneData, (_, u) => u);

const scope = fork({ handlers: [[fetchUserFx, async (id: number) => `stub ${id}`]] });
await allSettled(fetchUserFx, { scope, params: 7 });
scopeBind(() => $user.getState(), { scope })(); // "stub 7"
```

## Область через await

По умолчанию в браузере: как в Effector, завершившийся эффект восстанавливает область вызвавшего его кода, поэтому посторонний вызов во время ожидания может попасть в неё; захватывайте область через `scopeBind`. В Node: `setCarrier(nodeCarrier())`, где `nodeCarrier` импортируется из `@fiberfx/hypergraph/node`.

## Никогда не генерируйте

`serialize`, `hydrate`, `fork(domain)`, `scope.getState`, `createWatch`, `fx.use` и любые импорты из `effector`.

## Навигация

- [Страница в браузере](/ru/hypergraph/coming-from-effector/scopes-and-testing)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
