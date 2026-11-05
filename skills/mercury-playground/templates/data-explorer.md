# Data explorer

Use grouped Mercury controls beside a formatted query, structured result, or pipeline preview, with a natural-language prompt below. Ground schema and sample data in the provided source; mark invented examples as samples.

Map decisions to fields: source/table, selected columns, condition rows, grouping, ordering, and limits. Use add/remove rows for conditions with stable IDs. Expose field types and valid operations so a user can understand invalid combinations. Choose presets that answer different real questions, such as Recent activity, Grouped summary, and Exceptions.

Keep generation pure: derive output from state and an explicit schema. Render code as escaped text/tokens. Validate a field or expression before deriving executable output. For regex, handle malformed expressions and bound sample sizes; for SQL or APIs, distinguish a generated request from an executed request. Do not run database writes, send requests, or embed credentials merely to make the preview live.

The prompt states the requested outcome and essential schema context rather than repeating raw syntax: “Return the ten users with the most orders after the chosen date, joining orders.user_id to users.id.” The query may be separately copyable; label it distinctly from Copy prompt.

Verify a valid configuration produces the intended output, then an invalid field/type or malformed expression produces useful feedback without stale output presented as current. Check add/remove rows, reset, and empty results. If only generation was tested, do not claim query execution.
