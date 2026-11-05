# Building islands with mx: no Node — Mercury LMS

> LM2. `mx build --lib` bundles one entry into one ES module (Rolldown, Hypercompiler, no sid). EDU's five island assets are five such builds; the echd-os image runs them in a stage with no `node` on PATH.

## Read this when

You build an island bundle, add an island to EDU, or change how the image builds islands.

## The contract

- `mx build --lib <entry> --out <file> [--root <dir>] [--external <package>]... [--define <name>=<expression>]... [--minify] [--require-export <name>]...`. `--lib` and `--out` are required; `--root` defaults to `.`; any other flag is refused; `--lib` cannot combine with `--bundle` or `--host`.
- Imports resolve from members' source, as under `mx dev`. An `--external` package (and its subpaths) stays a bare import for the page's import map. A CSS import becomes an empty module; nothing is written for it.
- One output file: more than one chunk is an error. `--require-export` missing → exit 1, `"<entry> does not export <names> (it exports …)"`, nothing written.
- An island's `mx.mod` lists every module its import graph reaches (`require`) and each one's directory (`replace`).
- EDU's builds (`node/apps/edu-boot/bin/build-assets.sh <dest>`, `MX` = mx binary): `phoenix.js`; `phoenix_live_view.js` (`--external @fiberfx/phoenix`, `--define LV_VSN=…`); `edu-boot.js` (phoenix pair + `phoenix` external); `edu-island-demo.js` (`--require-export default --require-export hook`); `edu-island-kan.js` (also `--require-export KanFigure`). All `--minify`. Islands have no externals.
- `scripts/edu/build-islands.sh` writes them to `echo/apps/echo_edu/priv/static/edu` (ignored, never committed), adds `mercury.css` and fonts, and fails if any of six files is missing or empty. Served at `/_edu/assets`.
- Image (`echo/Dockerfile`, stage `edu-islands`, `rust:1.97.0-bookworm`): `cargo build --release --locked --bin mx`, then `! command -v node && MX=… bash scripts/edu/build-islands.sh`; the Elixir stage copies `priv/static/edu` in before `mix release echd_os`.

## Minimal example

```sh
mx build --lib node/apps/edu-island-demo/src/index.tsx --root node/apps/edu-island-demo \
  --out priv/static/edu/edu-island-demo.js --minify --require-export default --require-export hook
```

## Limits

- echd_os's `kan.mjs` (the KAN views' islands) is committed and built by `node/apps/echd-os/bin/kan-build.sh` with pnpm, tsc, Vitest and Vite; the image builds no JavaScript for it.
- Development: `EDU_ISLAND_DEV` (`name=url,…`) can point `bundle_url(name)` at a Vite dev server's `.ts`/`.tsx` entry; the boot installs Vite's HMR client first.
- The runtime image is `node:<version>-bookworm-slim`; its `node` is for a forthcoming worker, not a build step.

## Next

- LM3, props and streams: /live-mercury/props-and-streams (/live-mercury/props-and-streams/llms.txt)
- Back to the course: /live-mercury/llms.txt
- This companion: /live-mercury/building/llms.txt

## Navigation

- [Read this page in the browser](/live-mercury/building)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/live-mercury/llms.txt)
