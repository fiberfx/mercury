# Mercury native image

The candidate image contains native mx and Hyperscript LSAP, Python-served documentation, agent skills, the counter and task-list playgrounds, examples and notices. It was built and tested on win120 as non-root UID/GID 10001, with no Node/npm/Rust/BEAM. Network-disabled mx verification/build and five HTTP routes passed. GitHub preview publication is still pending.

## Download and load the candidate

The release uses a Docker archive on GitHub; GHCR is optional future distribution. From the repository, after publication and with a new output filename:

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

The downloader verifies the manifest SHA-256 before parsing and then the archive SHA-256 `aa08bb332a90ff1ea13780fe1c5a772b6f0fb8c36c43dcff458e35d81b9e6a93`. It does not execute Docker or inspect the image. `docker load` and `docker run` are explicit consumer actions. The observed image ID on Docker 29 is `sha256:9c0ae833f6c7bc58f61ea8cb783439dde78802c531f676eea8eca9363e5f12ca`; the verified archive bytes, not the local tag, establish which image is loaded.

## Work locally and build offline

Open `http://127.0.0.1:8000`. The server listens on the container interface; the host port is published only on loopback. `/opt/mercury` contains the release and mx is on PATH. `/workspace` is writable by the default UID/GID 10001.

Copy the supplied example before editing it; use a destination that does not already exist:

```sh
docker exec -e MXPROXY=off mercury-agent sh -c \
  'cp -R /opt/mercury/examples/first-page /workspace/my-page && cd /workspace/my-page && mx verify && mx build'
```

The example carries its pinned store, so this verification/build needs no package network access. The result is `/workspace/my-page/dist/`. For a different application, offline operation requires its dependencies to be present too.

To retain work on the host, add `--mount "type=bind,source=$PWD,target=/workspace"` to the run command from a dedicated directory writable by UID 10001. A bind mount replaces the image directory's permissions. Do not mount unrelated files merely to run the example.

The image is Linux amd64. Native binaries require glibc 2.39+ and libgcc_s.so.1; the image supplies them and the consumer tests ran with glibc 2.41. This does not establish musl or ARM64 support.

## Build from a verified release

The build context must contain this Dockerfile, `agents/bootstrap.py`, and `release-inputs/` with `release.json` plus the two archives named by that manifest. Schema 1 records `release` and `assets.bundle` / `assets.native_linux_x64`; each asset has `file`, `url` and `sha256`. Cache files retain their manifest filenames. No credentials belong in the context.

Obtain the expected manifest SHA-256 from the trusted release publication. Supply that value to the build; hashing an untrusted downloaded manifest alone does not authenticate it.

```sh
# Set this to the expected value supplied by the release publication.
export RELEASE_MANIFEST_SHA256=1dbcce7ed1443ec6ff2ae922b4b1b2ba0f3f0562c00af86a20af45dcddd67b50
docker build --platform linux/amd64 \
  --build-arg RELEASE_MANIFEST_SHA256="$RELEASE_MANIFEST_SHA256" \
  --tag mercury-agent:verified-local .
```

The installer receives the manifest, expected hash and local cache, verifies the release, and extracts the bundle under `/opt/mercury` and native tools under `/opt/mercury/native`. Its build step has no network access: absent or invalid inputs must fail. The final stage copies only the installed tree, so the cached archives and build-time bootstrap are not retained separately. No native compilation occurs.

The base is the official Python `3.14-slim-trixie` Linux amd64 manifest `sha256:ac25e5afbfdb4a94ff99cc24b0345719210133144481480bcba6085efa36a341`, queried directly from Docker Hub. Its tag index at inspection was `sha256:af8a5aa14780025dbfbcfbc81bd8a91ebd87711dd5b0f48ed71090949dd7cb1d`. The Dockerfile pins the platform manifest and checks glibc, libgcc, absence of excluded runtimes, and `mx --version` during the build. The candidate image was built and tested on win120; publication and a fresh public-network installation remain pending.

