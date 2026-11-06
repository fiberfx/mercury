# Layout and interaction polish

Apply these checks to the surface being changed. They capture problems found in Mercury navigation, prose, forms, explorers, and maps; they are not a requirement to add all of those surfaces.

## Compact navigation and responsive composition

At ordinary text size, prefer one compact header row containing the brand, the primary action where it fits, and a named navigation trigger. Move secondary navigation into a disclosure instead of repeating full navigation rows. At enlarged text sizes, allow an intentional second row or stacked controls when needed; preserving readable labels and reachable actions takes precedence over the row count. Do not force labels into letter-by-letter wrapping or hide overflow to retain a screenshot height.

Match behavior to the chosen control. Native `details`/`summary` exposes disclosure state; verify its actual browser behavior without assuming Escape dismissal or a focus trap. For a custom drawer or modal, verify its documented dismissal and focus-return contract. Do not turn ordinary navigation links into an ARIA menu just because the UI calls the region “Menu”. Keep expanded navigation scrollable and focused controls unobscured.

Use `minmax(0, 1fr)` for flexible grid tracks and `min-width: 0` for shrinking flex/grid children. Keep long code and diagrams scrollable inside their own region. Do not hide page overflow to conceal clipped actions or broken layout. Descriptions generally need the available width: placing a fixed-width reset button beside a mobile paragraph can turn it into a narrow, many-line column. Put the action beside the heading or below the description.

Use a disclosure for secondary inspector content on narrow screens. Preserve the primary task, selection, and access to feedback when regions stack. Check a realistic narrow viewport, longer labels, and text enlargement; desktop alignment does not establish mobile usability. In an explorer, measure where the first usable preview control appears, not only where its canvas border begins. A tall empty canvas or several wrapped toolbars can still bury the task after collapsing navigation. Keep secondary context accessible through disclosures that show the current selection.

## Applying the Mercury Book

The [English Book](https://mercury.jonnify.com/book) and [Russian Book](https://mercury.jonnify.com/ru/book) explain the documentation interface. When using that edition, translate its practices into the current task rather than copying every dimension. Prefer the supplied/versioned source; live pages can change.

| Book practice | Design consequence | Evidence to seek |
| --- | --- | --- |
| Character and proximity | Put the next useful action near its context; distinguish groups before adding borders | Real task content, including wrapped labels |
| Mark and color roles | Reuse the supplied SVG geometry; keep text/fill roles and theme pairs distinct | Actual asset binding, rendered color pairs and names |
| Type and rhythm | Use scalable text and deliberate spacing relationships | Loaded and fallback fonts, prose/code/labels, enlarged text |
| Navigation and adaptation | Use links for destinations and controls for state changes; preserve context across spaces | Forward/return journey, keyboard focus, compact and enlarged layouts |
| Governance and evidence | Separate established rules, proposals and observations | Source revision plus a valid and relevant stress case |

`68ch`, `1.75` body leading, a `0.25rem` rhythm and the `--lms-*` tokens are documented application choices, not universal Mercury UI defaults. A spacing increment does not align every glyph baseline. Keep three layers distinct: approved brand values, personal reading preferences, and experimental specimen values. An experiment or saved preference does not redefine the brand.

For localized spaces, use explicit locale-aware destinations and return links. Ordinary links retain modified-click/history behavior; changing language should retain a valid section and compatible preferences. Do not let a lesson-only path resolver silently turn a generated Book or other space into a homepage link. Test the actual destination.

## Typography and tokens

Establish a small application rhythm in `rem` rather than unrelated pixel sizes. A `0.25rem` spacing increment can be a useful starting point, not a requirement to change the library's token definitions. Pair body size with deliberate line-height, then align paragraph, list, label, heading, and code-block spacing to that rhythm. Different roles can have different line-heights; consistency means intentional relationships, not one forced value everywhere.

Inspect computed styles, including Mercury's global `p`, `small`, `code`, and `pre` rules. A parent declaration alone may not override a direct child rule. Keep inline code within the surrounding text's line box where possible; use a separate comfortable rhythm and contained scrolling for code blocks. Avoid fixed text-container heights, root font-size tricks, or wholesale typography resets that disrupt library controls.

Use semantic colors from the installed tokens, and preserve the host's theme. Do not assume a dark default, invent official token names, or hardcode colors where a suitable token exists. Check text and focus contrast in the requested themes and disabled/error states. Resolve contrast failures at the public theme/application boundary instead of patching private component selectors.

For reading/layout changes, use the Book’s relevant stress conditions: ordinary content at 320 CSS px equivalent width, text enlarged to 200%, and combined user text-spacing overrides. Name the actual method—browser zoom, changed root size or body-only scale—and do not claim they establish identical evidence. These checks should preserve content and actions, not enforce a preferred line length or line-height. See [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).

## Feedback and motion

Make typing, filtering, and repeated keyboard work immediate. Add motion only when it explains position, state, or feedback; keep it short and interruptible. Prefer transform/opacity to layout animation, list the properties being animated, honor reduced motion, and gate hover-only effects to capable pointers. Do not add an animation framework solely for polish.

Give controls visible focus and enough target area for their context; roughly `2.75rem` can be a useful touch target without inflating every dense desktop control. That is 44 CSS px only at a 16px root and is a comfort choice, not the WCAG AA minimum. Distinguish measured contrast, reflow and text-spacing checks from full accessibility conformance. Label icon-only actions. Status must remain understandable without color or animation.

When filtering a catalog or list, decide whether the filter also changes selection. If the workspace retains a selected item outside the results, explain that state and provide filter recovery for both matching and empty results. Verify that clearing filters restores useful focus without discarding unrelated drafts or settings.

For clipboard actions, copy the exact displayed text, await success, and clear stale success when the content changes. When clipboard access fails, offer selectable text with an honest manual-copy message. For saving, resetting, or deleting, make the state transition match the promised scope: a filter or view preset should not erase saved work. Offer undo when it provides a useful recovery path.

## Review workspaces

When asked to dogfood a review desk, record observed issues and concrete proposals in that desk, select the justified work, then record implementation and visual evidence against those same notes. If a note is anchored to a component example but concerns the surrounding application, identify that host surface and its actual source in the proposal. The example is reproduction context, not evidence that its library component needs changing.

Saving or refining a note can change its decision and remove it from a filtered queue. Keep the saved result reachable: preserve the filter when it still includes the note; otherwise reveal it and explain the view change. Move focus to the resulting note after rendering. Test both a new pending note saved under an approved-only filter and an anchored draft saved after navigating to another example. Do not re-anchor the draft to make a visibility check pass.

Give repeated preview → controls → review journeys a direct return path. Open the destination when collapsed and move keyboard focus with the visual position after the destination mounts. Check the route again when its view is already selected; a state-change-only effect may do nothing on the second visit. Navigation should preserve drafts and settings. Keep approval, implementation records, and observed visual results distinct.

## Graphs and large previews

Keep a keyboard-accessible list or picker alongside direct node selection. A selected offscreen node should become reachable; on mobile this may require local panning and an explicit link to details. Preserve user annotations across filtering. Distinguish source relationships from user-authored relationships and inferred suggestions.

Verify zoom using rendered dimensions or coordinate transforms. A percentage label can change while a minimum width clamps every zoom level to the same size. Decide whether zoom changes a measured base width or a transform, then check the actual output at two distinct values. Keep panning within the graph region so the whole page remains usable.
