# Copilot Instructions — VS Code Theme Factory

This repository is a **theme factory monorepo** that generates branded VS Code colour themes from shared templates. Every brand uses the same template system — you only need to create a `brand.json` colour palette and extension scaffolding.

## Architecture

```
brands/<slug>/brand.json       → Colour palette (~40 semantic roles per dark/light variant)
brands/<slug>/icon.png         → 256×256 PNG extension icon
brands/<slug>/README.md        → Marketplace README
templates/base-dark.jsonc      → Dark theme template (906 colour keys with {{role}} placeholders)
templates/base-light.jsonc     → Light theme template (906 colour keys with {{role}} placeholders)
scripts/generate.js            → Substitutes brand colours into templates → JSON
extensions/<slug>/themes/      → Generated theme files (committed, never hand-edited)
extensions/<slug>/package.json → VS Code extension manifest
```

## Placeholder Syntax

Templates use these placeholder patterns:
- `{{role}}` — resolves to the brand colour for that semantic role
- `{{role}}XX` — resolves to the brand colour + hex alpha suffix (e.g. `{{accent}}50`)
- `{{a|b|c}}` — fallback chain: tries `a`, then `b`, then `c`
- `{{a|b}}XX` — fallback chain with alpha suffix
- `{{#RRGGBB}}` — literal hex colour passthrough

## Creating a New Brand Theme

### Step 1: Extract Brand Colours

Given a brand's website URL or logo, extract their primary colours:
1. Visit the website and identify primary, secondary, and accent colours
2. Look at the logo, navigation, buttons, links, headings, and footer
3. Check for a brand guidelines page or style guide
4. Extract 5-8 core colours that define the brand

### Step 2: Create Brand Directory

Create `brands/<slug>/` where `<slug>` is the brand name in kebab-case (e.g. `acme-corp`).

### Step 3: Create `brand.json`

Map extracted colours to semantic roles. Use an existing brand (e.g. `brands/lucid-labs/brand.json`) as a reference for the full structure.

**Required top-level fields:**
```json
{
  "name": "Brand Name",
  "displayName": "Brand Name",
  "description": "A professional theme for VS Code inspired by Brand Name...",
  "publisher": "lucidlabs",
  "keywords": ["theme", "brand-name", ...],
  "homepage": "https://brand-website.com",
  "sponsor": "https://brand-website.com"
}
```

**Required colour roles per variant (`dark` and `light`):**

| Role | Purpose | Example |
|------|---------|---------|
| `background` | Editor background | `#1A1A2E` (dark) / `#FFFFFF` (light) |
| `foreground` | Primary text | `#E0E0E8` (dark) / `#1A1A2E` (light) |
| `backgroundDeep` | Activity bar, deepest surface | Darker than background |
| `backgroundPanel` | Side bar, panels | Between deep and main |
| `backgroundInput` | Input fields, line highlight | Slightly lighter than bg |
| `backgroundElevated` | Floating widgets | Slightly lighter than panel |
| `backgroundHover` | Hover states | Between panel and elevated |
| `borderSubtle` | Subtle borders | Low-contrast border |
| `muted` | Secondary text, placeholders | Grey/dim text |
| `accent` | Primary interactive colour | Brand primary colour |
| `accentHover` | Hover state of accent | Slightly darker/lighter |
| `keyword` | Keywords, types, attributes | Brand secondary colour |
| `string` | String literals | Contrasting colour |
| `constant` | Numbers, booleans, constants | Warm/neutral colour |
| `function` | Functions, methods, links | Brand accent or accent variant |
| `error` | Error states | Red variant |
| `success` | Success states, debugging bg | Green variant |
| `warning` | Warnings, constants (dark) | Yellow/amber variant |
| `info` | Info states | Blue/teal variant |
| `comment` | Code comments | Muted/grey |
| `shadow` | Shadows | Near-black |
| `added` | Git added | Same as success or accent |
| `modified` | Git modified | Same as keyword or function |
| `galleryBanner` | Marketplace banner colour | Background colour |

**Terminal colours** (nested under `terminal`):
```json
"terminal": {
  "black": "#...", "red": "#...", "green": "#...", "yellow": "#...",
  "blue": "#...", "magenta": "#...", "cyan": "#...", "white": "#...",
  "brightBlack": "#...", "brightRed": "#...", "brightGreen": "#...",
  "brightYellow": "#...", "brightBlue": "#...", "brightMagenta": "#...",
  "brightCyan": "#...", "brightWhite": "#..."
}
```

**Bracket colours** (`bracket1` through `bracket6`):
Cycle through 6 distinct colours from the brand palette for bracket pair colouring and indent guide colouring.

### Step 4: Create Extension Scaffolding

Create these files in `extensions/<slug>/`:

**`package.json`** — Copy from an existing extension and update:
- `name`: `<slug>-theme`
- `displayName`: Brand display name
- `description`: Brand-specific description
- `version`: `1.0.0`
- `publisher`: `lucidlabs`
- `keywords`: Brand-relevant keywords
- `galleryBanner.color`: Dark background hex from brand.json
- `contributes.themes`: Update labels and paths with brand name
- `contributes.iconThemes`: Update id and label
- `homepage`: Brand website URL

**`CHANGELOG.md`**:
```markdown
# Changelog

## 1.0.0 (YYYY-MM-DD)

- Initial release with dark and light theme variants
- Brand-aligned colour palette
- Custom file icon theme
```

**`.vscodeignore`**:
```
.vscode/**
.git/**
**/*.vsix
**/*.log
node_modules/**
```

