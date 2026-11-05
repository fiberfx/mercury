# npm distribution

The root `@fiberfx/mx` package contains the Node launcher. Its exact optional dependency `@fiberfx/mx-linux-x64` contains the qualified Linux x64/glibc binary. npm filters the native package by OS, CPU and libc; the launcher uses `require.resolve` and executes the installed binary. Node is required for this invocation path. Neither package has a lifecycle hook, and the launcher never downloads a binary.

Other platform packages are added after their actual binaries have been built and verified. No unbuilt platform package is advertised as available.

Package an already verified native directory with `SOURCE_DATE_EPOCH=<source-commit-epoch> node npm/package.mjs pack <native-directory> <output-directory>`. Publish the platform package before the root, at the same version, after registry authentication and consumer verification. Publication is pending. GitHub release and Docker downloads are separate consumer routes, not part of npm installation.
