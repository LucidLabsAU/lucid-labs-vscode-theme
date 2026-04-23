---
on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: read
  pull-requests: read

network: defaults

safe-outputs:
  create-pull-request:
    max: 1
---

# Continuous Documentation Sync

After a PR is merged to main, check that documentation is up to date and open a fix PR if not.

## Instructions

Only act when `github.event.pull_request.merged == true` and the base branch is `main`. Otherwise do nothing.

## Checks

### 1. CLAUDE.md Brand Table

Verify the "Current Brands" table in `CLAUDE.md` matches reality:
- List all directories in `brands/` that have a `brand.json`
- Compare against the table entries
- Check that version numbers match `extensions/<name>/package.json`
- Flag any missing, extra, or version-mismatched entries

### 2. README Brand Count

For each `brands/<name>/README.md`, verify:
- The file icon count (if mentioned) matches the actual count in `templates/icon-theme.jsonc`
- Brand-specific claims are accurate

### 3. CHANGELOG Entries

For each extension with a version bump in the merged PR:
- Verify `extensions/<name>/CHANGELOG.md` has an entry for the new version
- Flag missing changelog entries

### 4. Copilot Instructions

Verify `.github/copilot-instructions.md` is consistent with:
- Current colour roles in brand.json files
- Current template placeholder patterns
- Current scripts and commands

## Output

If any documentation is out of sync:
1. Create a PR with the fixes
2. Title: `docs: sync documentation after <merged PR title>`
3. List all changes made in the PR body

If everything is in sync, take no action.
