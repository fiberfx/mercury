Three commands sit around the build and the dev loop. `mx test` runs tests in a real browser, `mx lsap` starts the language server, and `mx run` runs scripts and hosts.

## mx test

```sh
usage: mx test [--root <dir>] [--timeout <seconds>] [--filter <words>]
```

`mx test` runs a module's tests in a headless browser that mx starts itself, from the same graph `mx dev` serves. Nothing is assumed passed: each result has to come back to mx, and a run that reports no tests, loses a report or never ends fails.

- **Which files.** Every `*.test.*` or `*.spec.*` file with a `js`, `mjs`, `jsx`, `ts`, `mts` or `tsx` extension under the root. `node_modules`, `dist`, `target` and `coverage` are never searched. With none: `mx test: no tests under <root>`, exit 1.
- **Imports first.** A test file whose imports can't be resolved fails by name before the browser starts, `FAIL  <url> > (its imports): <why>`, and the other files still run.
- **The browser.** `MX_BROWSER` names one. Otherwise mx takes the newest Chromium, then Playwright's headless shell, from `PLAYWRIGHT_BROWSERS_PATH`, `~/Library/Caches/ms-playwright` or `~/.cache/ms-playwright`.
- **`--timeout`** bounds the whole run, by default 120 s: `the run didn't end within <n> s`. Separately, a page that stays silent for 30 s past every test's own timeout is reported as stalled, and the rest of its file doesn't run.
- **`--filter <words>`** keeps the tests whose `<file> > <name>` contains the words, and counts the rest as left out.

| Exit | Meaning |
|---|---|
| 0 | every test passed |
| 1 | a test failed, none ran, or the run broke |
| 2 | usage |
| 3 | could not measure: no browser was found |

Exit 3 is never a pass. mx prints where it looked, then `Set MX_BROWSER to a Chromium binary.`

## What a test file imports

A test file imports from `vitest`, and the page's import map answers that with mx's own runtime, not Vitest. It has:

- `describe`, `it` and `test`, and the hooks `beforeAll`, `afterAll`, `beforeEach` and `afterEach`;
- `expect`, with its matchers;
- `vi`: `vi.fn`, `vi.spyOn`, `vi.stubGlobal`, fake timers (`vi.useFakeTimers`, `vi.advanceTimersByTime`, `vi.runAllTimers` and the rest) and `vi.setSystemTime`;
- `expectTypeOf` and `assertType`, which assert nothing at run time, because types are the compiler's business;
- `visit`, which is mx's own.

As in Vitest, a test has 5 s and a hook 10 s. `vi.mock` is not there: calling it throws `vi.mock is not in mx test: a module is mocked by import map, later (mercury.mx.13)`.

## Driving a page with visit

```ts
async function visit(url, { width = 0, height = 0, scale = 1, mobile = false, scheme = null, ready = null } = {})
```

`visit` opens a page at an http origin in the run's own browser, over the DevTools protocol, emulated as asked: a viewport, a scale, mobile, and `scheme` as `prefers-color-scheme`. It resolves once `ready`, a CSS selector, matches, or without one once the page has loaded. A `width` or `height` left out keeps the browser's own.

The handle it returns has two methods:

- `evaluate(fn, ...args)` runs `fn` in that page and resolves with its JSON value, or rejects with what it threw;
- `close()` closes the page.

A visit left open is closed when its test file ends. If the browser's DevTools fail, mx ends that file by name.

## Reading a run

One line per test, then the count:

```text
ok    <file> > <name>
skip  <file> > <name>
FAIL  <file> > <name>: <message>
mx test: <passed> passed, <failed> failed, of <total>
```

A failure's stack is read back to the line as written, through the compiler's source map. The run checks itself as well:

- when the pages' count and the reports that arrived differ, it says so (`the pages counted N tests and M reports arrived`) and fails;
- with `--filter` it prints how many were left out;
- with every test filtered away, it prints `no tests ran: the filter matched none` and exits 1.

## mx lsap

```sh
usage: mx lsap [--mcp] | mx lsap --version
```

`mx lsap` starts the Hyperscript language server, `hyperscript-lsap`, which must be installed in the same directory as mx. mx starts no other server and never falls back. It gives the server mx's own path in `HYPERSCRIPT_LSAP_MX`, so the server resolves imports with this mx, and then exits with the server's exit code. In a session the server's stdout is the protocol, so mx writes nothing there itself.

A release built by `release.sh` carries the server: `hyperscript-lsap-<target>` sits beside `mx-<target>`, and you install it beside mx, in the same directory, as `hyperscript-lsap`. Windows is the exception. The server is Unix-only, so a Windows release ships mx alone, and `mx lsap` there refuses with *The language server isn't built for Windows in this release*.

- **`--mcp`** is passed on to the server unchanged.
- **`--version`** prints both versions. On this machine, `mx lsap --version` printed:

```text
mx 0.1.0
hyperscript-lsap 0.1.0
```

With no server beside mx, it refuses with exit 1: `Error: mx lsap found no language server beside mx.`, where it looked, and `Put hyperscript-lsap in <dir>: a release of mx ships it there.`

The server is Rust. Today it is an imported TypeScript language server, built under Mercury's rules, and it doesn't answer Mercury's own facts yet.

## mx run

`mx run` has two forms, and the directory decides which.

**A task.** When the `package.json` in the directory has a script by that name, `mx run <name>` runs it as a cached task. The key is a sha256 over:

- the script, its arguments and the module's place in the workspace;
- `NODE_ENV`, plus the names `MXRUN_ENV` lists;
- the sha256 of every input file, and the tools.

On a hit, mx checks every stored blob, restores the outputs and replays the log: `mx run: <member> <task>: hit <key>, restored N files`. On a miss it names the first difference: `mx run: <member> <task>: miss (<why>)`. Only exit 0 is stored, under `MXCACHE`, by default `~/.cache/mx/run`.

The flags go before the script's name:

| Flag | What it does |
|---|---|
| `--no-cache` | run the script, neither reading nor storing an entry |
| `--verify` | on a hit, run the task again and hold its outputs to the stored ones |
| `-r`, `--recursive` | the task in every workspace member |
| `--filter <member>` | the task in the named members, by directory or package name, and every member they need |
| `-j <n>` | parallel tasks, by default the CPUs, at most 4 |

`-r` and `--filter` need an `mx.work`: `mx run: -r and --filter need an mx.work at or above <dir>`. A script that is `mx test` is never cached, because mx test reads the whole workspace from source: `mx run: <member> <task>: uncached: mx test reads the workspace from source`.

**A host.** Any other name keeps the host form: `mx run <command> [args]` builds the host (MX3), then becomes the command, so its signals and exit code are the command's. `mx run mix phx.server` is the example in mx's source.

With no name at all, `mx run` answers `mx run: a command is required`.
