Hypercompiler — компилятор Mercury для одного модуля: на входе TypeScript, JSX или оба языка; на выходе обычный ES-модуль, работающий на `@fiberfx/hyperscript`. Это Rust-крейт, встроенный в mx. Поэтому каждый модуль, который обслуживает `mx dev` или собирает `mx build`, проходит через тот же код, который запускает `mx compile`.

## Что делает Hypercompiler

- **Преобразует TypeScript и JSX.** Типы удаляются, JSX превращается в вызовы `@fiberfx/hyperscript/jsx-runtime`. Среда выполнения закреплена: комментарий-прагма `@jsx`, запрашивающий другую среду, отклоняется.
- **Определяет язык по расширению.** `.js`, `.jsx`, `.ts` и `.tsx` всегда компилируются как ES-модули. `.cjs` и `.cts` сохраняют свой режим, а `.d.ts` отклоняется: файл деклараций не является исполнимым входом.
- **По запросу добавляет два механизма:** идентичность единиц состояния (`sid`) и связи для разработки, позволяющие модулю с рендерингом заменять себя на месте (`roots`).

## Запуск через mx compile

```sh
usage: mx compile <file> [--options <json>] [--out <file>]
```

- Только один файл: второй вызывает `mx compile: one file, not b as well`.
- `--options <json>` передаёт параметры компилятора в JSON.
- `--out <file>` записывает код в файл вместо stdout. Запись происходит только при успехе.

Ошибки использования завершаются с кодом 2. Если mx не может прочитать файл, это собственный отказ mx: код 1, без JSON.

```text
mx: no-such.ts: No such file or directory (os error 2)
```

## Результат

`fiberfx/hypercompiler/tests/fixtures/native.tsx` — компонент из восьми строк:

```ts
type Props = { label: string; onInput: (event: Event) => void };

export function Field({ label, onInput }: Props) {
  return <>
    <label class="field" for="name">{label}</label>
    <input id="name" class="input" onInput={onInput} onFocusIn={() => undefined} />
  </>;
}
```

`mx compile fiberfx/hypercompiler/tests/fixtures/native.tsx` выводит следующий код и завершается с кодом 0:

```ts
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "@fiberfx/hyperscript/jsx-runtime";
export function Field({ label, onInput }) {
	return _jsxs(_Fragment, { children: [_jsx("label", {
		class: "field",
		for: "name",
		children: label
	}), _jsx("input", {
		id: "name",
		class: "input",
		onInput,
		onFocusIn: () => undefined
	})] });
}
```

Тип удалён, JSX заменён вызовами среды выполнения, а атрибуты передаются как написаны. `mx compile` выводит только код. Полный результат компилятора также содержит карту исходников и версии; `mx test` читает карту, чтобы привязать ошибку к строке исходника.

## Причины отказа

Отказ — один JSON-объект в stderr, пустой stdout и код 1. Файл `fiberfx/hypercompiler/tests/fixtures/invalid.tsx` содержит `export const broken = <div>;`; его компиляция отвечает:

```text
{"filename":"hypercompiler/tests/fixtures/invalid.tsx","details":[{"message":"Unexpected token","labels":[{"start":27,"end":29,"line":1,"column":27}]}],"phase":"parse","kind":"syntax","diagnostics":["\n  x Unexpected token\n   ,----\n 1 | export const broken = <div>;\n   :                            ^^\n   `----\n"]}
```

- **`details`** — сообщения, каждое со своими `labels`. `start` и `end` — смещения в байтах UTF-8; `line` отсчитывается с 1, а `column` — с 0 в единицах UTF-16.
- **`diagnostics`** — те же сообщения, оформленные для терминала.
- **`phase`** — этап остановки, а **`kind`** — категория для обработки инструментом:

| kind | Этапы |
|---|---|
| `syntax` | `parse`, `semantic analysis`, `lowering` |
| `input` | `input`, `policy` |
| `fuse` | `fuse` |
| `internal` | всё остальное |

Параметры тоже проверяются. `--options '{"nope":1}'` вызывает отказ `input`:

```text
{"filename":"hypercompiler/tests/fixtures/native.tsx","details":[{"message":"options: unknown field `nope`, expected `sid` or `roots` at line 1 column 7","labels":[]}],"phase":"input","kind":"input","diagnostics":["options: unknown field `nope`, expected `sid` or `roots` at line 1 column 7"]}
```

В модуле допускаются 256 уровней вложенности и 1024 звена цепочки. Превышение любого предела отклоняется на этапе `input`, до запуска парсера, с одинаковым текстом на всех хостах.

## Два параметра

`--options` принимает только эти два ключа, отклоняя остальные:

```text
{"sid": {"package": "…", "module": "…"}, "roots": {"id": "…"}}
```

- **`sid`** задаёт пакет и модуль для идентичности единиц состояния. Ключ единицы — первые 16 шестнадцатеричных цифр SHA-256 от `mhs-sid/1|<package>|<module>|<kind>|<line>:<column>`. Он зависит от места записи единицы, а не от машины. Сейчас проход sid преобразует только вызовы прежнего пакета состояния; единицы `@fiberfx/hypergraph` он пока не распознаёт.
- **`roots`** предназначен только для разработки. В модуле, импортирующем `render` или `hydrate` из `@fiberfx/hyperscript`, компилятор заменяет их объектом управления корнем из `@fiberfx/hyperscript/hmr` (`trackRoots(id, {render, hydrate})`), и модуль принимает собственные обновления. Тогда результат содержит `hmrRoot: true`. Остальные модули не меняются. Добавленные инструкции не имеют диапазонов исходного текста, поэтому карта исходников по-прежнему описывает только написанный вами код.

## Что передают mx dev и mx build

| Команда | `sid` | `roots` |
|---|---|---|
| `mx dev` | пакет и путь модуля | `{"id": <the module's URL>}` |
| `mx build --bundle` | пакет и путь модуля | нет |
| `mx build --lib` | нет | нет |

Пакет — путь модуля приложения из `mx.mod`, а модуль — путь файла относительно корня. Для файла участника, выполняемого из исходников, используются имя пакета участника и путь внутри его каталога.

При mx dev добавленные связи защищены условием `if (import.meta.hot)`, поэтому модуль выполняется как написан, пока клиент горячей замены не предоставит контекст. В бандле этих связей нет. MX2 объясняет, как mx dev по `hmrRoot` определяет, какие правки применять на месте.

До переноса этого взаимодействия на Hypergraph (mercury.hypergraph.2) связи для разработки импортируют вспомогательный код из прежнего пакета состояния. Поэтому приложение с рендерингом указывает этот пакет как участника при работе с mx dev.

## Чего он не делает

- **Не проверяет типы.** Типы удаляются без проверки.
- **Не оптимизирует.** Синтаксис преобразуется, но код не минифицируется. Файл библиотеки минифицирует `mx build --lib --minify`.
- **Не разрешает импорты.** Компилятор оставляет их как написаны. Разрешением занимается mx: при mx dev — через карту импортов страницы, в бандле — через участников.
