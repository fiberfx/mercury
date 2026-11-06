# Mercury

Mercury builds browser interfaces with Hyperscript, Mercury UI and the native `mx` toolchain. Phoenix and LiveView are optional integrations. The public `@fiberfx` browser packages are at 4.0.0.

This repository is a **consumer distribution hub**, not a checkout of all Mercury package sources. It provides the bootstrap tools and release instructions for documentation, agent skills, examples and native tools. There are no package source directories here to build with pnpm.

## Choose a starting point

- **Read and explore the design system:** open the [Design Book](https://mercury.jonnify.com/book) / [Дизайн книгу](https://mercury.jonnify.com/ru/book), its [editable formats and reader source](book/README.md), or the [brand-book skill](skills/mercury-brand-book/SKILL.md).

- **Keep an existing Mercury app:** use its working tools and dependency pins.
- **Try a page without installing a CLI:** open [site/examples/first-page.html](site/examples/first-page.html) from this checkout and follow the [browser guide](docs/start/browser.md). It uses plain JavaScript, versioned packages and a stylesheet; the CDN route needs network access. The bundled site serves the same example at `/examples/first-page.html`.
- **Work from a local documentation bundle:** use the Python bootstrap below. Add native tools on supported Linux, or select `--docs-only` elsewhere.
- **Give an agent the task:** start with [the agent guide](agents/README.md) and, after extraction, `mercury-sandbox/agents/SKILL.md`.

The JavaScript browser packages and the native CLI have separate versions. The published preview is [v0.1.0-agent-preview.1](https://github.com/fiberfx/mercury/releases/tag/v0.1.0-agent-preview.1). A fresh public-network bootstrap passed manifest rejection, native verification and page build on Linux. npm publication remains pending.

## Bootstrap a reviewed release

Requirements: Python 3.11 or later and network access to the release assets. Native tools require Linux x86_64 with glibc **2.39 or later** and `libgcc_s.so.1`. The current binaries were built and tested on glibc 2.41; their ELF requirements establish the 2.39 floor, not a completed test on every compatible Linux distribution. No Node, npm, Rust or BEAM installation is needed for this consumer route.

Obtain the versioned GitHub `release.json` URL and its SHA-256 through a reviewed release channel. Set `MERCURY_RELEASE_URL` and `MERCURY_RELEASE_SHA256` to those actual values. A checksum downloaded beside an untrusted manifest does not independently establish trust.

From this repository, with a destination path that does not already exist:

```sh
set -eu
MERCURY_RELEASE_URL=https://github.com/fiberfx/mercury/releases/download/v0.1.0-agent-preview.1/release.json
MERCURY_RELEASE_SHA256=1dbcce7ed1443ec6ff2ae922b4b1b2ba0f3f0562c00af86a20af45dcddd67b50
python3 agents/bootstrap.py \
  --manifest "$MERCURY_RELEASE_URL" \
  --sha256 "$MERCURY_RELEASE_SHA256" \
  --dest mercury-sandbox
export PATH="$PWD/mercury-sandbox/native/bin:$PATH"
mx --version
python3 mercury-sandbox/agents/serve.py --root mercury-sandbox/site --port 8000
```

The bootstrap checks the caller-pinned manifest hash **before parsing the manifest**, then verifies asset hashes before extraction. A mismatch is a failure, not a reason to disable verification. The `PATH` change above affects only the current shell.

On non-Linux systems, or when you only need documentation, add `--docs-only` to the bootstrap command and skip the `PATH` and `mx --version` lines. The bundle includes English and Russian Markdown, a rendered documentation site covering 120 lesson routes, agent instructions and playground skill templates. Start with the local site's home page using the address printed by the server. [Bundle contents and use](agents/README.md) explain what is local and what still needs network access.

## Optional npm distribution

The planned npm root package `@fiberfx/mx` supplies a Node launcher and optional platform packages. The launcher uses `require.resolve` to find the installed native binary and executes it. **Node remains required whenever the npm-installed mx command is invoked.** This path has no `postinstall` and does not download binaries from GitHub Releases; npm obtains the platform package. Keep optional dependencies enabled.

Only Linux x64 binaries have verification evidence, requiring glibc 2.39+. The planned platform package is `@fiberfx/mx-linux-x64`; other platform packages are future work, not built or available. npm publication is pending. The Python bootstrap, direct native archive and container routes above remain Node-free.

## Container route

The image is available as a GitHub release archive; GHCR is an optional future route, not a prerequisite. Run from this repository with a new output filename:

```sh
set -eu
python3 agents/download_image.py \
  --manifest https://github.com/fiberfx/mercury/releases/download/v0.1.0-agent-preview.1/release.json \
  --sha256 1dbcce7ed1443ec6ff2ae922b4b1b2ba0f3f0562c00af86a20af45dcddd67b50 \
  --output mercury-agent-linux-x64.docker.tar.gz
docker load --input mercury-agent-linux-x64.docker.tar.gz
docker run --rm --name mercury-agent \
  --platform linux/amd64 \
  -p 127.0.0.1:8000:8000 \
  mercury-agent:v0.1.0-agent-preview.1
```

Open `http://127.0.0.1:8000`. The downloader checks the reviewed manifest pin before parsing and verifies the image archive before writing it. It does not execute Docker; loading and starting the image are the explicit next commands. The archive SHA-256 is `aa08bb332a90ff1ea13780fe1c5a772b6f0fb8c36c43dcff458e35d81b9e6a93`. The tag used after loading names the image from those verified bytes; the tag alone is not the trust anchor.

The container runs as UID/GID 10001 and has a writable `/workspace`. To retain work on the host, add a bind mount for a dedicated directory writable by UID 10001; a bind mount replaces the image directory's permissions. See [image use and offline example](docker/README.md) for the mount and copy/build commands.

## What is verified

Source-side checks recorded for this candidate passed 88 LMS tests and 235 native tests, with two native tests ignored. A cold consumer check covered Node-free installation, build, offline reuse and tamper rejection. The image also passed checks on win120 as non-root UID 10001: network-disabled native verification/build, absence of Node/npm/Rust/BEAM, and five HTTP routes. The versioned GitHub assets are published. A fresh non-root Linux consumer downloaded the manifest and archives, rejected a wrong manifest pin, and ran native verification/build with `MXPROXY=off`. The public image archive passed SHA-256 verification, was loaded on win120, and passed the same offline runtime checks.

The bundle includes a native-built counter and a portable task list made from published Mercury packages. Internal repository maps and the Design Explorer are excluded pending a separate public-content selection. The reusable playground skill includes six templates; the Design Builder skill covers interface composition and interaction verification.

The bundled site is a source snapshot. Its empty `/downloads.json` describes the separate website-hosted archive route. Use the Python bootstrap above for this published GitHub preview; production-site deployment and npm publication remain pending.

## Contributing

Read [AGENTS.md](AGENTS.md) for distribution changes and [release/README.md](release/README.md) for the trust and publication boundary. Editing this repository does not alter already-published npm package metadata.

## License and notices

See [LICENSE](LICENSE) and [NOTICE.txt](NOTICE.txt). Native release assets carry their own third-party notices and source provenance; keep those files with redistributed tools.
