Остров поставляется как один файл ES-модуля, который страница импортирует по URL. В этом уроке собираем острова EDU так же, как их собирает образ: с mx и без Node.

## mx build --lib

`mx build --lib` собирает одну точку входа в один файл ES-модуля, который страница может загрузить самостоятельно:

```sh
mx build --lib <entry> --out <file> [--root <dir>] [--external <package>]... \
  [--define <name>=<expression>]... [--minify] [--require-export <name>]...
```

| Флаг | Назначение |
|---|---|
| `--lib <entry>` | файл точки входа; обязателен |
| `--out <file>` | единственный выходной файл; обязателен |
| `--root <dir>` | корневой каталог для разрешения импортов; по умолчанию `.` |
| `--external <package>` | оставляет пакет и его подпути импортами по имени для карты импортов страницы |
| `--define <name>=<expression>` | заменяет `name` выражением во время сборки |
| `--minify` | минифицирует результат |
| `--require-export <name>` | отклоняет бандл, если он не экспортирует `name`; можно указать несколько раз |

Для каждой сборки с `--lib` действуют три правила:

- **Импорты разрешаются из исходников.** mx разрешает каждый встреченный импорт так же, как `mx dev`: из исходников модуля, если они доступны. Каждый модуль проходит через Hypercompiler без sid.
- **Таблица стилей принадлежит странице.** Импорт CSS загружается как пустой модуль и не создаёт выходного файла: страница подключает свою таблицу стилей.
- **Один файл.** Сборка, которая должна создать более одного чанка, завершается ошибкой; `--lib` нельзя сочетать с `--bundle` или `--host`.

`--require-export` — статическая часть проверки, от которой зависит загрузчик EDU: ему нужны экспорты `default` и `hook` каждого острова. Если имени нет, сборка завершается ошибкой, перечисляет недостающие и доступные экспорты точки входа и ничего не записывает:

```text
<entry> does not export <missing names> (it exports <the names it has>)
```

## Модули острова в mx.mod

mx находит импортируемые островом пакеты через его `mx.mod`: файл перечисляет все модули, достижимые в графе импортов, и каталог каждого из них. Вот файл демонстрационного острова:

```text
module jonnify.com/node/edu-island-demo

mx 0.1.0

require (
	github.com/fiberfx/mercury/core v3.0.0
	github.com/fiberfx/mercury/hyperscript v3.0.0
	github.com/fiberfx/mercury/live-mercury v3.0.0
	github.com/fiberfx/mercury/phoenix v3.0.0
	github.com/fiberfx/mercury/phoenix_live_view v3.0.0
	jonnify.com/node/edu-boot v0.0.0
)

replace (
	github.com/fiberfx/mercury/core => ../../../fiberfx/core
	github.com/fiberfx/mercury/hyperscript => ../../../fiberfx/hyperscript
	github.com/fiberfx/mercury/live-mercury => ../../../fiberfx/live-mercury
	github.com/fiberfx/mercury/phoenix => ../../../fiberfx/phoenix
	github.com/fiberfx/mercury/phoenix_live_view => ../../../fiberfx/phoenix_live_view
	jonnify.com/node/edu-boot => ../edu-boot
)
```

Каждый `replace` указывает на каталог модуля в этом репозитории, поэтому менеджер пакетов и lock-файл в сборке не участвуют. Импорт острова `import { courseIsland } from "@echd/edu-boot/island"` разрешается в `node/apps/edu-boot`; его `package.json` направляет экспорт `./island` в `./src/island.ts`.

## Пять сборок

`node/apps/edu-boot/bin/build-assets.sh <dest>` создаёт все файлы, необходимые островам EDU: по одному вызову `mx build --lib` на файл. `MX` задаёт исполняемый файл mx; по умолчанию используется `mx` из PATH.

| Выходной файл | Точка входа | Флаги |
|---|---|---|
| `phoenix.js` | `fiberfx/phoenix/src/index.ts` | `--minify` |
| `phoenix_live_view.js` | `fiberfx/phoenix_live_view/src/index.ts` | `--minify --external @fiberfx/phoenix --define LV_VSN="<version>"` |
| `edu-boot.js` | `node/apps/edu-boot/src/app.ts` | `--minify`, пара phoenix и `phoenix` остаются внешними |
| `edu-island-demo.js` | `node/apps/edu-island-demo/src/index.tsx` | `--minify --require-export default --require-export hook` |
| `edu-island-kan.js` | `node/apps/edu-island-kan/src/index.tsx` | `--minify --require-export default --require-export hook --require-export KanFigure` |

