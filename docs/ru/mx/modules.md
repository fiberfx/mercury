Модуль — каталог с файлом `mx.mod`. Исходные модули Mercury и нативные приложения — модули mx. mx применяет к ним единые правила Go, а пакеты npm выступают модулями, от которых они зависят.


Для внешнего приложения начните с закреплённых файлов [первой страницы](/ru/mx/first-app). Они используют `registry.npmjs.org/fiberfx/core`, `registry.npmjs.org/fiberfx/hyperscript` и `registry.npmjs.org/fiberfx/ui` версии `v4.0.0`; модуль приложения — `example.com/mercury-first-page`. Пример ниже показывает исходную рабочую область с локальными заменами. Её пути `github.com/fiberfx/mercury/*` нельзя переносить в публичное приложение как адреса загрузки.

## Два файла без lock-файла

- **`mx.mod`** описывает модуль и его потребности: путь, версию mx, необходимые модули с минимальными версиями и правила их корректировки.
- **`mx.sum`** задаёт ожидаемый хеш каждого загруженного модуля. Это файл контрольных сумм, а не lock-файл: версии определяются по `mx.mod` алгоритмом выбора минимальных версий, а `mx.sum` лишь закрепляет их байтовое содержимое.

Рядом нет ни `mx.lock.json`, ни `mx.pins.json`: `mx mod init` удаляет их, если находит.

## Строки mx.mod

Директивы взяты из Go: `module`, `mx`, `toolchain`, `require`, `exclude`, `replace` и `retract`. Вот реальный пример — файл `node/apps/edu-boot/mx.mod` целиком:

```text
module jonnify.com/node/edu-boot

// mx build --lib's members (mercury.mx.18): every module this island's import graph reaches, each
// by directory, so EDU's islands build natively with no pnpm root (the Operator, 2026-11-04).

mx 0.1.0

require (
	github.com/fiberfx/mercury/core v3.0.0
	github.com/fiberfx/mercury/hyperscript v3.0.0
	github.com/fiberfx/mercury/live-mercury v3.0.0
	github.com/fiberfx/mercury/phoenix v3.0.0
	github.com/fiberfx/mercury/phoenix_live_view v3.0.0
)

replace (
	github.com/fiberfx/mercury/core => ../../../fiberfx/core
	github.com/fiberfx/mercury/hyperscript => ../../../fiberfx/hyperscript
	github.com/fiberfx/mercury/live-mercury => ../../../fiberfx/live-mercury
	github.com/fiberfx/mercury/phoenix => ../../../fiberfx/phoenix
	github.com/fiberfx/mercury/phoenix_live_view => ../../../fiberfx/phoenix_live_view
)
```

- **`module`** — путь модуля.
- **`mx`** — версия mx, для которой написан файл.
- **`require`** перечисляет необходимые модули и их минимальные версии. Строка с `// indirect` обозначает модуль, выбранный графом зависимостей, который сам текущий модуль напрямую не запрашивает.
- **`replace … => <dir>`** направляет модуль в каталог на этом диске. Для приложения эти каталоги — участники, исходники которых обслуживают `mx dev` и `mx build`.
- **`exclude`** исключает одну версию из рассмотрения. В `fiberfx/ui/mx.mod` есть такая строка с объяснением:

```text
exclude registry.npmjs.org/fsevents v2.3.2 // playwright pins 2.3.2 exactly and rollup asks ~2.3.3, and a path has one version
```

## Пути модулей

В файлах Mercury встречаются два вида путей:

- **Собственные модули Mercury** — `github.com/fiberfx/mercury/<name>`, например `github.com/fiberfx/mercury/hypergraph` в `fiberfx/hypergraph/mx.mod`.
- **Пакет npm** — `registry.npmjs.org/` и его имя без `@`: так, `@swc/helpers` становится `registry.npmjs.org/swc/helpers`. Версии записываются в формате Go, с `v`: `registry.npmjs.org/swc/helpers v0.5.23 // indirect`.

## mx.sum

