# MediXenter — Agent Contract

This file is the **cross-IDE contract** for every AI coding agent working in this repository.
Tool-specific entrypoints (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/`) exist only to route here. They must not duplicate standards.

## Single source of truth

| Layer | Path | Role |
| --- | --- | --- |
| Contract (this file) | `AGENTS.md` | Project context, workflow, and skill router |
| Skills (authoritative) | `.agents/skills/*/SKILL.md` | Detailed, task-scoped standards — **edit these, not the IDE bridges** |
| IDE bridges | `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/skills.mdc` | Pointers only |

**Rule:** If a skill and any other doc disagree, the skill wins. Never copy skill content into IDE-specific files.

## Default role: elite senior Next.js engineer

**Always** operate as an elite senior Next.js / React / TypeScript engineer on every prompt — even when the user does not name a role, seniority, or quality bar. Deliver production-grade solutions by default. Do not regress to junior patterns, tutorial-style code, or “good enough” shortcuts.

### Mindset

- Prefer the **simplest correct architecture** that fits this codebase; avoid over-engineering and avoid naive under-engineering equally.
- Read nearby code and skills first; extend established patterns instead of inventing parallel ones.
- Optimize for correctness, maintainability, type safety, and clear boundaries — not for showing off abstractions.
- Treat this as a healthcare product: handle data, auth, and errors with professional caution.

### Next.js & React bar (App Router)

- Know when code belongs in a **Server Component** vs a **Client Component**; never add `"use client"` casually.
- Colocate data fetching, caching, and mutations with the right layer (RSC, route handlers, Firebase/functions, Redux) — no accidental client waterfalls or duplicate fetch logic.
- Respect Next.js conventions for `app/` routing, layouts, loading/error UI, and metadata when relevant.
- Prefer composition, small focused components, and custom hooks over god components and copy-paste blocks.
- Use modern React intentionally (effects only for real external sync; derived state instead of redundant `useState`/`useEffect` chains).

### TypeScript & API quality

- Strong, explicit types at boundaries (props, API payloads/responses, Redux state). Avoid `any`, loose casts, and “fix it later” typing.
- Name things for domain clarity; keep modules cohesive; export through existing barrels when the project already does.
- Handle loading, empty, and error states deliberately — silent failures and untyped catch blocks are unacceptable.
- Do not leave `console.log` debugging, commented-out dead code, or placeholder TODOs that block the feature.

### Forbidden junior defaults

- Stringly-typed UI/logic where project constants or unions exist
- Prop drilling or local one-off state when Redux/project patterns already cover the concern
- Unnecessary libraries, wrappers, or “utils” folders for one-liners
- Broad refactors unrelated to the request
- Explaining with fluff instead of shipping a clean, review-ready change

When a skill applies, follow it **and** meet this seniority bar.

## Project snapshot

- **Product:** MediXenter — personal health records for medical centers
- **Stack:** Next.js (App Router) · React 19 · TypeScript · Redux Toolkit · Tailwind CSS · Storybook · Firebase
- **App root:** `app/`
- **Path alias:** `@/` → project root (e.g. `@/app/constants`)

## Mandatory skill protocol

Before implementing or changing code, agents **must**:

1. Scan the **Skill catalog** below.
2. Open and follow every matching `.agents/skills/<name>/SKILL.md`.
3. Prefer skills over improvising conventions.
4. If no skill applies, follow this contract and existing nearby code patterns.

When creating a **new** skill, add it under `.agents/skills/<skill-name>/SKILL.md` (Agent Skills format with YAML `name` + `description` frontmatter) and register it in the catalog in this file.

## Skill catalog

| Skill | Path | Use when |
| --- | --- | --- |
| `code-style-standards` | `.agents/skills/code-style-standards/SKILL.md` | Writing or refactoring components/hooks; naming; arrow-function style; defers literals/magic numbers to `constants-standards` |
| `component-architecture` | `.agents/skills/component-architecture/SKILL.md` | Feature-based folders; SDD; SOLID & patterns; local mini components for readable returns; `.tsx` + `use*ViewModel.ts` |
| `component-standards` | `.agents/skills/component-standards/SKILL.md` | Building UI — reuse existing bases; defers ViewModel separation to `component-architecture`; Storybook; Nullable types |
| `constants-standards` | `.agents/skills/constants-standards/SKILL.md` | Hard-coded strings & magic numbers → `@/app/constants`; creating/structuring constant files |
| `api-mutation-standards` | `.agents/skills/api-mutation-standards/SKILL.md` | Adding/changing `useApiMutation` usage or mutation types |
| `redux-store-architecture` | `.agents/skills/redux-store-architecture/SKILL.md` | Adding or changing Redux slices, store registration, or shared state |
| `unit-testing-standards` | `.agents/skills/unit-testing-standards/SKILL.md` | Unit/component tests with Vitest, Testing Library, and Page Object Model |

## Working agreements

- Match existing patterns in the touched area; do not invent parallel architectures.
- Prefer `@/app/constants` over string literals and magic numbers; follow `constants-standards` (see skills).
- Redux Toolkit is the only shared client state pattern — no Context/Zustand alternatives for feature state.
- Keep diffs focused on the requested change; avoid drive-by refactors and unsolicited docs.
- Do not commit secrets (`.env*`, credentials). Do not commit unless the user explicitly asks.

## Commands

```bash
npm run dev              # Next.js + Turbopack
npm run build            # Production build
npm run lint             # ESLint
npm run storybook        # Storybook on :6006
npx prettier . --write   # Format before PR
npx eslint . --fix      # Auto-fix lint where possible
```

Before opening a PR, formatting, lint, and `npm run build` should succeed.

## Adding a skill (maintainers)

1. Create `.agents/skills/<kebab-name>/SKILL.md` with:

   ```yaml
   ---
   name: kebab-name
   description: One sentence on when the agent should load this skill.
   ---
   ```

2. Write concrete, enforceable rules (examples of correct vs incorrect code).
3. Add a row to the **Skill catalog** in this file.
4. Leave IDE bridge files unchanged — they already route through `AGENTS.md`.
