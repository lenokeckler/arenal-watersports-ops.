# Bash / Shell

## Script preamble

Every non-trivial script starts with:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

- `-e` abort on error, `-u` abort on unset variable, `-o pipefail` so a failing
  command in a pipe fails the pipe.
- Where a command is allowed to fail, say so explicitly: `cmd || true`.

## Quoting

- Quote every expansion: `"$var"`, `"$@"`, `"${arr[@]}"`. Unquoted expansion is
  the single most common shell defect.
- `"$@"` never `"$*"` when forwarding arguments.
- Use `[[ ]]` over `[ ]` in bash. Use `(( ))` for arithmetic.
- Prefer `$(cmd)` over backticks.

## Idempotency

System scripts must be safe to re-run. Guard every mutating section so a second
run is a no-op, not a duplicate or an error:

```bash
# package install
pacman -Qi "$pkg" &>/dev/null || sudo pacman -S --noconfirm "$pkg"

# directory
mkdir -p "$dir"

# line in a config file
grep -qxF "$line" "$file" || printf '%s\n' "$line" >> "$file"

# symlink
[[ -L "$link" ]] || ln -s "$target" "$link"

# systemd unit
systemctl is-enabled --quiet "$unit" || sudo systemctl enable --now "$unit"
```

Back up before overwriting a config that already exists, and only once:

```bash
[[ -f "$cfg" && ! -f "$cfg.bak" ]] && cp "$cfg" "$cfg.bak"
```

## Structure

- Functions for anything used twice; `main "$@"` at the bottom.
- `readonly` constants at the top — no literal paths scattered through the body.
- `local` for every variable inside a function.
- Usage/help text behind `-h|--help`; parse flags rather than relying on
  positional order for anything beyond two arguments.

## Safety

- Never `rm -rf "$var"` without first confirming `$var` is non-empty and
  resolves inside the intended root.
- `cd` inside a script: use `cd "$dir" || exit 1`, or a subshell, never a bare
  `cd` that can leave the script running in the wrong place.
- Use `mktemp -d` for scratch space and remove it with a `trap`:
  `trap 'rm -rf "$tmp"' EXIT`
- Never parse `ls`. Use globs or `find -print0` with `read -d ''`.
- Prefer long flags in scripts (`--recursive`) — they document themselves.

## Errors and output

- Diagnostics to stderr, results to stdout — so the script composes in a pipe.
- Non-zero exit code on failure, with a distinct code per failure class where
  callers need to branch.

```bash
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
```

## Verification

If `shellcheck` is already installed, run it on every script before declaring it
done, and address the warnings rather than adding blanket
`# shellcheck disable` directives; when a disable is genuinely correct, scope it
to the single line and explain why.

Do not install it. If it is absent, review by hand — unquoted expansions, `[`
vs `[[`, unset variables, ignored exit codes, word splitting in `for` loops —
and state in your report that shellcheck was unavailable.
