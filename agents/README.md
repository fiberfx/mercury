# Mercury for coding agents

Use this bundle to build the user's requested Mercury page from public materials. Preserve an existing project and its working toolchain. The starter counter demonstrates the runtime; it is not the required result for every task.

## Obtain the bundle

Use Python 3.11 or later. The [root instructions](https://github.com/fiberfx/mercury#bootstrap-a-reviewed-release) use:

```sh
python3 agents/bootstrap.py \
  --manifest "$MERCURY_RELEASE_URL" \
  --sha256 "$MERCURY_RELEASE_SHA256" \
  --dest mercury-sandbox
```

The URL must identify a versioned GitHub `release.json`, and the hash must come from a reviewed release channel. Both values are required. The bootstrap checks the manifest before parsing and checks each asset before extraction. Native tools and the documentation bundle are selected by default; `--docs-only` selects just the bundle.

Check the versioned release record for availability. Do not replace missing artifacts with guessed URLs, unpinned latest releases or private repository paths.

## Use the verified image

The [container instructions](https://github.com/fiberfx/mercury/blob/master/docker/README.md) use the GitHub image archive, verified by `agents/download_image.py`, then explicit `docker load` and `docker run` commands. No GHCR account or registry pull is required for that route. Verify that the selected release provides the image asset. The image contains Python and native tools, without Node/npm/Rust/BEAM, and runs as UID/GID 10001.

Copy `/opt/mercury/examples/first-page` to `/workspace/my-page` before editing. With the container running as `mercury-agent`, a native offline check is:

```sh
docker exec -e MXPROXY=off mercury-agent sh -c \
  'cp -R /opt/mercury/examples/first-page /workspace/my-page && cd /workspace/my-page && mx verify && mx build'
```

Use a fresh `my-page` destination. The copied example includes the pinned dependency store needed for this offline check. For a host workspace bind mount, make the dedicated directory writable by UID 10001; the image's original `/workspace` permissions do not apply through the mount.

## Read locally

After extraction, the destination includes:

| Path | Purpose |
|---|---|
| `docs/` | Authored English and Russian Markdown; private grounding front matter is removed from the public export |
| `site/` | Rendered documentation and text endpoints: 248 responses covering 120 lesson routes |
| `agents/SKILL.md` | Mercury page workflow, adapted to the local bundle |
| `skills/mercury-playground/SKILL.md` | Playground skill, with its templates and supporting files |
| `skills/mercury-design-builder/SKILL.md` | Interface composition, design and interaction verification |
| `agents/serve.py` | Python server for the rendered site |
| `native/bin/` | Native tools, when selected and available for the host |

Serve the site:

```sh
python3 mercury-sandbox/agents/serve.py --root mercury-sandbox/site --port 8000
```

The served `/agent/SKILL.md` and `/SKILL.md` routes are aliases for the page skill. Read the local Markdown directly when an HTTP server is unnecessary.

Local documentation does not imply every example works offline. The browser-only starter uses versioned CDN imports and CSS and needs network access. Native packages require their recorded dependencies to be present before offline reuse. The bundle includes the native-built counter and portable task list. Internal code maps and the Design Explorer are excluded pending a separate public-content allowlist.

## Choose the page route

1. **Existing Mercury app or working mx:** keep its files and dependency pins. Use its existing development workflow.
2. **A simple browser page:** use the browser lesson and HTML example. Write plain JavaScript `h` calls; browsers do not compile TSX. Keep the import map and linked stylesheet together.
3. **Native development:** use compatible mx, then `mx install`, `mx verify`, `mx dev` and `mx build`. Native TSX imports `@fiberfx/ui/styles.css`; the browser-only route links the CSS instead. The Python bootstrap needs no Node/npm. The planned npm root package `@fiberfx/mx` instead installs a Node launcher with optional `@fiberfx/mx-linux-x64`. It resolves the installed binary via `require.resolve` and executes it, so Node must remain available at each invocation. It has no postinstall or GitHub Release binary download. Keep optional dependencies enabled; other platform packages are unbuilt future work and npm publication is pending.

The candidate native tools require Linux x64 with glibc 2.39 or later and `libgcc_s.so.1`. Their consumer checks ran on glibc 2.41; do not generalize that result to every Linux system. Other hosts can use `--docs-only` and browser examples.

## Complete the user's task

Check the requested appearance and interactions in a browser, including a relevant invalid or boundary case. For the sample counter, observe 0 → 1 → 2 and a saved title edit. For another page, use that page's requirements. Native work also needs a successful build and a check of the served `dist/` page.

Report the files produced, checks run and any missing browser, network or platform evidence. A successful download, package install or build is not proof that the interface works. Keep deployment within the user's authorization.
