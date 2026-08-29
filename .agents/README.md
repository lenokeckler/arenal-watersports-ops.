# Project skills (stack standards)

Task-scoped coding standards for this codebase live here as Agent Skills:

```text
.agents/skills/<skill-name>/SKILL.md
```

These are the **stack-specific** standards: how components, hooks, constants, Redux and tests are written in this project. Language-agnostic engineering standards (size limits, error handling, security, testing depth) live in `.claude/skills/` instead, and the project standards here outrank them on anything stack-specific.

## How agents discover them

Every IDE and agent entrypoint routes through root `AGENTS.md`, which catalogs these skills and requires matching `SKILL.md` files to be read before work.

| Entrypoint                        | Purpose                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| `AGENTS.md`                       | Cross-tool contract and skill router                         |
| `CLAUDE.md`                       | Imports `AGENTS.md`                                          |
| `.github/copilot-instructions.md` | Instructs Copilot to read `AGENTS.md` and the skills         |
| `.cursor/rules/skills.mdc`        | Always-on Cursor rule pointing at `AGENTS.md` and the skills |

## Adding a skill

1. Add `.agents/skills/<kebab-name>/SKILL.md` with `name` and `description` frontmatter.
2. Register it in the skill catalog inside `AGENTS.md`.
3. Do **not** copy the skill body into IDE bridge files.
