# Testing and inspecting — Mercury LMS

> HS5 of Mercury Hyperscript. `@fiberfx/hyperscript/test-utils` flushes batched renders and after-paint effects for tests; `./inspect` gives detached records of what the renderer does; `./debug` turns on development checks when imported.

## Read this when

You write a test for a Mercury component, build a tool that watches renders, or need a clear error for a hook, key or `render` mistake.

## The contract

- `act(callback: () => void | Promise<void>): Promise<void>`: runs the callback, then flushes renders and effects until settled. A sync callback is flushed before `act` returns, so no `await` is needed; for an async one, `await act(async () => …)`. Nested calls flush once, at the outermost.
- `setupRerender(): () => void`: queued renders wait until you call the returned function. `teardown()` drains the rest and restores the queue; call it after each such test.
- `onCommit(listener: (root) => void): () => void`: called after each commit, once per root, with the DOM updated.
- `onDiff(listener: () => void): () => void`: test-only, called inside the renderer after each diffed node; a throw stops the render and propagates out of `render`.
- `inspect({ root?, phases?, fn }): Subscription`: `phases` ⊆ `root | render | diffed | commit | unmount | error` (an unknown one throws `TypeError`); `root` is a container passed to `render`/`hydrate`. The record is `{ kind, id, parentId, rootId, type, name, error? }`: detached, `structuredClone`-safe, ids stable across re-renders. It returns `dispose()` (also `.unsubscribe()`). `inspectFailures(): number` counts contained subscriber throws. Importing installs nothing.
- `import "@fiberfx/hyperscript/debug"` (side effect, development only): it throws on an undefined `render` parent, an undefined component, or a hook outside render, and `console.error`s duplicate keys and improper table/paragraph nesting. It exports `getDisplayName`, `getCurrentVNode`, `getOwnerStack`, `captureOwnerStack`, `setupComponentStack` and `resetPropWarnings`.
- Mercury UI's harness, `fiberfx/ui/test/testing.ts`, wraps `render`, `rerender`, `unmount`, `cleanup` and `fireEvent` in `act`; its queries come from `@fiberfx/testing`.

## Minimal example

```tsx
import { expect, it } from "vitest";
import { render } from "@fiberfx/hyperscript";
import { useEffect, useState } from "@fiberfx/hyperscript/hooks";
import { act } from "@fiberfx/hyperscript/test-utils";

function Greeting() {
  const [name, setName] = useState("…");
  useEffect(() => setName("Mercury"), []);
  return <p>Hello, {name}</p>;
}

it("flushes the effect's update", () => {
  const container = document.createElement("div");
  act(() => render(<Greeting />, container));
  expect(container.textContent).toBe("Hello, Mercury");
});
```

## Never emit

- Assertions on the DOM right after a state update outside `act` or `setupRerender`: the render is still queued.
- `options` from the root entry to hook into the renderer: use `./inspect`, or `onCommit`/`onDiff` in tests.
- `onDiff` in application code: it is test-only.
- A testing library for another framework: use `act` from `./test-utils` (Mercury UI's harness builds on it).

## Next

- Rendering on the server: /hyperscript/server/llms.txt
- Components and render: /hyperscript/components/llms.txt
- This companion: /hyperscript/testing/llms.txt (the page as Markdown, `/hyperscript/testing.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hyperscript/testing)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hyperscript/llms.txt)
