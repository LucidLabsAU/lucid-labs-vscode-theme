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

# Bump every extension's version + changelog in one pass (for template/brand releases)
npm run bump -- --minor -m "What changed"

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

Versions are the `version` field in each `extensions/<slug>/package.json` — never duplicate them here.

| Brand | Extension ID |
|-------|-------------|
| Lucid Labs | `lucidlabs.lucid-labs-theme` |
| CHARLI Health | `lucidlabs.charli-health-theme` |
| Perfection Fresh | `lucidlabs.perfection-fresh-theme` |
| Australian Food & Fibre | `lucidlabs.australian-food-fibre-theme` |
| Banjo Loans | `lucidlabs.banjo-loans-theme` |
| Progenesis | `lucidlabs.progenesis-theme` |
| Queensland | `lucidlabs.queensland-theme` |
| New South Wales | `lucidlabs.new-south-wales-theme` |
| Victoria | `lucidlabs.victoria-theme` |
| Tasmania | `lucidlabs.tasmania-theme` |
| South Australia | `lucidlabs.south-australia-theme` |
| Western Australia | `lucidlabs.western-australia-theme` |
| Northern Territory | `lucidlabs.northern-territory-theme` |
| ACT | `lucidlabs.act-theme` |
| AI Tour Sydney | `lucidlabs.ai-tour-sydney-theme` |
| Aurora Dairies | `lucidlabs.aurora-dairies-theme` |
| Pax8 (suite: everyday + Beyond 2026 SLC/Copenhagen + CTF 2026) | `lucidlabs.pax8-theme` |
| CyberMattLee (variants: Matt Lee Full Beard / Matt Lee Shaved) | `lucidlabs.cybermattlee-theme` |
| Queensland Parks & Wildlife (Unofficial) | `lucidlabs.qpws-theme` |

## Repo-specific gotchas

- **Husky pre-commit hook** runs `npm run generate && npm run lint` to ensure generated themes are always up-to-date and valid.
- **Adding a new brand**: create `brands/<name>/brand.json` with palette mapped to semantic roles, add `brands/<name>/icon.png` (256x256 PNG) and `brands/<name>/README.md`, create `extensions/<name>/{package.json,.vscodeignore,CHANGELOG.md,LICENSE}`, then run `npm run generate`.
- **Release flow**: bump version in `extensions/<name>/package.json` and update `CHANGELOG.md`, push to `main`. Auto-publish workflow detects changed extensions, Azure OIDC authenticates, fetches VSCE PAT from Key Vault, publishes to marketplace. Manual dispatch (`workflow_dispatch`) publishes all extensions. Already-published versions skip gracefully.
- **Template/brand releases need version bumps**: a `templates/` or `brands/` change triggers a publish of ALL extensions, but any extension whose version already exists on the marketplace is skipped — the change ships nowhere without bumps. Run `npm run bump -- --minor -m "..."` first; the workflow emits a warning if a template-triggered run published nothing.
- **CI drift gate**: `.github/workflows/ci.yml` regenerates themes and fails if the committed output differs — pre-commit hooks can be skipped, CI cannot.
