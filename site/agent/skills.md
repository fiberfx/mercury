# Install Mercury skills

Public skill source: https://github.com/fiberfx/mercury/tree/main/skills
- mercury-design-builder: compose, refine and verify Mercury interfaces.
- mercury-playground: controls, live previews and retained intent for interactive tools.
- The page workflow is also readable at https://mercury.jonnify.com/agent/SKILL.md.

With Node/npm available, use the skills installer and select the intended agent/project scope:
```sh
npx skills add fiberfx/mercury --skill mercury-design-builder
npx skills add fiberfx/mercury --skill mercury-playground
```
Review the skill contents before installing. To avoid npm, download the selected skill directory
from the public repository, keeping its references and templates together, into the skills folder
documented by your agent host. A SKILL.md copied without its referenced resources is incomplete.
Do not overwrite an existing local skill without reviewing the diff. Installing a skill does not
install mx, UI packages or a browser. This MCP tool returns guidance and performs no installation.
