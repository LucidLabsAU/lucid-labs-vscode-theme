# Activity icon + brand palette viewer — design

**Date:** 2026-05-21
**Scope:** All 17 brands, delivered in two phases. Phase 1 ships the activity icon and
palette viewer for **Lucid Labs** as the reference implementation. Phase 2 generalises it
into generator-emitted artifacts and rolls it out to the remaining 16 brands.

## Problem

1. The Lucid Labs extension's activity-bar item uses `activity-icon.svg` — a stylised
   "L + K" mark that does not match the brand. It should use the Lucid Labs cloud-and-arrows
   mark (artwork already in `brands/lucid-labs/icons/git.svg`).
2. The Brand Palette viewer lists ~40 semantic theme **role keys** (`accent`, `keyword`,
   `string`…) with a hex value and click-to-copy. It does not surface the actual brand
   colour **names**, offers only hex (no RGB/CMYK), shows lots of near-duplicate swatches,
   and only reflects the active theme variant.
3. Only Lucid Labs has an extension runtime (`extension.js`) at all — the other 16 brands
   are themes-only and have no activity-bar item or palette viewer.

## Goal

- Replace the Lucid Labs activity-bar icon with a monochrome version of its
  cloud-and-arrows mark.
- Rebuild the palette viewer as a sidebar webview view: the canonical brand palette
  (named, grouped, hex/RGB/CMYK click-to-copy) plus a de-duplicated view of the active
  theme's role colours with a Dark/Light toggle.
- Roll the activity item and palette viewer out to **all 17 brands** by turning
  `extension.js` and `activity-icon.svg` into generator-emitted artifacts.

## Fleet survey (current state)

- **17 brands** under `brands/`: `act`, `ai-tour-sydney`, `aurora-dairies`,
  `australian-food-fibre`, `banjo-loans`, `charli`, `icon-group`, `lucid-labs`,
  `new-south-wales`, `northern-territory`, `perfection-fresh`, `progenesis`, `queensland`,
  `south-australia`, `tasmania`, `victoria`, `western-australia`.
  (`CLAUDE.md` lists 15; `ai-tour-sydney` and `aurora-dairies` are newer and `CLAUDE.md`
  should be updated to match.)
