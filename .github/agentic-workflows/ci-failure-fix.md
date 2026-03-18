---
name: CI Failure Analysis
description: Analyse CI failures and comment with fix suggestions
triggers:
  - type: check_run
    activity: completed
    conclusion: failure
permissions:
  contents: read
  pull-requests: write
safe-outputs:
  - comment-on-pull-request
---

# CI Failure Analysis

When a CI check fails on a pull request, analyse the failure and comment with a diagnosis and suggested fix.

## Instructions

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
