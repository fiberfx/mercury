# Виды, перенос контекста и ошибки — Mercury LMS

> `kindOf(x)` отличает виды единиц Hypergraph (unit) и изолированную область состояния (scope) от других значений; `setCarrier(nodeCarrier())` сохраняет область через `await` на сервере JavaScript; каждый отказ `@fiberfx/hypergraph` представлен `HypergraphError` с переносимым полем `code`.

## Когда читать

Если вы выбираете ветвь по виду значения, запускаете Hypergraph на сервере с одновременными запросами либо обрабатываете, тестируете или объясняете ошибку Hypergraph.

## Контракт (уровень готовности: Shipped — @fiberfx/hypergraph 4.0.0 доступен в npm с 2026-11-05)

- `kindOf(x)` → `'store' | 'event' | 'effect' | 'scope' | null`; `null` для всего, что создано не этим модулем.
- `setCarrier(carrier | null)`. По умолчанию переносчика контекста (carrier) нет: эффект (effect), вызванный в области, по завершении возвращает вызывающую сторону в эту область, поэтому посторонний вызов во время ожидания может попасть в неё. Переносчик (`{current(), run(scope, fn)}`) передаёт область по цепочке.
- `nodeCarrier()` из `@fiberfx/hypergraph/node` (AsyncLocalStorage). Вызовите `setCarrier(nodeCarrier())` один раз при запуске сервера. Никогда не импортируйте `/node` в браузерном коде.
- `HypergraphError extends Error`: `name` `"HypergraphError"`, `code: ErrorCode`. Сопоставляйте по `code`, а не по сообщению.
- Коды: `derived-call` (вызвана производная единица; выбрасывается); `derived-target` (производная единица — цель `sample` или ветвь `split`; выбрасывается при создании связей); `pure-call` (единица вызвана из редьюсера, `map` или фильтра; сообщается, а не выбрасывается); `disposed-scope` (работа в завершённой области; промис `allSettled` или вызова эффекта отклоняется); `reset-reason` (недопустимая причина сброса в интерфейсе горячей замены; недостижима из кода приложения).
- Исключение внутри любой функции, выполняемой графом, записывается в `console.error`, останавливает эту ветвь и наблюдается как `fail`; за пределы запуска оно не выходит.
- Обычный `Error` без кода: связывание единиц двух поколений; значение, не являющееся единицей, вместо ожидаемой единицы; `scopeBind` без области и без `safe`; `allSettled` для производной единицы; декларативный эффект без исполнителя.

## Минимальный пример

```ts
import { HypergraphError, allSettled, dispose, event, fork } from "@fiberfx/hypergraph";

const ping = event();

export async function afterDispose() {
  const scope = fork();
  dispose(scope);
  try {
    await allSettled(ping, { scope });
  } catch (error) {
    if (error instanceof HypergraphError && error.code === "disposed-scope") return "fork a new scope";
    throw error;
  }
}
```

## Никогда не генерируйте

`is`, `is.store`, `is.scope`, проверку текста сообщения об ошибке, вызов единицы внутри `.on`/`.map`/`filter` (используйте `sample`) и любые импорты из `effector`.

## Дальше

- Курс: /ru/hypergraph (/ru/hypergraph/llms.txt)
- Эта версия страницы для агентов: /ru/hypergraph/errors/llms.txt (страница в Markdown, `/hypergraph/errors.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hypergraph/errors)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hypergraph/llms.txt)
