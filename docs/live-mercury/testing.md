An island is tested from both ends of its element. On the server, the question is what LiveView rendered into it. In the browser, the question is what the hook renders from it. This lesson follows the tests this repository already has, so every pattern here runs somewhere.

## Two sides, one element

| Side | Tests | Tool |
|---|---|---|
| server, `<.mercury>` | the element's name, props, diffs, slots, `data-ssr` | `LiveMercury.Test.get_mercury/2` |
| server, a LiveView | events from the island, events back to it | `Phoenix.LiveViewTest`: `render_hook/3`, `assert_push_event/3` |
| client, `MercuryHook` | what the hook renders for an element and its updates | a stand-in hook on a real element, under Vitest |
| EDU | the host's form, the boot's forwarding, `courseIsland` | ConnCase tests, Vitest, `check_hosts/3` |

## LiveMercury.Test.get_mercury/2

`get_mercury(view_or_html, opts \\ [])` finds an island in rendered HTML and decodes it. It takes either a `Phoenix.LiveViewTest.View`, which it renders first, or an HTML string. It needs Floki in the test environment; without it, it raises and names the dependency to add, `{:floki, ">= 0.30.0", only: :test}`.

```elixir
def simple_component(assigns) do
  ~H"""
  <.mercury name="MyComponent" firstName="john" lastName="doe" />
  """
end

test "renders component with correct props" do
  html = render_component(&simple_component/1)
  island = LiveMercury.Test.get_mercury(html)

  assert island.component == "MyComponent"
  assert island.props == %{"firstName" => "john", "lastName" => "doe"}
end
```

It returns a map with these keys:

| Key | From |
|---|---|
| `:component` | `data-name` |
| `:id` | `id` |
| `:props` | `data-props`, decoded from compact JSON |
| `:props_diff`, `:streams_diff` | `data-props-diff`, `data-streams-diff`, as lists: `[op, path]` for a remove, `[op, path, value]` otherwise; the nonce is dropped |
| `:slots` | `data-slots`, each slot base64-decoded, such as `%{"default" => "Simple content"}` |
| `:ssr` | `true` when `data-ssr` is present |
| `:use_diff` | `data-use-diff == "true"` |
| `:class` | `class` |

With several islands on a page, it returns the first, or the one named by an option:

```elixir
island = LiveMercury.Test.get_mercury(html, name: "UserCard")
island = LiveMercury.Test.get_mercury(html, id: "card-1")
```

A name or id that matches nothing raises with the list of islands it did find, as `Name#id` pairs. Any other option is an `ArgumentError`, and a page with no island raises `"No Mercury components found in the rendered HTML"`.

**Props after an update.** With `diff` on, a connected re-render sends only `data-props-diff`, so in a LiveView test `:props` still holds the first render's snapshot and the change is in `:props_diff`. Either assert on `:props_diff`, or set `config :live_mercury, enable_props_diff: false` in the test config. `LiveMercury.Test`'s documentation recommends the second: `:props` is then always the complete state. The setting is read at compile time.

The live_mercury app's own diff tests render `LiveMercury.mercury/1` directly and set `__changed__` themselves, which is how a re-render is simulated without a LiveView:

```elixir
assigns = %{username: "John", age: 30, __changed__: %{}}
assigns = assign(assigns, :username, "Jane")

island =
  assigns
  |> LiveMercury.mercury()
  |> Phoenix.HTML.html_escape()
  |> Phoenix.HTML.safe_to_string()
  |> LiveMercury.Test.get_mercury()

assert ["replace", "/username", "Jane"] in island.props_diff
```

For stream diffs past the first render, the tests also pass `socket: %Phoenix.LiveView.Socket{transport_pid: self()}`, a socket that counts as connected, so the render is not treated as dead.

## Testing a LiveView and its events

An island's events are ordinary LiveView events, so `Phoenix.LiveViewTest` tests them without a browser. EDU's demo page test sends the event the island would push, then checks both the re-render and the event pushed back to the island:

```elixir
test "the island's event reaches the LiveView, and the reply is addressed to the island", %{
  conn: conn
} do
  {:ok, view, _html} = live(conn, @path)

  assert render_hook(view, "demo:clicked", %{"count" => 3}) =~ "Clicks the server has seen: 3"

  assert_push_event(view, "edu:island", %{id: "island-demo", event: "ack", payload: %{count: 3}})
end
```

`render_hook/3` plays the island's `pushEvent`, and `assert_push_event/3` sees the `push_event/3` that the island's `handleEvent` would receive.

## Testing the hook

`@fiberfx/live-mercury`'s own tests run `MercuryHook` against a stand-in for the `this` LiveView passes. `createLiveViewHook(attributes)` puts a real element in the document with the given attributes and gives the six hook functions as Vitest spies; `handleEvent` returns a fresh `ref-<n>` per call, as LiveView's does. The helper lives in the package's `src/test/` and is not exported from its entry.

A test registers a component with `getHooks`, calls the hook's callbacks itself, and changes attributes the way LiveView's patch would:

