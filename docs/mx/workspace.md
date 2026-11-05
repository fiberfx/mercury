One module is one `mx.mod`. Mercury itself is many modules developed together, and a workspace is how they are built as one: each member resolves the others from their directories, with no release in between.

## Why a workspace

Without a workspace, a module that needs another module's unreleased change has to say so in its own `mx.mod`, with a `replace` line pointing at a directory. A workspace says it once, for every member, in a file that none of the members has to carry. The rules are Go's: `mx.work` is a port of Go's `go.work` parser and printer, with `go` spelled `mx`, and the `mx work` commands are a port of `go work`.

## The file

Mercury's workspace is `fiberfx/mx.work`. Its first lines:

```text
// The workspace of the eighteen modules: sixteen public, and two private, @fiberfx/hypercompiler and @fiberfx/hyperscript-lsap (hyperscript-lsap.1). Regenerate with mx work use ./*/.
mx 0.1.0

use (
	./analytics
	./cms
	./content
	./core
```

The `use` block goes on with the rest of the eighteen module directories, one per line, and closes with `)`. An `mx.work` has four verbs: `mx`, `toolchain`, `use` and `replace`.

A member is a directory whose `package.json` has a `name`, as a Go member is a directory with a `go.mod` that has a `module` line. A member without one is refused: `error reading <dir>/package.json: missing name`.

Two files can sit beside it:

- **`mx.work.sum`**, the workspace's checksums. A line goes into it only when no member's `mx.sum` already has it.
- **`vendor/`**, when `mx work vendor` has written one.

## How mx finds it

mx looks for the workspace in this order:

1. **`-workfile <path>`**, where a command takes it;
2. **`MXWORK`**: `off` ignores every workspace, and any other value except `auto` must be an absolute path to the file, or mx refuses with `invalid MXWORK: not an absolute path`;
3. **the nearest `mx.work`** in the working directory or above it.

So `fiberfx/hypergraph` is in the workspace because `fiberfx/mx.work` is above it. Outside any workspace, the `mx work` commands refuse:

```text
mx: no mx.work file found
	(run 'mx work init' first or specify path using MXWORK environment variable)
```

The workspace changes other commands too. In an `mx.work` whose members all have an `mx.mod`, `mx install` and `mx verify` work on the whole workspace. `MXWORK=off` leaves a member to itself.

## The mx work commands

```sh
usage: mx work edit|use|init|sync|vendor …
```

| Command | What it does |
|---|---|
| `mx work init [dir]...` | Writes `mx.work` in the current directory, with `mx 0.1.0` and a `use` line for each directory. It looks for a workspace first, as every command does, so it refuses with `<path> already exists` when one is here or above. |
| `mx work use [-r] [dir]...` | Adds each directory that has a `package.json` to `use`, and drops a listed one that no longer has one. With `-r` it walks below each directory, passing over `vendor`, `node_modules` and `.mx`. `fiberfx/mx.work`'s header names its own way to regenerate it: `mx work use ./*/`. |
| `mx work edit …` | Prints or changes the file by flag. See the next section. |
| `mx work sync` | Raises each member's requirements to what the workspace selects. |
| `mx work vendor [-o outdir]` | Copies the workspace's dependencies into a directory, `vendor/` by default. |

Flags take Go's single dash, `-r` or `-json`. mx also takes `--json` and `-name=value`. A flag mx doesn't know is refused, for example `mx: flag provided but not defined: -nope`.

## Reading and editing with mx work edit

`mx work edit` takes at least one flag. With none it answers `mx: no flags specified (see 'mx work edit')`.

**Reading, which changes nothing:**

- `-print` prints the file as mx would write it. Run in `fiberfx/`, its output is byte for byte `fiberfx/mx.work`.
- `-json` prints it as JSON: `Mx`, the `Use` list with each member's `DiskPath`, and `Selected`, the versions the workspace selects.
- `-json` and `-print` together are refused with `mx: cannot use both -json and -print`.

**Editing, which writes the file:**

- `-use <dir>` and `-dropuse <dir>` add or drop a member;
- `-replace old[@v]=new[@w]` and `-dropreplace old[@v]` add or drop a `replace`. The separator is `=`, not `=>`, and a new path without a version must be a local directory;
- `-mx <version>` and `-toolchain <name>` set those lines, and `none` drops them;
- `-fmt` rewrites the file in its canonical form.

With `-print` or `-json` beside an edit, mx prints the edited file and does not write it. That makes a dry run of any edit.

## sync and vendor

`mx work sync` runs minimum version selection over every member's `mx.mod`, then raises each member's `require` lines to what was selected. Every member is settled before any file is written, so a refusal leaves the whole workspace as it was. It reads and writes no lock.

`mx work vendor [-o outdir]` writes the workspace's dependencies into one directory, by default `vendor/` beside `mx.work`. Before it reads any member it checks that the target is safe, because it replaces it: an `-o` that holds the workspace, its `mx.work` or a member is refused with `refusing to replace <dir>: it holds the workspace`.

`mx build`, `mx check`, `mx run` and `mx resolve` take `--mod vendor`. Any other value is refused: `mx <command>: --mod <value> is not vendor`.
