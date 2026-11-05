# Philosophy: native, not borrowed — Mercury LMS

> Mercury uses Hyperscript in the browser and mx for native builds. Plain JavaScript browser pages need no build step. Phoenix/LiveView is optional; the documentation website uses server-rendered HTML. The archive/image routes run native mx without Node. The planned npm wrapper needs Node at every invocation to resolve and launch its optional platform binary; no postinstall or GitHub binary download is used.

## Read this when

You need the scope of Mercury runtime, build and optional server choices.

## The rules these choices give you

- Toolchain: `mx`. It installs from static mirrors with sha512 checks (`mx install`, `mx verify`), serves (`mx dev`) and builds (`mx build`). Exit codes: 0 success, 1 refusal, 2 usage error.
- Components: `@fiberfx/hyperscript`, DOM semantics. `class`, `for`, `onInput` per keystroke, `onChange` on the DOM `change` event, SVG names such as `stroke-width`, `onFocusIn`/`onFocusOut` for bubbling focus. No compat entry exists.
- Published modules: no third-party runtime dependency or peer; no React package, import, type or peer (a check gates every landing).
- Documentation website and Phoenix integration: server-rendered HTML first (HEEx), with islands where needed. This is not a requirement for a standalone client-rendered Mercury page; see [browser route](/start/browser/llms.txt).
- Facts: the reference comes from source; mx's course quotes `mx --help`. Unfinished is reported as unfinished.

## Today, not yet

- The `@fiberfx/*` modules build and test with mx; pnpm remains only for apps and tools under `node/`. `mx run` scripts can call Node.
- `mix mercury.lms.scrub` checks this site: retired-package imports in lessons and assets, and Node invocations in the app.
- The examples check (`mix mercury.lms.examples`) and the generated reference are planned.

## Never emit

Do not replace mx app builds with Vite or introduce React-compatible runtime imports into Mercury examples. npm may obtain the native mx executable when its package is published; check [installation readiness](/start/install-mx/llms.txt). Write `class`, not `className`, and never use `onChange` for keystrokes.

## Next

- Tiers and versions: /start/stability
- Start: /start
- The site map: /llms.txt

## Navigation

- [Read this page in the browser](/start/philosophy)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/start/llms.txt)