```ts
it("applies props_diff on update when data-use-diff is true", () => {
	const hook = createLiveViewHook({ "data-name": "TestComponent", "data-props": encodeProps({ title: "Hello" }), "data-use-diff": "true" });
	call(MercuryHook, "mounted", hook);
	hook.el.setAttribute("data-props-diff", encodePatch([["replace", "/title", "World"]]));
	call(MercuryHook, "updated", hook);
	expect(seen?.title).toBe("World");
	expect(hook.el.textContent).toBe("World");
});
```

Three pieces of the file make this work:

- `const { MercuryHook } = getHooks({ TestComponent })`, where `TestComponent` records the props it receives and what `useLiveMercury()` returns;
- `call(definition, step, hook)`, which is `definition[step].call(hook)`;
- a test-only encoder that mirrors `LiveMercury.Patch.serialize/1` and `encode_object/1`, so fixtures are built rather than typed as wire strings.

The same file covers the mount errors, a component that arrives late, a new props object per update, the reconnect resync, the first paint over server markup, and teardown: after `destroyed()` the element is empty and every `handleEvent` ref the island still held has gone to `removeHandleEvent`.

## EDU's island tests

EDU tests each layer of its host:

- **The page** (`EchoEduWeb.IslandTest`, a ConnCase test): the demo page reads without JavaScript, maps the phoenix client through one import map, writes no cookie, and its element carries `phx-hook="CourseIsland"`, `phx-update="ignore"`, its `data-bundle` and JSON props. `bundle_url/1` and `props_json/1` have their own cases.
- **`courseIsland`** (`edu-boot/src/island.test.ts`): `readProps` parses only a direct JSON child, returns `{}` without one, and throws on malformed JSON; `courseIsland` renders inside a `data-island-root` with the JSON props, the hook's functions and the element's id.
- **The boot** (`edu-boot/src/app.test.ts`): one LiveSocket at the meta's path; `CourseIsland` forwards `mounted` with the same `this`, refuses a bundle with no `hook`, sets the server render aside and restores the same nodes, and writes `data-island-error` for each failure.
- **The built bundles** (`edu-boot/src/built-islands.check.ts`): import the built island files, not the sources, to catch a bundle whose component and lifecycle run on two hyperscript copies. `node/apps/edu-boot/scripts/f1-gate.mjs` imports each built bundle and requires a default function export and a `hook` with its four functions; mx's `--require-export` ([LM2](/live-mercury/building)) is the static half of the same gate.
- **The page in a browser** (`scripts/edu/island-check.mjs`): headless Chrome over the DevTools protocol, against a running page (the demo page by default). It checks that the island mounts (`data-island-mounted="true"`) and renders its title, that the page opens exactly one LiveView socket (`/_edu/live`), that a click in the island reaches the LiveView and the reply reaches the island, that the server render's text is on the page with JavaScript disabled, and that there is no script or console error. It prints one JSON summary and exits 1 when a check fails.

## check_hosts/3 at build time

Course pages in the HTML tree write `CourseIsland` hosts by hand, so EDU checks them when it generates a page, not when a browser loads it. `EchoEduWeb.Island.check_hosts(source, masked, {body_at, body_len})` returns `:ok` or the first refusal:

| Refusal | The host |
|---|---|
| `:no_id` | has no id, or an empty one |
| `{:outside_body, id}` | lies outside the body, which no LiveView mounts |
| `{:duplicate_id, id}` | shares its id with another element |
| `{:not_ignored, id}` | lacks `phx-update="ignore"` |
| `{:no_bundle, id}` | has no `data-bundle`, or an empty one |
| `{:bundle, id}` | has a `data-bundle` that is not a path or an http(s) URL |
| `{:props, id}` | has no JSON first child, or one that does not parse or holds a raw `<` |

`EchoEdu.Gen.split/1`, which `mix edu.gen` uses, calls it and wraps a refusal as `{:error, {:island_host, reason}}`. Its tests drive it with a host builder:

```elixir
test "refuses two hosts with one id" do
  assert {:error, {:island_host, {:duplicate_id, "k-fig"}}} =
           Gen.split(page("<main>#{host()}#{host()}</main>"))
end
```

and they pin the cases a naive check would miss: a host found in any attribute syntax the browser accepts, a host inside a script or comment that is not a host, and a bundle like `//cdn.example/x.js` or `javascript:alert(1)` that is refused. One case renders `island/1` itself with `</script>` in its props and checks that the result passes, so the component and the check cannot drift apart.

## What these tests do not cover

- **Only EDU's demo page is checked in a browser.** `island-check.mjs` drives a page with one course island. This course found no browser check for a `<.mercury>` island such as the KAN views': no check or test script outside the package names `MercuryHook`. For those islands, the server tests stop at the element and the hook tests start from one.
- **These checks need Node.** The hook tests' header runs them with `pnpm exec vitest`, and `island-check.mjs`, `f1-gate.mjs` and the built-artifact rows are Node scripts. `mx test` runs a member's tests in a headless browser and maps `vitest` to mx's own runtime, but whether `@fiberfx/live-mercury`'s hook tests pass under it is not recorded here.
- **`get_mercury/2` finds only `MercuryHook` elements.** EDU's `CourseIsland` hosts are read with LazyHTML in EDU's own tests.
