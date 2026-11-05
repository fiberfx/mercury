`mx dev` is the loop you work in: save a file, and the page you have open takes the change. This page follows one save from the disk to the page.

## What mx dev serves

```sh
usage: mx dev [--root <dir>] [--port <n>] [--importmap]
```

It binds 127.0.0.1 and prints `listening http://127.0.0.1:<port>/`. At that address it answers four kinds of path:

- **`/`, the page:** `index.html` with the import map where `<!-- mercury:importmap -->` stands. Right after the map come a `<meta name="mx-dev-token">` and a module script for the hot client. Every page gets the client, so an edit reaches a page even before any of its modules can be hot-replaced.
- **`/@mx/client.js`**, the hot client.
- **`/@mx/<package name>/<path>`**, a member's files. A member that has its source is compiled on request and watched; any other member is served from its build and never watched.
- **every other path**, the app's own files. A module (`js`, `mjs`, `jsx`, `ts`, `mts` or `tsx`) is compiled on request; anything else is served as it is.

## How it sees a save

mx dev doesn't ask the operating system for change events. Every 10 ms it looks at each file a page has asked for: one `stat` each, a few dozen at most. Because it only polls, it works the same on every machine and in containers, with no inotify, FSEvents or kqueue.

A change is acted on only after two more looks see it unmoved, which is at least 20 ms of stillness, so a save that arrives in several writes isn't compiled half-written. A save whose bytes hash the same as before is no change at all.

## From an edit to an update

What happens next depends on what changed:

| The saved file | What the page is sent |
|---|---|
| not a module, such as a stylesheet or JSON | `full-reload` |
| a module that had never run | `full-reload`: there is nothing to replace |
| a module whose new text is refused | `error`, and the page keeps running what it has |
| a module that compiles | the walk below |

**The walk.** From the changed module, mx dev walks up through the modules that import it until it reaches modules that accept the update, stamping each module it passes. Every open page then gets one `update` message. When it imports a stamped module again, the import carries `?t=<stamp>`, so the browser fetches the new text and not its cached copy. If the walk reaches a module that nothing imports and that doesn't accept, the page gets a `full-reload` instead.

On the page, the client takes an `update` in order. It calls the old module's `dispose`, imports `<path>?t=<timestamp>`, and hands the fresh module to the `accept` callback. If that import fails, the page keeps the module that was running, and the next save is tried like any other.

## Which modules accept

The compiler decides, not the text. A module accepts an update when its compile says `hmrRoot`; mx never searches the source for an `accept` call.

The Hypercompiler marks a module that renders. When a module imports `render` or `hydrate` from `@fiberfx/hyperscript`, the compiler rebinds them to a root handle from `@fiberfx/hyperscript/hmr`, and the module accepts its own update. Anything that handle can't account for reloads, and so does a module reached only through other modules' imports.

The client still gives every module `import.meta.hot` with its four members, `data`, `accept`, `dispose` and `invalidate`. `accept` takes a callback or nothing; accepting another module's update is outside the contract. An `invalidate` passes the update on to the module's importers. If that walk comes back to the module that started it, as two modules that import each other can, the page gets a full reload instead.

## When an edit is refused

A save that doesn't compile doesn't break the page:

- every open page gets an `error` message, `<path>: <the refusal>`, which the client writes to the console as `mx dev: …`;
- the page keeps running the module it already has;
- while the file stays refused, a request for that module answers 500 with the refusal;
- the next save tries again.

Two more cases are covered:

- **No page open.** An edit made while no page is open still reloads the next page that connects, which may have loaded the old text.
- **The server goes away.** The client polls once a second, and reloads as soon as mx dev answers again.

## The socket and its guards

The hot socket is at `/` and speaks Vite's protocols, so the handshakes are Vite's:

- an upgrade offering `vite-hmr` gets 101, and the socket opens with `{"type":"connected"}`;
- one offering `vite-ping` gets 101 and an immediate close with code 1000;
- any other path or protocol answers 400: `an HMR socket is at / and speaks vite-hmr or vite-ping`.

mx dev serves only this machine, and it checks that on every request:

- **The Host.** A request whose Host isn't a loopback name answers 403, `this host name is not allowed: mx dev answers loopback names only`. That stops a DNS-rebinding page.
- **The Origin.** A socket asked for from a page whose origin isn't loopback answers 403.
- **The token.** A page's `vite-hmr` socket must carry the page's `?token=`, which the client reads from `<meta name="mx-dev-token">`. Without it the answer is 400.

## Members from the workspace

An app's members are the directories its `mx.mod` replaces. Inside an `mx.work`, one package could come from two places: a `replace` line and a workspace member in another directory. mx refuses that, in mx dev and in every other command that resolves, and names both directories:

```text
<name> is both <app>'s replace (<dir>) and the mx.work's member (<dir>): remove the replace, or the member from mx.work, or build with MXWORK=off
```

A `replace` that points at the member's own directory is one source and passes. Two `replace` lines for one package are refused with `… one directory per package`.

## What is shipped

The loop above is built. Two limits are known:

- **App code.** On this site, a saved edit to `app/` is applied in place, and the page then reloads once. That reload is being traced.
- **Members and models.** An edit to a member's source reaches the page by a full reload. A model module that doesn't render is not an accepting module, so an edit to it reloads the page. Hypergraph's in-place swap of a model's graph is not delivered by `mx dev` yet.
