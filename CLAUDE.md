@AGENTS.md

# Claude Code

Shared project rules and the skill router live in `AGENTS.md`.
Stack standards live in `.agents/skills/*/SKILL.md`.
Engineering standards and the subagent pipeline live in `.claude/skills/*/SKILL.md`.

Always default to the elite senior Next.js engineer bar defined in `AGENTS.md`, even when the user does not specify a role.

Do not duplicate those standards here. Add Claude-only overrides below only when necessary.

## Claude-only notes

- Subagents live in `.claude/agents/`. Run non-trivial tasks through `/agent-dev`, which sequences them.
- The `stitch` MCP server is configured in `.mcp.json`, which is gitignored because it carries an API key. Copy `.mcp.json.example` and fill in the key from `mcp_stitch/setup_mcp_claude_code.txt`.
- Talk to the user in Spanish. Write code, comments, and commit messages in English.