- **Every brand has `brands/<name>/icons/git.svg`** — a brand mark authored with
  `{{role}}` template placeholders (e.g. CHARLi's "C letterform"). This is the activity-icon
  source for every brand.
- Only `lucid-labs` has `extension.js`, `activity-icon.svg`, and the
  `viewsContainers`/`views`/`commands` contributions in `package.json`.
- `scripts/generate.js` copies `icon.png`, `README.md`, `brand.json`, and
  `activity-icon.svg` from `brands/<name>/` into `extensions/<name>/`. `extension.js` is
  currently hand-authored and not touched by the generator.

## Source of truth — brand colours

`/Users/keithoak/Library/CloudStorage/OneDrive-LucidLabs/branding - branding - Templates/sharepoint-branding-config.json`
(version 2.0, 2026-04-28) carries a `brandColorMeta` block reconciled to the canonical v1
brand guide, with curated Pantone-matched CMYK per colour. Ten Lucid Labs colours:

| Group | Name | Hex | RGB | CMYK | Pantone | Role |
|---|---|---|---|---|---|---|
| primary | Deep Purple | `#271D3B` | 39,29,59 | 34,51,0,77 | 5255 C | Wordmark / dark page background / heading text on light surfaces |
| primary | Teal Green | `#339999` | 51,153,153 | 67,0,0,40 | 321 C | Accent / hyperlink / highlight / heading rule on dark backgrounds |
| primary | Vivid Purple | `#7454B3` | 116,84,179 | 35,53,0,30 | 2665 C | Accent — CTA / brand mark |
| secondary | Lucid Blue | `#677EB2` | 103,126,178 | 41,29,0,30 | 2129 C | Accent — secondary / supporting |
| secondary | Light Grey | `#CCCCCC` | 204,204,204 | 0,0,0,20 | Cool Gray 3 C | Footer text, secondary information, muted captions |
| secondary | Near Black | `#101820` | 16,24,32 | 50,25,0,87 | Black 6 C | Maximum-contrast text on light, body chrome on dark |
| secondary | White | `#FFFFFF` | 255,255,255 | 0,0,0,0 | — | Light surfaces / reversed text |
| other | Warm Accent | `#FF4B46` | 255,75,70 | 0,75,70,0 | Warm Red C | Warnings, risk callouts, attention markers |
| other | Lucid Gold | `#D4A843` | 212,168,67 | 10,25,80,15 | 7752 C | Warn / highlight badges (derived — not in v1 brand guide) |
| other | Dark Teal | `#3B7F80` | 59,127,128 | 70,15,30,40 | 7474 C | Accent depth (derived — not in v1 brand guide) |

`White` has no `brandColorMeta` entry in the source config; its values above are filled in
manually. The CMYK values for these ten colours are curated/Pantone-matched — stored, not
computed. Only Lucid Labs has this data; see "Graceful degradation" below.

---

## Phase 1 — Lucid Labs reference implementation

### 1.1 Activity-bar icon

Replace `brands/lucid-labs/activity-icon.svg` with a monochrome version of the
cloud-and-arrows mark from `brands/lucid-labs/icons/git.svg`.

- VS Code masks activity-bar icons to a single theme-tinted colour, so a multi-colour SVG
  cannot be used directly. Every `fill` is set to `currentColor` (colour literals and
  `{{role}}` placeholders removed).
- The cloud in `git.svg` is drawn as an outline *ring* (the path includes the inner
  contour), so the two solid exchange arrows still read as distinct shapes inside the ring
  when the whole mark is one colour.
- The `viewBox` is cropped to the artwork bounds and padded to a square so the wide mark
  fills the 24px activity-bar rail rather than rendering tiny.
- `brands/lucid-labs/activity-icon.svg` is hand-authored in Phase 1 and remains a
  per-brand **override** in Phase 2 (the generator skips generation when a hand-authored
  file exists).

### 1.2 Brand colour data

Add a `brandColors` array to `brands/lucid-labs/brand.json`. The generator already copies
`brand.json` into the extension folder, and `extension.js` reads `brand.json` from the
extension path, so no generator change is required for this in Phase 1.

Each entry:

```json
{
  "key": "teal",
  "name": "Teal Green",
  "hex": "#339999",
  "rgb": [51, 153, 153],
  "cmyk": [67, 0, 0, 40],
  "pantone": "321 C",
  "group": "primary",
  "role": "Accent / hyperlink / highlight / heading rule on dark backgrounds"
}
```

- `group` ∈ `"primary" | "secondary" | "other"`.
- Array order: primary → secondary → other (as the table above).
- `pantone` may be an empty string (White).

### 1.3 Palette viewer — sidebar webview view

Replace the tree-based `PaletteTreeProvider` with a `WebviewViewProvider`. The `views`
contribution for `lucidLabsPalette` changes to `"type": "webview"`.

**Sections rendered in the webview:**

1. **Brand Colours** — variant-independent, rendered under three sub-headers:
   *Primary Palette*, *Secondary Palette*, *Other Palette*. One card per colour: swatch,
   name, role caption, hex, Pantone label, and `[HEX] [RGB] [CMYK]` copy buttons.
   This section renders **only when `brand.json` contains a `brandColors` array**
   (Lucid Labs at launch — see Graceful degradation).
2. **Theme Roles** — the top-level semantic roles from `brand.json` for the selected
   variant. A **Dark / Light toggle** in the section header selects the variant; it
   defaults to the active editor theme variant and is independent of it (you can inspect
   the inverse variant without switching your editor theme). Cards are **de-duplicated by
   hex**: one card per unique colour, every role using that colour listed as caption chips
   (e.g. `#339999` → `accent · function · info · regex · added`). Where a de-duped colour
   matches a brand-colour hex, the card shows the brand name in place of an anonymous
   label. Same `[HEX] [RGB] [CMYK]` copy buttons.

**Excluded:** the nested `terminal` block (16 ANSI colours), matching the current viewer,
which filters to top-level string hex values only.

**Colour format conversion:**

- Brand colours use their stored `rgb`/`cmyk` (curated, Pantone-matched).
- Theme-role colours derive RGB from the hex and CMYK from a naive RGB→CMYK conversion
  (no ICC profile). The webview shows a one-line note that role CMYK is an approximation;
  brand-colour CMYK is exact.

**Copy mechanism:** webview scripts cannot reliably reach `vscode.env.clipboard`. A copy
button posts `{ type: 'copy', format, value }` to the extension host; the host calls
`vscode.env.clipboard.writeText(value)` and shows a transient status-bar message
(`Copied <value>`). Requires `enableScripts: true` and a Content-Security-Policy with a
per-render `nonce` on the inline `<script>`.

**`openAbout` full-tab command:** retained. The HTML generator is factored into a shared
function used by both the sidebar webview view and the `openAbout` full-tab panel. The
`view/title` navigation button is unchanged.

**Variant change handling:** `onDidChangeActiveColorTheme` re-posts the active variant to
the webview so the Theme Roles toggle default tracks the editor; an explicit toggle in the
view takes precedence until the view reloads.

### 1.4 Phase 1 files

| File | Change |
|---|---|
| `brands/lucid-labs/activity-icon.svg` | New monochrome cloud-and-arrows mark |
| `brands/lucid-labs/brand.json` | Add `brandColors` array (10 grouped entries) |
| `extensions/lucid-labs/extension.js` | `WebviewViewProvider`; shared HTML generator; hex de-dup; RGB/CMYK helpers; nonce'd CSP; message-based copy |
| `extensions/lucid-labs/package.json` | `views.lucidLabsPalette` → `"type": "webview"`; version bump |
| `extensions/lucid-labs/CHANGELOG.md` | New version entry |
| `extensions/lucid-labs/{activity-icon.svg,brand.json}` | Regenerated via `npm run generate` |

Phase 1 is independently shippable. Its `extension.js` becomes the template seed for
Phase 2.

---

## Phase 2 — fleet rollout to all 17 brands

### 2.1 `extension.js` becomes a generated artifact

Extract Phase 1's `extension.js` into a template (`templates/extension.js` or
`scripts/templates/extension.js`) with placeholders for the brand-specific values:

