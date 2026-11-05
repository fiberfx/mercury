# Начните здесь — Mercury LMS

> Mercury: компоненты на Mercury Hyperscript (`@fiberfx/hyperscript`), оформление через Mercury UI (`@fiberfx/ui`), состояние в Hypergraph (`@fiberfx/hypergraph`), сборка нативным `mx`. JavaScript исполняется в браузере. Phoenix/LiveView необязательны. Архивный путь и образ не требуют установки Node/npm, Rust и BEAM. Планируемой npm-обёртке Node нужен при каждом вызове mx. React не используется. Версия 4.0.0 доступна в npm с 2026-11-05.

## Когда читать

Если вы только знакомитесь с Mercury или перед написанием кода хотите понять, какой модуль или курс поможет решить задачу.

## Модули

- `mx` — нативный набор инструментов. Команда `mx dev [--root <dir>] [--port <n>] [--importmap]` запускает сервер приложения на 127.0.0.1. Режимы сборки: `mx build --bundle` — страница приложения, `--lib <entry> --out <file>` — один файл модуля, `--host` — сборка для хоста. Приложение — каталог с `index.html` рядом с `mx.mod`. Публичный архив для Linux x86_64 и стартовое приложение: /ru/start/install-mx. Курс: /ru/mx.
- `@fiberfx/hyperscript` — виртуальный DOM. `render`, `h`, `Fragment` импортируются из корневой точки входа; хуки — из `/hooks`; `createRoot` — из `/client`; `renderToString` — из `/server`; JSX не требует прагмы: Hypercompiler закрепляет среду выполнения и отклоняет любой комментарий `@jsx`. Курс: /ru/hyperscript.
- `@fiberfx/ui` — компоненты дизайн-системы, оформляемые через токены. Курс: /ru/ui.
- `@fiberfx/hypergraph` — ядро управления состоянием. Курс: /ru/hypergraph.
- `@fiberfx/content` — опубликованные страницы, каталог блоков. Курс: /ru/content.
- `live_mercury` (Mix, 2.8.0) и `@fiberfx/live-mercury` — острова в LiveView. Курс: /ru/live-mercury.

## Минимальный пример

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";

function Counter() {
  const [count, setCount] = useState(0);
  return <button class="counter" onClick={() => setCount(count + 1)}>{count}</button>;
}

render(<Counter />, document.getElementById("app")!);
```

## Правила

- Используйте имена DOM: `class`, `for`, `onInput` для каждого нажатия клавиши, `onChange` для события DOM `change`.
- Нативное приложение собирает mx; npm может установить mx после публикации пакета. Браузерному пути сборка не нужна. Не добавляйте конфигурации Vite или импорты из `react`, `react-dom`, `next`, `vue`, `solid-js` или `preact` в эти примеры Mercury.
- `mx dev` поддерживает горячую перезагрузку: сохранённый модуль обновляется на месте либо страница перезагружается (/ru/mx/dev). Замена Hypergraph с сохранением состояния пока не поставляется (/ru/hypergraph/hot-replacement); не обещайте её.

## Дальше

- Обоснование решений: /ru/start/philosophy (версия для агентов: /ru/start/philosophy/llms.txt)
- Уровни готовности и версии: /ru/start/stability
- Как агентам читать этот сайт: /ru/start/agents
- Нативный mx и стартовое приложение: /ru/start/install-mx
- Глоссарий: /ru/start/glossary
- Оформленный счётчик Card + Button: /ru/mx/first-app
- Навык агента: /SKILL.md
- Карта сайта: /llms.txt
- Эта версия страницы для агентов: /ru/start/llms.txt

## Навигация

- [Страница в браузере](/ru/start)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)

### Текстовые версии глав

- [/ru/start/agents](/ru/start/agents/llms.txt)
- [/ru/start/glossary](/ru/start/glossary/llms.txt)
- [/ru/start/install-mx](/ru/start/install-mx/llms.txt)
- [/ru/start/philosophy](/ru/start/philosophy/llms.txt)
- [/ru/start/stability](/ru/start/stability/llms.txt)

## Выбор пути

Сохраните существующее приложение или работающий mx. Без CLI начните с [браузерного HTML](/ru/start/browser/llms.txt). Для нативного TSX проверьте [готовность npm и архивов](/ru/start/install-mx/llms.txt). [Навык Mercury](/agent/SKILL.md) выбирает путь по среде и задаче; счётчик не заменяет проверку заказанных пользователем действий.
