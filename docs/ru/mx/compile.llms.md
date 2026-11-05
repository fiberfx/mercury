# Hypercompiler: по одному модулю — Mercury LMS

> MX4. Hypercompiler встроен в mx: на входе TS/JSX, на выходе ES-модуль со средой выполнения `@fiberfx/hyperscript/jsx-runtime`. `mx compile` обрабатывает один файл; mx dev и mx build — каждый модуль. Отказ — один JSON `CompileError` в stderr.

## Когда читать

Чтобы увидеть код модуля, который получает браузер, разобрать отказ компиляции или узнать параметры, передаваемые mx компилятору.

## Использование в выводе mx

`usage: mx compile <file> [--options <json>] [--out <file>]`

- Успех: код в stdout или `--out`, записываемый только при успехе; код 0.
- Отказ компиляции: JSON `CompileError` в stderr, пустой stdout, код 1.
- Собственный отказ mx при нечитаемом файле: `mx: <file>: <error>`, код 1, без JSON.
- Ошибки использования: `a file is required`, `one file, not <x> as well`, `--out needs a value`, `--out given twice`, `unknown flag <flag>` (код 2).

## CompileError

`{filename, details: [{message, labels: [{start, end, line, column}]}], phase, kind, diagnostics}`. Смещения в байтах UTF-8, `line` с 1, `column` с 0 в единицах UTF-16. `kind`: `syntax` (разбор, семантический анализ, преобразование) · `input` (входные данные, политика) · `fuse` · `internal`.

## Политика

- Среда выполнения JSX закреплена за `@fiberfx/hyperscript`; любой комментарий-прагма `@jsx` → отказ `policy`.
- `.js/.jsx/.ts/.tsx` — ES-модули; `.cjs/.cts` сохраняют свой режим; `.d.ts` → `declaration files are not executable inputs`.
- 256 уровней вложенности, 1024 звена цепочки; превышение → `input`, до разбора.
- Нет проверки типов, оптимизатора и разрешения импортов.

## Параметры

`{"sid": {"package", "module"}, "roots": {"id"}}`; неизвестные ключи → `input` (`expected \`sid\` or \`roots\``).

- `sid`: ключ — первые 16 шестнадцатеричных цифр SHA-256 от `mhs-sid/1|<package>|<module>|<kind>|<line>:<column>`. Преобразуются только вызовы прежнего пакета состояния; `@fiberfx/hypergraph` пока не поддерживается.
- `roots`: только разработка. Модуль, импортирующий `render`/`hydrate` из `@fiberfx/hyperscript`, получает `trackRoots` из `@fiberfx/hyperscript/hmr` и `hmrRoot: true`; остальные модули не меняются.

## Что передаёт mx

- mx dev: `sid` + `roots {id: <URL>}`.
- mx build --bundle: только `sid`.
- mx build --lib: ничего.

## Не выдавать

Прагмы `/** @jsx h */` или `/** @jsxImportSource … */`, шаг `tsc`/Babel/esbuild перед mx или `.d.ts` в качестве точки входа.

## Далее

- MX5, инструменты: /ru/mx/tools
- Эта текстовая версия: /ru/mx/compile/llms.txt

## Навигация

- [Страница в браузере](/ru/mx/compile)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/mx/llms.txt)
