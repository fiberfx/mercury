<!-- Published by scripts/package_readmes.py from fiberfx/phoenix_live_view/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# Phoenix LiveView Client

`@fiberfx/phoenix_live_view` is the Phoenix LiveView JavaScript client, ported to
TypeScript for Mercury Islands. It ships standard ES2024 modules with TypeScript
declarations and needs no bundler:

```bash
npm i @fiberfx/phoenix @fiberfx/phoenix_live_view
```

```ts
import { Socket } from "@fiberfx/phoenix";
import { LiveSocket } from "@fiberfx/phoenix_live_view";

const liveSocket = new LiveSocket("/live", Socket, { params: { _csrf_token: token } });
liveSocket.connect();
```

`@fiberfx/phoenix_live_view/phoenix_html` is the `phoenix_html` shim described
below. MIT, derived from Phoenix LiveView, Copyright (c) 2018 Chris McCord; see
[LICENSE](LICENSE).

## Upstream client notes

This is the documentation for the LiveView JavaScript client. 
It is a more low-level API documentation for advanced users. 
For a higher-level overview, [see the page on JavaScript interoperability](https://phoenix-live-view.hexdocs.pm/js-interop.html) instead.

## Important note

`./src/phoenix_html.ts` is the replacement for `phoenix_html` single file import in assets.
That's why `phoenix_html` does not required as dependency of the client bundle.
