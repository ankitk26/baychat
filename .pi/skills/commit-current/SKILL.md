---
name: commit-current
description: Stage all changes, auto-fix lint/format issues, and create a commit with a lowercase-only message based on the diff. Use when the user wants to commit their current work.
---

# commit-current

Stages all changes, auto-fixes issues, and commits with a concise lowercase message derived from the diff.

## Steps

### 1. Run checks and auto-fix

```bash
bun run types
```

If type errors exist, read them and attempt to fix in the source files. Re-run until clean.

```bash
bun run lint -- --fix
```

This auto-fixes lint issues. If unfixable issues remain, fix them manually.

```bash
bun run fmt
```

This auto-formats all files.

```bash
bun run types
```

Re-run to confirm everything is clean.

### 2. Stage all changes

```bash
git add -A
```

### 3. Generate commit message

Look at the staged diff to understand what changed:

```bash
git diff --staged --stat
```

Then write a commit message following these rules:

- **lowercase only** — no capital letters anywhere
- **imperative mood** — e.g. "add input indicators" not "added input indicators"
- **concise** — one line, under 72 chars if possible
- **describe the what** — focus on the change, not the why (the diff already shows what changed)

### 4. Commit

```bash
git commit -m "your lowercase commit message here"
```

## Important

- Never use uppercase letters in the commit message
- Always run `bun run lint -- --fix` (the extra `--` passes `--fix` to oxlint)
- If type errors cannot be fixed easily, stop and report them to the user
