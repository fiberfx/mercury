# Mercury LMS

> Mercury объединяет mx (нативные инструменты на Rust), Hyperscript (собственную среду DOM), Hypergraph (состояние) и Mercury UI. Live Mercury связывает их с Phoenix и LiveView. Архивный путь и образ запускают нативный mx без Node.js и npm CLI. Планируемая npm-обёртка требует Node при каждом вызове mx. Mercury использует Hyperscript, а не React.

## Когда читать

Перед написанием, сборкой или объяснением приложения Mercury, когда нужно понять, за что отвечает каждый модуль и где находится его курс.

## Выбор пути

Сохраните существующее приложение или работающий mx. Без CLI начните с [браузерного HTML](/ru/start/browser/llms.txt). Для нативного TSX проверьте [готовность npm и архивов](/ru/start/install-mx/llms.txt). [Навык Mercury](/agent/SKILL.md) выбирает путь по среде и задаче; счётчик не заменяет проверку заказанных пользователем действий.

## Модули

- mx — нативный набор инструментов: `mx build --bundle|--host|--lib`, `mx dev`, `mx test`, `mx check`. Курс: /ru/mx.
- `@fiberfx/hyperscript` — виртуальный DOM, среда выполнения JSX и хуки. Курс: /ru/hyperscript.
- `@fiberfx/ui` — компоненты и токены дизайн-системы. Курс: /ru/ui.
- `@fiberfx/hypergraph` — ядро управления состоянием. Курс: /ru/hypergraph (текстовая версия: /ru/hypergraph/llms.txt).
- `@fiberfx/content` — документы страниц и каталог блоков. Курс: /ru/content.
- `live_mercury` — острова Mercury в Phoenix и LiveView. Курс: /ru/live-mercury.

## Правила для агентов

- Нативное приложение собирает mx; браузерный путь использует обычный JavaScript. npm может установить опубликованный нативный пакет mx, но не выполняет сборку такого приложения.
- Не выдавайте код и импорты React, Next.js, Vue, Solid или Effector.
- У каждой страницы здесь есть адрес `<page>/llms.txt`.
- Все английские текстовые версии в порядке курсов собраны в одном файле: /llms-full.txt

## Статус

Сайт на Phoenix `mercury_lms` обслуживает главную страницу на двух языках по адресам / и /ru. Нативный пример в `sites/mercury` — отдельное приложение. Готовность модулей описана на /ru/start/stability, текущий способ установки — на /ru/start/install-mx. Публикация в реестре сама по себе не подтверждает, что нативная установка работает: выполните шаги и проверьте результат на /ru/mx/first-app. На странице с отметкой «Запланировано» (Planned) нет исполнимого примера.

## Первая нативная страница

- [Навык создания страницы Mercury](/SKILL.md).
- [Установка mx](/ru/start/install-mx/llms.txt): публичные архивы и проверка SHA-256.
- [Первая страница](/ru/mx/first-app/llms.txt): оформленный счётчик Card + Button, запуск и сборка.

Начните в новом каталоге на Linux x86_64. Сохраните mx.mod и mx.sum стартового приложения. Импортируйте @fiberfx/ui/styles.css. Браузер исполняет JavaScript; BEAM необязателен.

## Навигация

- [Страница в браузере](/ru)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [/ru/content](/ru/content/llms.txt)
- [/ru/hypergraph](/ru/hypergraph/llms.txt)
- [/ru/hyperscript](/ru/hyperscript/llms.txt)
- [/ru/live-mercury](/ru/live-mercury/llms.txt)
- [/ru/mx](/ru/mx/llms.txt)
- [/ru/start](/ru/start/llms.txt)
- [/ru/ui](/ru/ui/llms.txt)
- [English index](/llms.txt)
