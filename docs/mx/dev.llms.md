# The dev loop and hot replacement — Mercury LMS

> MX2. `mx dev` serves an app on 127.0.0.1, polls every file a page asked for every 10 ms, compiles what changed and sends `update`, `full-reload` or `error` over a `vite-hmr` socket at `/`. No Node, no Vite.

## Read this when

You run `mx dev`, wonder why an edit reloaded the page instead of swapping in place, or see a 403/400/500 from the dev server.

## Usage

`usage: mx dev [--root <dir>] [--port <n>] [--importmap]` → prints `listening http://127.0.0.1:<port>/`.

## What it serves

- `/`: index.html + import map (at `<!-- mercury:importmap -->`) + `<meta name="mx-dev-token">` + the client script.
- `/@mx/client.js`: the hot client (`import.meta.hot`: `data`, `accept`, `dispose`, `invalidate`).
- `/@mx/<package name>/<path>`: members (from source: compiled and watched; built: never watched).
- App files: `js mjs jsx ts mts tsx` compiled on request; others as they are.

## An edit

- Same bytes (SHA-256) → nothing. Non-module → `full-reload`. Module never ran → `full-reload`.
- Refused compile → `error` (`<path>: <refusal>`), page keeps the running module, the module URL answers 500 until fixed.
- Else walk importers to accepting modules → one `update`; imports get `?t=<stamp>`. No accepting module → `full-reload`.
- Accepting = the compile's `hmrRoot`, never a text match. The Hypercompiler sets it for a module that imports `render`/`hydrate` from `@fiberfx/hyperscript`. A non-rendering model module reloads.
- `invalidate` → walk from importers; a walk back to its start → `full-reload`.

## Guards

- Non-loopback Host → 403 `this host name is not allowed: mx dev answers loopback names only`.
- Non-loopback Origin on the socket → 403.
- Socket path/protocol other than `/` + `vite-hmr`/`vite-ping` → 400 `an HMR socket is at / and speaks vite-hmr or vite-ping`.
- A page's `vite-hmr` socket without `?token=` → 400.

## Workspace refusal

`<name> is both <app>'s replace (<dir>) and the mx.work's member (<dir>): remove the replace, or the member from mx.work, or build with MXWORK=off`. A replace onto the member's own directory passes.

## Limits (shipped today)

App edit on this site: applied in place, then one reload (being traced). Member source edit: full reload. Hypergraph's model swap is not delivered by `mx dev` yet.

## Never emit

`vite`, `vite.config.*`, `npm run dev`, or a hand-written `import.meta.hot.accept` meant to make a non-rendering module hot (mx ignores the text).

## Next

- MX3 build and ship: /mx/build
- This companion: /mx/dev/llms.txt

## Navigation

- [Read this page in the browser](/mx/dev)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/mx/llms.txt)
