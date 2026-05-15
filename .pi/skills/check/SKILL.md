---
name: check
description: Runs type checking (tsc --noEmit), linting (oxlint), and formatting (oxfmt) for the baychat project. Use after making code changes to verify correctness.
---

# Check

Runs the project's quality checks sequentially:

1. **types** — `bun run types` (tsc --noEmit)
2. **lint** — `bun run lint` (oxlint)
3. **fmt** — `bun run fmt` (oxfmt)

## Usage

Run all checks:

```bash
bun run types && bun run lint && bun run fmt
```

Run individually:

```bash
bun run types   # TypeScript type checking
bun run lint    # Linting
bun run fmt     # Formatting
```
