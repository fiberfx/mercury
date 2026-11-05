# mx, the native toolchain — Mercury LMS

> mx 0.1.0: Mercury's toolchain, one Rust binary. Modules in `mx.mod`/`mx.sum`, workspaces in `mx.work` (Go's rules), `mx dev` with hot reload, `mx build --bundle` (Rolldown linked in), `mx test`, `mx compile`, `mx lsap`. No Node, no npm.

## Read this when

You are about to build, serve, test or lay out a Mercury app or module and need mx's command surface. This page is the course's landing; the chapters follow.

## The command surface (as mx prints it)

- `mx` → `usage: mx exodus|pack|install|verify|importmap|resolve|scan|build|check|run|compile|work|dev|test|lsap …`
- `mx mod` → `usage: mx mod <init|tidy|verify|graph|why|download>` (not in the line above)
- `mx work` → `usage: mx work edit|use|init|sync|vendor …`
- `usage: mx dev [--root <dir>] [--port <n>] [--importmap]`
- `mx build --help` (exit 0): `usage: mx build [--host | --bundle | --lib] …`. Without a kind, `mx.json` makes a host build and `index.html` beside `mx.mod` an app bundle. `--help` is help only as the first argument.
- `usage: mx test [--root <dir>] [--timeout <seconds>] [--filter <words>]`
- `usage: mx compile <file> [--options <json>] [--out <file>]`
- `usage: mx lsap [--mcp] | mx lsap --version`
- `mx --version` → `mx 0.1.0`

## Exit codes

0 success · 1 refusal (message names why) · 2 usage error · `mx test` only: 3 could not measure (no browser). Diagnostics on stderr.

## Install

Follow /start/install-mx/llms.txt: native Linux x86_64 archive + pinned starter, SHA-256 check before extraction, mx install, mx verify. No source checkout or Rust needed. Build the styled counter at /mx/first-app; agent workflow: /SKILL.md.

## Rules for agents

- Build and serve native apps with mx. The planned npm distribution uses a Node launcher and optional native platform package. Node remains necessary for each npm-installed mx invocation; the archive/image route calls the native binary directly.
- Quote flags as mx prints them; don't add flags mx doesn't list.
- The retained native example check (the live website is Phoenix `mercury_lms`): `env PATH=<mx's dir>:/usr/bin:/bin mx build --bundle --root sites/mercury --out <dist>` — no Node on PATH.

## Chapters

- MX0 first app: /mx/first-app
- MX1 modules and workspace: /mx/modules, /mx/workspace
- MX2 dev loop and HMR: /mx/dev
- MX3 build and ship: /mx/build
- MX4 the Hypercompiler: /mx/compile
- MX5 tools: /mx/tools

## Next

- The site: /llms.txt
- This companion: /mx/llms.txt

## Navigation

- [Read this page in the browser](/mx)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)

### Chapter companions

- [/mx/build](/mx/build/llms.txt)
- [/mx/compile](/mx/compile/llms.txt)
- [/mx/dev](/mx/dev/llms.txt)
- [/mx/first-app](/mx/first-app/llms.txt)
- [/mx/modules](/mx/modules/llms.txt)
- [/mx/tools](/mx/tools/llms.txt)
- [/mx/workspace](/mx/workspace/llms.txt)
