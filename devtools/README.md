<!-- Published by scripts/package_readmes.py from fiberfx/devtools/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/devtools

Native Mercury DevTools, development only. `./connect` is the headless collector: it observes the application's own engine through `@fiberfx/effector/inspect` and keeps bounded, detached records of scoped events, errors, declarations and registered stores. `./panel` is the native MHS dock over a session. The design and its observation contract are in native-devtools.md.

```ts
import { connectMercuryDevtools } from "@fiberfx/devtools/connect";

const session = connectMercuryDevtools({ appId: "echd-os" });
session.observeDeclarations(); // before the model loads, for early coverage
const release = session.registerScope({ id: "client", scope, stores: { $user, $cart } });
session.records(); // detached records, oldest first
release();
session.dispose();
```

- **Exact scopes.** Each registration observes one Scope; global execution only through `registerGlobal`.
- **Store views are settled samples.** A registered store has an initial snapshot and a reread after each observed update settles. A raw update message is `unit.observed`, not a committed change.
- **Bounded.** 2,000 records, 4 MiB of preview text, 4 KiB per record, 5,000 descriptors, 32 scopes and 512 scope–store pairs by default. Counters name every eviction, truncation and drop. A registration over a cap is refused whole.
- **Safe previews.** Primitives as text, an Error as its message, anything else opaque unless the application's `previewPolicy.project` returns plain data. Getters and `toJSON` are never run.
- **Read-only.** No event dispatch, store write, evaluation or replay. A failing observer is counted and contained; the application runs as it would without DevTools.

## The panel

```ts
import { mountDevtoolsPanel } from "@fiberfx/devtools/panel";
import "@fiberfx/devtools/panel.css";

const panel = mountDevtoolsPanel(dock, session); // dock: a host element outside the app's own subtree
panel.close(); // also its Close button and Escape; focus goes back to where it was
```

- **Three views.** Timeline (filter by record kind and scope; gaps and evictions are marked), Stores (each registered store's newest retained snapshot per scope, with its SID or "no sid") and Session (scopes, coverage, counters, limits and the capabilities that aren't available, with their reasons).
- **Read-only.** Selecting a record changes the panel's selection only. Pause, resume and clear act on the session's capture; a paused view is marked historical while the app keeps running.
- **Its own lifetime.** Opening adds one session listener and no engine subscription; closing unmounts the panel's own root and removes it. Every panel action rereads the session, so a disposed session shows as disposed.
- **Text only.** Captured values render as text nodes from the collector's detached previews; nothing is parsed as markup.
- **Function components** over readonly data; the panel's own state is a pure reducer (`reducePanel`) that returns a fresh frozen value.
- **Renderer.** `@fiberfx/hyperscript` is a peer: the panel renders with the application's own runtime, never a bundled copy.

## Commands

| Command | Covers |
|---|---|
| `pnpm exec vitest run --project jsdom-hyperscript packages/mercury-devtools`, from `mercury/` | The collector's rows and the panel's, in jsdom through `@fiberfx/testing` |
| `pnpm run test:browser` | The dock in a real headless Chromium through Playwright's driver: the opener's click focuses the tabs, arrow keys switch views, Tab reaches a filter, Escape closes and focus returns. Chromium comes from `PLAYWRIGHT_BROWSERS_PATH` |
| `pnpm run check:closure` | The packed devtools with the engine (effector, core, ui) and hyperscript, installed in a fresh consumer outside the workspace: the dist imports (engine and renderer only), the manifest (peers effector and hyperscript, no dependencies), the functional surface (no exported class but the thrown `RegistrationRefused`, no renderer `options` hook, component class or ref API, packed or in the source), the install closure (no React, preact, npm effector, effector-react, Redux adapter or compat) and a runtime probe in Node with jsdom. Build first: `pnpm run build` here, in fiberfx/hyperscript and in fiberfx/core, and the JavaScript of effector and ui (`pnpm --filter <name> exec vite build`) |

**Negative controls,** each failing its row: `node scripts/check-closure.mjs --mutant forbidden-import` (manifest, install), `--mutant drop-panel` (manifest, runtime), `--mutant class-export` (surface types) and `--mutant options-hook` (surface runtime).

Production exclusion and the no-telemetry check belong to the host's wiring (EchdOS), not to this package.

The Operator ruled its publication on 2026-11-01 ("Publish as fiberfx/devtools"): it is the module `fiberfx/devtools`, versioned with its siblings at 3.0.0. Publishing it stays the Operator's.
