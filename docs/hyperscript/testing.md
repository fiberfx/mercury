Two things make a component test harder than a function test. Hyperscript batches renders: a state update queues one instead of rendering at once. And effects run after paint. `@fiberfx/hyperscript/test-utils` puts both under a test's control. Two more entry points help beside it: `./inspect`, which reports what the renderer does, and `./debug`, which adds development checks.

## act

`act(callback)` runs `callback` and then flushes: every queued render and every pending effect, again and again until nothing is left. When `act` returns, the DOM shows the settled result.

```tsx
import { describe, expect, it } from "vitest";
import { render } from "@fiberfx/hyperscript";
import { useEffect, useState } from "@fiberfx/hyperscript/hooks";
import { act } from "@fiberfx/hyperscript/test-utils";

function Greeting() {
  const [name, setName] = useState("…");
  useEffect(() => setName("Mercury"), []);
  return <p>Hello, {name}</p>;
}

describe("Greeting", () => {
  it("shows the name its effect sets", () => {
    const container = document.createElement("div");
    act(() => render(<Greeting />, container));
    expect(container.textContent).toBe("Hello, Mercury");
  });
});
```

- **A synchronous callback is flushed before `act` returns.** You don't have to `await` it, though it returns a promise.
- **An async callback is flushed when its promise settles.** Then `await act(async () => { … })`.
- **Nested calls flush once,** when the outermost `act` returns.

`act` takes over the renderer's frame and render-queue slots while it runs, and puts the previous ones back when it is done.

## Controlling the render queue

`setupRerender()` makes the render queue wait: a state update queues its render, and nothing renders until you call the function it returns. Use it to look at the DOM before and after a single update. `teardown()` drains what is left and restores the queue to normal; call it after each test that used `setupRerender`.

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";
import { setupRerender, teardown } from "@fiberfx/hyperscript/test-utils";

let increment = () => {};
function Counter() {
  const [count, setCount] = useState(0);
  increment = () => setCount(count + 1);
  return <b>{count}</b>;
}

const container = document.createElement("div");
const rerender = setupRerender();
render(<Counter />, container);
increment();
// container.textContent is still "0": the render is queued
rerender();
// container.textContent is now "1"
teardown();
```

Hyperscript's own `./inspect` suite drives a counter this way.

## onCommit and onDiff

Two listeners report what the renderer did. Each returns a function that removes it, and calling that function twice is harmless.

- **`onCommit(listener)`** calls `listener(root)` after each commit, once per root that was diffed, with the DOM up to date.
- **`onDiff(listener)`** calls `listener()` inside the renderer after each node it diffs. It is for tests only: a throw from the listener goes into the render and stops it where it is, so a test can put a ceiling on a loop of updates.

```ts
import { onDiff } from "@fiberfx/hyperscript/test-utils";

let diffs = 0;
const stop = onDiff(() => {
  if (++diffs > 1000) throw new Error("more than 1000 diffs: an update loop?");
});
// … render and interact …
stop();
```

## Mercury UI's test harness

Mercury UI's components are tested through `fiberfx/ui/test/testing.ts`, which builds the familiar `render`, `rerender`, `unmount`, `cleanup` and `fireEvent` on `act`. Its `render(ui)` mounts with Hyperscript's `render` inside `act`, and every `fireEvent` runs inside `act` too, so a test's next line always sees the settled DOM. The queries come from `@fiberfx/testing`.

## Watching the renderer

`@fiberfx/hyperscript/inspect` reports what the renderer does as records. A tool such as a devtools panel or a profiler can use it, and so can a test.

```ts
import { inspect, inspectFailures } from "@fiberfx/hyperscript/inspect";

const app = document.getElementById("app");
if (app) {
  const stop = inspect({
    root: app,
    phases: ["render", "error"],
    fn: (record) => console.log(record.kind, record.type, record.name ?? "", record.id),
  });
  // … later
  stop();
  console.log(inspectFailures(), "subscriber calls threw");
}
```

- **Six phases:** `root`, `render`, `diffed`, `commit`, `unmount` and `error`. `phases` picks some; leave it out for all six. An unknown phase throws a `TypeError` that names the six.
- **`root` picks one root:** the container you passed to `render` or `hydrate`. Leave it out to hear from every root.
- **A record is detached.** It holds `kind`, `id`, `parentId`, `rootId`, `type` (a tag, `"#text"`, `"#fragment"` or `"#component"`), `name` (a function component's name, else `null`) and, for `error`, the thrown `error`. It holds no node or component, so it survives `structuredClone`.
- **Ids are stable.** A mounted component keeps its id across re-renders, and a remounted one gets a new id.
- **An observer can't break the app.** A throw from `fn` is caught and counted, and `inspectFailures()` returns the count. The other subscribers still receive the record.
- **Importing it costs nothing.** The first `inspect` call installs its handlers; `inspect` returns the function that disposes the subscription, also reachable as `.unsubscribe()`.

## Development checks

`@fiberfx/hyperscript/debug` adds checks to the renderer. Importing the module turns them on: it has side effects, so import it once, in a development entry or a test setup. The package's README lists it as development warnings.

With it, a mistake that would otherwise fail obscurely gets a message:

- **Thrown:** `render` with an undefined parent ("Undefined parent passed to render(), this is the second argument."), an undefined component passed to `createElement`, usually a missed export, and a hook called outside a component's render ("Hook can only be invoked from render methods.").
- **Logged with `console.error`:** two children with the same `key`, and improper nesting of tables and paragraphs. Each message names the component and its owner stack.

It also exports helpers for tools: `getDisplayName(vnode)`, `getCurrentVNode()`, `getOwnerStack(vnode)`, `captureOwnerStack()`, `setupComponentStack()` and `resetPropWarnings()`.

No file under `fiberfx/ui/src`, `fiberfx/ui/test` or `fiberfx/core` imports `./inspect` or `./debug`, or calls `setupRerender`: Mercury UI's own tests use `act` alone.
