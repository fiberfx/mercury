# Start here — Mercury LMS

> Mercury: components on Mercury Hyperscript (`@fiberfx/hyperscript`), styled by Mercury UI (`@fiberfx/ui`), state in Hypergraph (`@fiberfx/hypergraph`), built by native `mx`. JavaScript runs in the browser. Phoenix/LiveView is optional. The archive/image route needs no Node/npm, Rust or BEAM installation. The planned npm launcher needs Node at each mx invocation. No React is used. 4.0.0 is on npm (since 2026-11-05).

## Read this when

You are new to Mercury, or you need to decide which module or course answers a task before writing code.

## The modules

- `mx`: the native toolchain. `mx dev [--root <dir>] [--port <n>] [--importmap]` serves an app on 127.0.0.1. `mx build --bundle` (an app's page), `--lib <entry> --out <file>` (one module file), `--host` (a host's line). An app is a directory with `index.html` beside `mx.mod`. Public Linux x86_64 archive and pinned starter: /start/install-mx. Course: /mx.
- `@fiberfx/hyperscript`: virtual DOM. `render`, `h`, `Fragment` from the root; hooks from `/hooks`; `createRoot` from `/client`; `renderToString` from `/server`; JSX with no pragma: the Hypercompiler fixes the runtime and refuses any `@jsx` comment. Course: /hyperscript.
- `@fiberfx/ui`: design system components, token-driven. Course: /ui.
- `@fiberfx/hypergraph`: state kernel. Course: /hypergraph.
- `@fiberfx/content`: published pages, block catalog. Course: /content.
- `live_mercury` (Mix, 2.8.0) and `@fiberfx/live-mercury`: islands in LiveView. Course: /live-mercury.

## Minimal example

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";

function Counter() {
  const [count, setCount] = useState(0);
  return <button class="counter" onClick={() => setCount(count + 1)}>{count}</button>;
}

render(<Counter />, document.getElementById("app")!);
```

## Rules

- Write DOM names: `class`, `for`, `onInput` for each keystroke, `onChange` for the DOM's `change`.
- Build native apps with mx; npm may bootstrap mx when its package is published. The browser-only route needs no build. Do not add Vite configs or imports from `react`, `react-dom`, `next`, `vue`, `solid-js` or `preact` to these Mercury examples.
- `mx dev` hot-reloads: a saved module is updated in place, or the page reloads (/mx/dev). Hypergraph's state-keeping swap is not delivered yet (/hypergraph/hot-replacement); do not promise it.

## Next

- Why: /start/philosophy (companion /start/philosophy/llms.txt)
- Tiers and versions: /start/stability
- How agents read this site: /start/agents
- Install native mx and the pinned starter: /start/install-mx
- Glossary: /start/glossary
- Build a styled Card + Button page: /mx/first-app
- Agent workflow: /SKILL.md
- The site map: /llms.txt
- This companion: /start/llms.txt

## Navigation

- [Read this page in the browser](/start)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)

### Chapter companions

- [/start/agents](/start/agents/llms.txt)
- [/start/glossary](/start/glossary/llms.txt)
- [/start/install-mx](/start/install-mx/llms.txt)
- [/start/philosophy](/start/philosophy/llms.txt)
- [/start/stability](/start/stability/llms.txt)

## Choose a route

Keep an existing app or working mx. Without a CLI, start with [browser HTML](/start/browser/llms.txt). For native TSX, check [npm and archive readiness](/start/install-mx/llms.txt). [The Mercury skill](/agent/SKILL.md) selects by environment and task; the counter is not a substitute for checking the user's requested interactions.
