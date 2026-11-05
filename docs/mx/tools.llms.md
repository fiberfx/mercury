# The tools, test, lsap and run — Mercury LMS

> MX5. `mx test` runs a module's tests in a headless Chromium mx starts itself, with mx's own runtime answering `vitest` imports. `mx lsap` starts `hyperscript-lsap` from beside mx. `mx run` runs a package.json script as a cached task, or builds a host and becomes a command.

## Read this when

You write or run tests for a Mercury module, set up the language server, or cache a script.

## mx test

- `usage: mx test [--root <dir>] [--timeout <seconds>] [--filter <words>]`
- Files: `*.test.*` / `*.spec.*` with `js mjs jsx ts mts tsx`; never in `node_modules`, `dist`, `target`, `coverage`.
- Browser: `MX_BROWSER`, else the newest Playwright Chromium, then headless shell (`PLAYWRIGHT_BROWSERS_PATH`, `~/Library/Caches/ms-playwright`, `~/.cache/ms-playwright`).
- `--timeout` = whole run (default 120 s). Per test 5 s, per hook 10 s. A page silent 30 s past those is a stall.
- `--filter` = substring of `<file> > <name>`.
- Exit: 0 all passed · 1 failed / none ran / broke · 2 usage · 3 no browser (never a pass).
- Output: `ok    <file> > <name>`, `skip  …`, `FAIL  <file> > <name>: <message>`, `mx test: P passed, F failed, of T`.

## The vitest runtime (mx's own)

`describe`, `it`, `test`, `beforeAll`, `afterAll`, `beforeEach`, `afterEach`, `expect`, `vi` (`fn`, `spyOn`, `stubGlobal`, fake timers, `setSystemTime`), `expectTypeOf`, `assertType` (no-ops at run time), `visit`. No `vi.mock`: it throws.

`visit(url, { width, height, scale, mobile, scheme, ready })` → `{ id, evaluate(fn, ...args), close() }`; `ready` is a CSS selector; `scheme` sets `prefers-color-scheme`.

## mx lsap

- `usage: mx lsap [--mcp] | mx lsap --version`
- A release ships `hyperscript-lsap-<target>` beside `mx-<target>`; install it beside mx as `hyperscript-lsap`. Not on Windows: a Windows release ships mx alone, and `mx lsap` refuses with "The language server isn't built for Windows in this release".
- Starts `hyperscript-lsap` from mx's own directory only; sets `HYPERSCRIPT_LSAP_MX`; exits with the server's code. `--version` → `mx 0.1.0` / `hyperscript-lsap 0.1.0`.
- Missing server: `Error: mx lsap found no language server beside mx.` (exit 1).

## mx run

- Task (package.json has the script): `mx run [--no-cache] [--verify] [-r | --filter <member>]... [-j <n>] <name> [-- args]`. Hit: `hit <key>, restored N files`. Miss: `miss (<why>)`. Cache: `MXCACHE` (default `~/.cache/mx/run`). Env in the key: `NODE_ENV` + `MXRUN_ENV`. Only exit 0 stored. `mx test` scripts are never cached.
- Host (anything else): build, then exec the command (`mx run mix phx.server`).
- Refusals: `a script name is required`, `-r and --filter need an mx.work at or above <dir>`, `-j 0 is not a count`, `a command is required` (exit 2).

## Never emit

`npx vitest`, `vitest run`, `jest`, `vi.mock(...)`, `playwright test` for a Mercury module, or a different language server in place of `mx lsap`.

## Next

- Back to the course: /mx
- This companion: /mx/tools/llms.txt

## Navigation

- [Read this page in the browser](/mx/tools)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/mx/llms.txt)
