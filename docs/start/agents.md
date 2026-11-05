A coding agent selects a route from the task and available tools. Keep an existing app or working mx; without a CLI, create [a browser page](/start/browser). For native development, check [installation readiness](/start/install-mx). [The Mercury skill](/agent/SKILL.md) covers all three routes; Phoenix and LiveView are optional.

## Give the agent a concrete task

```text
Read https://mercury.jonnify.com/agent/SKILL.md and create a
Mercury page for my task. Preserve an existing app and working
tools. If mx is unavailable, select browser HTML or an available
native bootstrap according to the task. Observe styling and the
requested interactions in a browser. For native work, build dist/
and check the built page too. Report any unverified steps.
```

Describe the content and behavior you want: for example, product cards with filtering or a form with input validation. The Card + Button counter is a teaching example, not the required output for every task. Browser and archive routes avoid Node/npm; the planned npm route installs a launcher that continues to require Node to invoke mx.

## The Mercury page skill

[/agent/SKILL.md](/agent/SKILL.md) gives the agent the installation route, imports, styling requirement and completion checks. Load it into your coding agent using that agent's supported skill mechanism, or ask the agent to read the URL. This site does not install an agent plugin or grant deployment authority.

The skill is scoped to creating or editing a Mercury page. It uses the user's chosen task and workspace. It does not require changing unrelated projects or replacing their framework.

## Read the documentation

Append `/llms.txt` to a lesson URL for its hand-written plain-text companion:

- [Site map](/llms.txt)
- [Install companion](/start/install-mx/llms.txt)
- [First-page companion](/mx/first-app/llms.txt)
- [Mercury UI companion](/ui/llms.txt)
- [All English companions in one file](/llms-full.txt)

Russian lessons use `/ru/`, for example [/ru/mx/first-app/llms.txt](/ru/mx/first-app/llms.txt). Companions summarize the same contracts as their pages; they are not a separate API. Use documented routes rather than guessing `.md` or search endpoints.

## Report what was verified

Check styling and the user's requested interactions, including a relevant invalid input or boundary case. Distinguish installation, a running dev server, observed interaction and a production build. The browser route needs no build. For this starter, verify styled Card and Button components, count changes from 0 to 1 to 2, a saved heading edit and the served `dist/` output. If a sandbox has no browser or cannot expose loopback, report that limitation; a build alone does not verify the interaction.

Keep `@fiberfx` imports. Native apps import `@fiberfx/ui/styles.css`; mx compiles their TSX and supplies the JSX runtime. Browser-only HTML links the pinned UI stylesheet and uses plain JavaScript `h` calls, without TSX or a compiler. JavaScript runs in the browser on both routes. Check [Stability](/start/stability) before promising another platform or integration.
