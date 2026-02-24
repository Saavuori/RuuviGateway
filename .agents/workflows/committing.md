---
description: how to commit and push code changes to GitHub
---

# Committing and Pushing Code

## Use MCP GitHub Tools — NOT local git

This machine does NOT have git user identity configured. Local `git commit` will fail with:

```
fatal: unable to auto-detect email address
```

**Always use the GitHub MCP tools instead:**

- `push_files` — push one or more files in a single commit
- `create_or_update_file` — push a single file
- `create_branch` — create a new branch
- `create_pull_request` — open a PR

## PowerShell Syntax

This machine runs PowerShell. The `&&` operator does NOT work. Chain commands with `;` instead:

```powershell
# Wrong
git add . && git commit -m "message"

# Right
git add .; git commit -m "message"
```

## Commit Message Convention

Use conventional commit prefixes (see `/versioning` workflow):

- `fix:` → patch bump
- `feat:` → minor bump
- `feat!:` → major bump

## Pushing to master

Pushing to `master` triggers the full CI/CD pipeline (auto-tag → Docker build → deploy). See `/versioning` for details.
