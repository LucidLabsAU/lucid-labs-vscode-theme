# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **theme factory** monorepo that generates multiple branded VS Code colour themes from shared templates. Each brand defines a colour palette; templates define the full theme structure with `{{role}}` placeholders; the generator substitutes colours to produce final theme JSON files.

### Current Brands

| Brand | Extension ID | Version |
|-------|-------------|---------|
| Lucid Labs | `lucidlabs.lucid-labs-theme` | 1.5.0 |
| CHARLi | `lucidlabs.charli-health-theme` | 1.1.0 |
| Perfection Fresh | `lucidlabs.perfection-fresh-theme` | 1.0.0 |
| Australian Food & Fibre | `lucidlabs.australian-food-fibre-theme` | 1.0.0 |
| Banjo Loans | `lucidlabs.banjo-loans-theme` | 1.0.0 |
| Progenesis | `lucidlabs.progenesis-theme` | 1.0.1 |

## Commands

```bash
# Generate all theme files from templates + brand configs
npm run generate

# Generate a single brand
node scripts/generate.js --brand lucid-labs

# Lint all generated themes
npm run lint

# Package all extensions
npm run package:all

# Package a single extension
cd extensions/lucid-labs && vsce package
```

Note: Requires `@vscode/vsce` to be installed globally (`npm install -g @vscode/vsce`).

## Architecture

```
brands/<name>/brand.json      → Colour palette (semantic roles per dark/light variant)
templates/base-dark.jsonc      → Dark theme template with {{role}} placeholders
templates/base-light.jsonc     → Light theme template with {{role}} placeholders
scripts/generate.js            → Substitutes brand colours into templates → JSON
extensions/<name>/themes/      → Generated theme files (committed)
extensions/<name>/package.json → VS Code extension manifest
```

### Key Files

- **Brand Configs**: `brands/*/brand.json` — ~40 semantic colour roles per variant (background, foreground, accent, keyword, string, function, etc.)
- **Templates**: `templates/base-*.jsonc` — 224+ UI colours, 55 tokenColor entries, 7 semantic tokens with `{{role}}` placeholders
- **Generator**: `scripts/generate.js` — supports `{{role}}`, `{{role}}XX` (alpha suffix), `{{a|b|c}}` (fallback chains)
- **Linter**: `scripts/lint-themes.js` — checks for deprecated properties, comments, and missing transparency
- **CI/CD**: `.github/workflows/auto-publish.yml` — sequential publish with change detection, Azure OIDC + Key Vault

### Pre-commit Hook

The husky pre-commit hook runs `npm run generate && npm run lint` to ensure generated themes are always up-to-date and valid.

## Adding a New Brand

1. Create `brands/<name>/brand.json` with palette mapped to semantic roles
2. Add `brands/<name>/icon.png` (256x256 PNG) and `brands/<name>/README.md`
3. Create `extensions/<name>/package.json`, `.vscodeignore`, `CHANGELOG.md`, and `LICENSE`
4. Run `npm run generate`

## Release Process

1. Bump the version in `extensions/<name>/package.json` and update `CHANGELOG.md`
2. Push to `main` — auto-publish workflow detects changed extensions
3. Azure OIDC authenticates, fetches VSCE PAT from Key Vault, publishes to marketplace
4. Manual dispatch (`workflow_dispatch`) publishes all extensions
5. Already-published versions are skipped gracefully
