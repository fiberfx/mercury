`mx build` создаёт три разных результата в зависимости от того, на что он направлен. Здесь они разобраны по очереди, затем — `mx check` и `mx run`, использующие флаги хоста.

## Три вида

| Вид | Как запросить | Что записывается |
|---|---|---|
| страница приложения | `--bundle` или корень с `index.html` рядом с `mx.mod` | каталог: `index.html` и `assets/` |
| один файл модуля | `--lib <entry>` | один файл ES-модуля |
| карта импортов хоста | `--host` или корень с `mx.json` | `importmap.json` и перечисленные в ней модули |

Сначала учитываются флаги, затем корень. Сочетание `--bundle` с `--host` или `--lib` с любым из них — ошибка использования; сообщения приведены в MX0.

## Страница приложения

```sh
usage: mx build [--bundle] [--root <dir>] [--out <dir>]
```

[MX0](/ru/mx/first-app) разбирает эту сборку: модульный скрипт страницы служит точкой входа, `--out` по умолчанию равен `<root>/dist`, успех выводит `bundled <entry> -> <out>`. mx заменяет только каталог, который сам пометил `.mx-bundle`. Бандл собирает встроенный Rolldown; каждый модуль приложения проходит через Hypercompiler без связей горячей перезагрузки, используемых в цикле разработки.

## Что попадает из .env в бандл

И `--bundle`, и `--lib` задают для собираемого кода одинаковые значения:

- `import.meta.env.MODE` равен `"production"`, `import.meta.env.PROD` — `true`, а `import.meta.env.DEV` — `false`;
- каждая строка с ключом `MX_` из `<root>/.env` становится `import.meta.env.MX_<name>`; начальный `export` и внешние кавычки удаляются.

В бандл попадают только ключи `MX_`, поэтому секрет в другой строке того же файла туда не попадает. Строка не в формате `KEY=VALUE` отклоняется: `<file>: not KEY=VALUE: <line>`.

## Один файл через --lib

```sh
usage: mx build --lib <entry> --out <file> [--root <dir>] [--external <package>]... [--define <name>=<expression>]... [--minify] [--require-export <name>]...
```

`--lib` собирает одну точку входа в один файл ES-модуля, который страница загружает самостоятельно, например остров. Обязательны и `--lib <entry>`, и `--out <file>`. При успехе выводится:

```text
bundled <entry> -> <out> (<bytes> bytes)
```

Контракт сборки:

- **Один файл.** Разбиения кода нет: динамический импорт встраивается. Если `--out` указывает на каталог, следует отказ `--out <dir> is a directory: --lib writes one file`.
- **Ровно собственные экспорты точки входа.** `--require-export <name>` превращает отсутствие экспорта в отказ: `<entry> does not export <names> (it exports <names>)`.
- **Импорты по имени пакета — по явному выбору.** Пакет `--external` и его подпути сохраняются как импорты по имени, которые должна разрешить карта импортов страницы.
- **Без sid и стилей.** Модули проходят Hypercompiler без sid. Импорт таблицы стилей загружается как пустой модуль, для него ничего не записывается; страницу нужно связать с её стилями отдельно.
- **`--define <name>=<expression>`** дополняет значения `.env`, описанные выше. Значение без `=` — ошибка использования: `--define nope: <name>=<expression>`.

Так собираются острова EDU. `node/apps/edu-boot/bin/build-assets.sh` делает пять вызовов `--lib`; два из них:

```sh
"$mx" build --lib "$fiberfx_dir/phoenix_live_view/src/index.ts" --root "$fiberfx_dir/phoenix_live_view" \
  --out "$dest/phoenix_live_view.js" --minify --external @fiberfx/phoenix --define "LV_VSN=\"$lv_vsn\""
"$mx" build --lib "$apps/edu-island-demo/src/index.tsx" --root "$apps/edu-island-demo" \
  --out "$dest/edu-island-demo.js" --minify --require-export default --require-export hook
```

## Где --lib находит участников

Сборка `--lib` разрешает импорты по имени пакета через участников, как `mx dev`, но по мере обращения к каждому импорту: страницы для предварительного обхода здесь нет. Участники поступают из двух источников:

