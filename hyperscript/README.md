<!-- Published by scripts/package_readmes.py from fiberfx/hyperscript/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/hyperscript

Mercury Hyperscript (MHS): the virtual DOM runtime of the `@fiberfx/*` packages. It renders function and class components to the DOM with native DOM semantics (`class`, `for`, native events), ships hooks, a server renderer and a JSX runtime, and has no React compatibility layer.

## Install

```sh
npm install @fiberfx/hyperscript@4.0.0
```

This package is version 4.0.0, coordinated with `@fiberfx/core` and
`@fiberfx/ui` 4.0.0. It declares no runtime dependencies or peer dependencies.
For a native mx app, preserve its module files and use `mx install`; the npm
command above is for an npm-managed consumer.

## Use

In a native Mercury app, mx selects the Hyperscript JSX runtime. Do not add a
JSX pragma comment: the native compiler fixes the runtime and refuses pragmas.

```jsx
import { render } from '@fiberfx/hyperscript';
import { useState } from '@fiberfx/hyperscript/hooks';

function Counter() {
	const [count, setCount] = useState(0);
	return (
		<button class="counter" onClick={() => setCount(count + 1)}>
			{count}
		</button>
	);
}

render(<Counter />, document.getElementById('app'));
```

Without JSX, `h(type, props, ...children)` builds the same tree. Browsers do
not parse JSX or TypeScript; use plain JavaScript `h` calls and an import map
for the [browser-only route](https://mercury.jonnify.com/start/browser).

## Entry points

| Import                                                    | Provides                                                                                                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@fiberfx/hyperscript`                                 | `render`, `hydrate`, `h`/`createElement`, `Fragment`, `createRef`, `cloneElement`, `isValidElement`, `Component`, `createContext`, `createPortal`, `toChildArray`, `memo`                               |
| `@fiberfx/hyperscript/hooks`                           | `useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useRef`, `useImperativeHandle`, `useMemo`, `useCallback`, `useContext`, `useDebugValue`, `useErrorBoundary`, `useId`, `useSyncExternalStore` |
| `@fiberfx/hyperscript/client`                          | `createRoot`, `hydrateRoot`                                                                                                                                                                             |
| `@fiberfx/hyperscript/server`                          | `renderToString`, `renderToStringAsync`, `renderToStaticMarkup`                                                                                                                                         |
| `@fiberfx/hyperscript/jsx-runtime`, `/jsx-dev-runtime` | The automatic JSX runtime (`jsx`, `jsxs`, `jsxDEV`, `Fragment`)                                                                                                                                         |
| `@fiberfx/hyperscript/test-utils`                      | `act`, `setupRerender`, `teardown`, `onCommit`, `onDiff` (test-only: a throw from its listener stops the render)                                                                                         |
| `@fiberfx/hyperscript/inspect`                         | `inspect`, `inspectFailures`: the renderer observed as detached records, root by root, effector's `./inspect` twin (mercury.hyperscript.2)                                                              |
| `@fiberfx/hyperscript/debug`                           | Development warnings                                                                                                                                                                                    |

There is no `./compat` entry and no compat source: React compatibility was deleted (mercury.compat-removal.1). Every sub-path imports the runtime by its own name, so an application holds one runtime. The renderer's hook slots (`options`) are internal to the module; observe it through `./inspect`.

## DOM contract

Mercury Hyperscript follows the DOM, not React. Five rules are pinned by probes in a real browser: `test/browser/dom-contract.test.jsx` in the source repository, run against core in headless Chromium. Each probe has a control that must fail.

1. **`class` and `for`** are the authoring names, on HTML and SVG: `<label class="a" for="x">`. (`className` also works, because it's a DOM property, but `class` is the name to write.)
2. **Native input and change.** On a text input or textarea, `onInput` fires on every keystroke and `onChange` fires on the DOM's `change` event (at least on blur). On a select or checkbox, `onChange` fires per selection or toggle. There is no React-style mapping of `onChange` to input events.
3. **SVG attributes keep their SVG names:** `stroke-width`, `fill-rule`, `clip-path`. `href` works without `xlink`. Core doesn't translate `strokeWidth`.
4. **Focus that bubbles uses `onFocusIn` and `onFocusOut`.** A parent's `onFocus` doesn't fire for a descendant, because `focus` doesn't bubble in the DOM.
5. **Custom elements** receive an object prop as a property and a string as an attribute. Custom events attach through `on<name>`: `onmy-event` listens to `my-event`, and `onionChange` to `ionChange`. A name that starts with a capital after `on` is lowercased, as for built-in events.

## The packed-consumer gate

`pnpm run check:consumer` (after `pnpm run build`) packs this package and installs it into a fresh app outside the workspace, with no aliases and no `mercury-source` condition. It checks what a consumer gets (mercury.64):

- the install has no warning, and its closure holds no npm `preact`, `@preact/*`, React or compat package;
- in Node, `.`, `./client`, `./hooks`, `./server` and both JSX runtimes import, and `./compat`, `./compat/client` and `./compat/jsx-runtime` throw `ERR_PACKAGE_PATH_NOT_EXPORTED` and each fail a Vite build;
- `renderToString` keeps `class`, `for` and `stroke-width`;
- `tsc` accepts a hook component with the contract's spellings and refuses the compat imports;
- the production build takes the runtime only from the installed `dist`, one root module, nothing foreign;
- in Chromium (dev and the production preview) the component renders, follows each keystroke, updates on a click and cleans up on unmount, and root, hooks, jsx-runtime, test-utils and inspect share one renderer.

`--mutant drop-export` (a packed export's file removed), `--mutant npm-preact` (the packed hooks rebound to npm `preact`) `--mutant compat-export` (`./compat` re-exported) and `--mutant compat-browser-dangling` (a browser-only `./compat` whose module fails for another reason) must each fail it. `--work <dir>` chooses the scratch directory, `--keep` keeps it, and `--offline` forbids the registry.

## Provenance

Mercury Hyperscript is vendored from [Preact](https://github.com/preactjs/preact), MIT.

- **Runtime** (`src`, `hooks`, `jsx-runtime`, `debug`, `devtools`, `test-utils`): Preact's `main` branch after the 11.0.2 tag. As imported in `4cb7abce` (2026-10-25), all 49 source files are byte-identical to Preact `main` at [`b21ad22e`](https://github.com/preactjs/preact/commit/b21ad22e5dd99f579cbf094f0c9fcc8cfb299e29) (2026-10-25T07:25:58Z), the last upstream change to them before the import. 46 of them also match the `11.0.2` tag; the other three changed on `main` after it:
  - `src/hooks/index.js`, [`6ba541ab`](https://github.com/preactjs/preact/commit/6ba541ab035073da82664d32a2c07f1e95d4fd54);
  - `compat/src/util.js` (since deleted), [`4683a1e1`](https://github.com/preactjs/preact/commit/4683a1e17c0b45c31c56b97765b957189c0e829f);
  - `src/dom.d.ts`, `b21ad22e`.
- **Server renderer** (`src/server`): vendored from [preact-render-to-string](https://github.com/preactjs/preact-render-to-string), upstream after 6.8.1, as `src/server` records it. Upstream's license is MIT, Copyright (c) 2015 Jason Miller.
- **Mercury's changes since the import** are in this repository's history: the package name and version, the native APIs and one runtime identity (H0, H0b), compat removed from what ships and then deleted (mercury.compat-removal.1), the donor server suite, the numeric-style unit, controlled inputs, and the manifests (mercury.62). The two runtime departures are listed below.

## Mercury's departures from Preact 11

This package vendors Preact 11. Where Mercury's runtime differs on purpose, it says so here.

- **Numeric style lengths are in px.** `style={{ width: 10 }}` writes `width: 10px`, on the client and in `./server`'s HTML alike; unitless properties (`opacity`, `zIndex`, `flex`, `lineHeight`, grid line numbers…) and custom properties (`--gap`) are written as given. Preact 11 dropped the client's px rule; Mercury's server renderer never did, and Mercury's own components and React-era code write numeric lengths, so the client agrees with the server. The list and the rule live in one module, `src/style.js`, which both renderers import. (H0e)
- **A controlled input shows its prop.** When an `<input>`, `<textarea>` or `<select>` has a `value` or `checked` prop, a handler that refuses an edit leaves the element as the prop says. After the element's own `onInput` or `onChange` handler runs and every render it queued has run, a `value` or `checked` that no render wrote is written back. So `<input value="a" onInput={() => {}} />` stays `a`, and `<input type="checkbox" checked={false} onChange={() => {}} />` stays unchecked.
  - **An accepted edit is untouched,** caret included, because its render already wrote the new value.
  - **A refused text edit** puts the caret back where the edit was made.
  - **A refused radio click** restores the group's controlled radios, so the checked one stays checked.
  - **No write-back during composition.** An input event between `compositionstart` and `compositionend` is `isComposing`, and an IME keeps its text until it commits.
  - **No cost to an uncontrolled element:** an element with `defaultValue`, `defaultChecked` or neither prop never queues a write-back.

  Preact 11 compares `value` and `checked` with the DOM only during a render, so a refused edit stays on screen. Mercury's components and React-era code are written for controlled semantics. The write-back is `restoreControlled` in `src/diff/props.js`; it runs in the render queue's flush, `process` in `src/component.js`. (H0f)

---

## License

MIT. See [LICENSE](LICENSE): Copyright (c) 2015-present Jason Miller, Preact's author. The server renderer is MIT too, Copyright (c) 2015 Jason Miller (preact-render-to-string).
