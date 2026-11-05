# Concept map

Make the map itself an interactive control, with a Mercury sidebar for knowledge levels, relationship types, and node selection, plus the prompt region. Use SVG for accessible graph structure or canvas when justified by scale; canvas needs equivalent keyboard/list controls.

Give concepts stable IDs, clear names, concise descriptions, and source references when mapping a real codebase. Distinguish provided relationships from relationships drawn by the user. Default knowledge to Fuzzy unless the user supplies their level; allow Know, Fuzzy, and Unknown without treating these as measured proficiency.

Allow selecting two nodes to create a labeled relationship, removing a user relationship, hiding nodes, and restoring the overview. If dragging is useful, use pointer capture and retain keyboard alternatives. Prevent accidental duplicate edges and dangling endpoints. Auto-layout is optional: do not promise a physics engine unless it is actually implemented and verified.

Presets should change the view, such as Overview, Core concepts, and a meaningful subsystem. They preserve the user's knowledge markings and authored relationships. A separate explicit reset can restore those edits.

Generate a targeted learning request naming what the user knows and asking about Fuzzy/Unknown concepts. Include user-authored relationships as the questions to investigate. Pre-populated relationships may supply context but must not appear as if the user drew or endorsed them. Explain only concepts requested by the chosen learning scope; do not dump every graph edge.

Verify knowledge changes update the prompt, a user edge can be added and removed, and hidden nodes preserve their state. Check the case where all selected concepts are Known: ask for a next step or show that there are no marked gaps rather than inventing a weakness.
