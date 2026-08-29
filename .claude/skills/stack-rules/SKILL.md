---
name: stack-rules
description: Technology-specific conventions and idioms — React/TypeScript, Bash, C, and Python. Covers typing rules, styling tokens, i18n, theming, accessibility, shell safety and idempotency, memory ownership, and packaging. Use after detecting which language or framework a project uses, when writing or reviewing code in one of them, or when asked how something should be done idiomatically in that stack.
user-invocable: true
---

# Stack Rules

Language-specific conventions. These sit **on top of** `code-standards`, which
holds the language-agnostic rules — never in place of it.

## How to use

1. Detect the stack before writing anything: read the dependency manifest
   (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `requirements.txt`,
   `Makefile`, `PKGBUILD`) and the existing source layout.
2. Load only the reference for the stack in play.
3. If the project's own conventions contradict a rule here, the project wins.
   Note the divergence; do not silently "fix" the codebase to match this file.
4. If the stack has no reference file here, apply `code-standards` alone and
   follow the idioms already present in the repository.

## References

| Stack                                 | File                     |
| ------------------------------------- | ------------------------ |
| React + TypeScript (and TS generally) | `references/react-ts.md` |
| Bash / POSIX shell, system scripts    | `references/bash.md`     |
| C                                     | `references/c.md`        |
| Python                                | `references/python.md`   |

## Universal, regardless of stack

- Use the project's existing package manager and lockfile. Never switch it.
- Never introduce a new framework, state library, or build tool without asking.
- Match the formatter and linter already configured; run them before finishing.
- **Never install anything.** Use only the tools the project or the machine
  already provides. If a reference below names a linter, formatter, sanitizer,
  or type checker, treat it as _use it when it is already available_, never as
  a dependency to add. No `pacman`, `apt`, `brew`, `pip install`, `npm i -g`.
- When a tool is missing, do the check by reading the code, and say plainly in
  your report that the tool was unavailable and the check was manual. Never
  claim a tool ran when it did not, and never let its absence block finishing.
- New files go where the existing convention puts them. Never invent a parallel
  directory structure.
