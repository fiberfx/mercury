# Build a page with your agent — Mercury LMS

> [The Mercury skill](/agent/SKILL.md) preserves an existing app and selects working mx, browser HTML or an available native bootstrap.

## Select and verify

- Without a CLI: [browser page](/start/browser/llms.txt), plain JavaScript h/render, pinned UNPKG imports and a UI stylesheet link. Needs network access; browsers do not execute TSX.
- For native TSX: [installation readiness](/start/install-mx/llms.txt), npm to obtain mx or the checksum-verified archive. Then [native first page](/mx/first-app/llms.txt), mx install/verify/dev/build. Keep mx.mod and mx.sum.
- Observe styling and the requested interactions in a browser. The 0 → 1 → 2 counter check applies only to that example. For native work, check the dist/ page over HTTP too. Report any checks you could not run.

Use Hyperscript and Mercury UI. Styles: import @fiberfx/ui/styles.css in native apps; link the pinned stylesheet in browser HTML. JavaScript runs in the browser; Phoenix/LiveView is optional. /SKILL.md is an alias for the same skill. Deployment requires user authorization.

## Navigation

- [Read this page in the browser](/start/agents)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)
- [Course companion](/start/llms.txt)
