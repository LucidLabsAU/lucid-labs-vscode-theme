# Lucid Labs VS Code Themes

A theme factory monorepo that generates branded VS Code colour themes from shared templates and brand configurations.

## Extensions

| Brand | Marketplace | Status |
|-------|------------|--------|
| **Lucid Labs** | [lucidlabs.lucid-labs-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.lucid-labs-theme) | Published |
| **CHARLI Health** | [lucidlabs.charli-health-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.charli-health-theme) | v1.0.0 |

## How It Works

1. **Brand configs** (`brands/<name>/brand.json`) define semantic colour roles per dark/light variant
2. **Templates** (`templates/base-dark.jsonc`, `templates/base-light.jsonc`) define the full theme structure with `{{role}}` placeholders
3. **Generator** (`scripts/generate.js`) substitutes brand colours into templates to produce final theme JSON
4. **Generated files are committed** — the pre-commit hook regenerates and stages them automatically

## Quick Start

```bash
npm install
npm run generate   # Generate all themes
npm run lint       # Validate themes
npm run package:all  # Package all extensions
```

## Adding a New Brand

1. Create `brands/<name>/brand.json` with colour palette
2. Add `brands/<name>/icon.png` and `brands/<name>/README.md`
3. Create `extensions/<name>/package.json`, `.vscodeignore`, and `CHANGELOG.md`
4. Add to `release-please-config.json` and `.release-please-manifest.json`
5. Run `npm run generate`

## Licence

MIT
