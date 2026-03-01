# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **theme factory** monorepo that generates multiple branded VS Code colour themes from shared templates. Each brand defines a colour palette; templates define the full theme structure with `{{role}}` placeholders; the generator substitutes colours to produce final theme JSON files.

### Current Brands

| Brand | Extension ID | Version |
|-------|-------------|---------|
| Lucid Labs | `lucidlabs.lucid-labs-theme` | 1.3.2 |
| CHARLI Health | `lucidlabs.charli-health-theme` | 1.0.0 |

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
- **CI/CD**: `.github/workflows/auto-publish.yml` — matrix publish with change detection, Azure OIDC + Key Vault
- **Release**: `release-please-config.json` — multi-package config for independent versioning

### Pre-commit Hook

The husky pre-commit hook runs `npm run generate && npm run lint` to ensure generated themes are always up-to-date and valid.

## Adding a New Brand

1. Create `brands/<name>/brand.json` with palette mapped to semantic roles
2. Add `brands/<name>/icon.png` and `brands/<name>/README.md`
3. Create `extensions/<name>/package.json`, `.vscodeignore`, and `CHANGELOG.md`
4. Add entries to `release-please-config.json` and `.release-please-manifest.json`
5. Run `npm run generate`

## Release Process

1. Push to `main` using conventional commits
2. Release Please opens release PRs per package with version bumps and changelogs
3. Merging a release PR creates a GitHub release and tag
4. Auto Publish detects which extensions changed and publishes them via matrix strategy
5. Azure OIDC authenticates, fetches VSCE PAT from Key Vault, publishes to marketplace
