Server rendering is the part of Live Mercury most likely to be misread, so this lesson keeps to what the code does. The short version: there is a switch and a behaviour for a renderer, no renderer is configured, and the client never hydrates.

## Where server rendering stands

- `<.mercury>` has an `ssr` flag. It is **off by default**, and nothing in the umbrella sets `:ssr_module`, the renderer it would call.
- With SSR off, a `<.mercury>` element is empty until its JavaScript runs.
- When an element does hold server markup, the client's first paint **replaces** it. There is no hydration.
- EDU's islands show server-rendered HTML before JavaScript runs, but that HTML is the page's own fallback, not the component rendered on the server.
- live_mercury's own guide says it plainly: Mercury Hyperscript's own server rendering through LiveMercury is not part of this release.

## The ssr flag

`ssr` is a reserved assign of `mercury/1`:

```elixir
~H"""
<.mercury name="MyComponent" ssr={true} />
"""
```

Its default is `config :live_mercury, :ssr`, read at compile time, and `false` when unset. Even when it is on, it applies only to the **first, dead render**: the render with no change tracking yet (`__changed__` is `nil`) and no connected socket. Every connected render ignores it.

When the flag applies, `mercury/1` calls `LiveMercury.SSR.render(name, props, slots)` with the encoded props. If that raises `LiveMercury.SSR.NotConfigured`, the island renders as if SSR were off. Otherwise the element gets `data-ssr`, and its content is the response's `:html`.

There is a trap here, which a test pins down. With no `:ssr_module` configured, `render/3` does not raise: it returns `%{preloadLinks: "", html: ""}`. So `<.mercury ssr={true}>` marks the element `data-ssr` around empty HTML. That is why the default is off: the comment above `@ssr_default` says a default-on flag did exactly that.

## LiveMercury.SSR and render/3

`LiveMercury.SSR` is a behaviour with one callback:

```elixir
@callback render(component_name, props, slots) :: render_response | no_return
```

A renderer is a module that implements it, named in config:

```elixir
config :live_mercury, ssr_module: MyCustomSSRModule
```

`LiveMercury.SSR.render/3` calls the configured module inside a telemetry span, `[:live_mercury, :ssr]`, whose metadata is the component name, the props and the slots. A binary response is split at the first `<!-- preload -->` into `preloadLinks` and `html`; any other response is returned as it is, and only its `:html` reaches the element. `mercury/1`'s template does not use `preloadLinks`.

Two implementations remain in the app for projects that run their own renderer, and both need one outside the BEAM:

- `LiveMercury.SSR.ViteJS` posts the name, props and slots to `http://{:vite_host}/ssr_render`. LiveMercury ships no Vite plugin and no server renderer for that endpoint.
- `LiveMercury.SSR.NodeJS` calls a `server.js` file through the `NodeJS` package.

They raise `LiveMercury.SSR.NotConfigured` when they cannot reach a renderer: ViteJS when `:vite_host` is unset, NodeJS when the `NodeJS` package is not loaded or its supervisor is not running. Neither is configured in this repository, and this course does not use them: they would put a JavaScript runtime back into the island's render path.

## An island without SSR

With SSR off, a `<.mercury>` element starts empty. All islands of this type in the repository use this setting. Everything the component needs travels in attributes:

- the props in `data-props`, as compact JSON;
- the default slot's HTML in `data-slots`, base64-encoded, which the client renders as the component's child.

So a `<.mercury>` island shows nothing until its bundle loads and `MercuryHook` paints. LiveView renders everything around the island as usual, so the page reads; the island's own content needs JavaScript.

## No hydration

Hydration would mean the client adopts the server's DOM and attaches to it. Live Mercury does not do that. On the first paint of an element marked `data-ssr`, the hook clears the element and renders the component afresh. The reason is in the hook's source: hyperscript's `render()` reuses what matches and leaves the rest beside the island, so without the clear a partial match would show the server's markup and the island's side by side.

A test fixes the behaviour: an element holding `<span>server</span><p>fallback</p>` with `data-ssr` shows only the island after `mounted()`, with one child.

An element **without** `data-ssr` keeps the children it holds. That is how EDU's props script survives: the hook paints beside it.

## EDU's fallback, which is not SSR

EDU's host, `EchoEduWeb.Island.island/1`, does put readable HTML in the page: its inner block, written by the LiveView's template.

```elixir
~H"""
<.island id={@island_id} bundle={@bundle} props={%{title: "The demo island"}}>
  <p class="mx-text mx-text--muted">The island mounts here when JavaScript runs.</p>
</.island>
"""
```

That HTML is a fallback written by hand, not the component's render. When the island mounts, EDU's boot sets it aside, except the props script, and puts the same nodes back when the island ends. A page test checks that the island page's server render reads without JavaScript.

Use the fallback when a page must read without JavaScript. It is honest about what it is: the reader sees the fallback, then the island.

## What is not there

- **No renderer.** No config file in the umbrella sets `:ssr` or `:ssr_module` for `:live_mercury`.
- **No Mercury renderer wired in.** `@fiberfx/hyperscript` has a `./server` entry, packaged as `@fiberfx/render-to-string` with `renderToString`, and exports `hydrate` (and `hydrateRoot` from its client entry); [Rendering on the server](/hyperscript/server) covers them. Nothing in `echo/apps/live_mercury`, `@fiberfx/live-mercury` or EDU's boot calls any of them.
- **No hydration**, by design of the current hook.
- **`preloadLinks`** is parsed and never used.

Turning server rendering on is, in the guide's words, its own measured step. Until it lands, write islands that render well from their props alone, and give EDU pages a fallback.
