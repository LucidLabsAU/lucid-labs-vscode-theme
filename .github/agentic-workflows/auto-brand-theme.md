---
name: Auto Brand Theme
description: Automatically create a new VS Code theme when a brand issue is opened
triggers:
  - type: issues
    activity: opened
    label: brand
permissions:
  contents: read
  pull-requests: write
  issues: write
safe-outputs:
  - create-pull-request
  - comment-on-issue
---

# Auto Brand Theme Creation

When a new issue is opened with the `brand` label, automatically create a complete VS Code theme.

## Instructions

1. Read the issue body and extract brand details (name, website, colours, logo)
2. Follow the complete brand creation workflow in `.github/copilot-instructions.md`
3. Create `brands/<slug>/brand.json` with colours mapped to all semantic roles
4. Scaffold `extensions/<slug>/` with package.json, CHANGELOG, .vscodeignore, LICENSE
5. Run `node scripts/generate.js --brand <slug>` to generate theme files
6. Run `npm run lint` to validate generated themes
7. Run `node scripts/check-contrast.js` to verify WCAG AA compliance
8. Run `cd extensions/<slug> && vsce package` to validate packaging
9. Open a PR with the new brand theme
10. Comment on the original issue with a link to the PR and a colour palette summary

## Quality Gates

- All contrast checks must pass (zero WCAG failures)
- Lint must pass with no errors
- VSIX package must build successfully
- Both dark and light variants must be generated

## Notes

- Use the `theme-creator` agent definition in `.github/agents/theme-creator.agent.md` for detailed guidance
- Reference existing brands (e.g. `brands/lucid-labs/brand.json`) for structure
- If contrast checks fail, adjust colours and re-run until all pass
