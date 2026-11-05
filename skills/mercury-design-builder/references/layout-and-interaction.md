# Layout and interaction polish

Apply these checks to the surface being changed. They capture problems found in Mercury navigation, prose, forms, explorers, and maps; they are not a requirement to add all of those surfaces.

## Compact navigation and responsive composition

A mobile header should preserve the brand, the primary action where it fits, and an accessible navigation trigger in one compact row. Move secondary links and utilities into a menu or drawer instead of stacking several full navigation rows. Keep expanded navigation scrollable when necessary, with a named trigger, expanded state, keyboard dismissal, and focus return. Let content and enlarged text determine the final height; a fixed pixel target must not clip labels.

Use `minmax(0, 1fr)` for flexible grid tracks and `min-width: 0` for shrinking flex/grid children. Keep long code and diagrams scrollable inside their own region. Do not hide page overflow to conceal clipped actions or broken layout. Descriptions generally need the available width: placing a fixed-width reset button beside a mobile paragraph can turn it into a narrow, many-line column. Put the action beside the heading or below the description.

Use a disclosure for secondary inspector content on narrow screens. Preserve the primary task, selection, and access to feedback when regions stack. Check a realistic narrow viewport, longer labels, and text enlargement; desktop alignment does not establish mobile usability.

## Typography and tokens

Establish a small application rhythm in `rem` rather than unrelated pixel sizes. A `0.25rem` spacing increment can be a useful starting point, not a requirement to change the library's token definitions. Pair body size with deliberate line-height, then align paragraph, list, label, heading, and code-block spacing to that rhythm. Different roles can have different line-heights; consistency means intentional relationships, not one forced value everywhere.

Inspect computed styles, including Mercury's global `p`, `small`, `code`, and `pre` rules. A parent declaration alone may not override a direct child rule. Keep inline code within the surrounding text's line box where possible; use a separate comfortable rhythm and contained scrolling for code blocks. Avoid fixed text-container heights, root font-size tricks, or wholesale typography resets that disrupt library controls.

Use semantic colors from the installed tokens, and preserve the host's theme. Do not assume a dark default, invent official token names, or hardcode colors where a suitable token exists. Check text and focus contrast in the requested themes and disabled/error states. Resolve contrast failures at the public theme/application boundary instead of patching private component selectors.

## Feedback and motion

Make typing, filtering, and repeated keyboard work immediate. Add motion only when it explains position, state, or feedback; keep it short and interruptible. Prefer transform/opacity to layout animation, list the properties being animated, honor reduced motion, and gate hover-only effects to capable pointers. Do not add an animation framework solely for polish.

Give controls visible focus and enough target area for their context; roughly `2.75rem` can be a useful touch target without inflating every dense desktop control. Label icon-only actions. Status must remain understandable without color or animation.

For clipboard actions, copy the exact displayed text, await success, and clear stale success when the content changes. When clipboard access fails, offer selectable text with an honest manual-copy message. For saving, resetting, or deleting, make the state transition match the promised scope: a filter or view preset should not erase saved work. Offer undo when it provides a useful recovery path.

## Graphs and large previews

Keep a keyboard-accessible list or picker alongside direct node selection. A selected offscreen node should become reachable; on mobile this may require local panning and an explicit link to details. Preserve user annotations across filtering. Distinguish source relationships from user-authored relationships and inferred suggestions.

Verify zoom using rendered dimensions or coordinate transforms. A percentage label can change while a minimum width clamps every zoom level to the same size. Decide whether zoom changes a measured base width or a transform, then check the actual output at two distinct values. Keep panning within the graph region so the whole page remains usable.
