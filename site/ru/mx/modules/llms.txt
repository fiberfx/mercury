# Модули: mx.mod и mx.sum — Mercury LMS

> MX1, часть первая. Модуль Mercury — каталог с `mx.mod` (правила Go go.mod) и `mx.sum` (Go go.sum, `/package.json` вместо `/go.mod`). Выбор минимальных версий; без lock-файла. Файлами управляет `mx mod <init|tidy|verify|graph|why|download>`.

## Когда читать

При добавлении, удалении или обновлении зависимости модуля либо приложения Mercury, перенаправлении модуля в локальный каталог или разборе отказа `tidy`/`verify`.

## Директивы mx.mod

`module`, `mx`, `toolchain`, `require`, `exclude`, `replace`, `retract`. `// indirect` — выбран графом, а не запрошен напрямую. `replace <path> => <dir>` — участник, обслуживаемый из этого каталога (без строки в `mx.sum`).

## Пути модулей

- Публичные пакеты @fiberfx: `registry.npmjs.org/fiberfx/<name>` с версией `v4.0.0` в стартовом приложении. Модуль приложения — `example.com/mercury-first-page`.
- Примеры из исходной рабочей области могут использовать `github.com/fiberfx/mercury/<name>` с локальными заменами. Не копируйте эти пути в приложение внешнего потребителя.
- npm: `registry.npmjs.org/<name without @>`, версия с `v`: `registry.npmjs.org/swc/helpers v0.5.23 // indirect`.

## Строки mx.sum

`<path> <version> h1:<hash>` и `<path> <version>/package.json h1:<hash>`.

## Команды со строками использования из mx

- `usage: mx mod init [module-path]` — из package.json; путь из аргумента или имени пакета; все четыре раздела зависимостей по нижним границам диапазонов; отказ `mx.mod already exists`; удаляет `mx.lock.json`, `mx.pins.json`.
- `usage: mx mod tidy [-e] [--check]` — записывает `mx.mod`, `mx.sum`, версии в package.json; `-e` продолжает после ошибок загрузки; `--check` → `tidy --check: <files> would change`.
- `usage: mx mod verify` — без сети; `all modules verified`.
- `usage: mx mod graph` — `<module> <dependency>@<version>` на ребро.
- `usage: mx mod why <module>` — `# <module>` и путь либо `(main module does not need module <module>)`.
- `usage: mx mod download` — заполняет хранилище.
- Если здесь есть `mx.mod`, `mx install` / `mx verify` не принимают флагов.

## Отказы, которые нельзя обходить

- `one version per module path`
- `SECURITY ERROR: mx.sum has <hash>, and the proxy served <hash>` (`-e` никогда не пропускает эту ошибку)

## Окружение

`MXPROXY` (по умолчанию `https://mx.jonnify.com,direct`; синтаксис GOPROXY) · `MX_STORE` (по умолчанию `./.mx/store`) · `MXSUMDB` · `MXNOSUMDB` (по умолчанию `MXPRIVATE`).

## Не выдавать

Не заменяйте управление зависимостями модуля mx на lock-файлы npm/pnpm и не добавляйте прежние mx.lock.json/mx.pins.json. Получение нативного исполняемого файла mx через опубликованный npm-пакет — отдельная начальная установка; она не заменяет mx.mod и mx.sum.

## Далее

- /ru/mx/workspace
- Эта текстовая версия: /ru/mx/modules/llms.txt

## Навигация

- [Страница в браузере](/ru/mx/modules)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/mx/llms.txt)
