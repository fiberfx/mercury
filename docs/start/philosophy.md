Mercury uses Hyperscript in the browser and mx for native builds. A standalone browser page can use plain JavaScript without a build step. Phoenix/LiveView is an optional server integration, used by this documentation website.

## A native toolchain, no Node

`mx` is a Rust program. It installs Mercury packages from static mirrors, checks each one's sha512, records it in `mx.sum`, and re-hashes the store on `mx verify`, with no npm and no Node. It serves an app (`mx dev`) and builds it (`mx build`). Mercury's language server, Hyperscript LSAP, is a Rust crate too.

**Why:** a native toolchain is one binary, which a consumer pins by its checksum, and one place where each fact is computed. A refusal says what it refused: `mx` exits 0 on success, 1 on a refusal and 2 on a usage error. The native binary performs the build without Node. The archive and image routes invoke that binary directly. The planned npm root package uses a Node launcher to resolve and execute a platform binary, so npm-installed mx requires Node on every invocation; it has no postinstall or GitHub binary download. See [installation readiness](/start/install-mx).

## No React

Mercury Hyperscript is Mercury's own virtual DOM. It follows the DOM, not React. You write `class` and `for`. `onInput` fires on each keystroke, and `onChange` fires on the DOM's own `change` event. SVG attributes keep their SVG names. There is no compatibility entry: it was deleted.

**Why:** a component should mean in the browser what it says in the source. No published Mercury package carries a third-party runtime dependency, and a check refuses any React package, import, type or peer before a change lands.

## On the BEAM

This documentation website uses Phoenix on the BEAM. In that server-first design, HEEx produces readable HTML before client JavaScript runs. That rule applies to the documentation site and the Phoenix integration, not every standalone Mercury page. A Mercury island mounts only where the page needs behaviour. A page that only shows content opens no LiveView socket. Live Mercury connects Mercury Hyperscript to LiveView: its `MercuryHook` mounts an island, and LiveView's updates reach it as props.

**Why:** on the BEAM each site is its own endpoint, so this site and another on the same node fail independently. A page that the server has already painted needs no client-side render before it can be read, by a person or by an agent.

## Every fact from its producer

A fact is computed once, by the code that owns it, and everything else reads it from there. On this site:

- the reference is generated from each package's source;
- the mx course quotes mx's own `--help` and `--json` output, never retyped;
- each example is to be bundled, run, or refused by the build, and none goes unchecked.

What isn't finished is reported as unfinished. That's why every page here says what is Shipped, what is a Preview and what is Planned.

## Where it stands today

These are the aims, and not all of them hold yet:

- **Node is still in the tools.** The `@fiberfx/*` modules build and test with mx; pnpm remains only for apps and tools under `node/`. A script that `mx run` runs can still call Node, which is why its cache key includes `node --version`.
- **A gate keeps Node out of this site's server.** `mix mercury.lms.scrub` fails an import of a retired package in any lesson or served asset, and fails the app if it invokes `node`, `npm`, `npx`, `pnpm` or `yarn`.
- **The examples check and the generated reference are planned.** They land in later waves. [Stability](/start/stability) lists what is ready now.
