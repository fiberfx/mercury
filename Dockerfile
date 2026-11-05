# Official python:3.14-slim-trixie Linux amd64 manifest, resolved from Docker Hub.
# This release's native binaries require glibc >=2.39 and libgcc_s.so.1.
FROM --platform=linux/amd64 python@sha256:ac25e5afbfdb4a94ff99cc24b0345719210133144481480bcba6085efa36a341 AS install
ARG RELEASE_MANIFEST_SHA256
COPY agents/bootstrap.py /tmp/bootstrap.py
COPY release-inputs/ /release-inputs/
# Missing cached assets refuse: this build never falls back to downloading them.
RUN --network=none python3 /tmp/bootstrap.py \
    --manifest /release-inputs/release.json \
    --sha256 "$RELEASE_MANIFEST_SHA256" \
    --cache-dir /release-inputs \
    --dest /opt/mercury

FROM --platform=linux/amd64 python@sha256:ac25e5afbfdb4a94ff99cc24b0345719210133144481480bcba6085efa36a341 AS runtime
COPY --from=install /opt/mercury /opt/mercury
ENV PATH="/opt/mercury/native/bin:$PATH" \
    HOME=/workspace \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
RUN groupadd --gid 10001 mercury \
    && useradd --uid 10001 --gid mercury --no-create-home --home-dir /workspace --shell /usr/sbin/nologin mercury \
    && mkdir -p /workspace \
    && chown mercury:mercury /workspace
# Fail the image build if the base cannot satisfy the measured native runtime contract.
RUN --network=none python3 -c 'import ctypes, os, platform, shutil; assert platform.machine() == "x86_64"; assert tuple(map(int, os.confstr("CS_GNU_LIBC_VERSION").split()[1].split("."))) >= (2,39); ctypes.CDLL("libgcc_s.so.1"); assert not any(shutil.which(t) for t in ("node","nodejs","npm","npx","pnpm","cargo","rustc","erl"))'
USER 10001:10001
WORKDIR /workspace
RUN --network=none mx --version
EXPOSE 8000
CMD ["python3", "/opt/mercury/agents/serve.py", "--root", "/opt/mercury/site", "--bind", "0.0.0.0", "--port", "8000"]
