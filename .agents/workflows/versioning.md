---
description: how the automatic version tagging and deployment pipeline works
---

# Automatic Version Tagging

Every push to `master` triggers a GitHub Actions workflow that:
1. Bumps the semantic version tag based on conventional commit prefixes
2. Builds a Docker image (linux/arm64) with the version injected via `-ldflags`
3. Pushes to `ghcr.io/saavuori/ruuvigateway`
4. Watchtower on the Raspberry Pi auto-pulls the new image within ~5 minutes

## Commit Message Rules

Use conventional commit prefixes — they control the version bump:

- `fix:` → patch bump (v0.0.1 → v0.0.2)
- `feat:` → minor bump (v0.0.2 → v0.1.0)
- `feat!:` or `BREAKING CHANGE:` → major bump (v0.1.0 → v1.0.0)
- anything else → patch bump

## Do NOT

- Edit `common/version/version.go` — the version is injected at build time
- Manually create git tags — GitHub Actions does this
- Hardcode version strings anywhere

## Key Files

- `common/version/version.go` — version variable (build-time injected, do not edit)
- `.github/workflows/docker-build.yml` — CI/CD pipeline
- `Dockerfile` — multi-stage build with `VERSION` build arg
- `docker-compose.yml` — production deployment with Watchtower
- `CHANGELOG.md` — update under `[Unreleased]` for significant changes

## Checking the Current Version

```bash
git describe --tags --abbrev=0
```
