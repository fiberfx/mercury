# Тестирование модели: своя область для каждого теста — Mercury LMS

> Тестируйте модель `@fiberfx/hypergraph` с одним `fork()` на тест: заменяйте обработчики эффектов для каждой изолированной области состояния (scope), запускайте работу через `allSettled`, читайте значения через `scopeBind(() => $s.getState(), {scope})()` или `snapshot(scope)`, проверяйте наблюдения через `inspect`. Тесты запускаются командой `mx test` в браузере без интерфейса; `vitest` направляется в среду выполнения mx. Векторы соответствия в `specs/mercury/vectors/hypergraph/` — поведение ядра, выраженное данными.

## Когда читать

Если вы пишете или исправляете тест модели Mercury, хотите подменить эффект либо узнать точное поведение ядра в конкретном случае — найдите его вектор.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- Один `fork()` на тест. Новая область читает начальное значение каждого хранилища (store), даже после вызовов вне областей; запуск в области никогда не затрагивает глобальное состояние.
- `fork({values: [[store, v]], handlers: [[effect, fn | effect]]})`: значения и обработчики действуют только в области; подмена модулей не нужна.
- `await allSettled(event, {scope, params})`; для эффекта (effect) возвращает `{status: 'done', value}` либо `{status: 'fail', value: error}`; ошибка обработчика никогда не отклоняет этот промис.
- Чтение: `scopeBind(() => $s.getState(), {scope})()`; `snapshot(scope).values[sid]` → `{shape, value}`; до первого изменения — пустой `{}`.
- `inspect({scope, kinds, fn})` перед запуском работы, отписка после. Каждое обновление сообщается один раз в порядке запуска. Проверяйте отсутствие `fail`: исключение редьюсера никогда не выходит за границы запуска, а только попадает в журнал и наблюдение `fail`.
- `watch($s, fn, {scope})` сообщает только об обновлениях, без начального вызова.
- `mx test`: файлы `*.test.*` / `*.spec.*` (js, mjs, jsx, ts, mts, tsx); `import {describe, test, expect} from "vitest"`; код выхода 0 — успех, 1 — ошибка или не запустился ни один тест, 3 — нет браузера. Не используйте в этих тестах `@fiberfx/hypergraph/node`.
- Векторы: `{format: 'hgv/1', family, vectors}`; идентификатор `<family>.<name>`; ключи `units`, `wiring`, `steps`, `expect` (`trace` — полный порядок внутри запуска, `state`, `scopes`, `spies`, `errors` по `{code}`, `inspected`); функции в hgx/1 (`{arg: n}`, `{op, args}`, `{lit}`); `{"$undef": true}`, `{"$error": msg}`. `protocol.json` — собственные правила Hypergraph (`observed {by, rule, why}`); `hmr.json` — сравнение при замене графа.

## Минимальный пример

```ts
import { expect, test } from "vitest";
import { allSettled, effect, fork } from "@fiberfx/hypergraph";

const loadUser = effect(async (id: number) => ({ name: `remote ${id}` }));

test("loads a user", async () => {
  const scope = fork({ handlers: [[loadUser, async (id: number) => ({ name: `user ${id}` })]] });
  expect(await allSettled(loadUser, { scope, params: 7 })).toEqual({ status: "done", value: { name: "user 7" } });
});
```

## Никогда не генерируйте

Тесты, вызывающие единицы Hypergraph (unit) вне области и читающие глобальное состояние; подмены модулей ради эффектов (используйте `handlers`); `effect.use`, `serialize`, `npm test`/`node --test`/исполнители Vite для тестов приложения (используйте `mx test`); любые импорты из `effector`.

## Дальше

- Следующая глава: /ru/hypergraph/models (/ru/hypergraph/models/llms.txt)
- Курс: /ru/hypergraph (/ru/hypergraph/llms.txt)
- Эта версия страницы для агентов: /ru/hypergraph/testing/llms.txt

## Навигация

- [Страница в браузере](/ru/hypergraph/testing)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
