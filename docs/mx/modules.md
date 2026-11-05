A module is a directory with an `mx.mod` in it. Mercury's source modules and native apps are modules, and mx treats them by one set of rules, Go's, with npm's packages as the modules they depend on.


For a public consumer app, start with the pinned files from [First page](/mx/first-app). They use `registry.npmjs.org/fiberfx/core`, `registry.npmjs.org/fiberfx/hyperscript` and `registry.npmjs.org/fiberfx/ui` at `v4.0.0`; the app module is `example.com/mercury-first-page`. The longer example below describes the source workspace with local replacements. Its `github.com/fiberfx/mercury/*` paths are not public consumer download addresses.

## Two files, no lockfile

- **`mx.mod`** says what the module is and what it needs: its path, the mx version, the modules it requires at their minimum versions, and the rules that adjust them.
- **`mx.sum`** says what every downloaded module must hash to. It is a checksum file, not a lockfile: the versions come from `mx.mod`, by minimum version selection, and `mx.sum` only holds them to their bytes.

There is no `mx.lock.json` and no `mx.pins.json` beside them: `mx mod init` deletes either when it finds one.

## The lines of mx.mod

The verbs are Go's: `module`, `mx`, `toolchain`, `require`, `exclude`, `replace` and `retract`. Here is a real one, the whole of `node/apps/edu-boot/mx.mod`:

```text
module jonnify.com/node/edu-boot

// mx build --lib's members (mercury.mx.18): every module this island's import graph reaches, each
// by directory, so EDU's islands build natively with no pnpm root (the Operator, 2026-11-04).

mx 0.1.0

require (
	github.com/fiberfx/mercury/core v3.0.0
	github.com/fiberfx/mercury/hyperscript v3.0.0
	github.com/fiberfx/mercury/live-mercury v3.0.0
	github.com/fiberfx/mercury/phoenix v3.0.0
	github.com/fiberfx/mercury/phoenix_live_view v3.0.0
)

replace (
	github.com/fiberfx/mercury/core => ../../../fiberfx/core
	github.com/fiberfx/mercury/hyperscript => ../../../fiberfx/hyperscript
	github.com/fiberfx/mercury/live-mercury => ../../../fiberfx/live-mercury
	github.com/fiberfx/mercury/phoenix => ../../../fiberfx/phoenix
	github.com/fiberfx/mercury/phoenix_live_view => ../../../fiberfx/phoenix_live_view
)
```

- **`module`** is the module's path.
- **`mx`** is the mx version the file was written for.
- **`require`** lists each module needed and its minimum version. A line ending in `// indirect` is a module the graph selected that this module doesn't ask for itself.
- **`replace … => <dir>`** points a module at a directory on this disk. For an app, those directories are its members, which `mx dev` and `mx build` serve from source.
- **`exclude`** removes one version from consideration. `fiberfx/ui/mx.mod` has one, with its reason on the line:

```text
exclude registry.npmjs.org/fsevents v2.3.2 // playwright pins 2.3.2 exactly and rollup asks ~2.3.3, and a path has one version
```

## Module paths

Two kinds of path appear in Mercury's files:

- **Mercury's own modules** are `github.com/fiberfx/mercury/<name>`, such as `github.com/fiberfx/mercury/hypergraph` in `fiberfx/hypergraph/mx.mod`.
- **An npm package** is `registry.npmjs.org/` followed by its name without the `@`, so `@swc/helpers` is `registry.npmjs.org/swc/helpers`. Versions take Go's form, with a `v`: `registry.npmjs.org/swc/helpers v0.5.23 // indirect`.

## mx.sum

Each module version gets two lines in Go's `h1:` form: one for its files, and one for its manifest, with `/package.json` where Go writes `/go.mod`. From `fiberfx/conformance/fixture/mx.sum`:

```text
registry.npmjs.org/internationalized/date v3.12.4 h1:2mSClM125/h7E9tYWyl7gbM5GDTnBZUnmlm+LfAH8w0=
registry.npmjs.org/internationalized/date v3.12.4/package.json h1:/VQAfoov1XUXQNDnyrLAssJp+LBXaOu4MYD/jEBhY9o=
```

A module whose `replace` points at a directory has no line: its bytes are on this disk.

## The mx mod commands

`mx mod` with no command prints its usage:

```sh
usage: mx mod <init|tidy|verify|graph|why|download>
```

| Usage, as mx prints it | What it does |
|---|---|
| `usage: mx mod init [module-path]` | Writes `mx.mod` from `package.json`. The path is the argument, else the package's name, so `@fiberfx/x` becomes `registry.npmjs.org/fiberfx/x` unless you name it. Each dependency in `dependencies`, `peerDependencies`, `optionalDependencies` and `devDependencies` is required at its range's lowest version. Refuses with `mx.mod already exists`. Deletes `mx.lock.json` and `mx.pins.json`. |
| `usage: mx mod tidy [-e] [--check]` | Settles the requirements by minimum version selection and writes `mx.mod`, `mx.sum` and the dependency versions in `package.json` to match. `-e` goes on past a module it can't fetch. `--check` writes nothing and fails with `tidy --check: <files> would change`. |
| `usage: mx mod verify` | Offline: checks every selected module in the store against `mx.sum` and prints `all modules verified`. |
| `usage: mx mod graph` | Prints the requirement graph, one `<module> <dependency>@<version>` line per edge, from the main module outward. |
| `usage: mx mod why <module>` | Prints `# <module>`, then a shortest path to it from the main module, or `(main module does not need module <module>)`. |
| `usage: mx mod download` | Fetches every module the graph selects into the store. Every module's two `mx.sum` lines are looked for before anything is written, so a missing one refuses with the store as it was, and a module whose manifest names an os, cpu or libc this host isn't is skipped. |

`tidy` refuses in two cases that you should not work around:

- `one version per module path`: two versions of one path were left after selection;
- `SECURITY ERROR: mx.sum has <hash>, and the proxy served <hash>`: the bytes changed under a version you already hold. `-e` never skips this one.

With an `mx.mod` in the directory, `mx install` and `mx verify` read it too, and they take no flags: `usage: mx install: with mx.mod it takes no flags, and installs through MXPROXY`.

## Where modules come from

- **The proxy.** `MXPROXY` is a list in `GOPROXY`'s syntax, by default `https://mx.jonnify.com,direct`. After a `,` the next entry is tried only on a 404 or 410; after a `|`, on any failure. `off` and `direct` end the list, and a path is a tree on this disk. The protocol is Go's, with a `.tgz` where Go has a `.zip` and a `.manifest` where it has a `.mod`.
- **The store.** What is fetched is unpacked under `MX_STORE`, by default `./.mx/store`.
- **The checksum database.** A line `mx.sum` doesn't hold yet is vouched for before it is written, by the database `MXSUMDB` names, unless `MXNOSUMDB` leaves the module out. `MXNOSUMDB` defaults to `MXPRIVATE`, as `GONOSUMDB` defaults to `GOPRIVATE`. A module taken unchecked is named on stderr: `tidy: MXNOSUMDB skipped the checksum database for <module@version>`.

The next page puts several modules in one [workspace](/mx/workspace).
