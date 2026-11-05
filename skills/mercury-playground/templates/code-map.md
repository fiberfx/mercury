# Code map

Build a bounded architecture overview with real file and relationship evidence. This is an authored or observed map, not a compiler, AST/HIR producer, or exhaustive call graph. The repository's `specs/mercury/design/mercury-playground.md` describes a separate compiler workbench; this skill does not claim to deliver it.

## Data and scope

Read the actual files within the requested scope. Choose enough nodes to explain a useful flow; do not inflate the map to hit a quota. Record the repository revision or snapshot boundary, included areas, and known omissions.

Keep stable node IDs, labels, repository-relative file paths, optional line spans, layer, concise role, and display position. Each edge has source, target, relationship kind, and evidence: an import, call site, registration, or other specific observed connection. Label inferred flows as inference and show their supporting evidence. A direct import does not by itself prove a runtime call or data flow. Keep external systems visibly distinct from local files. Check that every endpoint and cited file exists.

## Interaction

Use Mercury for a control sidebar, node detail/comment panel, and prompt region; use SVG for nodes and edges. Show source paths on selection without crowding every node. Draw edges under nodes with arrowheads and a legend that uses line styles as well as color.

- Provide meaningful presets based on the mapped code, such as Overview, Rendering path, and Input flow. Each preset changes a coherent set of layer and relationship filters.
- Support layer and relationship toggles, text search, and zoom/reset. An edge is visible only when both endpoints are visible and its kind is enabled. Display honest visible/total counts and an explicit no-match state.
- Select a node to inspect its role, source evidence, incoming/outgoing links, and comments. Make the same selection reachable from a keyboard-accessible list.
- Let users add, edit, cancel, and delete comments; reject whitespace-only comments. Bind them to stable node IDs, labels, and source paths. A saved comment marks the node. Filtering or changing presets must preserve it.
- Show saved comments outside the filtered diagram, including comments on hidden nodes. Distinguish saved feedback from an unsaved draft.

## Prompt

Name the project and snapshot, describe the current focus when narrowed, then include the user's saved feedback with component names and exact file references. Comments on hidden nodes remain in the prompt and are identified as outside the current view. Include uncertainty qualifiers where they affect the request. Do not fabricate feedback, turn inferred links into facts, or instruct changes merely because a node was selected.

With no feedback, offer an honest contextual exploration prompt or indicate that comments will create a change request. Keep view focus separate from the scope of saved feedback.

## Boundary checks

Validate at least one representative edge against its cited source and reject a deliberately missing endpoint/file in the data check. Exercise a filter hiding both nodes and edges, a zero-result search, preset restoration, and add/edit/cancel/delete feedback on a subsequently hidden node. Confirm the copied prompt names the correct component and file.
