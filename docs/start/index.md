Mercury builds browser pages with native `mx`, its Hyperscript runtime and Mercury UI components. Start with a [browser page](/start/browser), or use [native mx](/mx/first-app) for TSX development and bundles. Phoenix and BEAM are optional.

## What Mercury is

A Mercury app uses Hyperscript components and Mercury UI styles. Hooks can hold local state; Hypergraph supplies stores, events and effects when the application needs them. `mx` is the native toolchain; its output runs as JavaScript in the browser. Phoenix and LiveView are an optional server integration through Live Mercury.

This documentation site uses that optional server path: an Elixir application paints every page as HTML, and serves each page's companion for agents at the same address with `/llms.txt` appended.

## The pieces

- **mx**: the native toolchain. It installs and verifies packages from static mirrors with no npm and no Node, serves an app with `mx dev`, and builds with `mx build`. Use the [Linux installation route](/start/install-mx) for the public native archive and pinned starter.
- **Mercury Hyperscript**, `@fiberfx/hyperscript`: the virtual DOM, with native DOM semantics (`class`, `for`, native events), hooks, a JSX runtime and a server renderer.
- **Mercury UI**, `@fiberfx/ui`: the design system's components on Hyperscript, styled through tokens.
- **Hypergraph**, `@fiberfx/hypergraph`: the state kernel. Stores, events and effects, their wiring, and fork scopes.
- **Content**, `@fiberfx/content`: published pages, a renderer registry and a block catalog that reads Mercury documents.
- **Live Mercury**, the `live_mercury` Mix package with its browser client `@fiberfx/live-mercury`: Mercury islands inside Phoenix LiveView.

## What Mercury code looks like

A component is a function. It writes `class`, not `className`, and its hooks come from their own entry.

```tsx example
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button class="counter" onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

render(<Counter />, document.getElementById("app")!);
```

`mx` treats a directory holding an `index.html` beside an `mx.mod` as an app. `mx dev` serves it on 127.0.0.1 and prints the page's address. `mx build --bundle` bundles its page, and `mx build --lib <entry> --out <file>` bundles one entry into one module file. It also hot-reloads: a saved module is updated in place, or the page reloads ([MX2](/mx/dev)). Hypergraph's state-keeping swap through it is not delivered yet.

## Choose how to start

- **Existing app or working mx:** preserve the project and follow its development workflow.
- **One browser page, no CLI setup:** [open and adapt the HTML example](/start/browser). It uses plain JavaScript and versioned CDN imports; network access is required.
- **Native TSX development:** [check installation readiness](/start/install-mx), choose the npm bootstrap or verified archive, then follow [the native first page](/mx/first-app). npm installs the Node launcher and platform binary; keep Node available to invoke mx through that launcher.

- **Server integration:** [Use Mercury with Phoenix and LiveView](/live-mercury) when the app needs that server model.

[The Mercury skill](/agent/SKILL.md) makes the same choice for a coding agent. The counter is a starter example; your requested page determines the final content and interaction checks.

## First steps

1. **Build a page:** [Your first Mercury page](/mx/first-app). Install native mx and run a styled Card + Button counter from the public starter.
2. **See what you can use today:** [Stability](/start/stability). Each module's version and tier: Shipped, Preview or Planned.
3. **Give your agent the docs:** [For agents](/start/agents). Load [/SKILL.md](/SKILL.md), or append `/llms.txt` to a lesson address.
4. **Install mx:** [download and verify the Linux archive](/start/install-mx).
5. **Look up a word:** the [Glossary](/start/glossary) links each term to the lesson that teaches it.
6. **Understand the choices:** [Philosophy](/start/philosophy) explains the browser runtime, native build and optional server integration.
7. **Take a course:** [mx](/mx), [Hyperscript](/hyperscript), [Mercury UI](/ui), [Hypergraph](/hypergraph), [Content](/content) or [Live Mercury](/live-mercury).

## The courses, in order

The courses run in this order: Start, mx, Hyperscript, Mercury UI, Hypergraph, Content, Live Mercury. All seven have their first chapters here now; each course's landing lists which chapters are written and which come next. Mercury 4.0.0, the first release under `@fiberfx`, is on npm since 2026-11-05.
