# A page in the browser — Mercury LMS

> One HTML file with Hyperscript h/render, hooks and Mercury UI Card/Button. Requires import-map browser support and network access to UNPKG. No mx, Node, Rust, BEAM or build step.

## Workflow

1. Open or save the [complete HTML](/examples/first-page.html). Exact imports and limits: [lesson](/start/browser).
2. Keep the import map for @fiberfx/hyperscript, /hooks, /jsx-runtime, @fiberfx/core and @fiberfx/ui on UNPKG 4.0.0, and the UI stylesheet link. Do not replace pins with floating versions.
3. Write plain JavaScript and h(Component, props, children); browsers do not parse TSX. Adapt the page to the user's task.
4. Open the result in a browser and check styling and requested interactions, including a relevant invalid input. For the example counter: 0 → 1 → 2 and a saved heading edit. Inspect network failures and console errors.
5. If no browser is available, report interaction as unverified. This route produces no dist/ and needs the CDN network connection.

## Navigation

- [Read this page in the browser](/start/browser)
- [Agent index](/llms.txt)
- [Sitemap](/sitemap.xml)
- [All English companions](/llms-full.txt)
- [Course companion](/start/llms.txt)
- [Install mx](/start/install-mx/llms.txt)
- [Mercury skill](/agent/SKILL.md)
