# C

## Build

Compile with warnings on and treat them as real:

```
-std=c11 -Wall -Wextra -Wpedantic -Wshadow -Wconversion
```

For anything nontrivial, also build under `-fsanitize=address,undefined` during
development — it needs no extra package, only compiler flags. Run `valgrind`
before shipping only if it is already installed; do not install it. Without it,
audit allocation ownership by reading the code and say so in the report.

## Memory ownership

Every allocation has exactly one documented owner responsible for freeing it.
State it in the header comment of the function that returns allocated memory:

```c
/* Returns a heap-allocated string. Caller owns it and must free(). */
char *path_join(const char *base, const char *leaf);
```

Rules:

- Free on every exit path, including error paths. Use a single cleanup label
  when a function has several failure points:

```c
int load(const char *file, Config *out) {
    int rc = -1;
    FILE *f = fopen(file, "r");
    if (!f) return -1;
    char *buf = malloc(BUF_SIZE);
    if (!buf) goto cleanup;
    ...
    rc = 0;
cleanup:
    free(buf);
    fclose(f);
    return rc;
}
```

- Set pointers to `NULL` after freeing when the pointer stays in scope.
- Never return a pointer to a local buffer.
- Check every `malloc`/`calloc`/`realloc` return. `realloc` into a temporary
  first — assigning directly leaks the original on failure.

## Bounds and strings

- Never `strcpy`, `strcat`, `sprintf`, `gets`. Use `snprintf` and check its
  return against the buffer size — truncation is a defect, not a success.
- Size buffers with `sizeof buf`, not a repeated literal.
- Validate every index against the length before use. Signed/unsigned mixing in
  a bounds check is a classic hole — keep sizes `size_t`.
- Confirm NUL termination after any manual buffer manipulation.

## Types and const

- `const` on every pointer parameter the function does not modify.
- `static` on every function and global not used outside the translation unit.
- Fixed-width types (`uint32_t`, `int64_t`) when the width matters.
- `size_t` for sizes and indices, `ssize_t` only where a negative is meaningful.
- Enums over integer constants for closed sets.

## Errors

- Return an error code; use out-parameters for results. Reserve the return
  value for status when the function can fail.
- Check the return of every call that can fail, including `close`, `fclose`,
  and `write`.
- `errno` is only valid immediately after a failing call — capture it before
  doing anything else.
- No `exit()` from library code. Return the error and let `main` decide.

## Headers

- Include guards or `#pragma once` in every header.
- Headers declare the interface only: no definitions, no `static` functions, no
  variable definitions.
- Include what you use; do not rely on transitive includes.
- Keep macros minimal. Prefer `static inline` functions and `enum` constants —
  they are typed and debuggable. Where a macro is unavoidable, parenthesize
  every parameter and the whole body.

## Structure

- One module = one `.c` + one `.h` with a single responsibility.
- No global mutable state. Pass a context struct.
- Initialize every variable at declaration.
