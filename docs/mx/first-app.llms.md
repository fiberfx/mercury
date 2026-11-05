# Your first Mercury page — Mercury LMS

> MX0: a styled Card + Button counter on Hyperscript, built with native mx. Native Linux route; no React, Rust, BEAM or private repository in the app build. Archive/image invocation is Node-free; the planned npm launcher needs Node every time it runs mx.

## Start

Follow [Install mx](/start/install-mx/llms.txt): keep working mx or choose a ready bootstrap, download the starter and verify its checksum before extracting, then `mx install` and `mx verify`. Retain the supplied `package.json`, `mx.mod` and `mx.sum`: Hyperscript/core/ui are pinned at 4.0.0.

## app/main.tsx

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";
import { Card, Button } from "@fiberfx/ui";
import "@fiberfx/ui/styles.css";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Card title="My first Mercury page">
      <p aria-live="polite">Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </Card>
  );
}

render(<Counter />, document.getElementById("app")!);
```

## Verify

HTML needs `#app`, `<!-- mercury:importmap -->` and `<script type="module" src="./app/main.tsx"></script>`. Complete HTML: [First page](/mx/first-app).

`mx dev` prints a loopback URL. Check styling, Count: 0 → 1 → 2 and a saved title edit. Ctrl-C; `mx build` writes `dist/index.html` and assets. Serve dist over HTTP and repeat. If no browser is available, report interaction as unverified.

Do not copy a test fixture or add local replace paths, React or Vite. Keep the CSS import for styling. A checksum failure stops installation. Phoenix/LiveView are optional. [SKILL.md](/SKILL.md) supplies the agent workflow.

## Navigation

- [Read this page in the browser](/mx/first-app)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/mx/llms.txt)
