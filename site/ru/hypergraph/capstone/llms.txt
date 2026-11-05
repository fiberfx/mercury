# Итоговый пример: передача и восстановление модели — Mercury LMS

> Модель `@fiberfx/hypergraph`, собранная из экспортов, запускается в `fork()`; её кадр состояния (frame) получается через `snapshot`, применяется к новой изолированной области состояния (scope) через `fork({values: frame})`, проверяется на равенство через `diff(replica, frame)`, затем обновляется через `apply(replica, diff(scope, frame))`. Ожидаемые значения взяты из собственного теста пакета, `fiberfx/hypergraph/test/api-types.test.ts`.

## Когда читать

Если нужен полный корректный образец модели и её теста с передачей и восстановлением снимка (snapshot): например, передача с сервера клиенту или обновление реплики разницами кадров.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- В кадр входят только изменяемые хранилища (store) с `sid`; производные хранилища вычисляются в реплике заново.
- `await allSettled(event, {scope, params})` ждёт также завершения эффектов (effect), запущенных через `sample`.
- `snapshot(scope)` → `{format: 'mhg-scope/1', gen, values: {sid: {shape, value}}}`.
- `fork({values: frame})` = новая область + применение кадра.
- Равенство: `diff(replica, frame)` → `changed: {}` (нет новых или отличающихся записей) и `removed: []` (нет отсутствующих записей кадра). `changed` проверяется тестом пакета; `removed` прочитано в ядре, а не проверено запуском.
- Обновление: `apply(replica, diff(scope, since))`.
- Вызов вне всех областей (`add(5)`) меняет только глобальное состояние и никогда не меняет область.

## Минимальный пример

```ts
import { expect, test } from "vitest";
import { allSettled, apply, diff, event, fork, scopeBind, snapshot, store } from "@fiberfx/hypergraph";

const add = event<number>();
const $count = store(0, { sid: "count" }).on(add, (n, by) => n + by);
const read = (scope: ReturnType<typeof fork>) => scopeBind(() => $count.getState(), { scope })();

test("round-trips its frame", async () => {
  const scope = fork();
  await allSettled(add, { scope, params: 3 });
  const frame = snapshot(scope);              // values.count = { shape: "runtime:number", value: 3 }
  const replica = fork({ values: frame });
  expect(read(replica)).toBe(3);
  expect(diff(replica, frame).changed).toEqual({});
  await allSettled(add, { scope, params: 1 });
  apply(replica, diff(scope, frame));
  expect(read(replica)).toBe(4);
});
```

## Никогда не генерируйте

`serialize`, `hydrate`, хранилище без `sid`, которое должно передаваться; сравнение `getState()` вне области как доказательство состояния реплики; любые импорты из `effector` или `@fiberfx/hypergraph/hmr`.

## Дальше

- Курс: /ru/hypergraph (/ru/hypergraph/llms.txt)
- Эта версия страницы для агентов: /ru/hypergraph/capstone/llms.txt

## Навигация

- [Страница в браузере](/ru/hypergraph/capstone)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
