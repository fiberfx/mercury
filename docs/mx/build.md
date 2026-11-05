`mx build` makes three different things, and which one depends on what it is pointed at. This page takes them in turn, then `mx check` and `mx run`, which share the host's flags.

## Three kinds

| Kind | Ask for it | It writes |
|---|---|---|
| an app's page | `--bundle`, or a root with `index.html` beside `mx.mod` | a directory: `index.html` and `assets/` |
| one module file | `--lib <entry>` | one ES module file |
| a host's import map | `--host`, or a root with `mx.json` | `importmap.json` and the modules it names |

The flags decide first, then the root. `--bundle` with `--host`, or `--lib` with either, is a usage error (MX0 has the messages).

## An app's page

```sh
usage: mx build [--bundle] [--root <dir>] [--out <dir>]
```

[MX0](/mx/first-app) covers this build: the page's module script is the entry, `--out` defaults to `<root>/dist`, success prints `bundled <entry> -> <out>`, and mx replaces only a directory it marked itself with `.mx-bundle`. The bundle is Rolldown's, linked into mx, and every app module goes through the Hypercompiler without the dev loop's hot-reload wiring.

## What a bundle sees of .env

Both `--bundle` and `--lib` define the same values for the code they bundle:

- `import.meta.env.MODE` is `"production"`, `import.meta.env.PROD` is `true` and `import.meta.env.DEV` is `false`;
- each `MX_` line of `<root>/.env` becomes `import.meta.env.MX_<name>`, with a leading `export` and surrounding quotes taken off.

Only the `MX_` keys reach the bundle, so a secret on another line of the same file never does. A line that isn't `KEY=VALUE` is refused: `<file>: not KEY=VALUE: <line>`.

## One file with --lib

```sh
usage: mx build --lib <entry> --out <file> [--root <dir>] [--external <package>]... [--define <name>=<expression>]... [--minify] [--require-export <name>]...
```

`--lib` bundles one entry into one ES module file, for a module a page loads by itself, such as an island. Both `--lib <entry>` and `--out <file>` are required. On success it prints:

```text
bundled <entry> -> <out> (<bytes> bytes)
```

What it holds to:

- **One file.** There is no code splitting: a dynamic import is inlined. An `--out` that is a directory is refused with `--out <dir> is a directory: --lib writes one file`.
- **The entry's own exports, exactly.** `--require-export <name>` makes a missing one a refusal: `<entry> does not export <names> (it exports <names>)`.
- **Bare imports by choice.** An `--external` package, and its subpaths, stays a bare import for the page's own import map to answer.
- **No sids, no styles.** Modules go through the Hypercompiler with no sid. A stylesheet import loads as an empty module and nothing is written for it, so the page links its own.
- **`--define <name>=<expression>`** adds to the `.env` values above. A value without `=` is a usage error: `--define nope: <name>=<expression>`.

EDU's islands are built this way. `node/apps/edu-boot/bin/build-assets.sh` makes five `--lib` calls, two of them:

```sh
"$mx" build --lib "$fiberfx_dir/phoenix_live_view/src/index.ts" --root "$fiberfx_dir/phoenix_live_view" \
  --out "$dest/phoenix_live_view.js" --minify --external @fiberfx/phoenix --define "LV_VSN=\"$lv_vsn\""
"$mx" build --lib "$apps/edu-island-demo/src/index.tsx" --root "$apps/edu-island-demo" \
  --out "$dest/edu-island-demo.js" --minify --require-export default --require-export hook
```

## Where --lib finds its members

A `--lib` build resolves bare imports as `mx dev` does, from members, asked for import by import, since there is no page to walk. Its members come from two places:

- **the root's `mx.mod`:** each directory it `replace`s;
- **the `mx.work` above it, if there is one:** every workspace member, as `mx resolve` reads them. A `replace` keeps its own directory for its package name, and the root's own directory is not a member of itself.

A bare import that no member provides and no `--external` names is refused by name, never left for the browser to fail on:

```text
<spec>, imported by <importer>, is provided by no member the root's mx.mod replaces and no --external names it
```

With `MXWORK=off`, the build sees no workspace, which is how a release builds hermetic. If a workspace member would have provided the import, the refusal names that member and the fix:

```text
: MXWORK=off leaves out the mx.work whose member <dir> provides <name>. Add `require <module> v0.0.0` and `replace <module> => <relative>` to <root>/mx.mod, or build without MXWORK=off
```

One package from two directories, a `replace` and a workspace member, is refused before anything resolves, in `--lib` as in every command that resolves:

```text
<name> is both <app>'s replace (<dir>) and the mx.work's member (<dir>): remove the replace, or the member from mx.work, or build with MXWORK=off
```

## A host's import map

A host is a server, such as a Phoenix app, that serves Mercury modules from its own static files. Its `mx.json` names them. The proof host's, `fiberfx/mx/proof/phoenix-host/mx.json`, in full:

```json
{
  "packages": ["../../../../fiberfx/phoenix", "../../../../fiberfx/phoenix_live_view"],
  "out": "priv/static/mx",
  "base": "/mx/",
  "entries": ["@fiberfx/phoenix", "@fiberfx/phoenix_live_view"]
}
```

`mx.json` takes five keys: `packages`, `mirror`, `base`, `out` and `entries`. Any other key is refused with `mx.json refused: unknown key <key>`. A flag beats the file: `--out`, `--base`, `--mirror` and the entry specifiers given as arguments.

Without an `out` the host build refuses with `--out is required`, and without entries with `at least one entry specifier is required`. Those are refusals. `mx build --help` prints the usage of all three kinds and exits 0.

It runs in this order:

1. **Install** what the entries need, from the workspace, the `mx.mod`, or the store's lock. This step writes to the store.
2. **Render** the import map, with each module's integrity hash, under `base`.
3. **Copy** each module the map names into `<out>`.
4. **Write** `<out>/importmap.json` and print `build: <n> modules to <out>`.

The map is rendered before anything is copied, so a refusal leaves `<out>` as it was.

## mx check and mx run

`mx check` takes the host's targets and changes nothing. It verifies the store, renders the map again, and compares:

- `<out>/importmap.json` must be there and be the same map, or it is `… is missing` or `… is not this lock's map`;
- every module file must be there with the same sha384, or it is `… is missing` or `… was altered`.

Any of these fails as `check refused: <each problem>`. A pass prints `check: <n> modules in <out> match`.

`mx run <command> [args]` in its host form builds, then becomes the command, so the command's signals and exit code are the host's own. `mx run mix phx.server` is the example in mx's source. When the `package.json` in the directory has a script by that name, `mx run` runs it as a cached task instead (MX5).

`build`, `check`, `run` and `resolve` all take `--mod vendor`, and refuse any other value: `mx build: --mod x is not vendor`.

## Shipping

What ships is what `mx build` wrote: an app's `<out>` directory, a library's file, or a host's `<out>`. This site ships its bundle in three steps, none of them with Node:

```sh
env PATH=<mx's dir>:/usr/bin:/bin mx build --bundle --root sites/mercury --out <dist>   # no Node on PATH
mercury-site build --content sites/mercury/content --app <dist> --home node/apps/website --out <tree>
mercury-site serve --tree <tree>
```

`mercury-site` is the Go program in `go/mercury-site`: it builds the site's documents around the bundle and serves the tree.
