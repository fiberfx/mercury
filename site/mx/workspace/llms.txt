# A workspace, mx.work — Mercury LMS

> MX1, part two. `mx.work` (Go's go.work, `go` spelled `mx`) groups modules developed together; each member resolves the others from their directories. Mercury's is `fiberfx/mx.work`, eighteen members. `mx work edit|use|init|sync|vendor`.

## Read this when

You work across several Mercury modules at once, add a module to the workspace, inspect what the workspace selects, or vendor its dependencies.

## The file

Verbs: `mx`, `toolchain`, `use`, `replace`. A member = a directory whose `package.json` has a `name`. Beside it: `mx.work.sum` (only lines no member's `mx.sum` has), optionally `vendor/`.

## Finding it

`-workfile <path>` → `MXWORK` (`off` = none; else an absolute path; `auto` = search) → nearest `mx.work` at or above the working directory. None: `mx: no mx.work file found`. In a workspace whose members all have `mx.mod`, `mx install`/`mx verify` take the whole workspace.

## Commands

- `usage: mx work edit|use|init|sync|vendor …`
- `mx work init [dir]...` — refuses `<path> already exists` (here or above).
- `mx work use [-r] [dir]...` — adds dirs with package.json, drops listed ones without; `-r` skips `vendor`, `node_modules`, `.mx`. Regenerate Mercury's: `mx work use ./*/` (in `fiberfx/`).
- `mx work edit` — read: `-print`, `-json` (`Mx`, `Use[].DiskPath`, `Selected`; not both). Write: `-use`, `-dropuse`, `-replace old[@v]=new[@w]`, `-dropreplace old[@v]`, `-mx`, `-toolchain` (`none` drops), `-fmt`, `-workfile`. An edit with `-print`/`-json` is a dry run.
- `mx work sync` — MVS over members' `mx.mod`; raises their `require`s; all-or-nothing.
- `usage: mx work vendor [-o outdir]` — default `vendor/` beside `mx.work`; refuses `refusing to replace <dir>: it holds the workspace`.
- `--mod vendor` on `mx build`/`check`/`run`/`resolve`; any other value: `--mod <value> is not vendor`.

## Flags

Go's single dash (`-json`); `--json` and `-name=value` also accepted. Unknown: `mx: flag provided but not defined: -<name>` (exit 2). No flags to edit: `mx: no flags specified (see 'mx work edit')`.

## Never emit

`pnpm-workspace.yaml`, `workspaces` in a root package.json, or `link:`/`workspace:` dependencies for a Mercury module.

## Next

- MX2 dev loop and HMR: /mx/dev
- This companion: /mx/workspace/llms.txt

## Navigation

- [Read this page in the browser](/mx/workspace)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/mx/llms.txt)