- `BRAND` — display name (from `brand.json` `displayName`).
- `THEME_DARK` / `THEME_LIGHT` — theme labels (`<displayName> Dark` / `<displayName> Light`;
  verified against each extension's `package.json` `themes` array during planning).
- `CONFIG_NS` — command/config namespace, camelCase from the brand key
  (`lucid-labs` → `lucidLabsTheme`, `charli` → `charliTheme`).
- View IDs — `<ns>Palette`, `<ns>Container` (or `<brandKey>Palette` etc.; chosen for
  uniqueness and stability during planning).

The generator substitutes these and writes `extensions/<brand>/extension.js` for every
brand. `extension.js` is added to the generator's per-brand emission step.

### 2.2 `activity-icon.svg` becomes a generated artifact

For each brand the generator emits `extensions/<brand>/activity-icon.svg` from
`brands/<brand>/icons/git.svg` by substituting every colour placeholder/literal with
`currentColor`. Override rule: if `brands/<brand>/activity-icon.svg` exists (hand-authored,
e.g. Lucid Labs from Phase 1), copy that instead of generating. The source `git.svg`'s
`viewBox` is preserved; a brand whose mark renders poorly at 24px gets a hand-authored
override file rather than generator bbox-cropping logic.

### 2.3 `package.json` `contributes` injection

The generator patches each `extensions/<brand>/package.json` idempotently:

- Sets `main: "./extension.js"` and ensures `activationEvents` includes
  `"onStartupFinished"`.
- Merges a generated `contributes` partial with namespaced IDs: `viewsContainers.activitybar`
  (the brand container), `views.<container>` (the `webview`-type palette view),
  `commands` (`switchDark`, `switchLight`, `toggleVariant`, `openAbout`),
  `configuration` (`<ns>.showStatusBarItem`), and `menus.view/title`.
- **Preserves** all hand-authored fields: `themes`, `iconThemes`, `version`, `description`,
  `keywords`, `categories`, repository metadata, etc.

**Excluded from the fleet merge:** `keybindings` (the `ctrl+alt+l` toggle stays
Lucid-Labs-only — 17 extensions binding global keys would collide) and `walkthroughs`
(walkthrough markdown is Lucid-Labs-only; rolling walkthroughs fleet-wide is a separate
effort).

### 2.4 Graceful degradation for `brandColors`

The viewer's shared HTML generator renders the **Brand Colours** section only when the
brand's `brand.json` contains a `brandColors` array. At launch only Lucid Labs has one;
the other 16 brands show the **Theme Roles** section alone. Each brand's named palette is
added to its `brands/<name>/brand.json` incrementally later — no brand blocks the rollout.

### 2.5 Versioning and publish

Phase 2 changes every extension, so all 17 get a version bump and a `CHANGELOG.md` entry.
The `auto-publish.yml` workflow detects changed extensions and publishes them sequentially;
a `workflow_dispatch` run publishes all. No workflow change is required.

### 2.6 Phase 2 files

| File | Change |
|---|---|
| `templates/extension.js` (new) | Templated runtime, seeded from Phase 1's `extension.js` |
| `scripts/generate.js` | Emit `extension.js` + `activity-icon.svg` per brand; patch `package.json` `contributes` |
| `extensions/*/extension.js` (×17) | Generated |
| `extensions/*/activity-icon.svg` (×17) | Generated (Lucid Labs via its override) |
| `extensions/*/package.json` (×17) | `main`, `activationEvents`, `contributes` merged |
| `extensions/*/CHANGELOG.md` (×17) | New version entries |
| `brands/<name>/brand.json` | `brandColors` added per brand incrementally (post-rollout) |
| `CLAUDE.md` | Brand table updated to 17 (add `ai-tour-sydney`, `aurora-dairies`) |

## Verification

- `npm run generate` then `npm run lint` succeed (husky pre-commit runs both).
- **Phase 1:** the Lucid Labs activity-bar icon renders as the cloud-and-arrows mark,
  correctly theme-tinted; the sidebar view shows Brand Colours in three sub-groups plus a
  de-duplicated Theme Roles list; the Dark/Light toggle switches the role set without
  changing the editor theme; each copy button copies the correct HEX/RGB/CMYK string with
  status-bar confirmation; brand-colour CMYK matches the stored Pantone-matched values.
- **Phase 2:** every extension installs with an activity-bar item and palette viewer;
  brands without `brandColors` show Theme Roles only with no error; re-running
  `npm run generate` is idempotent (no spurious `package.json` churn); `vsce package`
  succeeds for a sample of brands.

## Out of scope

- HSL format (not selected).
- Search/filter within the viewer.
- Showing the `terminal` ANSI block in the viewer.
- Fleet-wide keybindings and walkthroughs.
- Curating `brandColors` for the non-Lucid brands (done incrementally after rollout).
