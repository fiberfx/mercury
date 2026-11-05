# Свойства и потоки: патчи по сети — Mercury LMS

> LM3. После первого рендеринга `LiveMercury.mercury/1` отправляет изменения свойств в виде JSON Patch в `data-props-diff`, а потоки LiveView — в виде патчей в `data-streams-diff`; оба используют компактный формат передачи. `@fiberfx/live-mercury` декодирует их через `decodeCompactPatch` и применяет через `applyPatch`, который добавляет к RFC 6902 операции `upsert`, `limit` и пути `$$<id>`.

## Когда читать

Когда разбираетесь с устаревшими свойствами острова, отображаете в нём поток LiveView или самостоятельно декодируете и применяете патчи Live Mercury.

## Контракт

- `data-props`: все свойства в компактном JSON; отправляются при первом и неподключённом рендеринге либо при `diff={false}`. `data-props-diff`: отправляется при последующих рендерингах с включённым `diff` (по умолчанию `config :live_mercury, :enable_props_diff`, `true`, время компиляции). Повторный рендеринг при активном подключении и включённом `diff` не отправляет `data-props` заново.
- Клиентский `updated()`: `data-use-diff="true"` → `applyPatch(props, decodeCompactPatch(data-props-diff))`; иначе — полный `data-props`. Потоки: всегда `applyPatch(streams, decodeCompactPatch(data-streams-diff))`.
- Изменения свойств: изменённый ключ без старого значения → `replace /<key>`; со старым значением → `Jsonpatch.diff` под путём `/<key>` (структуры через `LiveMercury.Encoder`, элементы списков сопоставляются по `id`). Каждая разница начинается с корневого `test` с nonce, сериализованного как `n<digits>`; декодер его пропускает.
- Потоки (assigns типа `%Phoenix.LiveView.LiveStream{}`, не обычные свойства): сброс → `replace /<name> []`; удаление → `remove /<name>/$$<dom_id>`; вставка → `upsert /<name>/-` (при -1) или `/<name>/<at>`; только обновление → `replace /<name>/$$<dom_id>`; ограничение → `limit /<name> <n>`. Элементы содержат `__dom_id`. Первый и неподключённый рендеринг сначала сбрасывают каждый поток.
- Передача: `<op><path_len>:<path><value>`; операции `a` — add, `d` — remove (без значения), `r` — replace, `u` — upsert, `l` — limit; значения `z`, `b0`/`b1`, `n<len>:<num>`, `s<len>:<str>`, `J<len>:<compact json>`. Длины измеряются как длины строк JavaScript — в кодовых единицах UTF-16.
- Компактный JSON: `"` → `^`, `^` → `~^`, `~` → `~~`. `decodeCompactJson` выполняет обратное преобразование.
- `applyPatch(doc, ops)`: копирование при записи ниже корня (каждый затронутый контейнер клонируется один раз на пакет операций); корень изменяется и возвращается. `applyOperation(doc, op)`: одна операция на месте. `getValueByPointer(doc, pointer)`.
- `$$<id>`: элемент, чей `__dom_id` нестрого равен `id`; если не найден → предупреждение, операция пропущена. `upsert`: замена по `__dom_id`, иначе вставка. `limit n`: оставить первые `n` (n ≥ 0) или последние `|n|` (n < 0). `test`: ничего не делает.

## Минимальный пример

```ts
import { applyPatch, decodeCompactPatch } from "@fiberfx/live-mercury";

const props = { count: 5, items: ["a", "b", "c"] };
const next = applyPatch(props, decodeCompactPatch("n123r6:/countn1:6d8:/items/0"));
// next === props; next.count === 6; next.items is a new array ["b", "c"]
```

## Ошибки

`decodeCompactPatch` вызывает `Unknown LiveMercury patch operation code`, `Unknown LiveMercury patch value tag` или `Invalid LiveMercury patch length prefix`. Структура свойства без `LiveMercury.Encoder` вызывает `Protocol.UndefinedError`.

## Чего не создавать

Операции `move` и `copy`: ни у одной нет кода в формате передачи. Длины в байтах в составленном вручную сообщении.

## Далее

- LM4, серверный рендеринг: /ru/live-mercury/server-rendering (/ru/live-mercury/server-rendering/llms.txt)
- Назад: /ru/live-mercury/liveview/llms.txt
- Этот справочник: /ru/live-mercury/props-and-streams/llms.txt

## Навигация

- [Страница в браузере](/ru/live-mercury/props-and-streams)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/live-mercury/llms.txt)
