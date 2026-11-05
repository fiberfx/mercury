# Testing islands: both sides of the element — Mercury LMS

> LM5. Server: `LiveMercury.Test.get_mercury/2` decodes a `<.mercury>` element; `Phoenix.LiveViewTest`'s `render_hook/3` and `assert_push_event/3` test an island's events. Client: `MercuryHook` driven on a stand-in hook under Vitest. EDU: ConnCase page tests, `courseIsland` and boot tests, built-bundle checks, a headless-Chrome page check, and `check_hosts/3` at generation time.

## Read this when

You write a test for an island, its LiveView, or an EDU course page that hosts one.

## The contract

- `LiveMercury.Test.get_mercury(view | html, opts \\ [])`; a `Phoenix.LiveViewTest.View` is rendered first. Needs `{:floki, ">= 0.30.0", only: :test}`. Finds `[phx-hook='MercuryHook']` elements only.
- Returns `%{component, id, props, props_diff, streams_diff, slots, ssr, use_diff, class}`. `props_diff`/`streams_diff`: lists `[op, path]` (remove) or `[op, path, value]`; nonce dropped. `slots`: base64-decoded, e.g. `%{"default" => "…"}`. `ssr`: `data-ssr` present.
- Options `name:` / `id:`; no match raises `No Mercury component found with name="…". Available components: Name#id, …`; another option → `ArgumentError`; no island → `No Mercury components found in the rendered HTML`.
- With `diff` on, `:props` after a connected update is still the first snapshot; assert on `:props_diff`, or `config :live_mercury, enable_props_diff: false` in test config (compile time).
- Simulate a re-render: call `LiveMercury.mercury(assigns)` with `__changed__: %{}` and `assign/3`; a connected socket for stream diffs: `%Phoenix.LiveView.Socket{transport_pid: self()}`.
- Events: `render_hook(view, "event", params)` plays the island's `pushEvent`; `assert_push_event(view, "event", payload)` sees what its `handleEvent` would get.
- Hook tests (`fiberfx/live-mercury/src/hooks.test.ts`): `createLiveViewHook(attrs)` (in `src/test/`, not exported) gives a real element and spies; `getHooks({ TestComponent })`; call `definition[step].call(hook)`; change attributes with `el.setAttribute` between `mounted` and `updated`.
- `EchoEduWeb.Island.check_hosts(source, masked, {body_at, body_len})` → `:ok` or `{:error, reason}`: `:no_id`, `{:outside_body, id}`, `{:duplicate_id, id}`, `{:not_ignored, id}`, `{:no_bundle, id}`, `{:bundle, id}`, `{:props, id}`. `EchoEdu.Gen.split/1` wraps it as `{:error, {:island_host, reason}}`.
- Browser: `node scripts/edu/island-check.mjs <page-url> [screenshot.png]` (default the demo page) checks mount, one `/_edu/live` socket, a click round trip, the no-JS render, no errors.

## Minimal example

```elixir
test "renders component with correct props" do
  html = render_component(&simple_component/1)
  island = LiveMercury.Test.get_mercury(html)

  assert island.component == "MyComponent"
  assert island.props == %{"firstName" => "john", "lastName" => "doe"}
end
```

## Never emit

`island.handlers` (documented in `LiveMercury.Test`'s moduledoc but not in the returned map); `get_mercury/2` on an EDU `CourseIsland` page; an assertion on `:props` after an update with diffs on.

## Limits

The hook tests, `island-check.mjs`, `f1-gate.mjs` and the built-bundle rows need Node. Whether the hook tests pass under `mx test` is not recorded. No browser check found for a `<.mercury>` island.

## Next

- Back to the course: /live-mercury/llms.txt
- This companion: /live-mercury/testing/llms.txt

## Navigation

- [Read this page in the browser](/live-mercury/testing)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/live-mercury/llms.txt)
