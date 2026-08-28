---
name: agent-dev
description: Runs a task through the specialized agents in the right order — design-director, code-architect, implementer, then standards-auditor and qa-tester in parallel, with a bounded fix loop that qa-tester always closes, committing task by task instead of one bulk commit. Use for any non-trivial coding task: implementing a feature, fixing a bug, refactoring a module, auditing code quality, or shipping UI. Skips stages that do not apply.
user-invocable: true
---

# Agent Dev

Delegation runs from **this** thread. Never spawn an agent whose job is to
delegate — you own the sequencing.

## Stage 0 — Triage (you, no agent)

Classify the request, then state in one line which stages will run and why.
Never launch anything before this line.

| Request | Stages |
|---------|--------|
| Feature, multi-module | `code-architect` → `implementer` → review loop |
| Feature, single obvious file | `implementer` → review loop |
| Bug fix | `qa-tester` (reproduce only) → `implementer` → review loop |
| Refactor | `standards-auditor` (baseline) → `code-architect` → `implementer` → review loop |
| Audit only | `standards-auditor`, stop. No edits |
| UI work with no design system defined | `design-director` → `implementer` → review loop |
| Design direction only | `design-director`, stop |
| Test writing only | `qa-tester`, stop |

"Review loop" means the parallel `standards-auditor` ‖ `qa-tester` round,
followed by the bounded fix loop below.

Skip a stage whenever its input already exists — an approved structure, an
existing design system, a reproduction already in hand. Say what you skipped.

Passing `--no-loop` in the invocation (`/agent-dev --no-loop <task>`) runs one
pass and reports; no fix rounds.

## Stage 1 — `design-director`

Runs only when the task touches UI **and** tokens, type scale, spacing, or
motion are undefined for what is being built.

Delivers: token values, layout spec, motion spec, handoff notes.
Gate to next: the implementer can build without inventing a visual decision.

## Stage 2 — `code-architect`

Runs when the change touches more than one module, introduces modules, or is a
refactor.

Delivers: target structure, contracts, dependency direction, ordered steps.
Gate to next: every proposed unit has a one-sentence purpose and a defined
interface. Without contracts, do not proceed — the implementer will improvise.

## Stage 3 — `implementer`

Always runs when code changes. Hand it: the requirement, the architecture plan
(if stage 2 ran), the design spec (if stage 1 ran), and the acceptance criteria.

Gate to next: the project's build, typecheck, and formatter pass. Auditing or
testing broken code produces noise, not findings.

**Where the commands come from**, in order of precedence:

1. The exact commands the invoking skill handed over. Use them verbatim.
2. Otherwise, read them off the project itself — `package.json` scripts, `Makefile`,
   `pyproject.toml`, `justfile`. State which ones you found.
3. Never invent a command, and never install a tool to make a check possible.
   If a check has no runner in the project, say the check was skipped and why.

Never run a test command in watch mode — it never exits. Prefer the explicit run variant
(`vitest run`, `jest --ci`, `pytest`) over a bare `test` script that may watch.

## Stage 3.5 — Checkpoint commits

Applies whenever the work has more than one distinct unit — a task list, several
acceptance criteria, or a change spanning multiple files. Long tasks are the norm,
not the exception: one giant commit at the end is a defect.

Break the work into the smallest units that leave the tree in a working state, and
state the list before starting, marking which one is next:

```
Units of work:
  1. <unit>          <- next
  2. <unit>
  3. <unit>
```

After finishing each unit, report in exactly this shape:

1. **What the unit closes, and against which acceptance criteria.** List them, marking each
   one met or pending. A pending criterion is said out loud, never hidden.
2. **The files touched, one line each, with what changed in that file** — path plus change,
   so the user can go read the diff. Not a summary paragraph.
3. **The real output of the formatter, linter, typechecker, tests and build**, in that
   order. Never report a check as passed that did not run; say plainly when one was skipped
   and why.
4. **Ask whether to commit that unit and move on to the next**, then wait for the answer.
   Do not chain three units and ask once at the end. Ask in the language the user is
   writing in.

On yes, commit with a conventional message scoped to that unit, then continue.
**Commit messages are written in English**, even when the conversation is in another
language, unless the user asks otherwise.

Rules:

