---
name: mercury-playground
description: Build interactive Mercury playgrounds with live controls, a visual preview, and a copyable natural-language prompt. Use for Mercury design explorers, code maps, concept maps, data explorers, document critique, or diff review. Requires genuine @fiberfx/hyperscript and @fiberfx/ui; does not implement the Mercury compiler workbench or replace an existing site's stack without request.
---

# Mercury Playground

Turn a broad decision space into something the user can explore, adjust, and turn into an actionable prompt. Compose real Mercury components and preserve the user's requested destination: a page inside an existing application or a portable built artifact.

## Choose the relevant template

Read only the matching template, then adapt its layout to the subject and host application.

| Subject | Template |
| --- | --- |
| Components, layouts, typography, color, motion | [Design playground](templates/design-playground.md) |
| Queries, structured configuration, APIs, pipelines | [Data explorer](templates/data-explorer.md) |
| Learning, relationships, knowledge gaps | [Concept map](templates/concept-map.md) |
| Documents with approved/rejected suggestions | [Document critique](templates/document-critique.md) |
| Actual diffs with contextual line comments | [Diff review](templates/diff-review.md) |
| Codebase layers, dependencies, flows, component comments | [Code map](templates/code-map.md) |

## Establish the implementation boundary

Find the requested application, its Mercury dependencies and applicable project instructions. Inspect the used components’ public exports, types, implementation and co-located `.prompt.md` where available. When source is absent, use documentation and type declarations matching the pinned artifacts; do not require a native source checkout for a browser-only host. Confirm uncertain behavior in the actual example. Keep package/version evidence explicit: older local docs may still describe React or pnpm.

Read [Mercury contracts](references/mercury-contracts.md) before implementation. Preserve a working host’s supported Mercury workflow. For a native checkout, use its `mx` route; for a requested browser-only example, use the complete pinned import map, plain JavaScript and UI stylesheet. Do not install a replacement toolchain, switch to React/compat, or substitute hand-written lookalikes to evade a resolution failure. An unavailable required runtime is a concrete limitation; preserve the source work.

For an existing application, compose its route and layout conventions. A standalone artifact is appropriate when requested or when there is no host application. A single HTML artifact may inline the **native build output containing Mercury** and its CSS; this does not mean replacing the application with hand-written DOM rendering. Portable artifacts must have no runtime CDN, font, module, or asset dependency. Keep readable source and the actual build or browser-loading recipe available for revisions.

## Shared interaction contract

- **Live controls and preview:** each valid change updates the preview and prompt immediately. No Apply step. Group controls by the user's decisions; hide infrequent settings in a disclosure.
- **One state owner:** hold domain state in Mercury hooks, update it immutably, and derive the visible model and prompt from that same state. Keep temporary drafts separate from saved annotations. Use stable item IDs and keys.
- **Actionable prompt:** provide enough project, subject, and source context to use it outside the playground. Express selected changes as natural instructions, not a raw value dump. Omit unchanged defaults while retaining context needed to understand the task. Do not invent user feedback or a requested action when there is none.
- **Copy:** copy exactly the visible prompt. Show success only after the clipboard operation succeeds. If copying is unavailable, show a selectable prompt and an honest fallback message.
- **Defaults and presets:** start with a useful, populated view. Add presets only for meaningful choices; a focused two-treatment comparison may need no presets. Presets change only the settings they represent; preserve comments, explanation drafts and review decisions. Name whether reset restores view settings, the example baseline, or saved work.
- **Empty and invalid states:** explain an empty filter result, rejected input, or absence of comments without treating it as a crash. Keep the last valid preview when an invalid intermediate input cannot be rendered.

## Design and accessibility

Let the live artifact dominate; keep controls and prompt easy to scan. Preserve the host’s supplied fonts, semantic tokens and theme, with tested fallbacks and monospace for source/values. The Mercury Book’s DM Sans, spacing and reading measure are application choices, not defaults to impose on another brand. Distinguish approved tokens, personal view settings and experimental specimen overrides; a saved experiment does not redefine the brand.

Choose good defaults before adding options. Preserve focus and text selection during updates. Use labeled controls, keyboard-visible focus, and non-color status cues. Graph interactions need a keyboard-accessible node list or equivalent controls. On narrow screens, stack regions without hiding the prompt or blocking actions.

Motion should clarify a change without delaying repeated input. Prefer immediate updates for filtering and typing; use brief transform/opacity feedback only where useful. Honor reduced motion, gate hover-only effects to hover-capable pointers, and use pointer capture for drags. Do not add an animation dependency for polish.

## Verify the useful path

Build with the host’s supported route when it has a build step, then inspect the rendered result in a browser. A browser-only route has no native build claim and remains network-dependent unless actually bundled and tested offline. Verify a meaningful control → preview → prompt → copy path, then a relevant violating case such as no visible nodes, invalid input, blank comments, or rejected suggestions. Check presets and reset when offered, plus keyboard operation and a narrow viewport. For comments, exercise add, edit, cancel, and delete; a hidden item must not silently lose its saved feedback.

Check application source for accidental React imports and app-authored `.mx-*` selectors. For a promised portable artifact, also reject remaining remote runtime dependencies. Library-generated private classes in compiled output are expected. For a portable artifact, load it with network unavailable and verify the same interaction path. Do not claim browser, offline, or clipboard checks that were not observed.

Deliver the working entry point, relevant source location, and brief verification evidence with material limits. Publishing, submitting comments to a service, or applying generated changes is a separate action requiring the user's authorization.
