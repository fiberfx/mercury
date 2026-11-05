# Live Mercury — острова на BEAM — Mercury LMS

> Компоненты Mercury Hyperscript («острова») внутри Phoenix и LiveView. Сервер: `LiveMercury.mercury/1` (echo/apps/live_mercury). Браузер: `@fiberfx/live-mercury` 4.0.0, peer-зависимость `@fiberfx/hyperscript`. Острова EDU собираются через `mx build --lib` без Node.

## Когда читать

Когда вы размещаете компонент Mercury на странице Phoenix, связываете его с LiveView или собираете бандл. Это обзор курса; далее идут LM0–LM5, а LM6 запланирован.

## Контракт

- Остров — один элемент с `phx-update="ignore"` и `phx-hook`; клиентский хук монтирует в него компонент Hyperscript.
- Сервер, вариант LiveView: `<LiveMercury.mercury name="X" ...props />` выводит `phx-hook="MercuryHook"`, `data-name="X"`, `data-props`, `data-props-diff`, `data-streams-diff`, `data-slots`, `data-ssr`, `data-use-diff`.
- Браузер: `getHooks({ X })` возвращает `{ MercuryHook }` для `new LiveSocket(path, Socket, { hooks })`. Серверный `name` должен совпадать с ключом карты.
- Вариант EDU: `<.island id bundle props>` (`EchoEduWeb.Island`) выводит `phx-hook="CourseIsland"`, `data-bundle` и дочерний `<script type="application/json">` со свойствами. Бандл экспортирует `default` и `hook = courseIsland(Component)` из `@echd/edu-boot/island`.
- Экспорты `@fiberfx/live-mercury`: `getHooks`, `createMercuryHook`, `useLiveMercury`, `LiveMercuryProvider`, `LiveMercuryContext`, `Link`, `decodeCompactJson`, `decodeCompactPatch`, `applyPatch`, `applyOperation`, `getValueByPointer`.

## Минимальный пример

```ts
import { Socket } from "@fiberfx/phoenix";
import { LiveSocket } from "@fiberfx/phoenix_live_view";
import { getHooks } from "@fiberfx/live-mercury";
import { KanBoard } from "./board";

const liveSocket = new LiveSocket("/live", Socket, { hooks: getHooks({ KanBoard }) as never });
liveSocket.connect();
```

## Не выдавать

Импорты из `react` или `react-dom`. Острова рендерятся через `@fiberfx/hyperscript`.

## Ограничения

- Острова EDU собираются через mx внутри образа (без `node` на этом этапе). Бандл представлений KAN `kan.mjs` хранится в Git и собирается вне образа.

## Дальше

- LM0: /ru/live-mercury/islands (/ru/live-mercury/islands/llms.txt)
- LM1: /ru/live-mercury/liveview (/ru/live-mercury/liveview/llms.txt)
- LM2: /ru/live-mercury/building (/ru/live-mercury/building/llms.txt)
- LM3: /ru/live-mercury/props-and-streams (/ru/live-mercury/props-and-streams/llms.txt)
- LM4: /ru/live-mercury/server-rendering (/ru/live-mercury/server-rendering/llms.txt)
- LM5: /ru/live-mercury/testing (/ru/live-mercury/testing/llms.txt)
- LM6, итоговое задание (остров в LiveView, собранный без Node): запланировано; зависит от H3–H5 эпика 24 и отказа от Vite для `kan.mjs`
- Сайт: /llms.txt
- Эта текстовая версия: /ru/live-mercury/llms.txt

## Навигация

- [Страница в браузере](/ru/live-mercury)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)

### Текстовые версии глав

- [/ru/live-mercury/building](/ru/live-mercury/building/llms.txt)
- [/ru/live-mercury/islands](/ru/live-mercury/islands/llms.txt)
- [/ru/live-mercury/liveview](/ru/live-mercury/liveview/llms.txt)
- [/ru/live-mercury/props-and-streams](/ru/live-mercury/props-and-streams/llms.txt)
- [/ru/live-mercury/server-rendering](/ru/live-mercury/server-rendering/llms.txt)
- [/ru/live-mercury/testing](/ru/live-mercury/testing/llms.txt)