Внешние импорты позволяют использовать один Socket на странице. `phoenix_live_view.js` и `edu-boot.js` импортируют `@fiberfx/phoenix` по имени; карта импортов страницы разрешает его в `phoenix.js`, поэтому все модули используют одну копию. У острова внешних импортов нет: каждый включает собственные hyperscript и Live Mercury, чтобы жизненный цикл и отрисовываемый компонент работали с одной копией. `LV_VSN` берётся из поля version в `fiberfx/phoenix_live_view/package.json` перед сборкой.

```sh
mx build --lib "$apps/edu-island-demo/src/index.tsx" --root "$apps/edu-island-demo" \
  --out "$dest/edu-island-demo.js" --minify --require-export default --require-export hook
```

## От бандлов к статическим ресурсам

`scripts/edu/build-islands.sh` выполняет пять сборок в `echo/apps/echo_edu/priv/static/edu`, затем копирует `mercury.css` и шрифты `.woff2` из каталога `priv/static` приложения EchoCms. Скрипт завершается ошибкой, если хотя бы один из файлов `phoenix.js`, `phoenix_live_view.js`, `edu-boot.js`, `edu-island-demo.js`, `edu-island-kan.js` и `mercury.css` отсутствует или пуст.

```sh
scripts/edu/build-islands.sh
```

Бандлы создаются при сборке и не попадают в коммиты: `priv/static/edu` исключён из Git. echo_edu отдаёт их по пути `/_edu/assets`: туда указывает карта импортов для пары phoenix, и там `EchoEduWeb.Island.bundle_url("demo")` находит `edu-island-demo.js`.

## Что делает образ echd-os

`echo/Dockerfile` собирает острова на отдельном этапе `edu-islands`, основанном на `rust:1.97.0-bookworm`. Он копирует `fiberfx`, `node`, `scripts/edu/build-islands.sh` и каталог `priv/static` приложения EchoCms, затем выполняет:

```sh
cd fiberfx/mx && cargo build --release --locked --bin mx
! command -v node && mkdir -p echo/apps/echo_edu/priv/static \
 && MX=/src/fiberfx/mx/target/release/mx bash scripts/edu/build-islands.sh
```

Проверка `! command -v node` подтверждает отсутствие Node: этап завершается ошибкой, если `node` есть в PATH, значит, собранным здесь островам он не требовался. Этап сборки Elixir копирует результат в `apps/echo_edu/priv/static/edu` перед `mix release echd_os`, поэтому бандлы входят в релиз.

Этап выполнения образа основан на `node:<version>-bookworm-slim`. Dockerfile сохраняет там `node` для будущего воркера рядом с релизом BEAM; как инструмент сборки он не используется, и JavaScript на этом этапе не собирается.

## При разработке

При разработке `bundle_url(name)` может указывать на исходную точку входа острова на сервере Vite вместо готового файла: это задаётся через `EDU_ISLAND_DEV` (`name=url,…`, значение читается в `:island_dev_urls`). Загрузчик распознаёт такую точку входа по форме: абсолютный URL http(s), путь которого заканчивается на `.ts` или `.tsx`. Перед импортом он устанавливает клиент HMR Vite с того же origin, чтобы изменения острова применялись на месте на странице, которой Vite не управляет. Если сервер разработки недоступен, это предупреждение, а не ошибка. Этот путь использует Vite; описанная выше сборка его не использует.

## Что mx пока не собирает

Представления KAN в echd_os не используют эти сборки. Их бандл `kan.mjs` хранится в Git в каталоге `priv/static` приложения echd_os, и образ не собирает для него JavaScript. Бандл создаёт `node/apps/echd-os/bin/kan-build.sh`, которому нужен pnpm: он проверяет типы с помощью `tsc`, запускает тесты островов через Vitest и собирает `kan.mjs` с помощью Vite.