Каждой версии модуля соответствуют две строки в формате Go `h1:`: одна для файлов, другая для манифеста, с `/package.json` там, где Go использует `/go.mod`. Из `fiberfx/conformance/fixture/mx.sum`:

```text
registry.npmjs.org/internationalized/date v3.12.4 h1:2mSClM125/h7E9tYWyl7gbM5GDTnBZUnmlm+LfAH8w0=
registry.npmjs.org/internationalized/date v3.12.4/package.json h1:/VQAfoov1XUXQNDnyrLAssJp+LBXaOu4MYD/jEBhY9o=
```

У модуля, чей `replace` указывает на каталог, строки нет: его байты уже находятся на этом диске.

## Команды mx mod

`mx mod` без команды выводит строку использования:

```sh
usage: mx mod <init|tidy|verify|graph|why|download>
```

| Строка использования в выводе mx | Действие |
|---|---|
| `usage: mx mod init [module-path]` | Создаёт `mx.mod` из `package.json`. Путь берётся из аргумента, иначе из имени пакета: без явного пути `@fiberfx/x` становится `registry.npmjs.org/fiberfx/x`. Каждая зависимость в `dependencies`, `peerDependencies`, `optionalDependencies` и `devDependencies` задаётся по нижней границе своего диапазона. Отказывает с `mx.mod already exists`. Удаляет `mx.lock.json` и `mx.pins.json`. |
| `usage: mx mod tidy [-e] [--check]` | Согласует требования алгоритмом выбора минимальных версий и записывает соответствующие `mx.mod`, `mx.sum` и версии зависимостей в `package.json`. `-e` позволяет продолжить после ошибки загрузки модуля. `--check` ничего не записывает и завершается с ошибкой `tidy --check: <files> would change`. |
| `usage: mx mod verify` | Без сети сверяет каждый выбранный модуль в хранилище с `mx.sum` и выводит `all modules verified`. |
| `usage: mx mod graph` | Выводит граф требований от главного модуля: одна строка `<module> <dependency>@<version>` на ребро. |
| `usage: mx mod why <module>` | Выводит `# <module>`, затем кратчайший путь от главного модуля или `(main module does not need module <module>)`. |
| `usage: mx mod download` | Загружает в хранилище все модули, выбранные графом. Обе строки `mx.sum` каждого модуля ищутся до любой записи; если строки нет, команда отказывает, сохраняя хранилище без изменений. Модуль пропускается, если его манифест задаёт os, cpu или libc, не соответствующие этому хосту. |

`tidy` отказывает в двух случаях, которые нельзя обходить:

- `one version per module path`: после выбора остались две версии одного пути;
- `SECURITY ERROR: mx.sum has <hash>, and the proxy served <hash>`: байты уже имеющейся версии изменились. `-e` никогда не пропускает эту ошибку.

Если в каталоге есть `mx.mod`, команды `mx install` и `mx verify` тоже читают его и не принимают флагов: `usage: mx install: with mx.mod it takes no flags, and installs through MXPROXY`.

## Откуда берутся модули

- **Прокси.** `MXPROXY` — список с синтаксисом `GOPROXY`, по умолчанию `https://mx.jonnify.com,direct`. После `,` переход к следующему элементу происходит только при 404 или 410; после `|` — при любом сбое. `off` и `direct` завершают список, а путь обозначает дерево каталогов на этом диске. Протокол взят из Go: `.tgz` используется там, где Go использует `.zip`, а `.manifest` — там, где он использует `.mod`.
- **Хранилище.** Загруженные данные распаковываются в `MX_STORE`, по умолчанию `./.mx/store`.
- **База контрольных сумм.** Строка, которой ещё нет в `mx.sum`, проверяется перед записью по базе, заданной через `MXSUMDB`, если только `MXNOSUMDB` не исключает этот модуль. По умолчанию `MXNOSUMDB` равен `MXPRIVATE`, как `GONOSUMDB` равен `GOPRIVATE`. Если модуль принят без проверки, stderr сообщает его имя: `tidy: MXNOSUMDB skipped the checksum database for <module@version>`.

Следующая страница объединяет несколько модулей в одну [рабочую область](/ru/mx/workspace).
