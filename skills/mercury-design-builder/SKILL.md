---
name: mercury-design-builder
description: Build, refine, and verify interfaces with real Mercury UI components, Hyperscript, and CSS tokens. Use for Mercury pages, application screens, forms, navigation, responsive layouts, and polishing existing explorers. Preserve the host application, its interactions, and its toolchain.
---

# Mercury Design Builder

Make the requested interface useful, coherent, and demonstrably interactive. Compose genuine Mercury components; use application CSS for layout and supported tokens for styling. A polished screenshot, a successful build, and a working interaction establish different things.

For a new playground with live controls and a generated prompt, the available `mercury-playground` skill can supply that product workflow. Polishing an existing explorer remains in this skill: preserve its working exploration model and improve the requested surface.

## Establish the boundary

Inspect the host route, entry point, styles, dependency manifests, and repository instructions before choosing an implementation. Keep an existing framework or build workflow unless migration is requested. A Mercury distribution bundle may contain documentation and a starter without the full module source tree.

Find the actual `@fiberfx/ui` and `@fiberfx/hyperscript` versions. For each component being changed, inspect its public exports, types, implementation, and co-located `.prompt.md` when available. Use the matching bundled documentation when source is absent. Resolve stale examples against those contracts; do not invent a prop, component, token, or package location.

Choose the smallest supported route:

| Available context | Route |
| --- | --- |
| Working application | Extend its conventions, pins, and existing tooling. |
| Native Mercury starter and compatible `mx` | Use its manifests and native development/build commands. |
| Simple standalone page with network access | Use the pinned browser example with import maps, plain JavaScript `h`/`render`, and the real UI stylesheet. Browsers do not parse TSX. |
| Portable offline artifact requested | Bundle real Mercury and account for all emitted assets; use the packaging guidance below. A CDN page does not satisfy this requirement. |

Read [Mercury contracts](references/mercury-contracts.md) before composing new controls. Read [build and delivery](references/build-and-delivery.md) when choosing a new build route, investigating module resolution, or producing a portable artifact. Neither npm packaging nor a familiar JSX shape authorizes switching to React or replacing Mercury with lookalike controls.

## Compose a useful screen

Start with the user's primary action and enough real or clearly labeled sample content to exercise it. Give the page one clear hierarchy: title/context, primary work area, supporting controls, and feedback. Use a card only when the content is a meaningful group; avoid turning every heading into a bordered panel.

Map interactions to public Mercury components. Keep custom SVG/canvas for the visualization itself, with Mercury controls around it. Prefer public composition parts and enum props over copied implementations or overrides of private `.mx-*` classes. Keep browser JavaScript in the explanation of interactive behavior; native `mx` is the Rust toolchain, and BEAM integration is optional.

Give each stateful interaction an owner. Separate editable drafts from committed values, derive dependent views from the same state, and preserve focus and selection during updates. Decide what loading, empty, invalid, and failed states mean for this task. Show success only after the operation succeeds. Do not add a generated prompt, presets, inspector, or clipboard panel to a normal product screen merely because previous Mercury work was a playground.

## Refine the interface

Read [layout and interaction polish](references/layout-and-interaction.md) for responsive composition, typography, focus, motion, or graphs. Preserve the host's visual language while making hierarchy and action placement deliberate.

Use the installed theme and tokens, including its fonts and color channels. Define application typography in `rem` with intentional line-height and spacing relationships; inspect the combined result with library styles. On mobile, keep the primary header compact and move secondary navigation into an accessible disclosure. Check content wrapping before reducing text size or truncating useful labels.

## Verify the changed boundary

Build with the chosen supported workflow when it has a build step, then inspect the served result in a browser. Verify the user's actual action end to end and one meaningful violating case. Scope checks to the change:

- **Controls:** edit a value and observe the resulting state; exercise invalid input and recovery, including reset if present.
- **Overlays/navigation:** open, use, dismiss, and reopen; check Escape, focus movement, and return to the trigger.
- **Responsive layout:** inspect narrow and wide views, long content, text enlargement, and page overflow. Check that the header stays compact and all actions remain available.
- **Keyboard/accessibility:** use visible focus and logical order; verify names, labels, error associations, and non-color status cues for changed controls. Use equivalent controls for pointer-only visualization actions.
- **Presentation:** inspect actual rendered typography and spacing, assets, console errors, and requested theme states. Measure layout or zoom when a label alone could conceal a failure.

Run existing relevant checks; add a regression test when behavior or reusable adaptation logic warrants one. Adapted story examples do not inherit proof from upstream `play` tests that were never run. Rendering a component catalog does not establish keyboard or interaction coverage for every export.

Deliver the entry point, changed files, observed checks, and material limits. Distinguish source/build verification from browser behavior, and verification from user acceptance. Keep publication within the user's authorization.

## Documentation discovery

Prefer version-matched local documentation. If it is unavailable, start with the [Mercury index](https://mercury.jonnify.com/llms.txt), then follow the relevant [UI](https://mercury.jonnify.com/ui/llms.txt), [Hyperscript](https://mercury.jonnify.com/hyperscript/llms.txt), [browser page](https://mercury.jonnify.com/start/browser/llms.txt), or [mx installation](https://mercury.jonnify.com/start/install-mx/llms.txt) companion. A link or candidate package is not evidence of a published, supported release.
