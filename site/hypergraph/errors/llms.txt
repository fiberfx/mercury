# Kinds, carriers and errors — Mercury LMS

> `kindOf(x)` tells a unit's kind or a scope from anything else; `setCarrier(nodeCarrier())` keeps a scope across an `await` on a JavaScript server; every refusal of `@fiberfx/hypergraph` is a `HypergraphError` with a portable `code`.

## Read this when

You branch on what a value is, run Hypergraph on a server with concurrent requests, or handle, test or explain a Hypergraph error.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- `kindOf(x)` → `'store' | 'event' | 'effect' | 'scope' | null`; `null` for anything not made by this module.
- `setCarrier(carrier | null)`. Default none: an effect called in a scope restores that scope to its caller on settle, so an unrelated call during the await can join it. A carrier (`{current(), run(scope, fn)}`) carries the scope down the chain.
- `nodeCarrier()` from `@fiberfx/hypergraph/node` (AsyncLocalStorage). Call `setCarrier(nodeCarrier())` once at server start. Never import `/node` in browser code.
- `HypergraphError extends Error`: `name` `"HypergraphError"`, `code: ErrorCode`. Match on `code`, never on the message.
- Codes: `derived-call` (derived unit called; thrown), `derived-target` (derived unit as `sample` target or `split` case; thrown at wiring), `pure-call` (unit called inside a reducer, `map`, filter; reported, not thrown), `disposed-scope` (work in a disposed scope; `allSettled` or the effect call rejects), `reset-reason` (bad reset reason at the hot-replacement port; not reachable from app code).
- A throw inside any function the graph runs goes to `console.error`, stops that branch, and is observed as `fail`; it never escapes the launch.
- Plain `Error` (no code): units of two generations wired together; a non-unit where a unit is expected; `scopeBind` with no scope and no `safe`; `allSettled` on a derived unit; a declared effect with no performer.

## Minimal example

```ts
import { HypergraphError, allSettled, dispose, event, fork } from "@fiberfx/hypergraph";

const ping = event();

export async function afterDispose() {
  const scope = fork();
  dispose(scope);
  try {
    await allSettled(ping, { scope });
  } catch (error) {
    if (error instanceof HypergraphError && error.code === "disposed-scope") return "fork a new scope";
    throw error;
  }
}
```

## Never emit

`is`, `is.store`, `is.scope`, a check of an error's message text, a unit call inside `.on`/`.map`/`filter` (use `sample`), and any import from `effector`.

## Next

- The course: /hypergraph (/hypergraph/llms.txt)
- This companion: /hypergraph/errors/llms.txt (the page as Markdown, `/hypergraph/errors.md`, is planned for W3)

## Navigation

- [Read this page in the browser](/hypergraph/errors)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
