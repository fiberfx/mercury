The course ends where its components are used: in the KAN views of EchdOS, under `node/apps/echd-os/src/kan/`. This chapter takes one of their components, writes down what it promises, and tests each promise with the tools of the last six chapters.

## The component

`KindFilter`, from `node/apps/echd-os/src/kan/common.tsx`, is the row of kind chips above the squads timeline and the messages viewer: one toggle per record kind, with its count, and an "All kinds" button that clears the choice. It suits a capstone for three reasons:

- **Two KAN islands use it.** `SquadsExplorer` renders it in `squads.tsx` and `KanBoard`'s messages view in `messages.tsx`, so a test of it covers both views.
- **It is a pure function of its props.** `common.tsx` says so of all its pieces: no store reads. The islands keep `picked` in their own stores and pass it down with the two callbacks, so a test can own that state with `useState`.
- **It is made of Mercury UI.** Each toggle holds a `Chip`, and the clear action is a `Button`. Testing it tests the way the KAN views compose `@fiberfx/ui`.

The explorers around it keep their models in island stores, built on a state layer this course doesn't teach, so this chapter keeps to the view.

## Its contract

```tsx
export function KindFilter({
  kinds,
  picked,
  onToggle,
  onClear,
}: {
  kinds: readonly SquadKindCount[] | null | undefined;
  picked: readonly string[];
  onToggle: (kind: string) => void;
  onClear: () => void;
}) {
  const list = kinds ?? [];
  if (!list.length) return null;
  return (
    <div class="kan-kinds" role="group" aria-label="Filter by kind">
      {list.map((k) => (
        <button key={k.kind} type="button" class="kan-kind" data-kind={k.kind} aria-pressed={picked.includes(k.kind)} onClick={() => onToggle(k.kind)}>
          <Chip size="sm" variant={kindTone(k.kind)} selected={picked.includes(k.kind)}>
            {k.kind} <b class="kan-kind__n">{k.count ?? 0}</b>
          </Chip>
        </button>
      ))}
      {picked.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onClear()}>
          All kinds
        </Button>
      )}
    </div>
  );
}
```

`SquadKindCount` is `{ kind: string; count: number | null }`. Read from the source, the contract is six promises:

1. **No kinds, no filter.** `null`, `undefined` or an empty list renders nothing.
2. **A named group.** The toggles sit in a `div` with `role="group"` and the label "Filter by kind".
3. **One native button per kind,** keyed and tagged by the kind (`data-kind`), showing the kind and its count. A `null` count shows as `0`.
4. **Pressed state is the props'.** A button's `aria-pressed`, and its chip's selected look, are whether `picked` includes the kind. The component holds no state of its own.
5. **A click reports; it doesn't decide.** Clicking a kind calls `onToggle(kind)`. What toggling means is the owner's business.
6. **Clearing appears only when there is something to clear.** The "All kinds" button renders while `picked` is non-empty and calls `onClear()`.

Promise 4 is the one to protect. A version that kept its own pressed state would drift from the island's store after a server update.

## Rendering it inside act

The test owns `picked`, as an island would, with a small harness, and mounts it with the client root inside `act`. It would sit beside `common.tsx` as `kind-filter.test.tsx`, a file the repository does not have yet.

```tsx
import { afterEach, expect, it } from "vitest";
import { createRoot } from "@fiberfx/hyperscript/client";
import { useState } from "@fiberfx/hyperscript/hooks";
import { act } from "@fiberfx/hyperscript/test-utils";
import { KindFilter } from "./common";
import type { SquadKindCount } from "./types";

const KINDS: SquadKindCount[] = [
  { kind: "ask", count: 1 },
  { kind: "answer", count: 1 },
  { kind: "fyi", count: null },
];

function Harness({ kinds }: { kinds: SquadKindCount[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <KindFilter
      kinds={kinds}
      picked={picked}
      onToggle={(kind) => setPicked((p) => (p.includes(kind) ? p.filter((k) => k !== kind) : [...p, kind]))}
      onClear={() => setPicked([])}
    />
  );
}

const cleanups: Array<() => void> = [];
afterEach(() => cleanups.splice(0).forEach((cleanup) => cleanup()));

function mount(kinds: SquadKindCount[]) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  act(() => root.render(<Harness kinds={kinds} />));
  cleanups.push(() => {
    act(() => root.unmount());
    el.remove();
  });
  return el;
}

const button = (el: Element, kind: string) => el.querySelector<HTMLButtonElement>(`.kan-kind[data-kind='${kind}']`);
```

`act` returns only after the render and its effects have settled, so the next line sees the finished DOM. `root.unmount()` renders nothing into the container, and the test then removes it. The KAN suites do the same with `render(...)` and `render(null, el)` inside `act`; `createRoot` is a root object over that same pair.

## Driving a click

A click is the DOM's own: `HTMLElement.click()` dispatches a native `click`, and the button's `onClick` receives it. Inside `act`, the state update the click causes has rendered before `act` returns.

```tsx
const click = (target: HTMLElement | null) => {
  if (!target) throw new Error("nothing to click");
  act(() => target.click());
};
```

This is how `squads.test.tsx` clicks the same buttons through `SquadsExplorer`.

## Asserting the DOM

Each assertion names one promise from the contract. The comment after it says where the expected value comes from.

