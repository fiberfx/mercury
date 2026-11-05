# Build and ship, three kinds of build — Mercury LMS

> MX3. `mx build` makes an app's page (`--bundle` → a directory), one ES module file (`--lib` → a file), or a host's import map (`mx.json` → `importmap.json` + modules). `mx check` verifies a host's output; `mx run` builds then execs. Rolldown runs inside mx; no Node.

## Read this when

You bundle an app or an island, build a host's static modules, verify them before a deploy, or hit a `--lib` member refusal.

## Usage (as mx prints it)

- `usage: mx build [--bundle] [--root <dir>] [--out <dir>]` → `bundled <entry> -> <out>`
- `usage: mx build --lib <entry> --out <file> [--root <dir>] [--external <package>]... [--define <name>=<expression>]... [--minify] [--require-export <name>]...` → `bundled <entry> -> <out> (<bytes> bytes)`
- Host: `--out` (or mx.json `out`), entries as arguments (or mx.json `entries`), `--base`, `--mirror`; → `build: <n> modules to <out>`

## Bundle env

`import.meta.env.MODE` = `"production"`, `PROD` = `true`, `DEV` = `false`; `.env`'s `MX_*` keys only.

## --lib rules

One file (no splitting; dynamic imports inlined; `--out` a directory is refused). Exact entry exports (`--require-export`). `--external` stays bare. No sids. Stylesheet imports are empty. Members = the root's mx.mod replaces + the mx.work's members.

## --lib refusals

- `<spec>, imported by <importer>, is provided by no member the root's mx.mod replaces and no --external names it`
- under `MXWORK=off`, plus: `: MXWORK=off leaves out the mx.work whose member <dir> provides <name>. Add \`require <module> v0.0.0\` and \`replace <module> => <relative>\` to <root>/mx.mod, or build without MXWORK=off`
- `<name> is both <app>'s replace (<dir>) and the mx.work's member (<dir>): remove the replace, or the member from mx.work, or build with MXWORK=off`
- `<entry> does not export <names> (it exports <names>)`

## Host

mx.json keys: `packages`, `mirror`, `base`, `out`, `entries` (others: `mx.json refused: unknown key <key>`). Steps: install (writes the store) → render map (sha384 each) → copy → `<out>/importmap.json`.

## mx check / mx run

- check: `check refused: … is missing | is not this lock's map | was altered`; pass: `check: <n> modules in <out> match`.
- `mx run <command>`: build, then exec (e.g. `mx run mix phx.server`); a package.json script name runs as a task instead.
- `--mod vendor` only; else `mx <cmd>: --mod <v> is not vendor`.

## Never emit

`vite build`, `tsdown`, `esbuild`, `rollup -c`, or `npm run build` for a Mercury app or island.

## Next

- MX4 the Hypercompiler: /mx/compile
- This companion: /mx/build/llms.txt

## Navigation

- [Read this page in the browser](/mx/build)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/mx/llms.txt)
