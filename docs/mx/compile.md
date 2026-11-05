The Hypercompiler is Mercury's compiler for one module: TypeScript, JSX, or both, in; a plain ES module that runs on `@fiberfx/hyperscript`, out. It is a Rust crate linked into mx, so every module `mx dev` serves and `mx build` bundles goes through the same code that `mx compile` runs.

## What the Hypercompiler does

- **It lowers TypeScript and JSX.** Types are stripped, and JSX becomes calls into `@fiberfx/hyperscript/jsx-runtime`. That runtime is fixed: a `@jsx` pragma comment asking for another one is refused.
- **It reads the language from the extension.** `.js`, `.jsx`, `.ts` and `.tsx` always compile as ES modules. `.cjs` and `.cts` keep their own mode, and a `.d.ts` is refused, because a declaration file is not an executable input.
- **On request, it adds two things:** identity for state units (`sid`), and the development wiring that lets a rendering module replace itself in place (`roots`).

## Run it with mx compile

```sh
usage: mx compile <file> [--options <json>] [--out <file>]
```

- One file, and only one: a second gives `mx compile: one file, not b as well`.
- `--options <json>` passes the compiler's options as JSON.
- `--out <file>` writes the code to a file instead of stdout. It is written only on success.

The usage errors exit 2. A file mx can't read is mx's own refusal, with exit 1 and no JSON:

```text
mx: no-such.ts: No such file or directory (os error 2)
```

## What comes out

`fiberfx/hypercompiler/tests/fixtures/native.tsx` is an eight-line component:

```ts
type Props = { label: string; onInput: (event: Event) => void };

export function Field({ label, onInput }: Props) {
  return <>
    <label class="field" for="name">{label}</label>
    <input id="name" class="input" onInput={onInput} onFocusIn={() => undefined} />
  </>;
}
```

`mx compile fiberfx/hypercompiler/tests/fixtures/native.tsx` prints this, and exits 0:

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

The type is gone, the JSX is runtime calls, and the attributes pass through as written. `mx compile` prints only the code. The compiler's full result also carries a source map and its versions; `mx test` reads the map to point a failure back at its source line.

## What it refuses

A refusal is one JSON object on stderr, with nothing on stdout and exit 1. `fiberfx/hypercompiler/tests/fixtures/invalid.tsx` is `export const broken = <div>;`, and compiling it answers:

```text
{"filename":"hypercompiler/tests/fixtures/invalid.tsx","details":[{"message":"Unexpected token","labels":[{"start":27,"end":29,"line":1,"column":27}]}],"phase":"parse","kind":"syntax","diagnostics":["\n  x Unexpected token\n   ,----\n 1 | export const broken = <div>;\n   :                            ^^\n   `----\n"]}
```

- **`details`** are the messages, each with its `labels`. `start` and `end` are UTF-8 byte offsets, `line` is 1-based, and `column` is 0-based UTF-16.
- **`diagnostics`** are the same messages rendered for a terminal.
- **`phase`** is where it stopped, and **`kind`** is what a tool acts on:

| kind | phases |
|---|---|
| `syntax` | `parse`, `semantic analysis`, `lowering` |
| `input` | `input`, `policy` |
| `fuse` | `fuse` |
| `internal` | anything else |

Options are checked too. `--options '{"nope":1}'` is an `input` refusal:

```text
{"filename":"hypercompiler/tests/fixtures/native.tsx","details":[{"message":"options: unknown field `nope`, expected `sid` or `roots` at line 1 column 7","labels":[]}],"phase":"input","kind":"input","diagnostics":["options: unknown field `nope`, expected `sid` or `roots` at line 1 column 7"]}
```

A module may nest 256 levels and chain 1,024 links. Past either it is refused in phase `input`, before the parser runs, with the same text on every host.

## The two options

`--options` takes at most these two keys, and refuses any other:

```text
{"sid": {"package": "…", "module": "…"}, "roots": {"id": "…"}}
```

- **`sid`** names the package and the module, for unit identity. A unit's key is the first 16 hex of SHA-256 over `mhs-sid/1|<package>|<module>|<kind>|<line>:<column>`, so it depends on where the unit is written and not on the machine. Today the sid pass lowers the calls of the legacy state package only; it does not recognize `@fiberfx/hypergraph`'s units yet.
- **`roots`** is development only. In a module that imports `render` or `hydrate` from `@fiberfx/hyperscript`, the compiler swaps them for a handle from `@fiberfx/hyperscript/hmr` (`trackRoots(id, {render, hydrate})`), and the module accepts its own updates. The result then says `hmrRoot: true`. Any other module is left alone. The added statements carry no source spans, so the source map still describes only what you wrote.

## What mx dev and mx build pass

| Command | `sid` | `roots` |
|---|---|---|
| `mx dev` | the package and the module's path | `{"id": <the module's URL>}` |
| `mx build --bundle` | the package and the module's path | none |
| `mx build --lib` | none | none |

The package is the app's `mx.mod` module path, and the module is the file's path below the root. For a member's file that runs from source, they are the member's package name and its path below the member.

Under mx dev, the wiring is guarded by `if (import.meta.hot)`, so a module runs as written until the hot client gives it a context. A bundle carries no wiring at all. MX2 covers how mx dev uses `hmrRoot` to decide which edits are applied in place.

Until the seam moves to Hypergraph (mercury.hypergraph.2), the development wiring imports a helper from the legacy state package. That is why a rendering app lists that package as a member under mx dev.

## What it does not do

- **No type checking.** Types are removed, not checked.
- **No optimizer.** The output is lowered, not minified. `mx build --lib --minify` minifies a library's file.
- **No resolution.** The compiler leaves imports as written. mx resolves them: under mx dev through the page's import map, in a bundle through its members.