```tsx
it("renders one toggle per kind, pressed by the props", () => {
  const el = mount(KINDS);
  expect(el.querySelector("[role='group']")?.getAttribute("aria-label")).toBe("Filter by kind"); // promise 2, from the source; not run
  expect(el.querySelectorAll(".kan-kind")).toHaveLength(3); // promise 3; squads.test.tsx:112 checks the same count through SquadsExplorer
  expect(button(el, "ask")?.textContent).toBe("ask 1"); // promise 3; squads.test.tsx:113 reads "ask 1"
  expect(button(el, "fyi")?.textContent).toBe("fyi 0"); // promise 3, null count; from the source; not run
  expect(button(el, "ask")?.getAttribute("aria-pressed")).toBe("false"); // promise 4; not run

  click(button(el, "ask"));
  expect(button(el, "ask")?.getAttribute("aria-pressed")).toBe("true"); // promise 4; squads.test.tsx:128 reads "true"
  expect(button(el, "ask")?.querySelector(".mx-chip")?.classList.contains("is-selected")).toBe(true); // promise 4, Chip.tsx:20; not run

  const clear = [...el.querySelectorAll("button")].find((b) => b.textContent === "All kinds") ?? null;
  expect(clear).not.toBeNull(); // promise 6; squads.test.tsx:135 finds it by this text
  click(clear);
  expect(button(el, "ask")?.getAttribute("aria-pressed")).toBe("false"); // promises 4 and 6; not run
  expect([...el.querySelectorAll("button")].some((b) => b.textContent === "All kinds")).toBe(false); // promise 6; not run
});

it("renders nothing without kinds", () => {
  const el = mount([]);
  expect(el.innerHTML).toBe(""); // promise 1, from the source; not run
});
```

The "ask 1" text holds because `Chip` adds nothing around its children: it renders a `span` with its classes and then the kind, a space, and the bold count.

## Inspecting the commit

`@fiberfx/hyperscript/inspect` reports what the renderer did, without touching it. A test can use it to say how much a click cost: here, that one toggle commits the root and doesn't remount the buttons.

```tsx
import { inspect } from "@fiberfx/hyperscript/inspect";
import type { NodeRecord } from "@fiberfx/hyperscript/inspect";

it("commits once per click, without remounting the toggles", () => {
  const el = mount(KINDS);
  const records: NodeRecord[] = [];
  const stop = inspect({ root: el, phases: ["commit", "unmount"], fn: (record) => records.push(record) });
  click(button(el, "answer"));
  stop();
  expect(records.filter((r) => r.kind === "commit").length).toBeGreaterThan(0); // a commit per commit, inspect/index.js:150-157; count not run
  expect(records.filter((r) => r.kind === "unmount" && r.type === "button")).toHaveLength(0); // keys keep the buttons; not run
});
```

What is pinned by Hyperscript's own suite: a render emits `root`, `render`, `diffed` and `commit` records, each one frozen and holding only numbers, strings and `null`; and a subscriber given a `root` sees only that root's records. How many commit records this click produces, and that no `button` unmounts, are expectations from the source that no test has run.

## The server render and the client

The KAN islands don't hydrate. Live Mercury paints each island with `render`, and when the element holds a server render (`data-ssr`), the first paint replaces it. So what the server sent is what the reader sees until that first paint, and a mismatch shows as a change on screen. A test can guard it by comparing the two renders of the same props:

```tsx
import { renderToString } from "@fiberfx/hyperscript/server";

it("renders the same markup on the server as in the browser", () => {
  const props = { kinds: KINDS, picked: ["ask"], onToggle: () => {}, onClear: () => {} };
  const el = document.createElement("div");
  const root = createRoot(el);
  act(() => root.render(<KindFilter {...props} />));
  expect(renderToString(<KindFilter {...props} />)).toBe(el.innerHTML); // not run
  act(() => root.unmount());
});
```

The click handlers never reach the string, since the server leaves out function props, so the comparison is between markup alone. Hyperscript's own suite pins the same property for a tree of `useId` components: after hydration, the container's `innerHTML` equals the string render. For `KindFilter`, with `aria-pressed` booleans and Mercury UI's `Chip` and `Button` inside, no test has run it. Run it before relying on it.

## What is verified and what is not

| Claim | Evidence |
|---|---|
| One `.kan-kind` button per kind; the text "ask 1"; `aria-pressed` "true" after a click; an "All kinds" button found by its text | `squads.test.tsx:112-135`, through `SquadsExplorer`, which renders `KindFilter` |
| `createRoot` renders, re-renders the same node, and unmounts to empty | `client.test.jsx:18-30` |
| `act` settles a synchronous callback before it returns | `test-utils/index.js:173-186` (source) |
| A render emits commit records, frozen and plain; a root filter sees one root | `inspect.test.jsx:52-91` |
| A string render equals the hydrated DOM for `useId` trees | `useId.test.jsx:204-275` |
| The group label, the `0` for a null count, the selected chip class, clearing, nothing for no kinds | read from `common.tsx` and `Chip.tsx`; **not run** |
| One commit per click, no button unmounted, server markup equal to client markup for `KindFilter` | **not run** |

No test in the repository renders `KindFilter` by itself, and nothing under `node/apps/echd-os/src/kan` calls `createRoot`, `inspect` or `renderToString`. The test in this chapter is a draft to add beside `common.tsx` and run: until then, its "not run" lines are expectations, not results.
