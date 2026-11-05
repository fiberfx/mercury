# Server rendering: a scope per request — Mercury LMS

> Render a `@fiberfx/hypergraph` model on a server: `fork()` per request, `await allSettled(...)`, `snapshot(scope)` → JSON frame keyed by sid, `dispose(scope)`; on the client `apply(fork(), frame)` or `fork({values: frame})`. On a JavaScript server, `setCarrier(nodeCarrier())` once at startup keeps each request's scope across `await`.

## Read this when

You render a Mercury page on a server, hand state to the browser, or debug a value that leaked between concurrent requests.

## The contract (tier: Shipped — @fiberfx/hypergraph 4.0.0 on npm since 2026-11-05)

- Server: `const scope = fork({handlers?})`; `await allSettled(event, {scope, params})` waits for every effect the launch started; `const frame = snapshot(scope)`; `dispose(scope)`; send `JSON.stringify(frame)`.
- Client: `apply(fork(), frame as Snapshot)` → `Miss[]` (`removed` | `shape {from, to}`); or `fork({values: frame})`, which reports misses as `reset` observations only.
- Frame: `{format: 'mhg-scope/1', gen, values: {sid: {shape, schema?, value}}}`. Keys are sids, so it applies across builds.
- Travels: writable stores with a sid that the scope changed or was given. Not: sid-less stores, derived stores (client recomputes), `serialize: 'ignore'` stores, stores still at their init.
- Non-JSON values: `serialize: {write(v), read(raw)}`; `apply` runs `read`.
- Carrier: default none (an effect restores its caller's scope on settle; a stray call during an await can join a suspended scope). `setCarrier(nodeCarrier())` from `@fiberfx/hypergraph/node` carries the scope down each async chain. Package test: leak probe reads global 0 / scope 1 by default, global 1 / scope 0 under the carrier.
- Callbacks from outside the chain: `scopeBind(fn, {scope})`.
- Never import `@fiberfx/hypergraph/node` in browser code.

## Minimal example

```ts
import { allSettled, dispose, fork, snapshot, type Snapshot, apply } from "@fiberfx/hypergraph";
import { pageOpened } from "./model";

export async function render(id: number) {
  const scope = fork();
  await allSettled(pageOpened, { scope, params: id });
  const text = JSON.stringify(snapshot(scope));
  dispose(scope);
  return text;
}

export const resume = (text: string) => apply(fork(), JSON.parse(text) as Snapshot);
```

## Never emit

`serialize(scope)`, `hydrate(...)`, `fork(domain)`, one scope shared across requests, `snapshot` before `allSettled` resolves, and any import from `effector`.

## Next

- Testing a model: /hypergraph/testing (/hypergraph/testing/llms.txt)
- This companion: /hypergraph/server-rendering/llms.txt

## Navigation

- [Read this page in the browser](/hypergraph/server-rendering)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/hypergraph/llms.txt)
