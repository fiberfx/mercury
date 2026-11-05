An island ships as one ES module file that a page imports by URL. This lesson builds EDU's islands the way the image does: with mx and no Node.

## mx build --lib

`mx build --lib` bundles one entry into one ES module file, for a module a page loads by itself:

```sh
mx build --lib <entry> --out <file> [--root <dir>] [--external <package>]... \
  [--define <name>=<expression>]... [--minify] [--require-export <name>]...
```

| Flag | What it does |
|---|---|
| `--lib <entry>` | the entry file; required |
| `--out <file>` | the one file written; required |
| `--root <dir>` | the root the build resolves from; `.` by default |
| `--external <package>` | leaves the package, and its subpaths, as a bare import for the page's import map |
| `--define <name>=<expression>` | replaces `name` with the expression at build time |
| `--minify` | minifies the output |
| `--require-export <name>` | refuses the bundle unless it exports `name`; repeatable |

Three rules hold for every `--lib` build:

- **Imports resolve from source.** mx resolves each import as `mx dev` does, from a member's source where it has one, as each import is met. Every module goes through the Hypercompiler, with no sid.
- **A stylesheet is the page's.** A CSS import loads as an empty module, and nothing is written for it: the page links its own stylesheet.
- **One file.** A build that would write more than one chunk is an error, and `--lib` cannot be combined with `--bundle` or `--host`.

`--require-export` is the static half of a gate EDU's boot depends on: the boot needs `default` and `hook` from every island. A missing name fails the build, names what is missing and what the entry does export, and writes nothing:

```text
<entry> does not export <missing names> (it exports <the names it has>)
```

## An island's members, mx.mod

mx finds the packages an island imports through the island's `mx.mod`, which lists every module its import graph reaches and where each one's directory is. The demo island's:

```text
module jonnify.com/node/edu-island-demo

mx 0.1.0

require (
	github.com/fiberfx/mercury/core v3.0.0
	github.com/fiberfx/mercury/hyperscript v3.0.0
	github.com/fiberfx/mercury/live-mercury v3.0.0
	github.com/fiberfx/mercury/phoenix v3.0.0
	github.com/fiberfx/mercury/phoenix_live_view v3.0.0
	jonnify.com/node/edu-boot v0.0.0
)

replace (
	github.com/fiberfx/mercury/core => ../../../fiberfx/core
	github.com/fiberfx/mercury/hyperscript => ../../../fiberfx/hyperscript
	github.com/fiberfx/mercury/live-mercury => ../../../fiberfx/live-mercury
	github.com/fiberfx/mercury/phoenix => ../../../fiberfx/phoenix
	github.com/fiberfx/mercury/phoenix_live_view => ../../../fiberfx/phoenix_live_view
	jonnify.com/node/edu-boot => ../edu-boot
)
```

Each `replace` points a member at a directory in this repository, so no package manager or lockfile takes part. The island's `import { courseIsland } from "@echd/edu-boot/island"` resolves to `node/apps/edu-boot`, whose `package.json` names its `./island` export as `./src/island.ts`.

## The five builds

`node/apps/edu-boot/bin/build-assets.sh <dest>` makes every file EDU's islands need, one `mx build --lib` each. `MX` names the mx binary, and `mx` on the PATH is the default.

| Output | Entry | Flags |
|---|---|---|
| `phoenix.js` | `fiberfx/phoenix/src/index.ts` | `--minify` |
| `phoenix_live_view.js` | `fiberfx/phoenix_live_view/src/index.ts` | `--minify --external @fiberfx/phoenix --define LV_VSN="<version>"` |
| `edu-boot.js` | `node/apps/edu-boot/src/app.ts` | `--minify`, the phoenix pair (and `phoenix`) external |
| `edu-island-demo.js` | `node/apps/edu-island-demo/src/index.tsx` | `--minify --require-export default --require-export hook` |
| `edu-island-kan.js` | `node/apps/edu-island-kan/src/index.tsx` | `--minify --require-export default --require-export hook --require-export KanFigure` |

The externals are what keeps one Socket on the page. `phoenix_live_view.js` and `edu-boot.js` import `@fiberfx/phoenix` by bare name, the page's import map resolves it to `phoenix.js`, and so every module shares one copy. An island has no externals: each carries its own hyperscript and Live Mercury, so the lifecycle and the component it renders run on the same copy. `LV_VSN` is read from `fiberfx/phoenix_live_view/package.json`'s version before the build.

```sh
mx build --lib "$apps/edu-island-demo/src/index.tsx" --root "$apps/edu-island-demo" \
  --out "$dest/edu-island-demo.js" --minify --require-export default --require-export hook
```

## From bundles to served assets

`scripts/edu/build-islands.sh` runs the five builds into `echo/apps/echo_edu/priv/static/edu`, then copies `mercury.css` and the `.woff2` fonts from EchoCms's `priv/static`. It fails unless `phoenix.js`, `phoenix_live_view.js`, `edu-boot.js`, `edu-island-demo.js`, `edu-island-kan.js` and `mercury.css` are all there and not empty.

```sh
scripts/edu/build-islands.sh
```

The bundles are built, never committed: `priv/static/edu` is ignored. echo_edu serves them under `/_edu/assets`, which is where its import map points the phoenix pair and where `EchoEduWeb.Island.bundle_url("demo")` finds `edu-island-demo.js`.

## What the echd-os image does

`echo/Dockerfile` builds the islands in a stage of their own, `edu-islands`, from `rust:1.97.0-bookworm`. It copies `fiberfx`, `node`, `scripts/edu/build-islands.sh` and EchoCms's `priv/static`, then:

```sh
cd fiberfx/mx && cargo build --release --locked --bin mx
! command -v node && mkdir -p echo/apps/echo_edu/priv/static \
 && MX=/src/fiberfx/mx/target/release/mx bash scripts/edu/build-islands.sh
```

`! command -v node` is the proof: the stage fails if a `node` is on its PATH, so the islands it builds cannot have needed one. The Elixir build stage copies the result into `apps/echo_edu/priv/static/edu` before `mix release echd_os`, so the release packs the bundles.

The image's runtime stage is based on `node:<version>-bookworm-slim`. The Dockerfile carries `node` there for a forthcoming worker beside the BEAM release, not as a build tool; nothing in that stage builds JavaScript.

## In development

In development, `bundle_url(name)` can point an island at a Vite dev server's source entry instead of the built file, through `EDU_ISLAND_DEV` (`name=url,…`, read into `:island_dev_urls`). The boot recognises such an entry by its shape, an absolute http(s) URL whose path ends in `.ts` or `.tsx`, and installs Vite's HMR client from that origin before importing it, so island edits swap in place in a page Vite does not own. A dev server that is not up is a warning, not a failure. That path uses Vite; the built path above does not.

## What mx does not build yet

echd_os's KAN views do not use these builds. Their bundle, `kan.mjs`, is committed in echd_os's `priv/static`, and the image builds no JavaScript for it. It is made by `node/apps/echd-os/bin/kan-build.sh`, which needs pnpm: it typechecks with `tsc`, runs the islands' tests with Vitest, and builds `kan.mjs` with Vite.
