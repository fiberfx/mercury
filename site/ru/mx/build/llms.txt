# Сборка и поставка: три вида сборки — Mercury LMS

> MX3. `mx build` создаёт страницу приложения (`--bundle` → каталог), один файл ES-модуля (`--lib` → файл) или карту импортов хоста (`mx.json` → `importmap.json` и модули). `mx check` проверяет результат хоста; `mx run` собирает его, затем выполняет exec. Rolldown работает внутри mx; без Node.

## Когда читать

При сборке приложения или острова, подготовке статических модулей хоста, проверке перед развёртыванием или разборе отказа `--lib`, связанного с участниками.

## Использование в выводе mx

- `usage: mx build [--bundle] [--root <dir>] [--out <dir>]` → `bundled <entry> -> <out>`
- `usage: mx build --lib <entry> --out <file> [--root <dir>] [--external <package>]... [--define <name>=<expression>]... [--minify] [--require-export <name>]...` → `bundled <entry> -> <out> (<bytes> bytes)`
- Хост: `--out` или `out` в mx.json; точки входа аргументами или `entries` в mx.json; `--base`, `--mirror`; → `build: <n> modules to <out>`

## Окружение бандла

`import.meta.env.MODE` = `"production"`, `PROD` = `true`, `DEV` = `false`; из `.env` — только ключи `MX_*`.

## Правила --lib

Один файл: без разбиения, динамические импорты встроены, каталог в `--out` отклоняется. Ровно экспорты точки входа (`--require-export`). `--external` сохраняет импорт по имени пакета. Без sid. Импорты стилей пустые. Участники — замены из mx.mod корня и участники mx.work.

## Отказы --lib

- `<spec>, imported by <importer>, is provided by no member the root's mx.mod replaces and no --external names it`
- при `MXWORK=off` дополнительно: `: MXWORK=off leaves out the mx.work whose member <dir> provides <name>. Add \`require <module> v0.0.0\` and \`replace <module> => <relative>\` to <root>/mx.mod, or build without MXWORK=off`
- `<name> is both <app>'s replace (<dir>) and the mx.work's member (<dir>): remove the replace, or the member from mx.work, or build with MXWORK=off`
- `<entry> does not export <names> (it exports <names>)`

## Хост

Ключи mx.json: `packages`, `mirror`, `base`, `out`, `entries`; другие: `mx.json refused: unknown key <key>`. Шаги: установка с записью в хранилище → формирование карты с sha384 каждого модуля → копирование → `<out>/importmap.json`.

## mx check / mx run

- check: `check refused: … is missing | is not this lock's map | was altered`; успех: `check: <n> modules in <out> match`.
- `mx run <command>`: сборка, затем exec, например `mx run mix phx.server`; имя скрипта package.json запускает задачу.
- Только `--mod vendor`; иначе `mx <cmd>: --mod <v> is not vendor`.

## Не выдавать

`vite build`, `tsdown`, `esbuild`, `rollup -c` или `npm run build` для приложения либо острова Mercury.

## Далее

- MX4, Hypercompiler: /ru/mx/compile
- Эта текстовая версия: /ru/mx/build/llms.txt

## Навигация

- [Страница в браузере](/ru/mx/build)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/mx/llms.txt)