**`LICENSE`** — Copy from the root `LICENSE` file (MIT).

### Step 5: Create Brand Icon

Create or obtain a 256×256 PNG icon at `brands/<slug>/icon.png`. This is the extension marketplace icon. If using an SVG source, convert it:
```bash
# Example with sips (macOS)
sips -z 256 256 source.png --out brands/<slug>/icon.png
```

### Step 6: Create Brand README

Create `brands/<slug>/README.md` with:
- Brand name as heading
- Description of the theme
- Features list (dual theme, WCAG AA, brand-aligned, etc.)
- Colour palette table (hex codes and usage)
- Installation instructions
- About section for the brand

### Step 7: Generate and Validate

```bash
# Generate themes
node scripts/generate.js --brand <slug>

# Lint generated themes
npm run lint

# Package for testing
cd extensions/<slug> && vsce package
```

### Step 8: Test Locally

```bash
code --install-extension extensions/<slug>/<slug>-theme-1.0.0.vsix
```

Then activate via File > Preferences > Colour Theme.

## Colour Derivation Strategy

The templates derive ~906 VS Code colour keys from ~15 core semantic roles using:

- **Alpha transparency** — `{{accent}}30` for subtle backgrounds, `{{accent}}80` for prominent
- **Fallback chains** — `{{modified|function}}` tries `modified`, falls back to `function`
- **Surface hierarchy** — `background` → `backgroundDeep` → `backgroundPanel` → `backgroundElevated`
- **State colours** — `error`/`warning`/`info`/`success` with varying alpha for bg/fg/border
- **Dark vs light** — Light themes use lower alpha (10-30 vs 20-50), `#FFFFFF` for button text

This means **no new template changes are needed** when adding a brand — just the `brand.json` palette.

## Contrast Requirements

All themes must meet WCAG AA contrast minimums:
- **Normal text**: 4.5:1 against background
- **Large text/UI**: 3:1 against background
- **Interactive elements**: Clearly distinguishable

For dark themes, ensure `foreground` against `background` is at least 10:1.
For light themes, ensure text colours against white/light backgrounds meet 4.5:1.

## Common Pitfalls

- Don't edit files in `extensions/*/themes/` — they're generated and overwritten
- The `commentToken` role (dark only) should include alpha, e.g. `#CCCCCC80`
- Light themes may need extra roles like `listActiveSelectionForeground`, `inactiveForeground`, `peekEditorBg` etc. — check existing brands for patterns
- Always run `npm run generate && npm run lint` before committing
- The pre-commit hook enforces this automatically

## Publishing

Push to `main` — the auto-publish workflow detects changed extensions and publishes to the VS Code Marketplace via Azure OIDC + Key Vault. Already-published versions are skipped.

---

## Azure resource tagging (org-wide standard)

Every Azure resource provisioned in any LucidLabsAU repo must carry the standard tag set. The lowercase keys are required by the tenant `require-standard-tags` policy.

| Tag | Type | Example |
| --- | --- | --- |
| `project` | kebab-case string | `lucid-operations` |
| `environment` | enum | `prod` / `nonprod` / `dev` / `staging` |
| `managedBy` | enum | `Bicep` / `Terraform` / `manual` |
| `costCentre` | enum | `Integration` / `Platform` / `Security` / `Productivity` / `Identity` / `Governance` / `Marketing` / `Engineering` / `rd-platform` |
| `application` | string | `Lucid Hub + MCP Server` |
| `owner` | email | `keith@oakai.au` |
| `mapping_tag` | GUID | `guid('LucidLabsAU/<repo>', '<path/to/file.bicep>')` |

Legacy PascalCase keys (`Application`, `Environment`, `ManagedBy`, `CostCenter`) may co-exist for backwards compatibility but lowercase is canonical.

### `mapping_tag` — Defender for Cloud code-to-cloud linkage

The `mapping_tag` GUID lets Microsoft Defender for Cloud correlate this deployed Azure resource back to its source Bicep file (Cloud Security Explorer → *Provisioned by* → *Code repositories*). Use a deterministic GUID derived from repo + path so it survives redeploys:

```bicep
mapping_tag: guid('LucidLabsAU/<repo-name>', '<path/to/file.bicep>')
```

In Bicep:

- **Single-file template:** add to a `commonTags` var and apply via `tags: commonTags`.
- **Multi-module template:** parent declares `commonTags`; pass via `tags` param to each module. If a module has inline tags (no parent passthrough), add `mapping_tag` inline using its own path.
- **Resource group declarations:** tag the RG with the full standard set including `mapping_tag`.

**Resource types that REJECT user tags** (don't try): `Microsoft.Insights/diagnosticSettings`, `Microsoft.OperationsManagement/solutions`, `Microsoft.Automation/automationAccounts/runbooks`, `microsoft.alertsmanagement/smartDetectorAlertRules`, some `Microsoft.Web/certificates`, some `Microsoft.EventGrid/systemTopics`, `Microsoft.App/agents`. Their parents carry the linkage instead.

**Caveats:**
- Defender's IaC mapping is GA on Azure DevOps, partial on GitHub (the MSDO GitHub Action does not ship `IaCFileScanner`). Authoring `mapping_tag` now is forward-compatible.
- ~12-hour propagation delay before Defender Cloud Security Explorer reflects the link.
- Requires Defender CSPM plan (Foundational CSPM is insufficient).

Reference: <https://learn.microsoft.com/azure/defender-for-cloud/iac-template-mapping>
