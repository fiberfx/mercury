# Modules, mx.mod and mx.sum — Mercury LMS

> MX1, part one. A Mercury module is a directory with `mx.mod` (Go's go.mod rules) and `mx.sum` (Go's go.sum, `/package.json` for `/go.mod`). Minimum version selection; no lockfile. `mx mod <init|tidy|verify|graph|why|download>` keeps the files.

## Read this when

You add, remove or upgrade a dependency of a Mercury module or app, point a module at a local directory, or debug a `tidy`/`verify` refusal.

## mx.mod verbs

`module`, `mx`, `toolchain`, `require`, `exclude`, `replace`, `retract`. `// indirect` = selected, not asked for directly. `replace <path> => <dir>` = a member served from that directory (no `mx.sum` line).

## Module paths

- Public @fiberfx packages: `registry.npmjs.org/fiberfx/<name>` at `v4.0.0` in the first-page starter. Its module is `example.com/mercury-first-page`.
- Source-workspace examples may use `github.com/fiberfx/mercury/<name>` with local replacements. Do not copy those paths into a public consumer app.
- npm: `registry.npmjs.org/<name without @>`, version with `v`: `registry.npmjs.org/swc/helpers v0.5.23 // indirect`.

## mx.sum lines

`<path> <version> h1:<hash>` and `<path> <version>/package.json h1:<hash>`.

## Commands (usage as mx prints it)

- `usage: mx mod init [module-path]` — from package.json; path = argument or the package name; all four dependency sections at their lower bounds; refuses `mx.mod already exists`; deletes `mx.lock.json`, `mx.pins.json`.
- `usage: mx mod tidy [-e] [--check]` — writes `mx.mod`, `mx.sum`, package.json versions; `-e` past fetch errors; `--check` → `tidy --check: <files> would change`.
- `usage: mx mod verify` — offline; `all modules verified`.
- `usage: mx mod graph` — `<module> <dependency>@<version>` per edge.
- `usage: mx mod why <module>` — `# <module>` + path, or `(main module does not need module <module>)`.
- `usage: mx mod download` — fill the store.
- With `mx.mod` here: `mx install` / `mx verify` take no flags.

## Refusals not to work around

- `one version per module path`
- `SECURITY ERROR: mx.sum has <hash>, and the proxy served <hash>` (`-e` never skips it)

## Environment

`MXPROXY` (default `https://mx.jonnify.com,direct`; GOPROXY syntax) · `MX_STORE` (default `./.mx/store`) · `MXSUMDB` · `MXNOSUMDB` (defaults to `MXPRIVATE`).

## Never emit

Do not replace an mx module's dependency management with npm/pnpm lockfiles or add legacy mx.lock.json/mx.pins.json. Installing the native mx executable through its published npm package is a separate bootstrap operation; it does not replace mx.mod or mx.sum.

## Next

- /mx/workspace
- This companion: /mx/modules/llms.txt

## Navigation

- [Read this page in the browser](/mx/modules)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/mx/llms.txt)
