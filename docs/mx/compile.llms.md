# The Hypercompiler, one module at a time — Mercury LMS

> MX4. The Hypercompiler is linked into mx: TS/JSX in, an ES module on `@fiberfx/hyperscript/jsx-runtime` out. `mx compile` runs it on one file; mx dev and mx build run it on every module. Refusals are one `CompileError` JSON on stderr.

## Read this when

You need to see what the browser gets for a module, read a compile refusal, or know which options mx passes to the compiler.

## Usage (as mx prints it)

`usage: mx compile <file> [--options <json>] [--out <file>]`

- Success: the code on stdout (or `--out`, written only on success), exit 0.
- Compile refusal: `CompileError` JSON on stderr, nothing on stdout, exit 1.
- mx's own refusal (file unreadable): `mx: <file>: <error>`, exit 1, no JSON.
- Usage: `a file is required`, `one file, not <x> as well`, `--out needs a value`, `--out given twice`, `unknown flag <flag>` (exit 2).

## CompileError

`{filename, details: [{message, labels: [{start, end, line, column}]}], phase, kind, diagnostics}`. Offsets are UTF-8 bytes, `line` 1-based, `column` 0-based UTF-16. `kind`: `syntax` (parse, semantic analysis, lowering) · `input` (input, policy) · `fuse` · `internal`.

## Policy

- JSX runtime fixed to `@fiberfx/hyperscript`; any `@jsx` pragma comment → `policy` refusal.
- `.js/.jsx/.ts/.tsx` are ES modules; `.cjs/.cts` keep their mode; `.d.ts` → `declaration files are not executable inputs`.
- 256 nesting levels, 1,024 chain links; past either → `input`, before parsing.
- No type checking, no optimizer, no import resolution.

## Options

`{"sid": {"package", "module"}, "roots": {"id"}}`; unknown keys → `input` (`expected \`sid\` or \`roots\``).

- `sid`: key = first 16 hex of SHA-256 of `mhs-sid/1|<package>|<module>|<kind>|<line>:<column>`. It lowers the legacy state package's calls only; not `@fiberfx/hypergraph` yet.
- `roots`: dev only. A module importing `render`/`hydrate` from `@fiberfx/hyperscript` gets `trackRoots` from `@fiberfx/hyperscript/hmr` and `hmrRoot: true`; other modules are untouched.

## What mx passes

- mx dev: `sid` + `roots {id: <URL>}`.
- mx build --bundle: `sid` only.
- mx build --lib: nothing.

## Never emit

`/** @jsx h */` or `/** @jsxImportSource … */` pragmas, a `tsc`/Babel/esbuild step before mx, or a `.d.ts` as an entry.

## Next

- MX5 tools: /mx/tools
- This companion: /mx/compile/llms.txt

## Navigation

- [Read this page in the browser](/mx/compile)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/mx/llms.txt)