- One unit of work = one commit. Never squash unrelated units into one commit.
- Never commit a tree that does not build.
- If the user says to stop asking, or passes `--auto-commit`, keep the same commit
  granularity but skip the confirmation between units.
- An invoking skill that already owns the commit conversation passes `--auto-commit`.
  Never ask the same question the caller is asking — one prompt per unit, one owner.
- The user always owns the decision to push, open PRs, or merge. This stage only
  produces local commits unless the invoking skill says otherwise.

## Non-negotiables the implementer must not break

These are cheap to get right while writing and expensive to fix in review. State them in
the `implementer` handoff every time:

- **Types and interfaces never live inside a component file.** A `.tsx` that renders is not
  where a `Props` interface, a domain type or an enum is declared. They go to the project's
  types location — a `models/` folder, a `*.interface.ts`, a `types/` module — following
  whatever the surrounding code already does. A component file imports its props type; it
  does not define it. This holds even for a one-field interface used by a single component.
- **No hardcoded values in components.** Ids, labels, routes, class strings repeated across
  files, numbers with meaning: all of them belong to constants.
  A module-level `const` inside a component file **does not count as extracting it** — it is
  the same literal, moved four lines up:

  ```tsx
  // wrong: the literal still lives in the component file
  const PLANS_TITLE_ID = "plans-heading";

  // right: it lives with the other ids and is imported
  import { SECTION_ID } from "@/app/constants";
  ...
  id={SECTION_ID.PLANS_HEADING}
  ```

  The test is *where the value is declared*, not whether it has a name. If a sibling
  component would need the same value, or a constants file already holds values of that
  kind, that is where it goes. This pattern repeats: check **every** component of the change
  for it, not just the one that prompted the rule.
- **Nothing is implemented that the task did not ask for.** Extra sections, extra fields,
  helpful defaults nobody requested — all of it gets reported, not built.

Repeat these in the handoff even when a project skill also says them: the agent reads the
handoff first.

## Stages 4 + 5 — Review round, in parallel

Launch **both in a single message** so they run concurrently. They are
independent: one is static analysis, one executes.

**`standards-auditor`** — audits the diff against `code-standards`. Reports
`file:line` with severity. Does not edit.

**`qa-tester`** — finds bugs, and **writes unit tests**. Tests are a required
deliverable, not optional:

- New logic ships with tests: business rules, parsing, state transitions,
  error paths
- Every bug fix ships with a regression test that fails before and passes after
- The suite is actually run and its real output reported
- It reports bugs; it never fixes application code

Pass both agents the findings already dismissed in earlier rounds so resolved
items do not reappear.

## Stage 6 — Fix loop

```
implementer (fixes ONLY the reported findings)
    → qa-tester revalidates
    → still critical/high?  →  repeat
```

Rules:

- **Cap: 3 rounds.** On exhaustion, stop and report what remains, by severity.
  Never loop indefinitely.
- **Convergence check:** if a round does not reduce the finding count, stop.
  That is a design problem, not an implementation one — return to
  `code-architect` and say so.
- The fixer touches only what was reported. Adjacent problems get noted, not
  fixed.
- `qa-tester` always runs last in every round. It closes the pipeline.
- **Medium and low findings do not gate the exit, but they are never dropped.** Carry
  them to the final report as accepted debt: `file:line`, severity, one-line fix. The
  user decides whether they get fixed now, later, or never — silence is not that decision.

## Exit criteria

All must hold before reporting done:

- [ ] Zero critical findings, zero high findings
- [ ] Test suite runs and passes — with the real output shown
- [ ] Unit tests exist for the important logic added
- [ ] Formatter, linter, and typechecker clean
- [ ] Every stage that ran is accounted for in the summary
- [ ] Work landed as small scoped commits, not one bulk commit
- [ ] Remaining medium/low findings are listed, not silently dropped

If any fail after the round cap, report the state honestly. Never present a
pipeline as complete when a gate did not pass.

## Handoffs

Each agent gets: objective, explicit scope, acceptance criteria, constraints,
expected output format, and the relevant output of the previous stage. Never
hand an agent a vague scope, and never give two agents overlapping scope.

## Final report

```
Stages run:   which, and why the others were skipped
Result:       what changed, file by file
Findings:     resolved / remaining, by severity
Debt:         medium+low left open, as file:line + one-line fix
Tests:        added, and suite status with real output
Open:         anything the round cap left unfinished
```
