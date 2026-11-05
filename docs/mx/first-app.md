This page takes a Linux x86_64 sandbox from public downloads to a styled Mercury UI `Card` with a `Button` that increments a counter. The application uses Hyperscript and Mercury UI. The app needs no React, Rust build, BEAM installation or private repository. The archive/image routes invoke native mx without Node/npm. The planned npm route installs a Node launcher and native platform package; Node remains required to invoke mx through that launcher.

## Start from the public download

Keep an existing app and working mx. For this new starter, follow [Install mx](/start/install-mx): select the existing-mx, npm or full-archive path, check publication readiness and verify the starter checksum, then run `mx install` and `mx verify`. It leaves you in `mercury-first-page/` with mx on this shell's `PATH`. The starter pins `@fiberfx/hyperscript`, `@fiberfx/core` and `@fiberfx/ui` at 4.0.0 and includes `mx.sum`; do not replace its dependency files with an empty `mx.mod`.

## The complete app

```text
mercury-first-page/
  index.html
  app/main.tsx
  package.json
  mx.mod
  mx.sum
```

`index.html` beside `mx.mod` makes the directory an app to mx. `package.json` identifies the application and its package dependencies; `mx.mod` records the module requirements and `mx.sum` pins downloaded contents. The public starter resolves dependencies without local `replace` directories or copied repository sources.

The HTML entry needs a mount element, the import-map marker and a module script. This is a standalone browser app. The documentation website is served by the Phoenix `mercury_lms` application; the repository also retains a separate native example under `sites/mercury`. Neither source tree is needed for this starter:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My first Mercury page</title>
  <!-- mercury:importmap -->
</head>
<body>
  <main id="app"></main>
  <script type="module" src="./app/main.tsx"></script>
</body>
</html>
```

The marker tells mx where to insert the import map. The script names the TSX entry that mx compiles. This HTML can replace the starter's entry if you want the minimal layout.

## The counter component

Replace `app/main.tsx` with this complete component, or edit the equivalent counter supplied in the starter:

```tsx example
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

`render` mounts the component into `#app`; `useState` keeps its local count. `Card` and `Button` come from Mercury UI, and the explicit stylesheet import supplies their styles and tokens. JSX uses Hyperscript's runtime, selected by mx; no JSX pragma is needed. The compiled application runs as JavaScript in the browser.

## Run and change the page

From the app directory:

```sh
mx dev
```

Open the printed `http://127.0.0.1:<port>/` address. If your browser is outside the sandbox, use that environment's port-forwarding facility; mx listens on loopback. The page should show a styled card, `Count: 0` and an `Increment` button. Click once: the count should become 1. Click again: it should become 2.

Change the card title in `app/main.tsx` and save. Confirm that the new title appears. Hot reload may reload the page and reset this local counter; this exercise does not promise state preservation across edits. Stop mx with Ctrl-C before the next command.

## Build the page

```sh
mx build
```

mx recognizes the app and bundles it into `dist/`. The result includes `dist/index.html` and `dist/assets/`, with JavaScript and the imported UI styles. Serve `dist/` with your static HTTP server or hosting preview and repeat the counter check. A BEAM server is optional; [Live Mercury](/live-mercury) covers Phoenix and LiveView integration separately.

mx marks its output directory with `.mx-bundle`. It refuses to overwrite a non-empty output directory it does not recognize, or the app's root. Keep the default `dist/` for this exercise.

## Check the result

- **Dependencies:** `mx install` and `mx verify` finish successfully with the starter's pins.
- **Development:** the page loads with Card and Button styling, two clicks produce 1 and 2, and a saved title edit appears.
- **Production:** `mx build` writes `dist/index.html` and assets; the served bundle retains the styles and counter interaction.
- **Failure:** if the archive checksum fails, do not extract or run it. If the browser reports a missing package or stylesheet, stop and resolve that error before calling the page complete.

The candidate native downloads require Linux x86_64 with glibc 2.39 or later, as measured from their ELF symbol requirements. Consumer verification is pending; macOS and Windows are not verified by this recipe. See [Modules](/mx/modules) when you are ready to add dependencies and [Dev loop](/mx/dev) for the server's detailed behavior.
