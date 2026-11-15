---
on:
  check_run:
    types: [completed]

# Only spend an agent run on failed checks attached to a pull request.
# Successful checks and failures on main have nowhere to comment.
if: github.event.check_run.conclusion == 'failure' && github.event.check_run.pull_requests[0] != null

permissions:
  contents: read
  copilot-requests: write
  pull-requests: read

network: defaults

safe-outputs:
  add-comment:
    max: 1
  noop:
---

# CI Failure Analysis

When a CI check fails on a pull request, analyse the failure and comment with a diagnosis and suggested fix.

## Instructions

Only act when `github.event.check_run.conclusion == 'failure'` and the check run belongs to a pull request. Otherwise call the `noop` safe output with a one-line reason and stop.

Every run must end with exactly one terminal safe output: `add-comment` on the PR, or `noop` if there is nothing to report (logs unavailable, failure unrelated to the categories below, or no PR to comment on).

1. Read the failing check run's logs
2. Identify the root cause — categorise as one of:
   - **Lint failure** — `npm run lint` found issues in generated themes
   - **Contrast failure** — `node scripts/check-contrast.js` found WCAG violations
   - **Generate mismatch** — generated themes are out of date (forgot `npm run generate`)
   - **Package failure** — `vsce package` failed (missing files, invalid manifest)
   - **Publish failure** — marketplace publish failed (version conflict, auth issue)
3. Comment on the PR with:
   - **What failed** — the specific check and error
   - **Why it failed** — root cause analysis
   - **How to fix** — concrete steps to resolve

## Comment Format

```markdown
## CI Failure Analysis

### ❌ <Check Name> Failed

**Root cause:** <diagnosis>

**How to fix:**

1. <step 1>
2. <step 2>
3. <step 3>

**Commands to run locally:**

\`\`\`bash
<fix commands>
\`\`\`
```

## Constraints

- **Do not push code** — only comment with analysis and suggestions
- Keep analysis focused on the specific failure
- Reference the exact error message from the logs
- Suggest the simplest fix that addresses the root cause
