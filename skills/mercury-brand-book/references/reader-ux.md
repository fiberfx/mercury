# Reader UX and research

## Reading first

Keep the source text central, with ordinary chapter links and optional search. Search should reveal real matches, identify no-results state, and preserve a path back to the full book. A compact contents rail and collapsible appearance settings are useful choices, not standards. Keep settings and token experiments visually subordinate to reading; preserve focus and reading position when values update. Keep action names meaningful when responsive layouts hide visible labels; preserve modified-click and browser-history behavior on chapter links.

Provide labeled native or genuine Mercury controls for font, text size, unitless leading and ch measure. Defaults follow the supplied book. Apply reading preferences separately from source tables. Remember valid preferences locally when useful, tolerate unavailable storage or malformed saved data, and offer a clearly named reset to the source defaults (“Reset to Mercury” for this example). Do not request remote fonts merely to populate a selector; use supplied DM Sans and available system alternatives with fallbacks.

## Units, color and SVG

Use rem for scalable dimensions with a user-relative root; px remains appropriate for thin rules. An inspector reports both declared units and actual computed CSS pixels. `1.25rem` is 20 CSS px at a 16px root and 25 CSS px at a 20px root. A unit-display toggle should not alter geometry. If body-only scaling is implemented, distinguish it from changing the root: other rem dimensions need not change. Label ch as a font-relative measure, not an exact proportional-character count.

Keep editable token drafts separate from the last valid applied values. Invalid input leaves the last valid specimen intact and is explained at its control. Derive specimen, contrast feedback and CSS/JSON/SVG exports from the same valid state. Isolate color experimentation from essential controls so even identical foreground/background cannot hide reset. Preserve semantic roles and show actual tested pairs with textual pass/fail. Compare unrounded ratios against thresholds; display rounding must not turn failure into success.

Use SVG for the live units diagram or meaningful specimen, with an accessible name and text explanation of its values. Decorative icons belong inside labeled buttons, not as unnamed clickable SVG roots. Preserve original brand paths in logo specimens. Standalone SVG exports need their own styling and usable dimensions; test them independently at maximum text size and across offered fonts. Wrap or resize the SVG canvas rather than clipping a longer title.

## Explain these decisions in the reader

Provide a short rationale near appearance settings or in an accessible “Why these controls?” disclosure, linked to sources. Describe local design choices as choices. Do not claim that rem, 68ch, 1.75 leading, 44px controls, or the existence of customization is a WCAG mandate or conformance certificate.

Primary sources checked 6 November 2026; recheck when a claim or relevant standard changes:

| Source | Claim and practical consequence |
| --- | --- |
| [CSS Values and Units: font-relative lengths](https://www.w3.org/TR/css-values-4/#font-relative-lengths) | rem follows the root font size; ch uses the zero glyph's advance. Report computed values and test changed fonts/root sizes. This is a Working Draft. |
| [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/) | Normal text generally needs 4.5:1, qualifying large text 3:1; meaningful control/graphic information generally needs 3:1. Text must resize to 200% without loss. The AA target-size rule is 24 CSS px with exceptions; 44px is a comfort choice. |
| [W3C Reflow explanation](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Ordinary vertical content works at 320 CSS px equivalent width; genuinely two-dimensional content has exceptions. Collapse rails and keep table/code scrolling local. |
| [W3C Text Spacing explanation](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) | Combined overrides of 1.5 line height, 2em paragraph spacing, .12em letter spacing and .16em word spacing must not lose content or function. These are stress settings, not required defaults. |
| [W3C Visual Presentation explanation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html) | Customizable foreground/background and limited line width are AAA concerns; browser mechanisms can satisfy them. Reader controls support preferences without proving AAA conformance. |
| [WAI APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | Enter/Space operate disclosure buttons; expanded state matches visibility. Native details/summary is suitable for simple disclosures; navigation links do not require menu roles. |
| [WAI Functional Images](https://www.w3.org/WAI/tutorials/images/functional/) | A control's image alternative communicates the action. Name a button “Reading settings,” not “sliders.” Hide duplicate decorative icon content. |
| [CSS Fonts 4: font-display](https://www.w3.org/TR/css-fonts-4/#font-display-desc) | The fallback policy permits early text and bounds late substitution. Prefer local assets and tested fallback metrics; consider fallback for downloaded long-form prose to reduce reading-position shifts. This is a Working Draft. |

W3C Understanding pages explain requirements; APG offers interaction guidance. Neither defines Mercury's identity.

## Verify the changed reader

- At desktop and 320px width, check ordinary content without page-wide horizontal scrolling, open settings, longest labels, and locally scrolling tables/code. Repeat relevant cases with 200% text enlargement and all four text-spacing overrides together.
- Use keyboard chapter navigation, settings activation, adjustment, reset and return to reading. Inspect actual names, expanded states, logical focus order and visible/unobscured focus. Hidden panels must not retain reachable invisible controls.
- Check the intended font and unavailable-font fallback; neither should clip text or prevent reading. Test long identifiers and URLs.
- Verify computed unit values with two root sizes; changing displayed units preserves geometry. Test any diagram against actual CSS measurements.
- Black/white yields 21:1; identical colors yield 1:1 and failure. A raw ratio below 4.5 must fail a normal-text check even if displayed as 4.50. Invalid color drafts preserve valid previews and exports; reset remains visible.
- If persistence exists, refresh restores valid preferences, malformed data recovers, and reset removes overrides. Source Markdown/PDF remain unchanged.
- Exercise search with a real match and absent term, chapter direct links, original downloads, and each offered export. Test a skip-to-reading link from a later chapter: it must focus the current heading without the route handler resetting the chapter. Number table accessible names by table order within the chapter, not by paragraph position. Inspect generated files, not only success messages.

Scope evidence honestly: computed contrast does not prove reading order, a screenshot does not prove keyboard operation, and a browser stress check does not replace an assistive-technology session.

For print views, explicitly reset paper, ink, muted text and tinted surfaces; changing only page foreground/background can leave dark-mode table headers unreadable. Check the full source introduction and every chapter in the print representation.

Measure the actual paragraphs, labels and code spans after applying preferences, not only their parent container. Library typography may set an explicit paragraph size or leading that defeats inheritance; make the app-owned reading boundary inherit intentionally and verify computed text values. Keep status feedback out of the reading path, and provide a reachable return action after long mobile settings.

For compact headers, test actual button-label scaling as well as body text. Prefer one row at ordinary text sizes; at enlarged sizes allow an intentional second row or stacked controls instead of clipping, shrinking text or breaking ordinary words into letters. A compact icon treatment is useful only when its meaning remains clear and its action name stays accessible. Verify every control is reachable, including the longest translated destination label.

Treat semantic control colors as matched sets: background, foreground, hover and pressed. An application override of only the fill can break a library’s dark-theme pairing. Measure actual rendered controls separately from specimen contrast; retaining the library pair is often the smallest safe fix.
