# Lucid Labs VS Code Themes

A theme factory monorepo that generates branded VS Code colour themes from shared templates and brand configurations. Each brand defines a colour palette; shared templates define the full theme structure with `{{role}}` placeholders; the generator substitutes colours to produce final theme JSON and the extension runtime.

Every extension ships **dual dark + light themes**, a **custom file-icon theme**, and a **Brand Palette sidebar** that previews the brand's semantic colour roles.

## Extensions

Versions live in each extension's `package.json` — the marketplace listing is always current.

| Brand | Marketplace |
|-------|------------|
| **Lucid Labs** | [lucidlabs.lucid-labs-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.lucid-labs-theme) |
| **CHARLI Health** | [lucidlabs.charli-health-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.charli-health-theme) |
| **Perfection Fresh** | [lucidlabs.perfection-fresh-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.perfection-fresh-theme) |
| **Australian Food & Fibre** | [lucidlabs.australian-food-fibre-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.australian-food-fibre-theme) |
| **Banjo Loans** | [lucidlabs.banjo-loans-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.banjo-loans-theme) |
| **Progenesis** | [lucidlabs.progenesis-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.progenesis-theme) |
| **Queensland** | [lucidlabs.queensland-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.queensland-theme) |
| **New South Wales** | [lucidlabs.new-south-wales-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.new-south-wales-theme) |
| **Victoria** | [lucidlabs.victoria-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.victoria-theme) |
| **Tasmania** | [lucidlabs.tasmania-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.tasmania-theme) |
| **South Australia** | [lucidlabs.south-australia-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.south-australia-theme) |
| **Western Australia** | [lucidlabs.western-australia-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.western-australia-theme) |
| **Northern Territory** | [lucidlabs.northern-territory-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.northern-territory-theme) |
| **ACT** | [lucidlabs.act-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.act-theme) |
| **Aurora Dairies** | [lucidlabs.aurora-dairies-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.aurora-dairies-theme) |
| **Pax8** | [lucidlabs.pax8-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.pax8-theme) |
| **CyberMattLee** | [lucidlabs.cybermattlee-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.cybermattlee-theme) |
| **Queensland Parks & Wildlife (Unofficial)** | [lucidlabs.qpws-theme](https://marketplace.visualstudio.com/items?itemName=lucidlabs.qpws-theme) |

## How It Works

1. **Brand configs** (`brands/<slug>/brand.json`) define ~40 semantic colour roles per dark/light variant.
2. **Templates** (`templates/base-dark.jsonc`, `templates/base-light.jsonc`) define the full theme structure with `{{role}}` placeholders.
3. **Generator** (`scripts/generate.js`) substitutes brand colours into the templates to produce the committed theme JSON under `extensions/<slug>/themes/`. It also builds the **extension runtime** — `activity-icon.svg`, `extension.js`, `lib/palette-view.js`, `icon-theme.json` — and patches the `contributes` block in each `extensions/<slug>/package.json`.
4. **Generated files are committed.** The Husky pre-commit hook runs `npm run generate && npm run lint` so the committed output is always current and valid.

## Quick Start

```bash
npm install
npm run generate     # Generate all themes + extension runtime
npm run lint         # Validate generated themes
npm run package:all  # Package all extensions
```

Packaging requires `@vscode/vsce` installed globally (`npm install -g @vscode/vsce`).

## Adding a New Brand

1. Create `brands/<slug>/brand.json` with the colour palette mapped to semantic roles.
2. Add `brands/<slug>/icon.png` (256×256 PNG) and `brands/<slug>/README.md`.
3. Create `extensions/<slug>/{package.json,.vscodeignore,CHANGELOG.md}` (the generator builds the rest — themes, runtime, and `LICENSE`).
4. Run `npm run generate` to produce the theme files and extension runtime, then `npm run lint`.

See `.github/copilot-instructions.md` for the full brand-authoring guide.

## Releasing

There is no `release-please` step — publishing is handled by the `Auto Publish` GitHub Actions workflow (`.github/workflows/auto-publish.yml`):

1. Bump `version` in `extensions/<slug>/package.json` and add an entry to that extension's `CHANGELOG.md`. For a templates/brands change that should ship to every extension, bump them all in one pass: `npm run bump -- --minor -m "What changed"`.
2. Push to `main`.
3. The workflow detects changed extensions (a `templates/` or `brands/` change publishes all of them), authenticates to Azure via OIDC, fetches the VSCE PAT from Key Vault, and publishes to the VS Code Marketplace. Already-published versions skip gracefully — the run warns if a templates/brands change shipped nothing because no versions were bumped.

A manual `workflow_dispatch` run republishes every extension.

## Licence

MIT
