The archive route uses a native `mx` executable for Linux x86_64 and a starter with pinned Mercury 4.0.0 dependencies. You do not need a repository checkout, Rust, Node.js, npm CLI, Elixir or BEAM. `mx` builds JavaScript for the browser; the browser still runs JavaScript.

## Choose your route

Keep a working `mx` installation or an existing application's toolchain. For a simple page without a CLI, use [the browser route](/start/browser). For native TSX development, choose one of the bootstrap routes below.

**Publication status:** `@fiberfx/mx@0.1.0` and the native release archives are pending publication and consumer verification. The commands below specify the intended installation contract; a package name or URL alone is not evidence that it is available. Check [release metadata](/downloads.json) and stop if the required artifact is absent. Do not claim a native installation succeeded until you have run it.

## Bootstrap through npm

The planned root package `@fiberfx/mx` supplies a Node launcher and optional platform packages. On Linux x64, `@fiberfx/mx-linux-x64` carries the native binaries; the launcher uses `require.resolve` to locate the installed binary and executes it. Keep Node installed: every invocation of the npm-installed `mx` goes through this launcher. The npm route has no `postinstall` and does not download binaries from GitHub Releases; npm obtains the platform package. Do not omit optional dependencies. Only the Linux x64 binary has verification evidence, and it requires glibc 2.39 or later. The produced mx and Hyperscript LSAP binaries both require ELF symbol version `GLIBC_2.39`; the build host used glibc 2.41. These are measured binary requirements, not a completed consumer test on glibc 2.39. Other platform packages are future work: they are not built or available. Do not infer support for other architectures, musl, macOS or Windows.

After publication, from a directory without `mercury-native-tools`, the isolated-prefix recipe is:

```sh
set -eu
mkdir mercury-native-tools
cd mercury-native-tools
npm install --prefix "$PWD/.mx-tools" --global --ignore-scripts @fiberfx/mx@0.1.0
export PATH="$PWD/.mx-tools/bin:$PATH"
mx --version
```

The prefix is local to the new directory; only this shell's `PATH` changes. Preserve an existing project's package files. Once mx runs, obtain the pinned app starter as described below, verify its release manifest, and use `mx install`, `mx verify`, `mx dev` and `mx build`. npm installs the Node launcher and native platform package; the launcher still needs Node when mx manages this app's dependencies and build. The archive and image routes invoke native binaries without Node.

If mx already works (including after npm bootstrap), do not replace it with an archive copy. Once the starter archive is published, download only the app and manifest into a new directory:

```sh
set -eu
mkdir mercury-native-app
cd mercury-native-app
curl -fLO https://mercury.jonnify.com/downloads/mercury-first-page.tar.gz
curl -fLO https://mercury.jonnify.com/downloads/sha256.sum
sha256sum --check --ignore-missing sha256.sum || exit 1
tar -xzf mercury-first-page.tar.gz
cd mercury-first-page
mx install
mx verify
```

Before extraction the check must report `mercury-first-page.tar.gz: OK`; `--ignore-missing` skips the native archive entry, which this route did not download. A checksum failure stops the sequence. The commands below describe the full archive installation.

## What you need

For the candidate native archive, use a Linux x86_64 sandbox with glibc 2.39 or later, a shell, `curl`, `tar`, `sha256sum`, HTTPS access and a browser to inspect the result. The required glibc version is recorded in the release's `DYNAMIC_DEPENDENCIES.txt`; consumer verification remains pending. macOS and Windows are separate, unverified installation paths; do not run the Linux executable there.

[Release metadata](/downloads.json) records the archive URLs, checksums and source revision. Download failures are blockers: do not substitute an unrelated executable or continue with an incomplete archive.

## Download and verify

Run this in a shell from a directory where `mercury-scratch` does not already exist. The commands create a new directory, stop on errors, and verify both archives before extracting or executing anything:

```sh
set -eu
mkdir mercury-scratch
cd mercury-scratch
curl -fLO https://mercury.jonnify.com/downloads/mx-linux-x86_64.tar.gz
curl -fLO https://mercury.jonnify.com/downloads/mercury-first-page.tar.gz
curl -fLO https://mercury.jonnify.com/downloads/sha256.sum
sha256sum --check sha256.sum
tar -xzf mx-linux-x86_64.tar.gz
tar -xzf mercury-first-page.tar.gz
export PATH="$PWD/bin:$PATH"
mx --version
cd mercury-first-page
mx install
mx verify
```

Both checksum entries must report `OK`. A missing file or checksum mismatch stops the sequence. The native archive extracts `bin/mx` and release notices; the starter extracts the `mercury-first-page/` directory. `PATH` changes only in this shell. No shell startup file is edited.

The starter carries `index.html`, `app/main.tsx`, `package.json`, `mx.mod` and `mx.sum`. Its dependencies are `@fiberfx/hyperscript`, `@fiberfx/core` and `@fiberfx/ui` at 4.0.0. `mx install` obtains their packages through the public mx feed; `mx verify` checks the installed files against the recorded sums. Keep `mx.sum`.

## Run your first page

From `mercury-first-page/`:

```sh
mx dev
```

Open the loopback URL printed by mx. Stop the server with Ctrl-C, then build:

```sh
mx build
```

Continue with [Your first Mercury page](/mx/first-app) for the component code, expected interaction and build checks.

## What the checks establish

The archive hashes check the bytes against the release's published manifest. HTTPS and the publisher are still the trust source for that manifest. The starter's `mx.sum` pins dependency contents for later installations. These pins are not proof of an authenticated checksum-database record. `mx verify` checks installed package contents; it does not test the page's interaction.

## Adding dependencies

The pinned starter does not need a checksum bootstrap exception. When adding a package whose version has no entry in `mx.sum`, mx can refuse with `nothing vouches for these bytes`. Prefer a trusted pin or a configured authenticated checksum database. If you deliberately accept the public feed as the initial source of trust, a command-scoped exception can bootstrap new `registry.npmjs.org/fiberfx/*` dependency entries:

```sh
MXNOSUMDB=registry.npmjs.org/fiberfx/* mx mod tidy
```

This skips checksum-database authentication for that namespace during that command. Review and retain the resulting `mx.sum`; later checksum matching is not retroactive authentication of the first download. Do not export this setting globally or add it to the normal starter recipe. See [Modules](/mx/modules) for the module format.
