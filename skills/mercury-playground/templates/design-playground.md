# Design playground

Use a controls/preview split with a readable prompt below; stack it on narrow screens. Render the actual Mercury component in a realistic context so controls demonstrate real public props and token-driven layout.

Group decisions by spacing, typography, color, shape, and interaction. Use bounded sliders for continuous values, selectors for enums, and toggles for boolean features. Keep a viewport-width control when responsive behavior is part of the question. Read the component's actual supported props; do not simulate unsupported variants by overriding private classes.

Derive preview styles from state. Apply application layout values through owned classes or inline styles and Mercury color tokens. Preview light/dark or contextual backgrounds only when they affect the decision. Show hover, focus, disabled, or loading behavior when relevant to the component being explored.

Provide cohesive presets such as Compact workspace, Comfortable reading, and Prominent action rather than unrelated random settings. Reset returns to the declared baseline. Presets should remain visibly distinguishable in the real preview.

The prompt describes the intended feel and precise non-default decisions: “Make the inspector more compact, using the small Button size and a narrower controls column while retaining readable labels.” Include numeric values only when meaningful, name public Mercury props where useful, and do not suggest Tailwind or `.mx-*` overrides.

Verify one change across control, actual component, and prompt; test a range limit and reset. Inspect keyboard focus, a narrow preview, and reduced motion if motion is adjustable.