- **`mx.mod` корня:** каждый каталог, заданный через `replace`;
- **`mx.work` выше по дереву, если он есть:** все участники рабочей области, как их читает `mx resolve`. `replace` сохраняет собственный каталог для своего имени пакета, а корневой каталог не является участником самого себя.

Импорт по имени, которого нет ни у одного участника и который не указан в `--external`, отклоняется с указанием имени; ошибка не откладывается до браузера:

```text
<spec>, imported by <importer>, is provided by no member the root's mx.mod replaces and no --external names it
```

При `MXWORK=off` сборка не видит рабочую область — так релиз собирается изолированно от неё. Если импорт мог бы предоставить участник рабочей области, отказ называет его и способ исправления:

```text
: MXWORK=off leaves out the mx.work whose member <dir> provides <name>. Add `require <module> v0.0.0` and `replace <module> => <relative>` to <root>/mx.mod, or build without MXWORK=off
```

Один пакет из двух каталогов — `replace` и участник рабочей области — отклоняется до разрешения импортов, как в `--lib`, так и в любой другой команде разрешения:

```text
<name> is both <app>'s replace (<dir>) and the mx.work's member (<dir>): remove the replace, or the member from mx.work, or build with MXWORK=off
```

## Карта импортов хоста

Хост — сервер, например приложение Phoenix, который обслуживает модули Mercury из собственных статических файлов. Их перечисляет `mx.json`. Файл проверочного хоста `fiberfx/mx/proof/phoenix-host/mx.json` целиком:

```json
{
  "packages": ["../../../../fiberfx/phoenix", "../../../../fiberfx/phoenix_live_view"],
  "out": "priv/static/mx",
  "base": "/mx/",
  "entries": ["@fiberfx/phoenix", "@fiberfx/phoenix_live_view"]
}
```

`mx.json` принимает пять ключей: `packages`, `mirror`, `base`, `out` и `entries`. Любой другой ключ отклоняется: `mx.json refused: unknown key <key>`. Флаги имеют приоритет над файлом: `--out`, `--base`, `--mirror` и спецификаторы точек входа, переданные аргументами.

Без `out` сборка хоста отказывает с `--out is required`, без точек входа — с `at least one entry specifier is required`. Это отказы. `mx build --help` выводит описание всех трёх видов и завершается с кодом 0.

Порядок работы:

1. **Установить** зависимости точек входа из рабочей области, `mx.mod` или lock-файла хранилища. Этот шаг записывает данные в хранилище.
2. **Сформировать** карту импортов под `base` с хешем целостности каждого модуля.
3. **Скопировать** каждый модуль из карты в `<out>`.
4. **Записать** `<out>/importmap.json` и вывести `build: <n> modules to <out>`.

Карта формируется до копирования, поэтому отказ оставляет `<out>` без изменений.

## mx check и mx run

`mx check` принимает параметры целей хоста и ничего не меняет. Он проверяет хранилище, заново формирует карту и сравнивает:

- `<out>/importmap.json` должен существовать и совпадать с картой, иначе — `… is missing` или `… is not this lock's map`;
- каждый файл модуля должен существовать и иметь тот же sha384, иначе — `… is missing` или `… was altered`.

Любое нарушение приводит к `check refused: <each problem>`. Успех выводит `check: <n> modules in <out> match`.

`mx run <command> [args]` в форме для хоста выполняет сборку, затем передаёт управление команде, сохраняя её сигналы и код завершения. Пример из исходников mx — `mx run mix phx.server`. Если `package.json` в текущем каталоге содержит скрипт с этим именем, `mx run` вместо этого запускает его как кешируемую задачу (MX5).

`build`, `check`, `run` и `resolve` принимают `--mod vendor` и отклоняют другие значения: `mx build: --mod x is not vendor`.

## Поставка

Поставляется результат `mx build`: каталог `<out>` приложения, файл библиотеки или `<out>` хоста. Этот сайт поставляет бандл в три шага, ни один из которых не использует Node:

```sh
env PATH=<mx's dir>:/usr/bin:/bin mx build --bundle --root sites/mercury --out <dist>   # no Node on PATH
mercury-site build --content sites/mercury/content --app <dist> --home node/apps/website --out <tree>
mercury-site serve --tree <tree>
```

`mercury-site` — Go-программа в `go/mercury-site`: она собирает документы сайта вокруг бандла и обслуживает полученное дерево.
