# Diff review

Load the actual requested commit, comparison, or supplied diff and preserve its identity. Render files and hunks with old/new line numbers, addition/deletion markers, and contextual comments. Use Mercury controls for navigation, filters, comment editing, and prompt copy. Color supplements explicit `+` and `−` signs.

Use structured diff data: file path, old path when renamed, hunk identity, old/new line numbers, line kind, and source text. Comment anchors must include file, comparison, hunk/line identity, and old/new side. A deletion targets the old side; an addition targets the new side. Do not infer all anchors from the visually displayed line number. Treat binary and truncated diffs explicitly.

Click or keyboard-select a line to edit its comment. Support Save, Cancel, Edit, and Delete, marking saved comments on their lines. Empty saves should have a clear delete/reject rule. Preserve comments while changing file filters or presets. Useful views include All files, Commented files, and a real subsystem; do not create fake review scenarios to meet a preset count.

The prompt names the repository and comparison, groups saved feedback by file, and includes the side, line number, relevant code, and user's text. Build it from state, not DOM data attributes. With no comments, explain how to add feedback rather than inventing review findings. Copying feedback does not submit a PR review or apply the suggested changes.

Verify comments on both a removed and an added line with equal numeric line numbers remain distinct. Exercise cancel, editing, deletion, hidden commented files, and exact copied anchors. Surface stale comparisons instead of silently rebasing comments onto unrelated code.
