mx is Mercury's toolchain: one binary, written in Rust, at version 0.1.0. It reads a module's `mx.mod` and a workspace's `mx.work`, serves an app with hot reload, bundles it and tests it, and it needs no Node and no npm to do any of that.

## What mx is

- **A module system after Go's.** A module declares itself in `mx.mod` and pins what it downloaded in `mx.sum`. Modules developed together sit in one `mx.work`. The commands `mx mod …` and `mx work …` keep those files, as `go mod` and `go work` keep theirs.
- **A dev server.** `mx dev` serves an app on 127.0.0.1 with its import map inline and compiles each module on request.
- **A bundler.** `mx build --bundle` bundles the app's page with Rolldown, linked into mx itself, so the bundle is made with no `node` on PATH.
- **A test runner and the tools around them:** `mx test` runs a module's tests in a headless browser that mx starts itself, `mx compile` runs the Hypercompiler on one file, and `mx lsap` starts the Hyperscript language server installed beside mx.

It is an independent Rust workspace in `fiberfx/mx`, not a Mix application.

## The commands

`mx` with no command prints its usage line and exits 2:

```sh
usage: mx exodus|pack|install|verify|importmap|resolve|scan|build|check|run|compile|work|dev|test|lsap …
```

One more family is dispatched before that line is read and is missing from it: `mx mod`, whose own usage is `usage: mx mod <init|tidy|verify|graph|why|download>`.

The commands that take flags print their usage when they are given one they don't know:

```sh
usage: mx dev [--root <dir>] [--port <n>] [--importmap]
usage: mx test [--root <dir>] [--timeout <seconds>] [--filter <words>]
usage: mx compile <file> [--options <json>] [--out <file>]
usage: mx build [--bundle] [--root <dir>] [--out <dir>]
usage: mx lsap [--mcp] | mx lsap --version
usage: mx work edit|use|init|sync|vendor …
```

`mx build --help` prints the usage of all three kinds of build: the host build, the app (`--bundle`) and the library (`--lib`). It also says how mx picks one when no kind is given: `mx.json` makes a host build, and `index.html` beside `mx.mod` makes an app bundle. `--help` is help only as the first argument. The first lesson explains how `mx build` decides.

## How mx answers

Every command keeps one contract:

| Exit | Meaning |
|---|---|
| 0 | success |
| 1 | a refusal: the input is wrong, and the message names what |
| 2 | a usage error: the command line is wrong |

Diagnostics go to stderr, so a command's own output on stdout, such as `mx dev --importmap`'s JSON, can be piped. One command adds a code: `mx test` exits 3 when it could not measure, because no browser was found.

## Install mx

Use [Install mx](/start/install-mx) to download the native Linux x86_64 archive and pinned starter, verify their SHA-256 checksums and run `mx install` and `mx verify`. This path needs no Rust, Node.js, npm CLI, BEAM or repository checkout. The [first-page lesson](/mx/first-app) creates a styled Card + Button counter.

## The chapters

1. **MX0 — first app:** [an app is an `index.html` beside an `mx.mod`](/mx/first-app); serve it with `mx dev`, bundle it with `mx build --bundle`.
2. **MX1 — modules and workspace:** [`mx.mod`, `mx.sum` and `mx mod`](/mx/modules), then [`mx.work` and `mx work`](/mx/workspace).
3. **MX2 — dev loop and HMR:** [what `mx dev` serves and how a saved edit reaches the page](/mx/dev).
4. **MX3 — build and ship:** [`mx build --bundle`, `--lib` and the host's build, and `mx check`](/mx/build).
5. **MX4 — the Hypercompiler:** [`mx compile`, and what it does to every module mx dev and mx build serve](/mx/compile).
6. **MX5 — tools:** [`mx test`, `mx lsap` and `mx run`](/mx/tools).

The course's capstone builds a native app with no `node` on PATH. The retained `sites/mercury` example can exercise that build; the live documentation website runs as the Phoenix `mercury_lms` application.

## What is shipped

The [release metadata](/downloads.json) identifies the native archive and source revision. This public first-page route targets Linux x86_64; macOS and Windows need separate verification. All six chapters, MX0 to MX5, are written.
