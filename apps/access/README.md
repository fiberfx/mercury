# Mercury Access

A focused sign-in and password-recovery interface built with real Mercury UI, Hyperscript, Hypergraph and Reflect. English and Russian are available through the language control (`?lang=ru`); the theme control is icon-only with a localized accessible name.

## Current boundary

The default `AuthService` is deliberately unconnected. Valid submissions show a service-unavailable message; they never pretend to create a session or send a reset email. Invalid fields are described and focused, drafts survive language/theme changes and failed requests, duplicate requests are bounded, and navigation cancels stale responses.

Connect a reviewed server adapter through `App`'s `service` property. Resolve `signIn` only after the server establishes the session, and supply the application's real `onSignedIn` destination. Recovery must avoid disclosing whether an account exists. Passwords and email addresses stay outside Hypergraph and the Inspector; do not log them or put them in URLs, browser storage, or review messages. The interface does not implement account storage or authentication policy.

## Native development

This source example uses the Mercury 4.0.0 module set. The public documentation repository does not contain those modules. Use a reviewed Mercury source workspace with a compatible native MX binary; no Node-based development server is used.

```sh
python3 workspace.py ../native-modules --output ../access.work
MXWORK="$PWD/../access.work" mx dev --root . --port 4819
MXWORK="$PWD/../access.work" mx test --root . --timeout 120
MXWORK="$PWD/../access.work" mx build --bundle --root . --out dist
```

Keep the app and reviewed module sources beneath one development directory. The generated workspace file must sit at that common parent; do not place it at the filesystem root. `workspace.py` refuses missing modules, paths outside the workspace and overwriting an existing file. Keep generated workspaces out of source control. An Inspector-capable MX candidate can add `--inspect` to the development command; this is not assumed to be available in the published CLI. The Inspector is a development aid, not part of the sign-in flow.

Tests cover invalid input, unavailable/rejected service responses, confirmed completion, duplicate prevention, cancellation, recovery, translations and draft retention. Injected test services are test fixtures, not a shipped backend.
