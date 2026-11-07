<!-- Published by scripts/package_readmes.py from fiberfx/schema/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/schema

The portable document format of the **Mercury** design system: versioned, JSON-safe page data
with block schemas, validation at declared limits, and one command layer that applies edits
atomically or refuses them. No React, no Effector, no DOM: a renderer, an editor and a server
read the same documents. The contract is the AUS
mercury.20.

```ts
import { applyCommand, createSchemaRegistry, parseDocument } from "@fiberfx/schema";

const registry = createSchemaRegistry({
  blocks: [
    { type: "section", version: 1, props: {}, slots: { content: {} } },
    { type: "heading", version: 1, props: { text: { kind: "string" }, level: { kind: "number", integer: true, min: 1, max: 6 } } },
  ],
});

const parsed = parseDocument(jsonText, registry); // { ok: true, document } or { ok: false, code, path, reason }
if (parsed.ok) {
  const result = applyCommand(
    { document: parsed.document, revision: 0 },
    { kind: "set-properties", expectedRevision: 0, node: "title", props: { level: 2 } },
    { registry },
  ); // { ok: true, local: { document, revision: 1 }, impact } or a refusal; the input is unchanged
}
```

- **Document:** `format`, `id`, `kind` (`page`, `fragment`, `template`), ordered `roots` and a flat
  `nodes` map. A node has `id`, `type`, `version`, JSON `props` and named `slots` of child IDs.
  Fields the format does not name are kept as they are.
- **Refusals** share one shape: a typed `code`, a JSON Pointer `path` in its URI-fragment form
  (`#/…`, percent-encoded), a `reason`, the `subject` the path points into (`document`, `command`
  or `state`) and, when there is one, the `node`. Parsing, commands and migration never return a
  partial document, and hostile input (a throwing getter, a revoked proxy) is refused, not thrown.
- **Commands:** insert, remove, move, duplicate and set-properties, each against an expected
  local revision. Duplicate mints fresh node IDs and keeps references. An edit to a fragment
  reports every document that references it.
- **Limits** (`maxDepth`, `maxBytes`, `maxNodes`, `maxPropDepth`) are declared per registry and
  hold for every result: an edit or a migration that would outgrow them is refused. `maxBytes`
  counts the document's compact JSON, so whitespace never changes a verdict.
- **Tokens:** a `token` prop admits only a name from a set the registry declares (`tokens`).
- **Migration:** `migrateDocument` steps older block versions forward through each definition's
  deterministic migrations, on a copy; a refusal hands back the untouched `original`, and a step
  that drops data needs `{ allowLossy: true }`. Format 1 is the first portable format.
- **Unknown blocks** (an unregistered type or a newer version) are kept unchanged through parsing,
  edits elsewhere, saves and migration, their slots included; `inspectDocument` reports them
  `unsupported`.
- **References** (`{ "$ref": "asset" | "route" | "entity" | "fragment", "id" }`, plus any JSON fields
  a later version adds) resolve beside the document with `resolveReferences`; an `unauthorized`
  target keeps only its identity. `indexConsumers` follows fragments inside fragments.
- **Responsive values** (`{ "$responsive": { "base", "overrides" } }`) keep absent, explicit and
  removed (`{ "$removed": true }`) distinct; `resolveResponsive` reads one width and writes nothing.

Client validation helps authors; the host still authorizes every change on its server.
