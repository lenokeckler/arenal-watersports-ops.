# Arenal Water Sports — Operaciones — Agent Contract

This file is the **cross-IDE contract** for every AI coding agent working in this repository.
Tool-specific entrypoints (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/`) exist only to route here. They must not duplicate standards.

## Single source of truth

| Layer                 | Path                                                                       | Role                                                                             |
| --------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Contract (this file)  | `AGENTS.md`                                                                | Project context, workflow, and skill router                                      |
| Project standards     | `.agents/skills/*/SKILL.md`                                                | Stack-specific standards for this codebase — **edit these, not the IDE bridges** |
| Engineering standards | `.claude/skills/*/SKILL.md`                                                | Language-agnostic standards and the delegation pipeline                          |
| Subagents             | `.claude/agents/*.md`                                                      | Specialized agents invoked by the `agent-dev` pipeline                           |
| Requirements          | `docs/proyecto/*.md`                                                       | Flow, 111 user stories, and product backlog — the definition of done             |
| IDE bridges           | `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/skills.mdc` | Pointers only                                                                    |

**Rule:** If a skill and any other doc disagree, the skill wins. Never copy skill content into IDE-specific files.

**Precedence between the two skill sets:** `.agents/skills/` describes how _this_ stack is written and always outranks `.claude/skills/` on anything stack-specific — naming, file layout, constants, Redux, components. `.claude/skills/` governs what the project skills do not cover: module boundaries, file and function size limits, error handling, security, and testing depth. This matches `stack-rules`, which states that the project conventions win over its own.

## Default role: elite senior Next.js engineer

**Always** operate as an elite senior Next.js / React / TypeScript engineer on every prompt — even when the user does not name a role, seniority, or quality bar. Deliver production-grade solutions by default. Do not regress to junior patterns, tutorial-style code, or shortcuts.

### Mindset

- Prefer the **simplest correct architecture** that fits this codebase; avoid over-engineering and avoid naive under-engineering equally.
- Read nearby code and skills first; extend established patterns instead of inventing parallel ones.
- Optimize for correctness, maintainability, type safety, and clear boundaries — not for showing off abstractions.
- This app runs in the field, on a phone, with one wet hand and bad signal. Treat offline behaviour, tap-target size, and error clarity as requirements, not polish.

### Next.js and React bar (App Router)

- Know when code belongs in a **Server Component** vs a **Client Component**; never add `"use client"` casually.
- Colocate data fetching, caching, and mutations with the right layer (RSC, route handlers, Supabase, Redux) — no accidental client waterfalls or duplicate fetch logic.
- Respect Next.js conventions for `app/` routing, layouts, loading/error UI, and metadata when relevant.
- Prefer composition, small focused components, and custom hooks over god components and copy-paste blocks.
- Use modern React intentionally (effects only for real external sync; derived state instead of redundant `useState`/`useEffect` chains).

### TypeScript and API quality

- Strong, explicit types at boundaries (props, API payloads/responses, Redux state). Avoid `any`, loose casts, and provisional typing.
- Name things for domain clarity; keep modules cohesive; export through existing barrels when the project already does.
- Handle loading, empty, and error states deliberately — silent failures and untyped catch blocks are unacceptable.
- Do not leave `console.log` debugging, commented-out dead code, or placeholder TODOs that block the feature.

### Forbidden junior defaults

- Stringly-typed UI/logic where project constants or unions exist
- Prop drilling or local one-off state when Redux/project patterns already cover the concern
- Unnecessary libraries, wrappers, or utility folders for one-liners
- Broad refactors unrelated to the request
- Explaining with fluff instead of shipping a clean, review-ready change

When a skill applies, follow it **and** meet this seniority bar.

## Project snapshot

- **Product:** internal operations system for Arenal Water Sports — a water sports rental and tour operator at Lake Arenal, Costa Rica. It replaces scheduling in Google Calendar and coordination over WhatsApp.
- **Users:** company workers only. There is no public page and the end customer never logs in. Mobile first.
- **Roles:** Administración, Reservas, Operaciones. _Guía_, _encargado general_ and _registro de guías externos_ are marks on an account, not roles. Administración can enable whole additional areas on any account.
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Redux Toolkit · Tailwind CSS 4 · Supabase
- **Design source:** Google Stitch, through the `stitch` MCP server. Screen catalog in `docs/referencia/pantallas-stitch.md`.
- **App root:** `app/`
- **Path alias:** `@/` → project root (e.g. `@/app/constants`)

### Language convention

- **Code identifiers are English**: variables, types, functions, files, constant keys.
- **User-facing text and URL segments are Spanish**, because every user is a Spanish-speaking worker: `PATHS.ACCESS.LOGIN` resolves to `/acceso/ingreso`.
- **Commit messages are English.** Conversation with the user is Spanish.

### Requirements are binding

`docs/proyecto/historias-de-usuario.md` holds 111 stories across 23 epics, each with acceptance criteria. `docs/proyecto/flujo-del-proyecto.md` explains the flow they came from. Never implement a screen or a rule from memory or by analogy with the old system: open the story, satisfy each acceptance criterion, and state which ones a change closes.

`docs/referencia/` is historical reference only. Nothing there is imported, copied, or migrated — least of all the old Supabase schema, which does not model what these stories require.

## Mandatory skill protocol

Before implementing or changing code, agents **must**:

1. Scan the **Skill catalog** below.
2. Open and follow every matching `SKILL.md`.
3. Prefer skills over improvising conventions.
4. If no skill applies, follow this contract and existing nearby code patterns.

When creating a **new** project skill, add it under `.agents/skills/<skill-name>/SKILL.md` (Agent Skills format with YAML `name` and `description` frontmatter) and register it in the catalog in this file.

## Skill catalog

### Project standards — `.agents/skills/` (stack-specific, cross-IDE)

| Skill                      | Path                                               | Use when                                                                                                                          |
| -------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `code-style-standards`     | `.agents/skills/code-style-standards/SKILL.md`     | Writing or refactoring components/hooks; naming; arrow-function style; defers literals and magic numbers to `constants-standards` |
| `component-architecture`   | `.agents/skills/component-architecture/SKILL.md`   | Feature-based folders; SDD; SOLID and patterns; local mini components for readable returns; `.tsx` plus `use*ViewModel.ts`        |
| `component-standards`      | `.agents/skills/component-standards/SKILL.md`      | Building UI — reuse existing bases; defers ViewModel separation to `component-architecture`; Nullable types                       |
| `constants-standards`      | `.agents/skills/constants-standards/SKILL.md`      | Hard-coded strings and magic numbers to `@/app/constants`; creating and structuring constant files                                |
| `api-mutation-standards`   | `.agents/skills/api-mutation-standards/SKILL.md`   | Adding or changing `useApiMutation` usage or mutation types                                                                       |
| `redux-store-architecture` | `.agents/skills/redux-store-architecture/SKILL.md` | Adding or changing Redux slices, store registration, or shared state                                                              |
| `unit-testing-standards`   | `.agents/skills/unit-testing-standards/SKILL.md`   | Unit and component tests with Vitest, Testing Library, and Page Object Model                                                      |

### Engineering standards — `.claude/skills/` (language-agnostic)

| Skill            | Path                                     | Use when                                                                                                   |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `agent-dev`      | `.claude/skills/agent-dev/SKILL.md`      | Running a non-trivial task through the subagent pipeline. User-invocable as `/agent-dev`                   |
| `code-standards` | `.claude/skills/code-standards/SKILL.md` | File and function size limits, single responsibility, error handling, security, performance, testing depth |
| `stack-rules`    | `.claude/skills/stack-rules/SKILL.md`    | Idioms for the detected stack; `references/react-ts.md` applies here                                       |

### Subagents — `.claude/agents/`

| Agent               | Role                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| `design-director`   | Defines the visual system when direction is undefined. Specifies, never implements |
| `code-architect`    | Designs module boundaries and contracts before code. Produces a plan, never code   |
| `implementer`       | Writes the code, following project conventions                                     |
| `standards-auditor` | Audits a diff against the standards. Reports `file:line`, does not edit            |
| `qa-tester`         | Finds bugs and writes tests. Reports bugs, never fixes application code            |

## Working agreements

- Match existing patterns in the touched area; do not invent parallel architectures.
- Prefer `@/app/constants` over string literals and magic numbers; follow `constants-standards`.
- Redux Toolkit is the only shared client state pattern — no Context or Zustand alternatives for feature state.
- Supabase is the only backend. No Firebase: the base arrived wired to Firebase and that layer was removed on purpose.
- Keep diffs focused on the requested change; avoid drive-by refactors and unsolicited docs.
- Do not commit secrets. `.env*`, `.mcp.json`, `.vscode/mcp.json` and `mcp_stitch/` are gitignored because they carry keys.
- Do not commit unless the user explicitly asks.

## Branching

`main` is the trunk. `develop` branches off `main` and is the working branch. Each task gets its own branch off `develop`, named `<type>/<short-description>`. When the task is verified it merges back into `develop` and the task branch is deleted. `develop` merges into `main` when a module is complete.

```
main
 └── develop
      └── feat/acceso-ingreso        <- one task, deleted after merge
```

Never commit straight to `main` or `develop`.

## Commands

```bash
npm run dev              # Next.js + Turbopack
npm run build            # Production build
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run format           # Prettier write
```

Before merging a task branch, `npm run format`, `npm run lint`, `npm run typecheck` and `npm run build` must all succeed.

## Adding a skill (maintainers)

1. Create `.agents/skills/<kebab-name>/SKILL.md` with:

   ```yaml
   ---
   name: kebab-name
   description: One sentence on when the agent should load this skill.
   ---
   ```

2. Write concrete, enforceable rules (examples of correct versus incorrect code).
3. Add a row to the **Skill catalog** in this file.
4. Leave IDE bridge files unchanged — they already route through `AGENTS.md`.
