# Рабочая область: mx.work — Mercury LMS

> MX1, часть вторая. `mx.work` (Go go.work с заменой `go` на `mx`) объединяет совместно разрабатываемые модули; каждый участник находит остальные в их каталогах. Рабочая область Mercury — `fiberfx/mx.work`, восемнадцать участников. `mx work edit|use|init|sync|vendor`.

## Когда читать

При работе одновременно с несколькими модулями Mercury, добавлении модуля в рабочую область, проверке выбранных версий или копировании её зависимостей в vendor.

## Файл

Директивы: `mx`, `toolchain`, `use`, `replace`. Участник — каталог, в котором `package.json` содержит `name`. Рядом: `mx.work.sum` (только строки, которых нет ни в одном `mx.sum` участников), при необходимости `vendor/`.

## Поиск

`-workfile <path>` → `MXWORK` (`off` — отключено; иначе абсолютный путь; `auto` — поиск) → ближайший `mx.work` в текущем каталоге или выше. Не найден: `mx: no mx.work file found`. Если у всех участников рабочей области есть `mx.mod`, `mx install`/`mx verify` работают со всей областью.

## Команды

- `usage: mx work edit|use|init|sync|vendor …`
- `mx work init [dir]...` — отказывает с `<path> already exists`, если область уже есть здесь или выше.
- `mx work use [-r] [dir]...` — добавляет каталоги с package.json, удаляет из списка каталоги без него; `-r` пропускает `vendor`, `node_modules`, `.mx`. Пересоздание рабочей области Mercury: `mx work use ./*/` в `fiberfx/`.
- `mx work edit` — чтение: `-print`, `-json` (`Mx`, `Use[].DiskPath`, `Selected`; флаги несовместимы). Запись: `-use`, `-dropuse`, `-replace old[@v]=new[@w]`, `-dropreplace old[@v]`, `-mx`, `-toolchain` (`none` удаляет), `-fmt`, `-workfile`. Правка с `-print`/`-json` только показывает результат.
- `mx work sync` — выбор минимальных версий (MVS) по `mx.mod` участников; повышает их `require`; всё или ничего.
- `usage: mx work vendor [-o outdir]` — по умолчанию `vendor/` рядом с `mx.work`; отказ: `refusing to replace <dir>: it holds the workspace`.
- `--mod vendor` для `mx build`/`check`/`run`/`resolve`; другое значение: `--mod <value> is not vendor`.

## Флаги

Один дефис, как в Go (`-json`); `--json` и `-name=value` также допустимы. Неизвестный флаг: `mx: flag provided but not defined: -<name>` (код 2). edit без флагов: `mx: no flags specified (see 'mx work edit')`.

## Не выдавать

`pnpm-workspace.yaml`, `workspaces` в корневом package.json или зависимости `link:`/`workspace:` для модуля Mercury.

## Далее

- MX2, цикл разработки и HMR: /ru/mx/dev
- Эта текстовая версия: /ru/mx/workspace/llms.txt

## Навигация

- [Страница в браузере](/ru/mx/workspace)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/mx/llms.txt)
