# Mercury LMS

> Mercury combines mx (the native Rust toolchain), Hyperscript (its own DOM runtime), Hypergraph (state) and Mercury UI. Phoenix and LiveView integration is available through Live Mercury. The archive/image workflow invokes native mx without Node.js or npm CLI. The planned npm wrapper requires Node for each mx invocation. Mercury uses Hyperscript, not React.

## Read this when

You are about to write, build or explain a Mercury app, and need to know which module does what and where its course is.

## Choose a route

Keep an existing app or working mx. Without a CLI, start with [browser HTML](/start/browser/llms.txt). For native TSX, check [npm and archive readiness](/start/install-mx/llms.txt). [The Mercury skill](/agent/SKILL.md) selects by environment and task; the counter is not a substitute for checking the user's requested interactions.

## The modules

- mx — the native toolchain: `mx build --bundle|--host|--lib`, `mx dev`, `mx test`, `mx check`. Course: /mx.
- `@fiberfx/hyperscript` — the virtual DOM, JSX runtime and hooks. Course: /hyperscript.
- `@fiberfx/ui` — the design system's components and tokens. Course: /ui.
- `@fiberfx/hypergraph` — the state kernel. Course: /hypergraph (its companion: /hypergraph/llms.txt).
- `@fiberfx/content` — page documents and the block catalog. Course: /content.
- `live_mercury` — Mercury islands in Phoenix and LiveView. Course: /live-mercury.

## Rules for agents

- Use mx for a native app, or plain JavaScript for the browser-only route. npm may bootstrap the published native mx package; it is not the native app build tool.
- Never emit React, Next.js, Vue, Solid, or Effector code or imports.
- Every page here answers `<page>/llms.txt`.
- Every English companion, in course order, in one file: /llms-full.txt

## Status

The Phoenix `mercury_lms` website serves the bilingual homepage at / and /ru. The native app example retained under `sites/mercury` is a separate application. Check /start/stability for module readiness and /start/install-mx for the current installation route. Registry publication alone does not prove a working native install: follow the steps and check the result at /mx/first-app. A page marked Planned has no runnable example.

## Native first page

- [Mercury page-building skill](/SKILL.md).
- [Install mx](/start/install-mx/llms.txt): public archives and SHA-256 verification.
- [First page](/mx/first-app/llms.txt): styled Card + Button counter, dev and build.

Start in a new directory on Linux x86_64. Keep the starter mx.mod and mx.sum. Import @fiberfx/ui/styles.css. The browser runs JavaScript; BEAM is optional.

## Navigation

- [Read this page in the browser](/)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [/content](/content/llms.txt)
- [/hypergraph](/hypergraph/llms.txt)
- [/hyperscript](/hyperscript/llms.txt)
- [/live-mercury](/live-mercury/llms.txt)
- [/mx](/mx/llms.txt)
- [/start](/start/llms.txt)
- [/ui](/ui/llms.txt)
- [Русский индекс](/ru/llms.txt)
