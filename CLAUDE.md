# Lucid Labs VS Code Theme Factory

Monorepo that generates multiple branded VS Code colour themes from shared templates. Each brand defines a colour palette; templates define the full theme structure with `{{role}}` placeholders; the generator substitutes colours to produce final theme JSON files.

> **Precedence**: Inherits global (`~/.claude/CLAUDE.md`), workspace (`~/Documents/GitHub/CLAUDE.md`), and org (`LucidLabsAU/CLAUDE.md`). This file owns only repo-specific concerns.

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

Requires `@vscode/vsce` installed globally (`npm install -g @vscode/vsce`).

## Architecture

```text
brands/<name>/brand.json      → Colour palette (semantic roles per dark/light variant)
templates/base-dark.jsonc      → Dark theme template with {{role}} placeholders
templates/base-light.jsonc     → Light theme template with {{role}} placeholders
scripts/generate.js            → Substitutes brand colours into templates → JSON
extensions/<name>/themes/      → Generated theme files (committed)
extensions/<name>/package.json → VS Code extension manifest
```

### Key files

- **Brand configs**: `brands/*/brand.json` — ~40 semantic colour roles per variant (background, foreground, accent, keyword, string, function, etc.)
- **Templates**: `templates/base-*.jsonc` — 906 UI colour keys (100% VS Code API coverage), 55 tokenColor entries, 15 semantic tokens with `{{role}}` placeholders
- **Copilot Instructions**: `.github/copilot-instructions.md` — full guide for AI agents to create new brand themes
- **Generator**: `scripts/generate.js` — supports `{{role}}`, `{{role}}XX` (alpha suffix), `{{a|b|c}}` (fallback chains)
- **Linter**: `scripts/lint-themes.js` — checks for deprecated properties, comments, and missing transparency
- **CI/CD**: `.github/workflows/auto-publish.yml` — sequential publish with change detection, Azure OIDC + Key Vault

### Current brands

| Brand | Extension ID | Version |
|-------|-------------|---------|
| Lucid Labs | `lucidlabs.lucid-labs-theme` | 1.15.2 |
| CHARLI Health | `lucidlabs.charli-health-theme` | 1.9.1 |
| Perfection Fresh | `lucidlabs.perfection-fresh-theme` | 1.8.2 |
| Australian Food & Fibre | `lucidlabs.australian-food-fibre-theme` | 1.8.2 |
| Banjo Loans | `lucidlabs.banjo-loans-theme` | 1.8.2 |
| Progenesis | `lucidlabs.progenesis-theme` | 1.8.1 |
| Icon Group | `lucidlabs.icon-group-theme` | 1.9.2 |
| Queensland | `lucidlabs.queensland-theme` | 1.8.2 |
| New South Wales | `lucidlabs.new-south-wales-theme` | 1.7.2 |
| Victoria | `lucidlabs.victoria-theme` | 1.7.2 |
| Tasmania | `lucidlabs.tasmania-theme` | 1.7.2 |
| South Australia | `lucidlabs.south-australia-theme` | 1.7.2 |
| Western Australia | `lucidlabs.western-australia-theme` | 1.7.2 |
| Northern Territory | `lucidlabs.northern-territory-theme` | 1.7.2 |
| ACT | `lucidlabs.act-theme` | 1.7.2 |
| AI Tour Sydney | `lucidlabs.ai-tour-sydney-theme` | 1.3.2 |
| Aurora Dairies | `lucidlabs.aurora-dairies-theme` | 1.1.2 |
| Asplundh | `lucidlabs.asplundh-theme` | 1.0.1 |
| Pax8 (suite: everyday + Beyond 2026 SLC/Copenhagen + CTF 2026) | `lucidlabs.pax8-theme` | 1.3.1 |
| CyberMattLee (variants: Matt Lee Full Beard / Matt Lee Shaved) | `lucidlabs.cybermattlee-theme` | 1.0.0 |
| Queensland Parks & Wildlife (Unofficial) | `lucidlabs.qpws-theme` | 1.0.0 |

## Repo-specific gotchas

- **Husky pre-commit hook** runs `npm run generate && npm run lint` to ensure generated themes are always up-to-date and valid.
- **Adding a new brand**: create `brands/<name>/brand.json` with palette mapped to semantic roles, add `brands/<name>/icon.png` (256x256 PNG) and `brands/<name>/README.md`, create `extensions/<name>/{package.json,.vscodeignore,CHANGELOG.md,LICENSE}`, then run `npm run generate`.
- **Release flow**: bump version in `extensions/<name>/package.json` and update `CHANGELOG.md`, push to `main`. Auto-publish workflow detects changed extensions, Azure OIDC authenticates, fetches VSCE PAT from Key Vault, publishes to marketplace. Manual dispatch (`workflow_dispatch`) publishes all extensions. Already-published versions skip gracefully.
