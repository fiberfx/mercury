# Working in the Mercury distribution repository

This repository owns consumer bootstrap tools, documentation distribution and release packaging. It is not the complete Mercury module source workspace. Inspect the files that exist before proposing a package build; do not assume `ui/`, `core/`, `hyperscript/`, `mx/` or an upstream monorepo is available here.

Preserve other writers' changes and the user's existing application. For page creation, read `agents/SKILL.md` from the extracted bundle and choose the route that fits the task: existing tools, browser-only HTML or supported native mx. Browser JavaScript is required for interactive pages; Phoenix/BEAM is optional. npm is an optional distribution mechanism, not a prerequisite for the Python bootstrap or native CLI runtime.

## Distribution invariants

- The caller supplies both a versioned manifest URL and a reviewed SHA-256. Verify the manifest bytes before parsing them. A manifest and checksum from the same untrusted location do not create an independent trust anchor.
- `schema_version: 1` identifies `assets.bundle` and `assets.native_linux_x64`, each with `file`, `url` and `sha256`. Verify downloaded asset bytes before extracting or executing them. Keep extraction inside the selected destination; do not weaken failure handling to make a release pass.
- Preserve dependency pins, native provenance and license notices. Report the source revision, asset hashes and checks actually performed without substituting a planned tag for an observed release.
- Native candidates require Linux x64, glibc 2.39 or later and `libgcc_s.so.1`; they were tested on glibc 2.41. Do not claim support for musl, other architectures, macOS or Windows based on that evidence. `--docs-only` is the documentation route on other hosts.
- Keep publication state explicit. Source-side tests, local packages, public asset downloads and digest-pinned image pulls are separate evidence. Never invent a hash, published version, successful browser interaction or release URL.

## Verification and delivery

For bootstrap changes, check the supported input and a meaningful rejection such as a wrong manifest pin, changed asset or unsafe extraction path. For documentation changes, check the actual consumer commands and links. For a requested page, observe its styling and requested interactions in a browser; native work also needs a build and a check of the served output. If an essential check cannot run, report the limitation.

Keep changes in their owning files. Do not modify runtime code or package versions under a documentation task. Do not publish a release or image merely because packaging succeeds; follow the user's granted scope. Commit or upload completion does not imply acceptance of the resulting page.
