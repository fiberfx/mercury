<!-- Published by scripts/package_readmes.py from fiberfx/testing/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/testing

Tests on Mercury Hyperscript, the runtime your users ship (mercury.testing.1). It uses one renderer (hyperscript's own `render` and `act`), DOM Testing Library's queries, and no React, React Testing Library or bare-Preact adapter.

```ts
import { act, cleanup, fireEvent, render, screen, typeInto, waitFor } from "@fiberfx/testing";

afterEach(cleanup);

const view = render(<Search />);                       // queries are bound to this container
typeInto(view.getByRole("searchbox"), "alpha");        // input, then change
await waitFor(() => expect(view.getByText("Alpha")).toBeTruthy());
```

| Export | What it does |
|---|---|
| `render(ui, { container?, baseElement? })` | Mounts inside `act` and returns the queries **bound to the container** (or to `baseElement`, for a portal's host), plus `rerender`, `unmount` (idempotent) and `debug`. `screen` is document-wide and explicit. |
| `cleanup()` | Unmounts every tree `render` mounted, then removes only the containers `render` created. DOM the test owns itself stays. |
| `act(callback)` | Hyperscript's `act`: it runs the callback, awaits the promise the callback returns, and drains queued renders and effects. **It spends no extra microtask turns.** Work that wasn't returned (a promise chain an effect started, a timer) isn't done when `act` resolves; wait for its outcome with `waitFor`. Every failure is the returned promise's rejection. |
| `fireEvent` | DOM Testing Library's, each call inside `act`. It dispatches exactly the native event named: `change` is the DOM's commit event, and `focus` doesn't bubble (a container uses `focusIn`). Nothing is remapped. |
| `typeInto(element, value)` | Sets the value, then fires `input` and then `change`, as a user's typing and commit do. |
| `renderHook(hook, { initialProps?, wrapper? })` | Gives `result.current`, `rerender(props?)` and `unmount`. `rerender()` with no argument re-renders with the last props given (`initialProps` until a `rerender(props)`); `rerender(undefined)` passes `undefined`. |
| `guardRenders({ budget, label })` | Throws `RenderBudgetExceeded` from inside the render once a guarded stretch exceeds `budget` diffs, which fails an update loop while it runs. It chains `options.diffed`, and `release()` restores it. It's test-only. |
| `screen`, `within`, `waitFor`, `waitForElementToBeRemoved`, `prettyDOM`, `getBy*`, `queryBy*`, `findBy*` and their `All` forms, `configure`, `getRoles`, `logRoles` | A port of DOM Testing Library, with no npm dependency. Not ported: its query suggestions, testing-playground URL and colored code frames. |

Peer: `@fiberfx/hyperscript` (the same Mercury version). Inside this repository a suite says `environment: "mercury"`, the vendored host in `host/`, with no dependency on a DOM package. The published package does not carry that host, so a consumer outside the repository still provides a DOM environment of its own.

## Commands

Run these from `fiberfx/testing`.

| Command | Covers |
|---|---|
| `pnpm run test:contract` | MHT1 to MHT3: `vitest run --config vitest.config.ts`, on `src/*.spec.ts(x)` only, which the root config's `*.test.*` globs don't collect |
| `pnpm run test:loop-watchdog` | MHT3's negative control: the unstable fixture with the guard disabled (`MHT3_NO_GUARD=1`), in a child process ended by an outside 30 s watchdog. That's a failed run, never a pass. `--guarded` runs the same with the guard on, expecting it to end by itself |
| `pnpm run check:closure` | MHT6 and MHT7: the packed testing and hyperscript tarballs installed in a fresh consumer outside the workspace. It checks the dist imports, the install closure, a runtime render, click and guard in Node with jsdom, the packed manifest, and the adopters (no built dist imports this package). Needs `pnpm run build` here and in hyperscript |
| `pnpm run test:browser` | MHT5 (T2): native interaction in a real headless Chromium through Playwright's driver (`userEvent` from `vitest/browser`), on `src/browser/*.spec.tsx` with `vitest.browser.config.ts`. It covers typing character by character before any blur, a checkbox's and a select's committed change, focus-within through `focusin`, double-click, and a portal dialog's keyboard close with focus back on its opener. Chromium comes from `PLAYWRIGHT_BROWSERS_PATH`; this lane is Chromium only |
| `pnpm run typecheck` | `tsc --noEmit` |

**Negative controls,** each of which must make its row fail:

- `node scripts/check-closure.mjs --mutant foreign-renderer`: the packed bundle imports npm preact. Fails MHT7's manifest row and MHT6's install row.
- `node scripts/check-closure.mjs --mutant drop-export`: `dist/index.js` is missing from the tarball. Fails MHT6's runtime row.
- `node scripts/loop-watchdog.mjs`: the guard disabled. Ended by the watchdog.
- **In src/browser, by hand:**
  - the text input's `onInput` changed to `onChange` fails "typing updates visible state … before any blur";
  - the container's `onFocusIn` changed to `onFocus` fails the focus-within row.
- **In src, by hand:**
  - queries bound to `document.body` fail MHT1's two-root, portal and cleanup cases;
  - an `act` with ten extra microtask turns fails "act spends no extra turns";
  - an `act` that swallows errors fails the two rejection cases.

**Owned scope and disposal (MHT4)** is in the Effector adopter, `effector/src/testing-adoption.test.tsx`. It measures the engine's own seam: a scoped watch is a node in the scope's `additionalLinks`.

## The socket half

mx's own RFC 6455 engine, built to wasm, as a client on the WHATWG interface and a `Server` it can reach in the same process, for tests. Every frame is real bytes across an in-memory duplex, including the opening handshake, with no network. It has no dependencies. `mx dev` links the same engine natively (the crate).

```js
import { WebSocket, Server, init } from "@fiberfx/testing/socket";

await init();

const server = new Server("wss://example.com/live");
server.on("connection", ({ connection }) => connection.send("hello"));

const socket = new WebSocket("wss://example.com/live");
socket.onmessage = (event) => console.log(event.data);
```

`await init()` first, once: constructing a socket before that throws. It behaves as a browser does where a client can tell: with no server listening at exactly that URL, a client fires `error`, then `close` with 1006. `http` and `https` URLs become `ws` and `wss`. `send` while connecting throws `InvalidStateError`. Stopping a server closes its clients with 1001.

One difference from the standard is deliberate: `readyState` is a plain property, because test suites assign it to put a socket in a state. Events are real `Event`, `MessageEvent` and `CloseEvent` objects on a real `EventTarget`.

A server takes `{ selectProtocol }`, and a client reaches it when its URL, query stripped, is equal. `init()` refuses bytes that are not `wasm/canonical.json`'s. `Engine`, `handshake` and `acceptKey` expose the engine itself. Rebuild the artifact with `sh fiberfx/mx/crates/mx-socket/wasm-build.sh`; `--check` confirms the committed bytes.

Clients reach Servers through one registry on the global, so a client and a `Server` connect even when a test environment and a suite each load their own copy of this module.

## DOM matchers

`@fiberfx/testing/matchers` exports `matchers` for `expect.extend`, jest-dom's own checks for the eight Mercury's suites call: `toBeInTheDocument`, `toHaveAttribute`, `toHaveFocus`, `toHaveTextContent`, `toBeDisabled`, `toBeEnabled`, `toHaveClass` and `toHaveValue`.

## Read-only focus evidence

`inspectFocus(element, { indicatorOwners?, includeNames? })` observes the element's own document and window. It reports the actual `document.activeElement`, whether that is the requested element, `:focus-visible`, computed outline/border/shadow for the control and each explicitly supplied owner, measured boxes, viewport/device scale/visual viewport, forced colors and preferred color scheme. It never moves focus or infers indicator ownership from ancestors or shadow layers. `fireEvent.focus` still dispatches an event; that alone does not move focus or establish keyboard modality.

```ts
import { inspectFocus } from "@fiberfx/testing";

// After the test's real input action, declare the fixture's known indicator owner.
const evidence = inspectFocus(control, { indicatorOwners: [field] });
expect(evidence.isActiveElement).toBe(true);
expect(evidence.element.outline.style).toBe("none");
expect(evidence.indicatorOwners[0].boxShadow).not.toBe("none");
```

These are fixture-specific expectations, not an automatic accessibility verdict. A canonical ring may contain multiple shadows, and an intentional SVG stroke needs its own assertion. Shadow DOM follows `document.activeElement` semantics: the helper reports the host and does not pierce shadow roots. CSS rule provenance and screenshots belong to the runner, not this helper.

`FocusEvidenceError` carries a stable `code`: `invalid-element`, `detached-element`, `cross-document-owner`, `too-many-owners`, `document-unavailable`, `host-unavailable` or `layout-unavailable`. Owners must be connected and share the control's document; at most eight are accepted. Real computed styles, media queries and positive layout boxes are required. Hidden/zero-size subjects, detached frames and no-layout DOM hosts refuse explicitly instead of producing zero-filled evidence. An unavailable visual viewport is represented as `null`.

Diagnostics never collect text content, accessible labels or field values. HTML `name` attributes are omitted unless `includeNames: true` is explicitly requested for a controlled fixture. Identity strings are limited to 160 characters and computed-style strings to 1024; `truncated` lists clipped fields, whose contents must not be treated as complete evidence. IDs and explicit roles remain caller-controlled fixture identifiers.

The native browser suite is `test/focus.test.ts`; run it on the authorized stand with `mx test --root fiberfx/testing --filter focus.test.ts`. `mx` discovers both test/spec files before applying its name filter, so unrelated import failures are still run failures. The suite covers real DOM focus observation, an extra-outline control, event-only false focus, bounded/private diagnostics, unavailable layout/host errors and a second document with a distinct viewport. It makes no keyboard-navigation, forced-color emulation, screenshot or built-package claim; those require the native runner's consumer acceptance lane.
