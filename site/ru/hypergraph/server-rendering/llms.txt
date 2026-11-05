# Серверный рендеринг: своя область для каждого запроса — Mercury LMS

> Рендеринг модели `@fiberfx/hypergraph` на сервере: `fork()` для каждого запроса, `await allSettled(...)`, `snapshot(scope)` → JSON-кадр состояния (frame) с ключами sid, `dispose(scope)`; на клиенте `apply(fork(), frame)` либо `fork({values: frame})`. На JavaScript-сервере однократный вызов `setCarrier(nodeCarrier())` при запуске сохраняет изолированную область состояния (scope) каждого запроса через `await`.

## Когда читать

Если вы рендерите страницу Mercury на сервере, передаёте состояние браузеру или выясняете, почему значение перетекло между параллельными запросами.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- Сервер: `const scope = fork({handlers?})`; `await allSettled(event, {scope, params})` ждёт завершения каждого эффекта (effect), начатого этим запуском; `const frame = snapshot(scope)`; `dispose(scope)`; передайте `JSON.stringify(frame)`.
- Клиент: `apply(fork(), frame as Snapshot)` → `Miss[]` (`removed` | `shape {from, to}`); либо `fork({values: frame})`, который сообщает о несовпадениях только наблюдениями `reset`.
- Кадр: `{format: 'mhg-scope/1', gen, values: {sid: {shape, schema?, value}}}`. Ключи — sid, поэтому кадр применим между сборками.
- Передаются изменяемые хранилища (store) с sid, которые область изменила или получила извне. Не передаются хранилища без sid, производные хранилища (клиент вычисляет их заново), хранилища с `serialize: 'ignore'` и хранилища с начальным значением.
- Значения вне JSON: `serialize: {write(v), read(raw)}`; `apply` вызывает `read`.
- Переносчик контекста (carrier): по умолчанию отсутствует. Эффект при завершении восстанавливает область вызвавшего его кода; посторонний вызов во время ожидания может попасть в приостановленную область. `setCarrier(nodeCarrier())` из `@fiberfx/hypergraph/node` передаёт область по каждой асинхронной цепочке. Тест пакета: проверка утечки даёт глобальное значение 0 / значение в области 1 по умолчанию и глобальное значение 1 / значение в области 0 с переносчиком.
- Обратные вызовы извне цепочки: `scopeBind(fn, {scope})`.
- Никогда не импортируйте `@fiberfx/hypergraph/node` в браузерном коде.

## Минимальный пример

```ts
import { allSettled, dispose, fork, snapshot, type Snapshot, apply } from "@fiberfx/hypergraph";
import { pageOpened } from "./model";

export async function render(id: number) {
  const scope = fork();
  await allSettled(pageOpened, { scope, params: id });
  const text = JSON.stringify(snapshot(scope));
  dispose(scope);
  return text;
}

export const resume = (text: string) => apply(fork(), JSON.parse(text) as Snapshot);
```

## Никогда не генерируйте

`serialize(scope)`, `hydrate(...)`, `fork(domain)`, общую область для нескольких запросов, `snapshot` до завершения `allSettled` и любые импорты из `effector`.

## Дальше

- Тестирование модели: /ru/hypergraph/testing (/ru/hypergraph/testing/llms.txt)
- Эта версия страницы для агентов: /ru/hypergraph/server-rendering/llms.txt

## Навигация

- [Страница в браузере](/ru/hypergraph/server-rendering)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
