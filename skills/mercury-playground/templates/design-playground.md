# Design playground

Use a controls/preview split with a readable prompt below; stack it on narrow screens. Render the actual Mercury component in a realistic context so controls demonstrate real public props and token-driven layout.

Group decisions by spacing, typography, color, shape, and interaction. Use bounded sliders for continuous values, selectors for enums, and toggles for boolean features. Keep a viewport-width control when responsive behavior is part of the question. Read the component's actual supported props; do not simulate unsupported variants by overriding private classes.

Derive preview styles from state. Apply application layout values through owned classes or inline styles and Mercury color tokens. Preview light/dark or contextual backgrounds only when they affect the decision. Show hover, focus, disabled, or loading behavior when relevant to the component being explored.

When presets help compare meaningful choices, use cohesive settings such as Compact workspace, Comfortable reading, or Prominent action. A small baseline/improvement comparison may need none. If Reset is offered, it returns to the declared baseline without erasing unrelated explanations or decisions. Verify offered presets produce distinguishable results in the real preview.

The prompt describes the intended feel and precise non-default decisions: “Make the inspector more compact, using the small Button size and a narrower controls column while retaining readable labels.” Include numeric values only when meaningful, name public Mercury props where useful, and do not suggest Tailwind or `.mx-*` overrides.

Verify one change across control, actual component, and prompt; test a range limit for bounded controls and reset when offered. Inspect keyboard focus, a narrow preview, enlarged text and long labels, and reduced motion if motion is adjustable. A narrow canvas control does not prove the surrounding application itself reflows.

## When the playground teaches a design decision

Start from one concrete user action. Keep content, state and visual identity comparable; vary one behavior at a time so the reader can explain the difference. Label deliberately flawed examples and simulated work. Describe the tradeoff and a condition where the preferred treatment is unsuitable; fixed timing or spacing values are not universal quality rules.

Capture the reader’s explanation separately from the chosen settings and improvement decisions. Preserve that explanation when changing a preset. Derived structural findings may identify a known token, size or state inconsistency; they must not declare taste, usability or accessibility verified. A checkbox saying “tested” records the reviewer’s statement and context, not an automated browser result. Keep evidence bound to the example/source/settings it describes; relevant changes make that evidence stale.

If review decisions are requested, distinguish proposed, selected, implemented and visually checked work. Generate implementation requests from selected changes only; attach remaining checks as checks, not as fabricated completions. A saved comparison of editable settings is not a recording of internal example interactions. Do not add a full review desk to an ordinary exploration request.

A useful reusable rule explains the context, decision, reason, valid example, counterexample and observed check. Try it on a different task before calling it transferable. Keep the rule with its owning skill or example; avoid a second copy of the Book or a numeric “craft score”.
