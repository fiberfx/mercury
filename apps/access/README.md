# Mercury Access

A focused sign-in and password-recovery interface built with real Mercury UI, Hyperscript, Hypergraph and Reflect. English and Russian are available through the language control (`?lang=ru`); the theme control is icon-only with a localized accessible name.

## Current boundary

The default `AuthService` is deliberately unconnected. Valid submissions show a service-unavailable message; they never pretend to create a session or send a reset email. Invalid fields are described and focused, drafts survive language/theme changes and failed requests, duplicate requests are bounded, and navigation cancels stale responses.

Connect a reviewed server adapter through `App`'s `service` property. Resolve `signIn` only after the server establishes the session, and supply the application's real `onSignedIn` destination. Recovery must avoid disclosing whether an account exists. Passwords and email addresses stay outside Hypergraph and the Inspector; do not log them or put them in URLs, browser storage, or review messages. The interface does not implement account storage or authentication policy.

## Native development

This example uses the Mercury 4.1.1 modules, which mx installs from its module proxy. Nothing here needs Node, npm or a Python helper.

```sh
mx install   # the modules mx.mod requires, checked against mx.sum
mx dev       # serves the app with hot reload and prints its URL
mx test      # the tests in a headless Chromium
mx build     # a bundle in dist/
```

An Inspector-capable MX can add `--inspect` to `mx dev`; the published CLI doesn't assume it. The Inspector is a development aid, not part of the sign-in flow.

Tests cover invalid input, unavailable/rejected service responses, confirmed completion, duplicate prevention, cancellation, recovery, translations and draft retention. Injected test services are test fixtures, not a shipped backend.
