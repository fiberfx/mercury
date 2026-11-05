# Инструменты: test, lsap и run — Mercury LMS

> MX5. `mx test` выполняет тесты модуля в Chromium без интерфейса, который mx запускает сам; импорты `vitest` обслуживает собственная среда выполнения mx. `mx lsap` запускает `hyperscript-lsap` из каталога рядом с mx. `mx run` выполняет скрипт package.json как кешируемую задачу либо собирает хост и передаёт управление команде.

## Когда читать

При написании или запуске тестов модуля Mercury, настройке языкового сервера или кешировании скрипта.

## mx test

- `usage: mx test [--root <dir>] [--timeout <seconds>] [--filter <words>]`
- Файлы: `*.test.*` / `*.spec.*` с расширениями `js mjs jsx ts mts tsx`; поиск не ведётся в `node_modules`, `dist`, `target`, `coverage`.
- Браузер: `MX_BROWSER`, иначе самый новый Chromium Playwright, затем headless shell (`PLAYWRIGHT_BROWSERS_PATH`, `~/Library/Caches/ms-playwright`, `~/.cache/ms-playwright`).
- `--timeout` — весь запуск, по умолчанию 120 с. На тест 5 с, на хук 10 с. Молчание страницы ещё 30 с после этих пределов считается зависанием.
- `--filter` — подстрока в `<file> > <name>`.
- Коды: 0 — всё прошло · 1 — ошибка, ни один тест не выполнялся или запуск нарушен · 2 — ошибка использования · 3 — нет браузера, никогда не успех.
- Вывод: `ok    <file> > <name>`, `skip  …`, `FAIL  <file> > <name>: <message>`, `mx test: P passed, F failed, of T`.

## Среда выполнения vitest, собственная реализация mx

`describe`, `it`, `test`, `beforeAll`, `afterAll`, `beforeEach`, `afterEach`, `expect`, `vi` (`fn`, `spyOn`, `stubGlobal`, подменённые таймеры, `setSystemTime`), `expectTypeOf`, `assertType` (ничего не делают во время выполнения), `visit`. `vi.mock` отсутствует: вызов выбрасывает ошибку.

`visit(url, { width, height, scale, mobile, scheme, ready })` → `{ id, evaluate(fn, ...args), close() }`; `ready` — CSS-селектор; `scheme` задаёт `prefers-color-scheme`.

## mx lsap

- `usage: mx lsap [--mcp] | mx lsap --version`
- Релиз содержит `hyperscript-lsap-<target>` рядом с `mx-<target>`; установите его рядом с mx под именем `hyperscript-lsap`. В Windows его нет: Windows-релиз содержит только mx, а `mx lsap` отказывает с "The language server isn't built for Windows in this release".
- Запускает `hyperscript-lsap` только из каталога mx; задаёт `HYPERSCRIPT_LSAP_MX`; завершается с кодом сервера. `--version` → `mx 0.1.0` / `hyperscript-lsap 0.1.0`.
- Нет сервера: `Error: mx lsap found no language server beside mx.` (код 1).

## mx run

- Задача, если скрипт есть в package.json: `mx run [--no-cache] [--verify] [-r | --filter <member>]... [-j <n>] <name> [-- args]`. Попадание: `hit <key>, restored N files`. Промах: `miss (<why>)`. Кеш: `MXCACHE` (по умолчанию `~/.cache/mx/run`). Окружение в ключе: `NODE_ENV` + `MXRUN_ENV`. Сохраняется только код 0. Скрипты `mx test` никогда не кешируются.
- Хост, для остальных имён: сборка, затем exec команды (`mx run mix phx.server`).
- Отказы: `a script name is required`, `-r and --filter need an mx.work at or above <dir>`, `-j 0 is not a count`, `a command is required` (код 2).

## Не выдавать

`npx vitest`, `vitest run`, `jest`, `vi.mock(...)`, `playwright test` для модуля Mercury или другой языковой сервер вместо `mx lsap`.

## Далее

- К курсу: /ru/mx
- Эта текстовая версия: /ru/mx/tools/llms.txt

## Навигация

- [Страница в браузере](/ru/mx/tools)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/mx/llms.txt)
