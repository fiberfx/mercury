The browser route creates a Mercury page without installing mx, Node.js, Rust or BEAM. It uses plain JavaScript with Hyperscript `h` and `render`, Mercury UI `Card` and `Button`, and a linked stylesheet. The browser fetches packages from UNPKG at version 4.0.0; this is not an offline bundle.

## Open the example

Open [the complete first-page example](/examples/first-page.html). You need a browser with import-map support and network access to `unpkg.com`. The expected result is a styled card and an `Increment` button. If packages or styles fail to load, inspect the browser's console and network panel before continuing.

## Make your own copy

Save the example as `index.html` in a new directory, or fetch it:

```sh
mkdir mercury-browser-page
cd mercury-browser-page
curl -fL https://mercury.jonnify.com/examples/first-page.html -o index.html
```

Open the saved file in a browser, or serve the directory with your existing static HTTP preview. If the environment blocks module loading from a local file, use the HTTP preview. Edit the title, copy and components in that file. Preserve the import map and stylesheet link unless you deliberately change the dependency source.

## How it works

The HTML import map pins these browser entries:

| Import | URL |
|---|---|
| `@fiberfx/hyperscript` | `https://unpkg.com/@fiberfx/hyperscript@4.0.0/dist/mhs.mjs` |
| `@fiberfx/hyperscript/hooks` | `https://unpkg.com/@fiberfx/hyperscript@4.0.0/dist/hooks.mjs` |
| `@fiberfx/hyperscript/jsx-runtime` | `https://unpkg.com/@fiberfx/hyperscript@4.0.0/dist/jsx-runtime.mjs` |
| `@fiberfx/core` | `https://unpkg.com/@fiberfx/core@4.0.0/dist/index.js` |
| `@fiberfx/ui` | `https://unpkg.com/@fiberfx/ui@4.0.0/dist/index.js` |

A `<link rel="stylesheet">` loads `https://unpkg.com/@fiberfx/ui@4.0.0/dist/styles.css`. Version pinning fixes the requested version; it is not a local checksum or offline copy. The browser and CDN remain part of the delivery path.

The application is ordinary JavaScript. This component fragment shows the shape; the downloadable HTML supplies the full imports, map and mount element:

```js
function Counter() {
  const [count, setCount] = useState(0);
  return h(Card, { title: "My first Mercury page", variant: "raised" },
    h("p", { id: "count", "aria-live": "polite" }, `Count: ${count}`),
    h(Button, { onClick: () => setCount(count + 1) }, "Increment")
  );
}
render(h(Counter, null), document.getElementById("app"));
```

Do not paste TSX into the browser module script: a browser does not compile JSX or TypeScript. Use `h(Component, props, children)` on this route. The `jsx-runtime` map entry serves the published packages' imports; it does not turn the browser into a TSX compiler.

## Check the page

For the supplied counter, confirm that the card and button are styled, two clicks change 0 to 1 to 2, and a saved heading edit appears after reload. Check for failed module, stylesheet or font requests. For your own page, exercise the interactions the user requested, including an appropriate invalid input or boundary case. The counter is an example, not the acceptance criteria for every page.

Report what you actually observed. Downloading HTML is not a browser check. If no browser is available, return the file and state that appearance and interaction remain unverified. There is no native build step for this route.

## When to use mx

Keep an existing Mercury app's toolchain. If `mx --version` already works, use [the native first-page workflow](/mx/first-app) for TSX, development serving and a `dist/` build. Otherwise [Install mx](/start/install-mx) compares the npm bootstrap and checksum-verified archive routes and states their readiness. Phoenix/LiveView remains an [optional integration](/live-mercury).
