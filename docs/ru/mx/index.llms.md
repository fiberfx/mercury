# mx — нативный набор инструментов — Mercury LMS

> mx 0.1.0: набор инструментов Mercury, один исполняемый файл на Rust. Модули в `mx.mod`/`mx.sum`, рабочие области в `mx.work` (правила Go), `mx dev` с горячей перезагрузкой, `mx build --bundle` (встроенный Rolldown), `mx test`, `mx compile`, `mx lsap`. Без Node и npm.

## Когда читать

Перед сборкой, запуском сервера, тестированием или организацией приложения либо модуля Mercury, когда нужно знать доступные команды mx. Это вводная страница курса; далее идут главы.

## Доступные команды в выводе mx

- `mx` → `usage: mx exodus|pack|install|verify|importmap|resolve|scan|build|check|run|compile|work|dev|test|lsap …`
- `mx mod` → `usage: mx mod <init|tidy|verify|graph|why|download>` (отсутствует в строке выше)
- `mx work` → `usage: mx work edit|use|init|sync|vendor …`
- `usage: mx dev [--root <dir>] [--port <n>] [--importmap]`
- `mx build --help` (код 0): `usage: mx build [--host | --bundle | --lib] …`. Если вид не задан, `mx.json` означает сборку хоста, а `index.html` рядом с `mx.mod` — бандл приложения. `--help` вызывает справку только в качестве первого аргумента.
- `usage: mx test [--root <dir>] [--timeout <seconds>] [--filter <words>]`
- `usage: mx compile <file> [--options <json>] [--out <file>]`
- `usage: mx lsap [--mcp] | mx lsap --version`
- `mx --version` → `mx 0.1.0`

## Коды завершения

0 — успех · 1 — отказ с указанием причины · 2 — ошибка использования · только для `mx test`: 3 — проверку выполнить не удалось (нет браузера). Диагностика поступает в stderr.

## Установка

Выполните /ru/start/install-mx/llms.txt: нативный архив Linux x86_64 и стартовое приложение, проверка SHA-256 до распаковки, mx install и mx verify. Репозиторий и Rust не нужны. Счётчик: /ru/mx/first-app; навык агента: /SKILL.md.

## Правила для агентов

- Нативное приложение собирается и обслуживается mx. Планируемый npm-путь использует обёртку на Node и необязательный нативный платформенный пакет. Node нужен при каждом вызове установленного через npm mx; архивный путь и образ запускают нативный файл напрямую.
- Приводите флаги в том виде, в котором их выводит mx; не добавляйте флаги, которых нет в его списке.
- Проверка сохранённого нативного примера (действующий сайт — Phoenix `mercury_lms`): `env PATH=<mx's dir>:/usr/bin:/bin mx build --bundle --root sites/mercury --out <dist>` — без Node в PATH.

## Главы

- MX0, первое приложение: /ru/mx/first-app
- MX1, модули и рабочая область: /ru/mx/modules, /ru/mx/workspace
- MX2, цикл разработки и HMR: /ru/mx/dev
- MX3, сборка и поставка: /ru/mx/build
- MX4, Hypercompiler: /ru/mx/compile
- MX5, инструменты: /ru/mx/tools

## Далее

- Сайт: /llms.txt
- Эта текстовая версия: /ru/mx/llms.txt

## Навигация

- [Страница в браузере](/ru/mx)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)

### Текстовые версии глав

- [/ru/mx/build](/ru/mx/build/llms.txt)
- [/ru/mx/compile](/ru/mx/compile/llms.txt)
- [/ru/mx/dev](/ru/mx/dev/llms.txt)
- [/ru/mx/first-app](/ru/mx/first-app/llms.txt)
- [/ru/mx/modules](/ru/mx/modules/llms.txt)
- [/ru/mx/tools](/ru/mx/tools/llms.txt)
- [/ru/mx/workspace](/ru/mx/workspace/llms.txt)
