# Release contract

This directory describes the consumer distribution: documentation and agent resources, native Linux tools and the tested container-image candidate. The public repository is a distribution hub, not a complete source workspace.

The candidate tag is `v0.1.0-agent-preview.1`. The GitHub preview is published; GHCR is an optional future distribution route. The browser packages at 4.0.0 and the native CLI at 0.1.0 have separate version identities; the distribution tag does not rename either.

## Manifest and trust

The manifest declares `schema_version: 1` and uses `assets.bundle`, `assets.native_linux_x64` and `assets.image_linux_x64`. The `release` field names the versioned GitHub release; asset URLs must identify files under that release in `fiberfx/mercury`. Each asset record supplies:

| Field | Meaning |
|---|---|
| `file` | Release asset filename |
| `url` | Download URL for those bytes |
| `sha256` | SHA-256 of the asset bytes |

The image asset also records `image_id`, the observed Docker image identity. The release producer generates `release.json` and `SHA256SUMS` from real artifacts. Do not author placeholder hashes or infer a release URL from a proposed tag.

The consumer supplies the versioned manifest URL **and its SHA-256** to `agents/bootstrap.py`. The bootstrap hashes the downloaded manifest before parsing it, then uses the verified asset records to download and hash each selected asset before extraction.

Obtain the manifest pin through a reviewed release channel, such as an approved release record whose digest has been checked against the producer's artifacts. A checksum fetched beside a manifest from the same untrusted location proves only consistency between those responses. It does not independently authenticate the publisher or protect against both being replaced. A manifest pin records which bytes the caller trusts; it is not itself a signature or a checksum-database record.

## Candidate manifest pin

Versioned URL: `https://github.com/fiberfx/mercury/releases/download/v0.1.0-agent-preview.1/release.json`

Reviewed manifest SHA-256: `1dbcce7ed1443ec6ff2ae922b4b1b2ba0f3f0562c00af86a20af45dcddd67b50`

This pin identifies the published preview manifest. Both `agents/bootstrap.py` and `agents/download_image.py` require the caller to supply this pin before trusting asset metadata.

## Contents and boundaries

- **Documentation bundle:** English/Russian authored Markdown, the rendered site, the Mercury page skill, and the playground skill with its template resources. Exported Markdown omits private grounding front matter. The rendered export contains 248 endpoint responses covering 120 lesson routes.
- **Native Linux asset:** mx and Hyperscript LSAP executables with source revision, hashes, source-input inventory and third-party notices. The measured highest required ELF symbol version is `GLIBC_2.39` for both binaries; the build and consumer host used glibc 2.41. Linux x64/glibc 2.39+ with `libgcc_s.so.1` is a requirement, not evidence of testing every eligible host.
- **Public playgrounds:** the native-built counter and self-contained task list use published Mercury packages. The internal code-map and Design Explorer artifacts are excluded pending an explicit public-content allowlist. Their reusable generic skill templates are included.
- **Container image:** `mercury-agent-linux-x64.docker.tar.gz`, verified against `assets.image_linux_x64.sha256` before `docker load`. Archive SHA-256: `aa08bb332a90ff1ea13780fe1c5a772b6f0fb8c36c43dcff458e35d81b9e6a93`. Observed image ID on Docker 29: `sha256:9c0ae833f6c7bc58f61ea8cb783439dde78802c531f676eea8eca9363e5f12ca`. Python serves documentation on port 8000; consumers publish that port on loopback. The archive hash pins the delivered image bytes; its local tag alone does not.

`--docs-only` allows use of the documentation bundle without native installation. Browser examples may still fetch packages and styles from a CDN; distinguish local documentation from offline runnable applications.

## Evidence before publication

The current source-side evidence is 88 passing LMS tests and 235 passing native tests, with two native tests ignored. Cold consumer checks covered Node-free installation and build, offline reuse and tamper rejection. The image passed win120 checks as non-root UID 10001, with no Node/npm/Rust/BEAM, a network-disabled mx verification/build, and five HTTP routes. These assembly checks are complemented by the public consumer results below.

Before calling the distribution available, verify the actual published manifest and asset bytes through the public consumer path. Record their real digests and source revision, run the documented fresh bootstrap, and inspect the requested page in a browser. For the image, verify the public archive through `agents/download_image.py`, load the verified bytes and check startup. A future GHCR route should use a reviewed OCI digest, but GHCR is not required for the archive route. Public-network verification passed on 2026-11-05: a fresh non-root Linux container rejected a wrong manifest pin, installed from the public GitHub assets, and ran native verification/build with `MXPROXY=off`. The public Docker archive was independently downloaded and hash-verified, loaded on win120, and checked for the recorded image identity, five HTTP routes and network-disabled native build. The frozen manifest records assembly-time status; this release record carries the later observations.

A source README correction does not change an existing npm package's README. Treat that update as a separate publication step and report its actual state.

## npm packaging contract

The planned `@fiberfx/mx` root package contains a Node launcher and optional platform dependencies. `@fiberfx/mx-linux-x64` carries the Linux native binaries; the launcher resolves the installed binary with `require.resolve` and executes it. Node is required for npm-installed mx invocations, not only installation. There is no postinstall hook and no GitHub Release binary download in this npm path.

Linux x64/glibc 2.39+ is the only native platform with verification evidence. Other platform packages are future work, not built or published. npm publication and wrapper consumer validation must be reported separately from the verified direct-native archive/image checks. These packaging changes do not add Node to the Python bootstrap or container runtime.

## Why use a pinned bundle

The bundle gives a fresh agent one versioned set of docs, examples and tools without access to a private source checkout. A caller-reviewed manifest pin preserves that exact selection and rejects changed bytes. The cost is maintaining an export and requiring a trusted pin to start; an unpinned “latest” download would be easier to type but would not establish which release the consumer agreed to use.
