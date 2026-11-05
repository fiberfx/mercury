# Document critique

Render the supplied document beside a Mercury suggestions panel, with the generated prompt below. Keep source line numbering accurate even when the display is formatted. Use escaped text or a verified parser, never raw pasted markup as HTML.

Each suggestion needs a stable ID, exact source range, quoted target text or equivalent anchor, rationale, actionable proposal, category, status, and optional user comment. Validate anchors against the loaded snapshot; do not use fuzzy nearby-line matching that can attach feedback to the wrong passage. Record the document path and snapshot identity.

Support Pending, Approved, and Rejected status, with Approve, Reject, Comment, and Reset actions. Selecting a suggestion reveals its actual passage. Show status counts and filter presets such as All, Pending, and Approved. Changing views must not change decisions. Keyboard operation and visible status labels accompany color.

Generate requested edits only from approved suggestions, with user notes included once. Comments on other suggestions are additional feedback, preserving their status; rejected suggestions are not instructions to implement. Include rejected items only when necessary to explain a user's note or an explicitly requested exclusion. With no approvals or comments, state that no edits have been selected.

The interface prepares feedback. It does not silently rewrite the source document. Applying the feedback is a separate requested action.

Verify exact anchor matching, approval and rejection transitions, reset, and a comment on a rejected item. Confirm a stale/missing anchor is flagged and does not highlight or instruct an unrelated passage. Copy should preserve document and line context.
