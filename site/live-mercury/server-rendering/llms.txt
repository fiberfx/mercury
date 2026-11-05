# Server rendering: what is there, and what is not — Mercury LMS

> LM4. `<.mercury ssr={true}>` asks the configured `LiveMercury.SSR` module for an island's HTML on the first, dead render. No module is configured anywhere in the umbrella, SSR is off by default, a `<.mercury>` element starts empty, and the client replaces server markup instead of hydrating it.

## Read this when

You are asked to server-render an island, see an empty island element before JavaScript runs, or see `data-ssr` on an element.

## The contract

- `ssr` assign; default `config :live_mercury, :ssr` (compile time), `false`. Applies only when `__changed__` is `nil` and the socket is not connected (the dead first render).
- On: `LiveMercury.SSR.render(name, encoded_props, slots)`. Raises `LiveMercury.SSR.NotConfigured` → treated as off. Otherwise the element gets `data-ssr` and the response's `:html` as content.
- `LiveMercury.SSR` behaviour: `@callback render(component_name, props, slots) :: render_response | no_return`. Configure with `config :live_mercury, ssr_module: Mod`. Telemetry span `[:live_mercury, :ssr]`, metadata `%{component, props, slots}`. A binary response splits at `<!-- preload -->` into `preloadLinks` (unused by the template) and `html`.
- With no `:ssr_module`, `render/3` returns `%{preloadLinks: "", html: ""}`: `ssr={true}` gives `data-ssr` around empty HTML (tested).
- With SSR off, a `<.mercury>` element starts empty; props are in `data-props`, the default slot base64 in `data-slots`, rendered by the client.
- Client: with `data-ssr`, the first paint clears the element, then renders. No hydration. Without `data-ssr`, existing children are kept.
- `LiveMercury.SSR.ViteJS` (POST `{:vite_host}/ssr_render`) and `LiveMercury.SSR.NodeJS` (a `server.js` via the `NodeJS` package) exist, are not configured here, and need a JavaScript runtime.
- EDU's `<.island>` inner block is a hand-written no-JS fallback, set aside while the island lives and restored after. It is not SSR.

## Minimal example

```elixir
def ssr_on_component(assigns) do
  ~H"""
  <.mercury name="MyComponent" ssr={true} />
  """
end

# with no :ssr_module configured: data-ssr is set, the element's HTML is empty
assert LiveMercury.Test.get_mercury(render_component(&ssr_on_component/1)).ssr == true
```

## Never emit

`config :live_mercury, ssr: true` without a renderer that returns real HTML; a claim that an island is hydrated; `hydrate` or `hydrateRoot` calls in an island bundle expecting Live Mercury to use them.

## Next

- LM5, testing islands: /live-mercury/testing (/live-mercury/testing/llms.txt)
- Back: /live-mercury/props-and-streams/llms.txt
- This companion: /live-mercury/server-rendering/llms.txt

## Navigation

- [Read this page in the browser](/live-mercury/server-rendering)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/live-mercury/llms.txt)
