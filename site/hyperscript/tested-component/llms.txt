# A tested component — Mercury LMS

> HS6, the Mercury Hyperscript capstone. `KindFilter` (`node/apps/echd-os/src/kan/common.tsx`), the kind chips of the KAN squads and messages views, given a written contract and a test: `createRoot` inside `act`, a native click, DOM assertions, `./inspect` commit records, and a server-versus-client markup check. Results are marked: read from an existing test, or not run.

## Read this when

You test a Mercury component end to end, or you change `KindFilter` or another KAN view piece in `common.tsx`.

## The contract (KindFilter)

- Props: `kinds: readonly SquadKindCount[] | null | undefined` (`{ kind: string; count: number | null }`), `picked: readonly string[]`, `onToggle(kind)`, `onClear()`. It is controlled: no state of its own.
- No kinds → renders `null`.
- `div.kan-kinds[role=group][aria-label="Filter by kind"]` → one `button.kan-kind[data-kind=<kind>][aria-pressed=<picked.includes(kind)>]` per kind, keyed by the kind, holding a `Chip` (size `sm`, variant `kindTone(kind)`, `selected` while picked) with the kind and its count (`null` → `0`).
- A click calls `onToggle(kind)`. The ghost `Button` "All kinds" renders only while `picked` is non-empty and calls `onClear()`.
- Used by `SquadsExplorer` (`squads.tsx:91`) and the messages view (`messages.tsx:430`), each with `picked` from its island store.

## The test recipe

- Own `picked` in a harness with `useState`, and mount with `createRoot(el)` and `act(() => root.render(...))`. Unmount with `act(() => root.unmount())`.
- Drive with `act(() => button.click())`: a native click, settled when `act` returns.
- Verified through `SquadsExplorer` (`squads.test.tsx:112-135`): one `.kan-kind` per kind, the text "ask 1", `aria-pressed` "true" after a click, and an "All kinds" button by its text.
- Not run: the group label, `fyi 0`, `is-selected` on the chip, clearing, `null` for no kinds, the commit count per click, no button unmount, and `renderToString(<KindFilter …/>) === el.innerHTML`.
- `inspect({ root: el, phases: ["commit", "unmount"], fn })` → frozen, plain records; `stop()` disposes.
- Live Mercury islands don't hydrate: a `data-ssr` render is replaced on the first paint (`fiberfx/live-mercury/src/hooks.ts:68-71`). Compare the markup, not a hydration.

## Minimal example

```tsx
import { createRoot } from "@fiberfx/hyperscript/client";
import { act } from "@fiberfx/hyperscript/test-utils";
import { KindFilter } from "./common";

const el = document.createElement("div");
const root = createRoot(el);
let toggled = "";
act(() => root.render(<KindFilter kinds={[{ kind: "ask", count: 1 }]} picked={[]} onToggle={(k) => (toggled = k)} onClear={() => {}} />));
act(() => el.querySelector<HTMLButtonElement>(".kan-kind[data-kind='ask']")?.click());
// toggled === "ask" (from the source; not run)
act(() => root.unmount());
```

## Never emit

- Pressed state held inside `KindFilter`: `picked` is the owner's.
- DOM assertions outside `act` after a click.
- A claimed result for a check no test has run: mark it "not run".

## Next

- Testing and inspecting: /hyperscript/testing/llms.txt
- Rendering on the server: /hyperscript/server/llms.txt
- This companion: /hyperscript/tested-component/llms.txt

## Navigation

- [Read this page in the browser](/hyperscript/tested-component)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hyperscript/llms.txt)
