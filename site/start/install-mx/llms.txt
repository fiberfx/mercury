# Install mx on Linux — Mercury LMS

> Candidate native archive: Linux x86_64 with glibc 2.39 or later, mx and a pinned starter. No Rust, Node, npm CLI, BEAM or private repository required.

## Choose a route

Keep working mx or the existing app's toolchain. [The browser route](/start/browser/llms.txt) needs no CLI. The @fiberfx/mx@0.1.0 npm package and archives are pending publication and consumer verification; check [metadata](/downloads.json), and do not treat a URL as proof of availability.

## npm bootstrap after publication

The proposed `@fiberfx/mx` root package is a Node launcher with optional platform packages. It resolves the installed native binary with `require.resolve` and executes it. Node must remain available for every npm-installed mx invocation. There is no postinstall or GitHub Release binary download in this npm route; npm obtains `@fiberfx/mx-linux-x64`. Keep optional dependencies enabled. Only Linux x64 has binary verification evidence; it requires glibc 2.39+. Other platform packages are unbuilt future work, not available. npm publication and wrapper consumer verification remain pending. The separate archive/image routes run native mx without Node. In a new directory:

```sh
set -eu
mkdir mercury-native-tools
cd mercury-native-tools
npm install --prefix "$PWD/.mx-tools" --global --ignore-scripts @fiberfx/mx@0.1.0
export PATH="$PWD/.mx-tools/bin:$PATH"
mx --version
```

## With working mx

After npm bootstrap, or with existing mx, download only the starter and manifest once published. Skip the full installation below: it would put a second copy of mx on PATH. For a new app:

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

The check must report `mercury-first-page.tar.gz: OK`. `--ignore-missing` skips the native archive entry that was not downloaded. Keep mx.mod/mx.sum and continue at Next. Details: [installation lesson](/start/install-mx).

## Full archive installation

Use a new directory; stop on any error. Both hashes must report OK before extraction.

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

## Next

Run `mx dev`, open its loopback URL, check Card/Button styling and click twice. After Ctrl-C, run `mx build`; output is `dist/`. Full lesson: [First page](/mx/first-app).

## Limits

`mx.sum` pins dependency bytes; it is not an authenticated checksum-database record. The starter needs no `MXNOSUMDB`. New-dependency exceptions are explained at /start/install-mx. macOS and Windows require separate verification. [Release metadata](/downloads.json).

## Navigation

- [Read this page in the browser](/start/install-mx)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/start/llms.txt)
