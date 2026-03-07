---
description: how to commit and push code changes to GitHub
---

# Committing and Pushing Code

## Git Identity

Set git identity before committing if not already configured:

```powershell
git config user.name "Sampsa Saavuori"
git config user.email "sampsa.saavuori@gmail.com"
```

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
