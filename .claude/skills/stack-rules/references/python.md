# Python

## Typing

- Type hints on every public function: parameters and return.
- Run `mypy` (or `pyright`) in strict mode only where the project already has it
  configured and installed. Never add it to a project that lacks it.
- `Optional[T]` only when `None` is a real, handled case — not as a lazy
  default. Prefer a sentinel or an overload over a nullable parameter.
- `dataclass` or `pydantic` model over passing dicts between layers. A dict
  with implied keys is an untyped, undocumented interface.
- `Protocol` for structural interfaces; that is how you invert dependencies
  without an inheritance hierarchy.
- Never `Any` as a shortcut. `object` plus a narrowing check is honest; `Any`
  disables checking silently.

## Idioms

- Comprehensions for mapping and filtering; a loop when there is a side effect.
- Context managers for every resource — files, locks, connections, temp dirs.
- `pathlib.Path` over `os.path` string manipulation.
- `enumerate`, `zip`, `itertools` over manual index arithmetic.
- f-strings for formatting; never `%` or `.format()` in new code.
- Never a mutable default argument (`def f(x=[])`). Use `None` and build inside.
- Prefer standard library. `dataclasses`, `enum`, `functools`, `collections`,
  and `itertools` cover most of what people reach for dependencies to do.

## Structure

- One responsibility per module; packages with an explicit `__init__.py` that
  defines the public surface.
- No logic at import time beyond constants — imports must have no side effects.
- `if __name__ == "__main__":` guard on any runnable module; the entrypoint
  parses arguments and calls a function that is testable on its own.
- Configuration is read once at startup into a typed object, not read from
  `os.environ` scattered across the codebase.

## Errors

- Custom exception classes deriving from a project base exception.
- `raise ... from e` to preserve the cause.
- Never bare `except:` — it catches `KeyboardInterrupt` and `SystemExit`.
- `logging` module, never `print`, for diagnostics in library or service code.

## Async

- Do not mix blocking IO into an async function. Wrap it with
  `asyncio.to_thread` or use an async client.
- `asyncio.gather` for independent work; bound it with a semaphore.
- Every `create_task` result is retained and awaited or explicitly handled —
  a discarded task can vanish silently.

## Tooling

- `ruff` for lint and format if configured; otherwise match the project.
- Virtual environment always; never install into the system interpreter.
- Pin dependencies in the lockfile the project already uses (`uv`, `poetry`,
  `pip-tools`) — do not introduce a second one.
