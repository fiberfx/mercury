<!-- Published by scripts/package_readmes.py from fiberfx/vite-plugin-mhs/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/vite-plugin-mhs

The Vite plugin for Mercury Hyperscript (MHS). It lowers JSX to `@fiberfx/hyperscript`, resolves Mercury packages from their built artifacts or, inside the Mercury workspace, from their sources, and refuses any configuration that would put a foreign renderer beside MHS.

## Install

```sh
npm install --save-dev @fiberfx/vite-plugin-mhs vite
npm install @fiberfx/hyperscript
```

Peers: `vite` 8.3.5, exactly as `package.json` pins it, and `@fiberfx/hyperscript` at the same Mercury version. Every `@fiberfx/*` package moves at one version: the manifests say 3.0.0 today, and the first release under `@fiberfx` is 4.0.0 (mx-modules M9). The plugin is ESM only and has no dependencies of its own.

## Use

```ts
// vite.config.ts
import mhs from '@fiberfx/vite-plugin-mhs';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [mhs()] });
```

`.jsx` and `.tsx` files then compile against `@fiberfx/hyperscript/jsx-runtime` (`/jsx-dev-runtime` in dev), through Vite's own Oxc transform. Write `class`, `for` and native events, as [MHS's DOM contract](../hyperscript/README.md#dom-contract) describes. For your editor and `tsc`, set the same import source in `tsconfig.json`:

```json
{ "compilerOptions": { "jsx": "preserve", "jsxImportSource": "@fiberfx/hyperscript" } }
```

`mhs()` returns an array of plugins. Put it in `plugins` as is.

## Options

| Option | Values | Default | Meaning |
|---|---|---|---|
| `resolution` | `'installed'`, `'source'` | `'installed'` | `'installed'` resolves `@fiberfx/*` from their built files, and refuses a config that selects the `mercury-source` condition. `'source'` puts `mercury-source` ahead of each environment's conditions (Vite's defaults, or yours), so the workspace's sources load with no build. Use it only inside the Mercury workspace. |
| `compiler` | `'oxc'`, `'hypercompiler'` | `'oxc'` | Vite's Oxc or the bundled Rust/WASM Hypercompiler lowers TSX to native MHS. |
| `sid` | `false`, `true`, `{ complete?, package?, factories? }` | off | Stable Effector SIDs, with `compiler: 'hypercompiler'` only. See [Effector SIDs](#effector-sids-mercuryvite3-s1). |
| `scope` | `'optional'`, `'required'` | `'optional'` | `'required'` turns on the Effector adapter's required mode at run time. See [Scope enforcement](#scope-enforcement-mercuryvite3-s3). |
| `modelHmr` | `false`, `true` | `false` | Model replacement in development, with `compiler: 'hypercompiler'` and `sid`. See [Model replacement](#model-replacement-mercuryvite3-s4). |
| `optimizer`, `refresh`, `ssr` | `false` | off | Unavailable. Any other value is refused rather than ignored. |

Options are typed, and they're validated at runtime too, for JavaScript configs. Every refusal is an `MhsConfigError` with a `code`:

- `MHS_INVALID_OPTION`: an unknown option, or a value outside the table.
- `MHS_UNAVAILABLE`: a mode that doesn't exist yet. The message says where it's tracked, and nothing is substituted for it.
- `MHS_CONFLICT`: the rest of the config fights the plugin. That covers:
  - any `esbuild` setting, since Vite 8 ignores it once `oxc` is set; use `oxc`;
  - `oxc: false`, an `oxc.jsx` that isn't an object, or an `oxc.jsx.runtime` other than `'automatic'`;
  - another `oxc.jsx.importSource`, or `oxc.jsx.pragma`, `oxc.jsx.pragmaFrag` or `oxc.jsxInject`;
  - an alias for `react`, `react-dom`, `preact`, `effector` or `effector-react`;
  - a React or Preact plugin;
  - `mercury-source` under `resolution: 'installed'`;
  - `sid` without `compiler: 'hypercompiler'`.

## What it keeps, and what it doesn't do

- It keeps your aliases, conditions, externals, build settings and asset handling. It adds no alias. `?raw` and `?url` imports of a `.tsx` file keep Vite's meaning: the text, and an asset URL.
- Importing `react`, `react-dom`, `preact`, `effector-react` or npm `effector` fails, naming the importer. This holds for direct, transitive and per-file `@jsxImportSource` imports, and for externals. Mercury's own state library is `@fiberfx/effector`.
- Source maps are Vite's: on when you turn them on (`build.sourcemap`), and composed with the transforms before them.
- Edits reload the page under Vite's normal rules. Nothing is self-accepted, and no component state is preserved across an edit.
- It doesn't render on the server, replace models on edit, or optimize. Those are separate, later capabilities. Effector SIDs are opt-in, through `sid` with the Hypercompiler.

## Development

Run these from `fiberfx/vite-plugin-mhs`:

| Command | What it runs |
|---|---|
| `pnpm run build` | `tsc -p tsconfig.build.json` into `dist` (ESM and declarations) |
| `pnpm run typecheck` | the plugin (`tsconfig.json`), then the tests (`test/tsconfig.json`) |
| `pnpm run test:contract` | `vitest run`: `test/contract/{config,build,browser}.test.ts` in Node, driving Vite's API, with Chromium through Playwright for the browser rows |
| `pnpm run check:consumer` | `scripts/check-consumer.mjs`: pack, fresh install, types, graph and pages (below) |

Before `test:contract` and `check:consumer`, run `pnpm --filter @fiberfx/hyperscript build`: installed resolution needs the runtime's `dist`. Source resolution works without it. The browser rows need Playwright's Chromium, through `PLAYWRIGHT_BROWSERS_PATH` or `pnpm --filter @fiberfx/hyperscript test:install`. Working copies of the fixture go to `test/.cache/work`, which the suite removes when it ends.

### The fixture

`test/fixtures/app` is a TSX app:

- `index.html` loads `src/main.tsx`;
- `src/App.tsx` renders `h1#greeting`, `label.field[for=name]`, `input#name` and `output#typed`, which `onInput` updates on every keystroke;
- `src/throws.tsx` is the source-map fixture: a `throw` at line 4, UTF-16 column 70, after an astral character.

`main.tsx` exposes `window.__mhs.mount()` and `dispose()`. `window.__mhsOwners` counts the mounted apps' watchers.

`test/fixtures/foreign` holds the files that must fail: a React pragma, a transitive `react-dom`, npm `effector`, and `?raw` and `?url` imports.

### The packed consumer

`node ./scripts/check-consumer.mjs [--work <dir>] [--keep] [--offline] [--mutant <name>]` packs this package and `@fiberfx/hyperscript` with pnpm. It copies the fixture into a fresh app outside the workspace, adds a `vite.config.ts` that records the build's module ids and an identity probe (`src/identity.ts`), and installs with `pnpm install --prefer-offline --ignore-workspace` (`--offline` to forbid the registry). Its rows:

| Row | Passes when |
|---|---|
| pack | The tarball holds no `.cjs`, `.cts` or UMD file and no `require` export, isn't private, and every export target is in it |
| install | It installs with no warning |
| closure | `node_modules/.pnpm` holds no `@babel/*`, `react`, `react-dom`, `effector-react`, `effector`, `preact`, `@preact/*` or compat package, and the plugin has no dependencies |
| types | `types.ts` typechecks against the packed declarations: documented options pass, and four `@ts-expect-error` lines (unavailable and invalid options) are each used |
| graph | The production build takes the runtime only from the installed `dist`: none from `src`, none from the checkout, one root runtime module (`dist/mhs.mjs`), nothing foreign |
| page (preview), page (dev) | In Chromium: `class` and `for` render, `#typed` follows each keystroke, and the identity probe reports `{"shared":true,"rendered":true}`, meaning root, hooks, jsx-runtime and test-utils share one renderer |

Mutants, each of which must fail its row:

- `--mutant drop-types` removes the packed declarations; pack and types fail.
- `--mutant drop-export` removes the runtime's `./hooks` export; graph fails.
- `--mutant forbidden-dep` makes the packed plugin depend on React; closure fails.
- `--mutant second-runtime` makes the probe import a copy of the root runtime; both pages fail.

The packed consumer also accepts `--compiler hypercompiler`; its default is `oxc`. Both modes
run the same install, type, graph and browser rows, and the same four failing controls.

## Evidence map (mercury.vite.1)

| Row | Good case | Failing control |
|---|---|---|
| VIT1 | `browser.test.ts` "VIT1 dev" and "VIT1 production preview"; `config.test.ts` "lowers TSX to the MHS dev runtime"; `build.test.ts` "the fixture app bundles the MHS runtime from source and nothing foreign" | `config.test.ts` "control: without the plugin, the same file silently lowers to React" (the workspace's React 19.3.1); "esbuild.jsxImportSource react is refused"; `build.test.ts` pragma and transitive `react-dom` |
| VIT2 | `config.test.ts` source mode (hyperscript's `dist` absent) and "installed mode resolves the built runtime"; `check:consumer` graph and pages | `check:consumer --mutant drop-export` and `--mutant second-runtime` |
| VIT3 | `config.test.ts` conditions and "keeps the caller's aliases"; `build.test.ts` "?raw is the original TSX text" | `build.test.ts` "control: a transform that compiles every .tsx id" |
| VIT4 | `browser.test.ts` "an edit reloads the page" and "a mount and dispose cycle releases its own watcher" | the self-accept and no-dispose controls in the same file |
| VIT5 | `build.test.ts` "VIT5": the built and dev maps, composition with a preceding transform, maps off by default, and malformed TSX failing at line 4 | "control: an identity map that forgets the inserted lines" |
| VIT6 | `check:consumer` pack and types; `node --test ../scripts/packages.test.mjs`; the inventory lists the plugin | `check:consumer --mutant drop-types`; the inventory and private mutants below |
| VIT7 | `check:consumer` closure and graph; `build.test.ts` foreign-graph cases | `check:consumer --mutant forbidden-dep` |
| VIT8 | `config.test.ts` "runtime option validation" and "configuration conflicts"; `check:consumer` types | each refusal case in those blocks |

Source mutants: make one edit, run the command, expect a failure, then restore the file.

| Row | Edit | Command |
|---|---|---|
| VIT1 | `src/index.ts`: the `config` hook returns `{}` | `vitest run test/contract/config.test.ts -t "source-mode transform"` |
| VIT2 | `src/index.ts`: `if (resolved.resolution === 'installed')` becomes `if (false)` | `... config.test.ts -t "installed mode"` |
| VIT3 | `src/index.ts`: `env.resolve.conditions = [SOURCE_CONDITION]` | `... config.test.ts -t conditions` |
| VIT4 | `src/index.ts`: a `transform` that appends `import.meta.hot.accept()` to `App.tsx` | `vitest run test/contract/browser.test.ts -t "an edit reloads"` |
| VIT5 | `src/index.ts`: a `transform` that returns `{ code: '\n' + code, map: null }` for `.tsx` | `vitest run test/contract/build.test.ts -t VIT5` |
| VIT6 | `../scripts/packages.mjs`: drop the INVENTORY line, or add `"private": true` here | `node -e "import('../scripts/packages.mjs').then((m) => m.publishedPackages('../..'))"` (InventoryError) |
| VIT7 | `src/index.ts`: drop `effector\|` from `FOREIGN` | `vitest run test/contract/build.test.ts -t "npm effector"` |
| VIT8 | `src/options.ts`: skip the unknown-key check | `... config.test.ts -t invalid` and `-t unavailable` |

## Rust Hypercompiler (mercury.vite.2)

Select `mhs({ compiler: 'hypercompiler' })` to compile client JS, JSX, TS and TSX through the
packaged Rust/WASM artifact. The package ships its compiler and notices; an installed consumer
needs Node and Vite, with no Rust toolchain or checkout path. Package maintainers build that artifact
with `pnpm run build:compiler`, pinned Rust 1.97.0, the `wasm32-unknown-unknown` target and
wasm-bindgen 0.2.105. Ordinary `pnpm run build` only emits TypeScript and does not require Rust,
wasm-bindgen or an existing compiler artifact. Selecting Hypercompiler without its artifact refuses.
Release packing must include and verify `dist/compiler/manifest.json` and all four hashed files.

A release ships the canonical Linux producer's artifact, never a local build. The producer runs
`canonical-artifact.mjs produce` and commits the compiler's `canonical-artifact.json`. A release
then sets `MHS_COMPILER_ARTIFACT` to the producer's output directory, for example
`MHS_COMPILER_ARTIFACT=<dir> pnpm release:mercury check`, and `pnpm run build` stages it into
`dist/compiler` once every file matches that record. Without the variable, `build` keeps a
canonical `dist/compiler` and removes any other one, since whatever `dist` holds gets packed; run
`build:compiler` again afterwards for local tests. A release check without the variable then
fails on the missing artifact rather than shipping a development build.
The compiler builder remaps Cargo/source/target paths to canonical `/mhs/*` locations and refuses
inherited `RUSTFLAGS` or `CARGO_ENCODED_RUSTFLAGS`. Use the committed toolchain and lockfile when
comparing artifacts. The driver checks WASM and binding hashes independently before creating its
worker; valid JavaScript bindings changed without updating the manifest also refuse.

The compiler receives each real filename and returns original-source maps. Vite composes those maps
with preceding transforms. Malformed source and JSX pragma overrides fail with original locations;
no alternate compiler runs after a refusal. Asset-query, dependency, declaration and virtual modules
keep their existing handling. A dependency is anything under `node_modules`, and JavaScript in the mx store (`.mx/store`, or `MX_STORE`); TypeScript in the store is a source module and compiles. SSR, optimization and state-preserving refresh remain off; automatic SIDs are the opt-in below.

One compiler worker belongs to each client environment lifecycle. Closing it rejects pending work;
an older transform cannot overwrite a later revision. Obsolete successes and failures use Vite's
`ERR_CLOSED_SERVER` cancellation, which the tested Vite 8.3.5 middleware handles as an empty 504
without a compiler error overlay. The client environment closes its worker before Vite waits for
pending transforms, including middleware-mode hosts without an HTTP listener. Changes to the local compiler manifest or bytes
restart the dev server and invalidate its graph. There is no additional result cache. The artifact hash
identifies the loaded bytes; it is not an authenticity signature.

`pnpm run test:contract` runs only the V1 suite and does not require a compiler artifact.
After `pnpm run build:compiler`, `pnpm run test:hypercompiler` exercises the real WASM, structured
refusals, source-map composition, artifact restart, and held-response/disposal controls. Missing
artifacts fail this explicit suite; no test is silently skipped. Set `MHS_TEST_ARTIFACT_DIR` to a generated artifact
folder for those tests. Runtime correctness still belongs to the native runtime's separate gates.

The compiler artifact selects Apache-2.0 for `self_cell` 1.3.0, whose upstream offers
Apache-2.0 **or** GPL-2.0-only. Its unused GPL text is not copied. Rust's shipped standard-library
notice HTML is curated for the measured `wasm32-unknown-unknown` link inputs: the UEFI-only
`r-efi`/`r-efi-alloc` sections are absent. `compiler_builtins` retains its full MIT AND Apache-2.0
WITH LLVM-exception text; linked allocator and compression dependencies keep their notices.
The compiler source's `licenses/target-provenance.json` records exact revisions, source hashes,
link-input inventory and selections. Artifact hashes include both notice files.

## Effector SIDs (mercury.vite.3 S1)

`mhs({ compiler: 'hypercompiler', sid: true })` gives each `@fiberfx/effector` unit and operator
call a stable `sid`, its declarator's `name` and a `loc`, so a fork serializes and restores across
builds without hand-written SIDs. The Hypercompiler lowers each call into the form its operator
reads; an authored `sid` or `name` still wins. Only calls that resolve through an import of the
facade are lowered: a named import, an alias or a namespace member.

- **The key** is the first 16 hex digits of SHA-256 over
  `mhs-sid/1|<package>|<module>|<kind>|<line>:<column>`. `<package>` is the `name` of the nearest
  `package.json` that has one, `<module>` the path from that package's directory with `/`
  separators, and the position the call's start in the original source (UTF-16 column). Keys do
  not depend on the checkout root, the OS, the mode, minification or source maps. Moving a call,
  its file or its package changes its key: keep an authored `sid` for long-lived persisted state.
- **`sid.package`** names modules with no named `package.json` above them (they are keyed from
  Vite's root). Without it such a module is refused with `MHS_SID_PACKAGE`.
- **`MHS_SID_COLLISION`** fails the build when one key has two origins, naming both: two files
  authoring the same literal `sid`, or two packages with one name. A `sid` computed at run time,
  or `null`, is not a key the build can know, so it is not checked.
- **Look-alikes** (a domain's `createStore`, a local that shadows the import, another library's
  `merge`) are left as written with an `MHS_SID_LOOKALIKE` warning; `sid: { complete: true }`
  refuses them as `MHS_SID_INCOMPLETE`, and the build emits nothing.
- **`MHS_SID_SOURCE`** refuses a module an earlier plugin rewrote, because the keys come from
  positions in the original source. Put `mhs()` before such plugins.
- The compiler artifact must declare `sid:mhs-sid/1`; an older one is refused with `sid` on.
- **Factories (S2).** A function that builds units, called in several places, needs a key per
  call site. Register it: `sid: { factories: { counter: '@app/model/src/counter.ts#createCounter' } }`
  maps a name to `'<module>#<export>'`. `<module>` is the defining module's `<package>/<path>`, or a
  bare specifier exactly as imported (`'@app/kit'`). Each call site is keyed as
  `factory:<name>` and runs as `withFactory({ sid, name, loc, method, fn: () => <the call> })`
  from `@fiberfx/effector/compiler`, so the units it builds get `<site>|<unit>` sids, and a
  factory called inside a registered factory gets `<outer>|<inner>|<unit>`. A call site in a loop,
  in a function that isn't a registered factory, a factory calling itself, and an async factory
  are refused with `MHS_SID_FACTORY`: one site would otherwise build several instances under one
  key. The artifact must declare `sid-factory:mhs-sid/1`.
- Model replacement in development is `modelHmr` (S4), below.

Each transformed module's records are on `this.getModuleInfo(id).meta.mhs.sids`. The suite's
`test/hypercompiler/sid.test.ts` builds through Vite and runs a minified bundle on the owned engine.

## Scope enforcement (mercury.vite.3 S3)

`mhs({ scope: 'required' })` makes a missing `<Provider>` an error instead of a silent fall back
to the global scope. Each module that imports or re-exports `@fiberfx/effector` also imports
a virtual module, `virtual:mhs/scope-mode`, which calls `setScopeMode('required')` from
`@fiberfx/effector/compiler`. ES imports run before the importing module's body, so the mode
is set before any hook in it runs. The import is appended to the module, so no source position
moves. In required mode the owned adapter throws when `useUnit`, `useStoreMap`, `useList`,
`useEvent`, `useGate` or a `scopeBind` dispatch runs with no Provider scope. Two scopes still
work, and `'optional'` (the default) adds nothing. It works with either compiler. The adapter's
setter and its rows are `@fiberfx/effector`'s; `test/contract/scope.test.ts` checks that a
build and a dev server really call it, before the importing module's body.

## Model replacement (mercury.vite.3 S4)

`mhs({ compiler: 'hypercompiler', sid: true, modelHmr: true })` lets the dev server replace an
edited model without a full reload. Only dev server transforms change; a build carries none of it.
- A module that imports `render` or `hydrate` from `@fiberfx/hyperscript` is rebound to a root
  handle from `@fiberfx/hyperscript/hmr` under its transform id, so each root it mounts is
  recorded, also after an `await`. It accepts its own updates.
- On an update, the handle suspends its roots with `hmrScope` from `@fiberfx/effector/compiler`:
  each root's scope is serialized, its scoped watches cleaned up and the root unmounted. The new
  instance resumes them: an app root that builds its scope with `createRootScope(container)` gets a
  fresh fork restored from that snapshot, and after the module body runs, any snapshot nobody took
  up reloads the page.
- A module that only defines units does not accept, so its update reaches the module that renders.
  A namespace import of the renderer, a renderer reached through a re-export, a scope the handle
  can't account for, or a snapshot that can't be taken all reload, as before.
- A unit whose key changed in the edit (a moved call site) starts from its default.

The registry and the engine's snapshot and restore are `@fiberfx/hyperscript`'s and
`@fiberfx/effector`'s; `test/hypercompiler/hmr.test.ts` checks the wiring, its source map and
its absence from builds, and the artifact must declare `model-hmr:mhs/1`.

## License

Plugin integration: MIT. See [LICENSE](LICENSE). The packaged Rust/WASM compiler also carries
its dependency and standard-library notices under `dist/compiler/`.
