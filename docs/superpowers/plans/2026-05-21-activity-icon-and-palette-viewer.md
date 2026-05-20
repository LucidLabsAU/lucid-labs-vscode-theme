# Activity Icon + Brand Palette Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Lucid Labs VS Code extension a brand-correct activity-bar icon and a rich sidebar palette viewer (named colours, hex/RGB/CMYK copy, de-duped theme roles), then roll the same activity item and viewer out to all 17 brand extensions via the theme-factory generator.

**Architecture:** Phase 1 builds the feature for Lucid Labs as a reference implementation — a hand-authored monochrome SVG, a `brandColors` array in `brand.json`, a pure (no-`vscode`) `lib/palette-view.js` module for colour maths and HTML rendering, and a rewritten `extension.js` hosting a `WebviewViewProvider`. Phase 2 extracts the pure module and a templated `extension.js` into `templates/`, adds generator helpers in `scripts/lib/extension-build.js`, and teaches `scripts/generate.js` to emit `extension.js` + `activity-icon.svg` per brand and patch each `package.json` `contributes` block. Brands without `brandColors` degrade gracefully (Theme Roles section only).

**Tech Stack:** Node.js 24 (built-in `node:test`), VS Code Extension API (`WebviewViewProvider`, webview messaging), plain CommonJS — no new runtime dependencies.

---

## File Structure

| File | Responsibility |
|---|---|
| `extensions/lucid-labs/lib/palette-view.js` | Pure module: hex/RGB/CMYK conversion, role de-dup, palette HTML rendering. No `vscode` import. (Phase 1) |
| `extensions/lucid-labs/test/palette-view.test.js` | `node:test` unit tests for the pure module. (Phase 1) |
| `extensions/lucid-labs/extension.js` | VS Code host wiring: `WebviewViewProvider`, commands, status bar, message-based clipboard copy. (Phase 1, rewritten) |
| `brands/lucid-labs/activity-icon.svg` | Hand-authored monochrome cloud-and-arrows mark. (Phase 1) |
| `brands/lucid-labs/brand.json` | Gains a `brandColors` array. (Phase 1) |
| `templates/lib/palette-view.js` | Phase 2 home of the pure module — copied verbatim to every extension. |
| `templates/extension.js` | Phase 2 templated host wiring with `__PLACEHOLDER__` tokens. |
| `scripts/lib/extension-build.js` | Phase 2 pure generator helpers: namespacing, monochrome SVG transform, `contributes` merge, `extension.js` rendering. |
| `scripts/test/extension-build.test.js` | `node:test` unit tests for the generator helpers. (Phase 2) |
| `scripts/generate.js` | Phase 2: emits `extension.js`, `activity-icon.svg`, `lib/palette-view.js` per brand; patches `package.json`. |

---

# PHASE 1 — Lucid Labs reference implementation

## Task 1: Add the `node:test` harness

**Files:**
- Modify: `package.json` (root)
- Modify: `.husky/pre-commit`

- [ ] **Step 1: Add the `test` script**

In the root `package.json`, add a `test` entry to `scripts` (place it after `lint`):

```json
  "scripts": {
    "generate": "node scripts/generate.js",
    "lint": "node scripts/lint-themes.js",
    "test": "node --test",
    "package:all": "for dir in extensions/*/; do (cd \"$dir\" && vsce package); done",
    "prepare": "husky || true"
  },
```

- [ ] **Step 2: Make the pre-commit hook run tests**

Replace the entire contents of `.husky/pre-commit` with:

```sh
npm run generate && npm run lint && npm test
```

- [ ] **Step 3: Verify the test runner works with no tests yet**

Run: `npm test`
Expected: exits 0 with output like `tests 0` / `pass 0` (no test files exist yet — this confirms the runner is wired).

- [ ] **Step 4: Commit**

```bash
git add package.json .husky/pre-commit
git commit -m "build: add node:test harness and run it in pre-commit"
```

---

## Task 2: Hand-author the monochrome activity-bar icon

**Files:**
- Create: `brands/lucid-labs/activity-icon.svg` (overwrites the existing "L+K" file)

The source mark is `brands/lucid-labs/icons/git.svg` (cloud ring + two exchange arrows, authored with `{{accent}}`/`{{keyword}}` placeholders). The activity-bar version must be a single colour: set `fill="currentColor"` on the root `<svg>` and remove every per-path `fill` so all paths inherit. VS Code tints the result with the theme foreground.

- [ ] **Step 1: Write the icon file**

Overwrite `brands/lucid-labs/activity-icon.svg` with exactly:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" fill="currentColor">
  <path d="M131.1,127.2h-20.9l6.5-6.6c6.8-6.9,7.5-8.2,5.5-11.1-.6-1-1.6-1.4-3-1.4s-3.4,1.3-13.1,11.1c-8.1,8.1-11,11.5-11,12.6s2.9,4.5,11,12.6c11.8,11.8,13,12.6,15.9,9.8,2.5-2.5,1.7-4.2-5.2-11.2l-6.5-6.6h20.5c19.8,0,20.5,0,22.2-1.3,2-1.6,2.2-4.5.4-6.3-1.2-1.2-2.1-1.3-22.2-1.3h0Z"/>
  <path d="M176.1,96c-7.2-7.2-11.6-11-12.4-11-2.2,0-4.2,2.1-4.2,4.4s1,3,6.6,8.8l6.6,6.6h-21.1c-11.6,0-21.4.3-21.8.5-2.4,1.6-2.6,6-.3,7.2.9.5,8.4.7,22.2.6h20.9l-6.8,6.9c-4.2,4.3-6.8,7.5-6.8,8.2,0,2.2,2.1,4.2,4.5,4.2s3.3-1.2,12.9-10.8c9.1-9.2,10.8-11.2,10.8-12.8s-1.7-3.6-11.1-12.9h0Z"/>
  <path d="M255.5,85.1l-2.7-.5-.8-3.9c-2.3-11.4-9.9-23-19-29.2-12.3-8.4-25.3-10.7-40.4-7.2-1.9.4-2.1.2-5.1-4.3-4.2-6.1-14.1-16.1-19.8-19.8-10-6.6-21.5-11.2-32.3-13-17-2.8-34.8.2-49.9,8.1-8.1,4.3-13.4,8.2-19.9,15-13.3,13.8-20.9,30.5-22.2,48.8l-.5,5.8-6.1,2c-16,5.3-27.3,15.8-33.3,30.8-8.6,21.3-1.9,46.5,15.9,60.7,4.4,3.4,13.4,8.1,19.6,10l4.5,1.4,100.1.3c66.6.1,102.6,0,107.5-.5,4.5-.4,9.5-1.3,12.5-2.2,16.5-5.3,29.3-18.5,34.5-35.8,1.5-5,1.7-6.8,1.7-14.4s-.3-9.4-1.7-14.4c-6-20-22.2-34.4-42.6-37.9h0ZM287,148.9c-4.2,13.3-13.8,23.2-27,27.8l-5.4,1.9-102.3.2c-114.7.2-107.7.5-118-4.5-4.4-2.1-6.4-3.6-10.9-8.1-6.1-6.2-8.8-10.8-10.9-19-5.9-23.3,10.3-47.3,34.3-50.7,3.3-.5,4.7-1,6-2.3,1.6-1.5,1.7-2,2.1-11.1.6-13,3.4-22.9,9.6-33.2,9.7-16.2,28.6-28.6,48.5-31.7,4-.6,16.3-.4,21.2.5,18.3,3.2,35,14.3,45.2,30.1,6.5,10,6.3,9.9,13.4,7.5,9.6-3.2,19.8-2.7,28.8,1.5,4.5,2.1,13.1,10.5,15.7,15.4,2.1,4,4.3,12.1,4.3,16s.4,3.2,1.8,4.6c1.5,1.5,2.4,1.9,6.8,2.2,5.8.5,13.2,2.8,17.9,5.5,8.2,4.7,15.5,13.9,18.7,23.3,2.4,7.2,2.5,17,.3,24h0Z"/>
</svg>
```

- [ ] **Step 2: Verify it is well-formed XML with no per-path fills**

Run: `node -e "const s=require('fs').readFileSync('brands/lucid-labs/activity-icon.svg','utf8'); if(/fill=\"#/.test(s)||/\{\{/.test(s)) throw new Error('icon has non-currentColor fills'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Propagate to the extension and verify the copy**

Run: `npm run generate -- --brand lucid-labs && diff brands/lucid-labs/activity-icon.svg extensions/lucid-labs/activity-icon.svg && echo "copied ok"`
Expected: `Generating lucid-labs...` output followed by `copied ok` (the generator copies `activity-icon.svg` into the extension dir).

- [ ] **Step 4: Commit**

```bash
git add brands/lucid-labs/activity-icon.svg extensions/lucid-labs/activity-icon.svg
git commit -m "feat(lucid-labs): replace activity-bar icon with cloud-and-arrows brand mark"
```

---

## Task 3: Add the `brandColors` array to `brand.json`

**Files:**
- Modify: `brands/lucid-labs/brand.json`

Values are taken verbatim from the brand guide's `brandColorMeta` (Pantone-matched CMYK). The array goes at the top level of the brand config, after the `sponsor` field and before `dark`.

- [ ] **Step 1: Insert the `brandColors` array**

In `brands/lucid-labs/brand.json`, add this key immediately after `"sponsor": "https://lucidlabs.com.au",`:

```json
  "brandColors": [
    { "key": "primary", "name": "Deep Purple", "hex": "#271D3B", "rgb": [39, 29, 59], "cmyk": [34, 51, 0, 77], "pantone": "5255 C", "group": "primary", "role": "Wordmark / dark page background / heading text on light surfaces" },
    { "key": "teal", "name": "Teal Green", "hex": "#339999", "rgb": [51, 153, 153], "cmyk": [67, 0, 0, 40], "pantone": "321 C", "group": "primary", "role": "Accent / hyperlink / highlight / heading rule on dark backgrounds" },
    { "key": "purple", "name": "Vivid Purple", "hex": "#7454B3", "rgb": [116, 84, 179], "cmyk": [35, 53, 0, 30], "pantone": "2665 C", "group": "primary", "role": "Accent — CTA / brand mark" },
    { "key": "blue", "name": "Lucid Blue", "hex": "#677EB2", "rgb": [103, 126, 178], "cmyk": [41, 29, 0, 30], "pantone": "2129 C", "group": "secondary", "role": "Accent — secondary / supporting" },
    { "key": "lightGrey", "name": "Light Grey", "hex": "#CCCCCC", "rgb": [204, 204, 204], "cmyk": [0, 0, 0, 20], "pantone": "Cool Gray 3 C", "group": "secondary", "role": "Footer text, secondary information, muted captions" },
    { "key": "nearBlack", "name": "Near Black", "hex": "#101820", "rgb": [16, 24, 32], "cmyk": [50, 25, 0, 87], "pantone": "Black 6 C", "group": "secondary", "role": "Maximum-contrast text on light, body chrome on dark" },
    { "key": "white", "name": "White", "hex": "#FFFFFF", "rgb": [255, 255, 255], "cmyk": [0, 0, 0, 0], "pantone": "", "group": "secondary", "role": "Light surfaces / reversed text" },
    { "key": "red", "name": "Warm Accent", "hex": "#FF4B46", "rgb": [255, 75, 70], "cmyk": [0, 75, 70, 0], "pantone": "Warm Red C", "group": "other", "role": "Warnings, risk callouts, attention markers" },
    { "key": "gold", "name": "Lucid Gold", "hex": "#D4A843", "rgb": [212, 168, 67], "cmyk": [10, 25, 80, 15], "pantone": "7752 C", "group": "other", "role": "Warn / highlight badges (derived — not in v1 brand guide)" },
    { "key": "darkTeal", "name": "Dark Teal", "hex": "#3B7F80", "rgb": [59, 127, 128], "cmyk": [70, 15, 30, 40], "pantone": "7474 C", "group": "other", "role": "Accent depth (derived — not in v1 brand guide)" }
  ],
```

- [ ] **Step 2: Verify the JSON still parses and the array is intact**

Run: `node -e "const b=require('./brands/lucid-labs/brand.json'); if(b.brandColors.length!==10) throw new Error('expected 10 brand colours'); console.log('ok', b.brandColors.length)"`
Expected: `ok 10`

- [ ] **Step 3: Propagate to the extension**

Run: `npm run generate -- --brand lucid-labs && node -e "if(require('./extensions/lucid-labs/brand.json').brandColors.length!==10) throw new Error('not copied'); console.log('copied ok')"`
Expected: generator output followed by `copied ok`.

- [ ] **Step 4: Commit**

```bash
git add brands/lucid-labs/brand.json extensions/lucid-labs/brand.json
git commit -m "feat(lucid-labs): add canonical brandColors palette to brand config"
```

---

## Task 4: Pure module — colour conversion helpers

**Files:**
- Create: `extensions/lucid-labs/lib/palette-view.js`
- Test: `extensions/lucid-labs/test/palette-view.test.js`

- [ ] **Step 1: Write the failing tests**

Create `extensions/lucid-labs/test/palette-view.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const pv = require('../lib/palette-view');

test('hexToRgb parses a 6-digit hex', () => {
  assert.deepEqual(pv.hexToRgb('#339999'), [51, 153, 153]);
});

test('hexToRgb ignores an 8-digit alpha suffix', () => {
  assert.deepEqual(pv.hexToRgb('#CCCCCC80'), [204, 204, 204]);
});

test('rgbToCmyk converts teal to the expected percentages', () => {
  assert.deepEqual(pv.rgbToCmyk([51, 153, 153]), [67, 0, 0, 40]);
});

test('rgbToCmyk converts pure black to 0,0,0,100', () => {
  assert.deepEqual(pv.rgbToCmyk([0, 0, 0]), [0, 0, 0, 100]);
});

test('formatHex upper-cases and trims to 6 digits', () => {
  assert.equal(pv.formatHex('#cccccc80'), '#CCCCCC');
});

test('formatRgb renders a CSS rgb() string', () => {
  assert.equal(pv.formatRgb([51, 153, 153]), 'rgb(51, 153, 153)');
});

test('formatCmyk renders a percentage string', () => {
  assert.equal(pv.formatCmyk([67, 0, 0, 40]), 'cmyk(67%, 0%, 0%, 40%)');
});

test('escapeHtml neutralises angle brackets and quotes', () => {
  assert.equal(pv.escapeHtml('<a "b">'), '&lt;a &quot;b&quot;&gt;');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test extensions/lucid-labs/test/palette-view.test.js`
Expected: FAIL — `Cannot find module '../lib/palette-view'`.

- [ ] **Step 3: Write the minimal implementation**

Create `extensions/lucid-labs/lib/palette-view.js`:

```js
'use strict';

/** Parse a #RRGGBB or #RRGGBBAA hex string into [r, g, b] (alpha ignored). */
function hexToRgb(hex) {
  const h = String(hex).replace('#', '').slice(0, 6);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Naive RGB->CMYK conversion (no ICC profile). Returns integer percentages. */
function rgbToCmyk([r, g, b]) {
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);
  if (k === 1) return [0, 0, 0, 100];
  return [
    Math.round(((1 - rp - k) / (1 - k)) * 100),
    Math.round(((1 - gp - k) / (1 - k)) * 100),
    Math.round(((1 - bp - k) / (1 - k)) * 100),
    Math.round(k * 100),
  ];
}

/** Normalise any hex to an upper-case #RRGGBB string. */
function formatHex(hex) {
  return '#' + String(hex).replace('#', '').slice(0, 6).toUpperCase();
}

/** Render [r,g,b] as a CSS rgb() string. */
function formatRgb([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
}

/** Render [c,m,y,k] as a cmyk() percentage string. */
function formatCmyk([c, m, y, k]) {
  return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
}

/** Escape a string for safe interpolation into HTML text/attributes. */
function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]
  ));
}

module.exports = {
  hexToRgb,
  rgbToCmyk,
  formatHex,
  formatRgb,
  formatCmyk,
  escapeHtml,
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test extensions/lucid-labs/test/palette-view.test.js`
Expected: PASS — 8 passing tests.

- [ ] **Step 5: Commit**

```bash
git add extensions/lucid-labs/lib/palette-view.js extensions/lucid-labs/test/palette-view.test.js
git commit -m "feat(lucid-labs): add colour-format helpers to palette-view module"
```

---

## Task 5: Pure module — de-duplicate theme roles by hex

**Files:**
- Modify: `extensions/lucid-labs/lib/palette-view.js`
- Test: `extensions/lucid-labs/test/palette-view.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `extensions/lucid-labs/test/palette-view.test.js`:

```js
test('dedupeRoles groups roles that share a hex', () => {
  const result = pv.dedupeRoles({
    accent: '#339999',
    function: '#339999',
    keyword: '#9B7ED9',
  });
  assert.deepEqual(result, [
    { hex: '#339999', roles: ['accent', 'function'] },
    { hex: '#9B7ED9', roles: ['keyword'] },
  ]);
});

test('dedupeRoles ignores non-string and non-hex values', () => {
  const result = pv.dedupeRoles({
    accent: '#339999',
    terminal: { black: '#000000' },
    name: 'Lucid Labs',
  });
  assert.deepEqual(result, [{ hex: '#339999', roles: ['accent'] }]);
});

test('dedupeRoles collapses 8-digit alpha hexes onto their 6-digit colour', () => {
  const result = pv.dedupeRoles({
    comment: '#CCCCCC',
    commentToken: '#CCCCCC80',
  });
  assert.deepEqual(result, [{ hex: '#CCCCCC', roles: ['comment', 'commentToken'] }]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test extensions/lucid-labs/test/palette-view.test.js`
Expected: FAIL — `pv.dedupeRoles is not a function`.

- [ ] **Step 3: Write the minimal implementation**

In `extensions/lucid-labs/lib/palette-view.js`, add this function before `module.exports`:

```js
/**
 * Collapse a variant's role->colour map into one entry per unique colour.
 * Only top-level string values matching #RRGGBB(AA) are included; alpha is
 * dropped so #CCCCCC80 groups with #CCCCCC. First-seen order is preserved.
 */
function dedupeRoles(variantColours) {
  const byHex = new Map();
  for (const [role, value] of Object.entries(variantColours)) {
    if (typeof value !== 'string') continue;
    if (!/^#[0-9A-Fa-f]{6,8}$/.test(value)) continue;
    const hex = formatHex(value);
    if (!byHex.has(hex)) byHex.set(hex, []);
    byHex.get(hex).push(role);
  }
  return [...byHex.entries()].map(([hex, roles]) => ({ hex, roles }));
}
```

Then add `dedupeRoles` to the `module.exports` object:

```js
module.exports = {
  hexToRgb,
  rgbToCmyk,
  formatHex,
  formatRgb,
  formatCmyk,
  escapeHtml,
  dedupeRoles,
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test extensions/lucid-labs/test/palette-view.test.js`
Expected: PASS — 11 passing tests.

- [ ] **Step 5: Commit**

```bash
git add extensions/lucid-labs/lib/palette-view.js extensions/lucid-labs/test/palette-view.test.js
git commit -m "feat(lucid-labs): add hex de-duplication of theme roles"
```

---

## Task 6: Pure module — render the palette webview HTML

**Files:**
- Modify: `extensions/lucid-labs/lib/palette-view.js`
- Test: `extensions/lucid-labs/test/palette-view.test.js`

`renderPaletteHtml` builds the complete webview document. It renders a **Brand Colours** section (three `group` sub-sections) only when `brandColors` is a non-empty array, and always renders **Theme Roles** for both variants (CSS hides the inactive one; a toggle flips `body[data-variant]`). Copy buttons carry the value in `data-copy`; a nonce'd script posts it to the extension host.

- [ ] **Step 1: Write the failing tests**

Append to `extensions/lucid-labs/test/palette-view.test.js`:

```js
const SAMPLE = {
  dark: { accent: '#339999', function: '#339999', keyword: '#9B7ED9' },
  light: { accent: '#2B8282', keyword: '#7454B3' },
};
const BRAND_COLOURS = [
  { name: 'Teal Green', hex: '#339999', rgb: [51, 153, 153], cmyk: [67, 0, 0, 40], pantone: '321 C', group: 'primary', role: 'Accent' },
  { name: 'Lucid Blue', hex: '#677EB2', rgb: [103, 126, 178], cmyk: [41, 29, 0, 30], pantone: '2129 C', group: 'secondary', role: 'Secondary' },
];

test('renderPaletteHtml includes the Brand Colours section when brandColors given', () => {
  const html = pv.renderPaletteHtml({
    brandName: 'Lucid Labs', palette: SAMPLE, activeVariant: 'dark',
    brandColors: BRAND_COLOURS, nonce: 'abc123', cspSource: 'vscode-webview://x',
  });
  assert.match(html, /Brand Colours/);
  assert.match(html, /Primary Palette/);
  assert.match(html, /Secondary Palette/);
  assert.match(html, /Teal Green/);
  assert.match(html, /PANTONE 321 C/);
});

test('renderPaletteHtml omits the Brand Colours section when brandColors absent', () => {
  const html = pv.renderPaletteHtml({
    brandName: 'Acme', palette: SAMPLE, activeVariant: 'dark',
    brandColors: undefined, nonce: 'abc123', cspSource: 'vscode-webview://x',
  });
  assert.doesNotMatch(html, /Brand Colours/);
  assert.match(html, /Theme Roles/);
});

test('renderPaletteHtml de-dups roles and labels brand-matched colours', () => {
  const html = pv.renderPaletteHtml({
    brandName: 'Lucid Labs', palette: SAMPLE, activeVariant: 'dark',
    brandColors: BRAND_COLOURS, nonce: 'abc123', cspSource: 'vscode-webview://x',
  });
  // #339999 used by accent + function -> one card, both roles, brand name shown
  assert.match(html, /accent · function/);
  assert.match(html, /Teal Green/);
});

test('renderPaletteHtml embeds the nonce on the script tag and a CSP', () => {
  const html = pv.renderPaletteHtml({
    brandName: 'Lucid Labs', palette: SAMPLE, activeVariant: 'dark',
    brandColors: BRAND_COLOURS, nonce: 'abc123', cspSource: 'vscode-webview://x',
  });
  assert.match(html, /<script nonce="abc123">/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /nonce-abc123/);
});

test('renderPaletteHtml sets the initial variant on the body', () => {
  const html = pv.renderPaletteHtml({
    brandName: 'Lucid Labs', palette: SAMPLE, activeVariant: 'light',
    brandColors: BRAND_COLOURS, nonce: 'n', cspSource: 'x',
  });
  assert.match(html, /<body data-variant="light">/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test extensions/lucid-labs/test/palette-view.test.js`
Expected: FAIL — `pv.renderPaletteHtml is not a function`.

- [ ] **Step 3: Write the minimal implementation**

In `extensions/lucid-labs/lib/palette-view.js`, add these functions before `module.exports`:

```js
/** Build the three copy buttons for a colour, given pre-formatted strings. */
function copyButtons(fmt) {
  return ['hex', 'rgb', 'cmyk']
    .map((k) => `<button class="copy" data-copy="${escapeHtml(fmt[k])}">${k.toUpperCase()}</button>`)
    .join('');
}

/** Format a colour for display, preferring supplied rgb/cmyk over derived. */
function colourFormats(hex, rgb, cmyk) {
  const r = rgb || hexToRgb(hex);
  const c = cmyk || rgbToCmyk(r);
  return { hex: formatHex(hex), rgb: formatRgb(r), cmyk: formatCmyk(c) };
}

/** One card for a named brand colour. */
function brandCard(c) {
  const fmt = colourFormats(c.hex, c.rgb, c.cmyk);
  const pantone = c.pantone
    ? `<span class="pantone">PANTONE ${escapeHtml(c.pantone)}</span>` : '';
  return `<div class="card">
    <span class="chip" style="background:${escapeHtml(formatHex(c.hex))}"></span>
    <div class="meta">
      <span class="name">${escapeHtml(c.name)}</span>
      <span class="role">${escapeHtml(c.role || '')}</span>
      <span class="hex">${fmt.hex}</span>${pantone}
      <div class="copies">${copyButtons(fmt)}</div>
    </div>
  </div>`;
}

/** One card for a de-duped theme-role colour. */
function roleCard(entry, brandColors) {
  const fmt = colourFormats(entry.hex);
  const match = (brandColors || []).find((c) => formatHex(c.hex) === entry.hex);
  const title = match ? escapeHtml(match.name) : entry.hex;
  return `<div class="card">
    <span class="chip" style="background:${entry.hex}"></span>
    <div class="meta">
      <span class="name">${title}</span>
      <span class="role">${entry.roles.map(escapeHtml).join(' · ')}</span>
      <span class="hex">${fmt.hex}</span>
      <div class="copies">${copyButtons(fmt)}</div>
    </div>
  </div>`;
}

/** Render the Brand Colours section (three group sub-sections), or '' if none. */
function brandSection(brandColors) {
  if (!Array.isArray(brandColors) || brandColors.length === 0) return '';
  const groups = [
    ['primary', 'Primary Palette'],
    ['secondary', 'Secondary Palette'],
    ['other', 'Other Palette'],
  ];
  const blocks = groups.map(([key, label]) => {
    const cards = brandColors.filter((c) => c.group === key).map(brandCard).join('');
    return cards ? `<h3>${label}</h3><div class="grid">${cards}</div>` : '';
  }).join('');
  return `<h2>Brand Colours</h2>${blocks}`;
}

/**
 * Render the full palette webview document.
 * opts: { brandName, palette, activeVariant, brandColors, nonce, cspSource }
 *   palette — the brand.json object (has .dark and .light role maps)
 *   brandColors — optional array; Brand Colours section omitted when absent
 */
function renderPaletteHtml(opts) {
  const { brandName, palette, activeVariant, brandColors, nonce, cspSource } = opts;
  const darkCards = dedupeRoles(palette.dark || {})
    .map((e) => roleCard(e, brandColors)).join('');
  const lightCards = dedupeRoles(palette.light || {})
    .map((e) => roleCard(e, brandColors)).join('');
  const csp = `default-src 'none'; style-src ${cspSource} 'unsafe-inline'; `
    + `script-src 'nonce-${nonce}';`;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background); margin: 0; padding: 12px; }
  h1 { font-size: 15px; margin: 0 0 12px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em;
    margin: 18px 0 6px; color: var(--vscode-descriptionForeground); }
  h3 { font-size: 12px; margin: 10px 0 4px; color: var(--vscode-descriptionForeground); }
  .grid { display: flex; flex-direction: column; gap: 6px; }
  .card { display: flex; gap: 8px; padding: 8px; border-radius: 6px;
    background: var(--vscode-editorWidget-background);
    border: 1px solid var(--vscode-editorWidget-border); }
  .chip { flex: 0 0 32px; height: 32px; border-radius: 4px;
    border: 1px solid var(--vscode-editorWidget-border); }
  .meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .name { font-weight: 600; font-size: 12px; }
  .role { font-size: 11px; color: var(--vscode-descriptionForeground); }
  .hex { font-family: var(--vscode-editor-font-family); font-size: 11px; }
  .pantone { font-size: 10px; color: var(--vscode-descriptionForeground); }
  .copies { display: flex; gap: 4px; margin-top: 4px; }
  button.copy { font-size: 10px; padding: 2px 6px; cursor: pointer;
    color: var(--vscode-button-secondaryForeground);
    background: var(--vscode-button-secondaryBackground); border: none; border-radius: 3px; }
  button.copy:hover { background: var(--vscode-button-secondaryHoverBackground); }
  .toggle { display: inline-flex; gap: 4px; margin-left: 8px; }
  .toggle button { font-size: 10px; padding: 2px 8px; cursor: pointer;
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground); border: none; border-radius: 3px; }
  .toggle button.active { background: var(--vscode-button-background);
    color: var(--vscode-button-foreground); }
  .roles-header { display: flex; align-items: center; }
  body[data-variant="dark"] .roles-light { display: none; }
  body[data-variant="light"] .roles-dark { display: none; }
  .note { font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 12px; }
</style></head>
<body data-variant="${escapeHtml(activeVariant)}">
<h1>${escapeHtml(brandName)} — Brand Palette</h1>
${brandSection(brandColors)}
<div class="roles-header"><h2>Theme Roles</h2>
  <span class="toggle">
    <button data-variant="dark">Dark</button>
    <button data-variant="light">Light</button>
  </span>
</div>
<div class="grid roles-dark">${darkCards}</div>
<div class="grid roles-light">${lightCards}</div>
<p class="note">Role CMYK is an approximate RGB&rarr;CMYK conversion (no ICC profile).
Brand-colour CMYK is the exact Pantone-matched value.</p>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  function syncToggle() {
    const v = document.body.dataset.variant;
    document.querySelectorAll('.toggle button').forEach((b) => {
      b.classList.toggle('active', b.dataset.variant === v);
    });
  }
  document.querySelectorAll('.toggle button').forEach((b) => {
    b.addEventListener('click', () => {
      document.body.dataset.variant = b.dataset.variant;
      syncToggle();
    });
  });
  document.querySelectorAll('button.copy').forEach((b) => {
    b.addEventListener('click', () => {
      vscode.postMessage({ type: 'copy', value: b.dataset.copy });
    });
  });
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'variant') {
      document.body.dataset.variant = e.data.value;
      syncToggle();
    }
  });
  syncToggle();
</script>
</body></html>`;
}
```

Then add `renderPaletteHtml` to `module.exports`:

```js
module.exports = {
  hexToRgb,
  rgbToCmyk,
  formatHex,
  formatRgb,
  formatCmyk,
  escapeHtml,
  dedupeRoles,
  renderPaletteHtml,
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test extensions/lucid-labs/test/palette-view.test.js`
Expected: PASS — 16 passing tests.

- [ ] **Step 5: Commit**

```bash
git add extensions/lucid-labs/lib/palette-view.js extensions/lucid-labs/test/palette-view.test.js
git commit -m "feat(lucid-labs): render grouped brand palette + de-duped theme roles as webview HTML"
```

---

## Task 7: Rewrite `extension.js` to host the webview view

**Files:**
- Modify: `extensions/lucid-labs/extension.js` (full rewrite)

The tree provider is replaced by a `WebviewViewProvider`. View/container IDs adopt the
final scheme so Phase 2 needs no rename: namespace `lucidLabsTheme`, container
`lucidLabsThemeContainer`, view `lucidLabsThemePalette`.

- [ ] **Step 1: Replace the file contents**

Overwrite `extensions/lucid-labs/extension.js` with:

```js
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pv = require('./lib/palette-view');

const BRAND = 'Lucid Labs';
const THEME_DARK = 'Lucid Labs Dark';
const THEME_LIGHT = 'Lucid Labs Light';
const CONFIG_NS = 'lucidLabsTheme';
const VIEW_ID = 'lucidLabsThemePalette';

let brandData;

function loadBrand(extensionPath) {
  if (brandData) return brandData;
  brandData = JSON.parse(fs.readFileSync(path.join(extensionPath, 'brand.json'), 'utf8'));
  return brandData;
}

function activeThemeName() {
  return vscode.workspace.getConfiguration().get('workbench.colorTheme') || '';
}

function isBrandActive() {
  const name = activeThemeName();
  return name === THEME_DARK || name === THEME_LIGHT;
}

function activeVariant() {
  return activeThemeName() === THEME_LIGHT ? 'light' : 'dark';
}

async function setTheme(label) {
  await vscode.workspace
    .getConfiguration()
    .update('workbench.colorTheme', label, vscode.ConfigurationTarget.Global);
}

function makeStatusBarItem(context) {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = `${CONFIG_NS}.openAbout`;
  item.tooltip = `${BRAND} theme — click for the brand palette`;
  context.subscriptions.push(item);
  return item;
}

function refreshStatusBar(item) {
  const cfg = vscode.workspace.getConfiguration(CONFIG_NS);
  if (!cfg.get('showStatusBarItem', true) || !isBrandActive()) {
    item.hide();
    return;
  }
  item.text = `$(symbol-color) ${BRAND} · ${activeVariant() === 'dark' ? 'Dark' : 'Light'}`;
  item.show();
}

/** Build the webview HTML for a given webview instance. */
function renderHtml(extensionPath, webview) {
  const brand = loadBrand(extensionPath);
  return pv.renderPaletteHtml({
    brandName: brand.displayName || BRAND,
    palette: brand,
    activeVariant: activeVariant(),
    brandColors: brand.brandColors,
    nonce: crypto.randomBytes(16).toString('hex'),
    cspSource: webview.cspSource,
  });
}

/** Wire copy messages from a webview to the clipboard. */
function attachCopyHandler(webview, subscriptions) {
  subscriptions.push(
    webview.onDidReceiveMessage(async (msg) => {
      if (msg && msg.type === 'copy' && msg.value) {
        await vscode.env.clipboard.writeText(msg.value);
        vscode.window.setStatusBarMessage(`Copied ${msg.value}`, 1500);
      }
    }),
  );
}

class PaletteViewProvider {
  constructor(extensionPath) {
    this.extensionPath = extensionPath;
    this.view = null;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = renderHtml(this.extensionPath, webviewView.webview);
    attachCopyHandler(webviewView.webview, []);
  }

  /** Tell the live view which variant the editor is now on. */
  notifyVariant() {
    if (this.view) {
      this.view.webview.postMessage({ type: 'variant', value: activeVariant() });
    }
  }
}

function openAbout(context) {
  const panel = vscode.window.createWebviewPanel(
    'lucidLabsAbout',
    `${BRAND} — Brand Palette`,
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: false },
  );
  panel.webview.html = renderHtml(context.extensionPath, panel.webview);
  attachCopyHandler(panel.webview, context.subscriptions);
}

function activate(context) {
  const statusBar = makeStatusBarItem(context);
  refreshStatusBar(statusBar);

  const provider = new PaletteViewProvider(context.extensionPath);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, provider),
    vscode.window.onDidChangeActiveColorTheme(() => {
      refreshStatusBar(statusBar);
      provider.notifyVariant();
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(`${CONFIG_NS}.showStatusBarItem`)) {
        refreshStatusBar(statusBar);
      }
    }),
    vscode.commands.registerCommand(`${CONFIG_NS}.switchDark`, () => setTheme(THEME_DARK)),
    vscode.commands.registerCommand(`${CONFIG_NS}.switchLight`, () => setTheme(THEME_LIGHT)),
    vscode.commands.registerCommand(`${CONFIG_NS}.toggleVariant`, () =>
      setTheme(activeVariant() === 'dark' ? THEME_LIGHT : THEME_DARK),
    ),
    vscode.commands.registerCommand(`${CONFIG_NS}.openAbout`, () => openAbout(context)),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
```

- [ ] **Step 2: Verify the file is syntactically valid**

Run: `node --check extensions/lucid-labs/extension.js && echo "syntax ok"`
Expected: `syntax ok`

- [ ] **Step 3: Verify the pure module still loads and tests pass**

Run: `npm test`
Expected: PASS — 16 tests (the rewrite did not touch `lib/palette-view.js`).

- [ ] **Step 4: Commit**

```bash
git add extensions/lucid-labs/extension.js
git commit -m "feat(lucid-labs): host brand palette as a webview view with clipboard copy"
```

---

## Task 8: Update `package.json`, changelog, regenerate and verify

**Files:**
- Modify: `extensions/lucid-labs/package.json`
- Modify: `extensions/lucid-labs/CHANGELOG.md`

- [ ] **Step 1: Change the palette view to a webview type**

In `extensions/lucid-labs/package.json`, replace the `views` block with:

```json
    "views": {
      "lucidLabsThemeContainer": [
        {
          "id": "lucidLabsThemePalette",
          "name": "Brand Palette",
          "type": "webview",
          "icon": "activity-icon.svg",
          "contextualTitle": "Lucid Labs"
        }
      ]
    },
```

- [ ] **Step 2: Update the view-title menu binding to the new view id**

In the same file, replace the `menus` block with:

```json
    "menus": {
      "view/title": [
        {
          "command": "lucidLabsTheme.openAbout",
          "when": "view == lucidLabsThemePalette",
          "group": "navigation"
        }
      ]
    },
```

- [ ] **Step 3: Rename the `openAbout` command title**

In the `commands` array, change the `openAbout` entry's title so it matches the value the
Phase 2 generator will produce (this keeps regeneration idempotent — see Task 13 Step 3).
Replace:

```json
        {
          "command": "lucidLabsTheme.openAbout",
          "title": "Open Theme Reference",
          "category": "Lucid Labs",
          "icon": "$(symbol-color)"
        }
```

with:

```json
        {
          "command": "lucidLabsTheme.openAbout",
          "title": "Open Brand Palette",
          "category": "Lucid Labs",
          "icon": "$(symbol-color)"
        }
```

- [ ] **Step 4: Bump the version**

In `extensions/lucid-labs/package.json`, change `"version": "1.14.1"` to `"version": "1.15.0"`.

- [ ] **Step 5: Add a changelog entry**

At the top of the entries in `extensions/lucid-labs/CHANGELOG.md`, add:

```markdown
## [1.15.0]

### Added

- Brand Palette sidebar view: canonical Lucid Labs colours grouped into Primary,
  Secondary and Other palettes, with HEX / RGB / CMYK one-click copy and PANTONE
  references.
- Theme Roles section with a Dark/Light toggle and hex de-duplication, so each
  colour appears once with every role that uses it.

### Changed

- Activity-bar icon is now the Lucid Labs cloud-and-arrows brand mark.
```

- [ ] **Step 6: Regenerate, lint and test**

Run: `npm run generate -- --brand lucid-labs && npm run lint && npm test`
Expected: generator output, `No issues found.`, and 16 passing tests.

- [ ] **Step 7: Verify the extension packages cleanly**

Run: `cd extensions/lucid-labs && vsce package --out /tmp/lucid-labs-1.15.0.vsix && cd ../.. && echo "packaged ok"`
Expected: `packaged ok` (requires `@vscode/vsce` installed globally; if absent, run `npm install -g @vscode/vsce` first).

- [ ] **Step 8: Manual verification in the Extension Development Host**

Open `extensions/lucid-labs` in VS Code and press `F5`. In the dev host:
- Confirm the activity bar shows the cloud-and-arrows icon (not the old "L" mark).
- Open the **Brand Palette** view: confirm Primary/Secondary/Other sub-sections, the
  PANTONE labels, and the Theme Roles section below.
- Click a `HEX`/`RGB`/`CMYK` button — confirm the `Copied …` status-bar message and that
  the clipboard holds the value.
- Click the Dark/Light toggle — confirm the Theme Roles list swaps without changing the
  editor theme.

- [ ] **Step 9: Commit**

```bash
git add extensions/lucid-labs/package.json extensions/lucid-labs/CHANGELOG.md
git commit -m "feat(lucid-labs): ship webview palette view, bump to 1.15.0"
```

**Phase 1 is complete and independently shippable here.**

---

# PHASE 2 — Fleet rollout to all 17 brands

## Task 9: Extract the pure module and templated `extension.js` into `templates/`

**Files:**
- Create: `templates/lib/palette-view.js` (copy of the Phase 1 module)
- Create: `templates/extension.js` (Phase 1 `extension.js` with placeholder tokens)

- [ ] **Step 1: Copy the pure module into `templates/lib/`**

Run: `mkdir -p templates/lib && cp extensions/lucid-labs/lib/palette-view.js templates/lib/palette-view.js && echo "copied"`
Expected: `copied`. This file is brand-agnostic and will be copied verbatim to every extension by the generator.

- [ ] **Step 2: Create the templated `extension.js`**

Run: `cp extensions/lucid-labs/extension.js templates/extension.js && echo "copied"`
Expected: `copied`.

- [ ] **Step 3: Replace the five brand constants with placeholder tokens**

In `templates/extension.js`, replace the constant block:

```js
const BRAND = 'Lucid Labs';
const THEME_DARK = 'Lucid Labs Dark';
const THEME_LIGHT = 'Lucid Labs Light';
const CONFIG_NS = 'lucidLabsTheme';
const VIEW_ID = 'lucidLabsThemePalette';
```

with:

```js
const BRAND = '__BRAND__';
const THEME_DARK = '__THEME_DARK__';
const THEME_LIGHT = '__THEME_LIGHT__';
const CONFIG_NS = '__CONFIG_NS__';
const VIEW_ID = '__VIEW_ID__';
```

- [ ] **Step 4: Verify the template still parses as JS once tokens are filled**

Run: `node -e "const t=require('fs').readFileSync('templates/extension.js','utf8'); const f=t.replace(/__BRAND__/g,'X').replace(/__THEME_DARK__/g,'X Dark').replace(/__THEME_LIGHT__/g,'X Light').replace(/__CONFIG_NS__/g,'xTheme').replace(/__VIEW_ID__/g,'xThemePalette'); new Function(f); console.log('template ok')"`
Expected: `template ok`

- [ ] **Step 5: Commit**

```bash
git add templates/lib/palette-view.js templates/extension.js
git commit -m "refactor: move palette-view module and templated extension.js into templates/"
```

---

## Task 10: Generator helpers — namespacing and monochrome SVG

**Files:**
- Create: `scripts/lib/extension-build.js`
- Test: `scripts/test/extension-build.test.js`

- [ ] **Step 1: Write the failing tests**

Create `scripts/test/extension-build.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const eb = require('../lib/extension-build');

test('camelCase converts a kebab brand key', () => {
  assert.equal(eb.camelCase('new-south-wales'), 'newSouthWales');
  assert.equal(eb.camelCase('charli'), 'charli');
});

test('nsFor appends Theme to the camelCased key', () => {
  assert.equal(eb.nsFor('lucid-labs'), 'lucidLabsTheme');
  assert.equal(eb.nsFor('charli'), 'charliTheme');
});

test('monochromeSvg replaces {{role}} placeholders with currentColor', () => {
  const out = eb.monochromeSvg('<svg><path fill="{{accent}}"/></svg>');
  assert.equal(out, '<svg fill="currentColor"><path/></svg>');
});

test('monochromeSvg replaces literal hex fills with currentColor', () => {
  const out = eb.monochromeSvg('<svg><path fill="#339999"/><path fill="#ABC"/></svg>');
  assert.equal(out, '<svg fill="currentColor"><path/><path/></svg>');
});

test('monochromeSvg leaves an already-monochrome svg unchanged in meaning', () => {
  const out = eb.monochromeSvg('<svg fill="currentColor"><path d="M0 0"/></svg>');
  assert.match(out, /fill="currentColor"/);
  assert.doesNotMatch(out, /fill="currentColor"[^>]*fill="currentColor"/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/test/extension-build.test.js`
Expected: FAIL — `Cannot find module '../lib/extension-build'`.

- [ ] **Step 3: Write the minimal implementation**

Create `scripts/lib/extension-build.js`:

```js
'use strict';

/** kebab-case -> camelCase. */
function camelCase(s) {
  return String(s).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/** Brand key -> command/config namespace, e.g. 'lucid-labs' -> 'lucidLabsTheme'. */
function nsFor(brandKey) {
  return camelCase(brandKey) + 'Theme';
}

/**
 * Turn a brand mark SVG into a single-colour activity-bar icon:
 * strip every per-element fill (template placeholders and literal hex) and set
 * fill="currentColor" once on the root <svg>.
 */
function monochromeSvg(svg) {
  let out = svg.replace(/\s*fill="(\{\{[^}]+\}\}|#[0-9A-Fa-f]{3,8})"/g, '');
  if (/<svg[^>]*\sfill="currentColor"/.test(out)) return out;
  return out.replace(/<svg\b/, '<svg fill="currentColor"');
}

module.exports = { camelCase, nsFor, monochromeSvg };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test scripts/test/extension-build.test.js`
Expected: PASS — 5 passing tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/extension-build.js scripts/test/extension-build.test.js
git commit -m "feat(generator): add namespacing and monochrome-SVG helpers"
```

---

## Task 11: Generator helper — merge the `contributes` block

**Files:**
- Modify: `scripts/lib/extension-build.js`
- Test: `scripts/test/extension-build.test.js`

`mergeContributes` patches a parsed `package.json` object in place: it sets `main`,
`activationEvents`, and the generated `contributes` keys, while preserving `themes`,
`iconThemes`, `keybindings`, `walkthroughs` and every top-level metadata field. It is
idempotent — running it twice yields an identical object.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/test/extension-build.test.js`:

```js
function samplePkg() {
  return {
    name: 'charli-health-theme',
    version: '1.7.0',
    contributes: {
      themes: [
        { label: 'CHARLi Dark', uiTheme: 'vs-dark', path: './themes/charli-dark.json' },
        { label: 'CHARLi Light', uiTheme: 'vs', path: './themes/charli-light.json' },
      ],
      iconThemes: [{ id: 'charli-icons', label: 'CHARLi Icons', path: './icon-theme.json' }],
    },
  };
}

test('mergeContributes sets main and activationEvents', () => {
  const pkg = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  assert.equal(pkg.main, './extension.js');
  assert.ok(pkg.activationEvents.includes('onStartupFinished'));
});

test('mergeContributes adds a namespaced container, webview view and commands', () => {
  const pkg = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  assert.equal(pkg.contributes.viewsContainers.activitybar[0].id, 'charliThemeContainer');
  const view = pkg.contributes.views.charliThemeContainer[0];
  assert.equal(view.id, 'charliThemePalette');
  assert.equal(view.type, 'webview');
  const cmdIds = pkg.contributes.commands.map((c) => c.command);
  assert.deepEqual(cmdIds, [
    'charliTheme.switchDark', 'charliTheme.switchLight',
    'charliTheme.toggleVariant', 'charliTheme.openAbout',
  ]);
});

test('mergeContributes preserves themes and iconThemes', () => {
  const pkg = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  assert.equal(pkg.contributes.themes.length, 2);
  assert.equal(pkg.contributes.iconThemes.length, 1);
});

test('mergeContributes is idempotent', () => {
  const once = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  const twice = eb.mergeContributes(JSON.parse(JSON.stringify(once)), 'charli', 'CHARLi');
  assert.deepEqual(twice, once);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/test/extension-build.test.js`
Expected: FAIL — `eb.mergeContributes is not a function`.

- [ ] **Step 3: Write the minimal implementation**

In `scripts/lib/extension-build.js`, add before `module.exports`:

```js
/** Build the generated contributes keys for a brand. */
function buildContributes(brandKey, displayName) {
  const ns = nsFor(brandKey);
  const container = `${ns}Container`;
  const view = `${ns}Palette`;
  return {
    viewsContainers: {
      activitybar: [
        { id: container, title: displayName, icon: 'activity-icon.svg' },
      ],
    },
    views: {
      [container]: [
        {
          id: view,
          name: 'Brand Palette',
          type: 'webview',
          icon: 'activity-icon.svg',
          contextualTitle: displayName,
        },
      ],
    },
    commands: [
      { command: `${ns}.switchDark`, title: `Switch to ${displayName} Dark`, category: displayName },
      { command: `${ns}.switchLight`, title: `Switch to ${displayName} Light`, category: displayName },
      { command: `${ns}.toggleVariant`, title: 'Toggle Dark/Light Variant', category: displayName },
      { command: `${ns}.openAbout`, title: 'Open Brand Palette', category: displayName, icon: '$(symbol-color)' },
    ],
    configuration: {
      title: `${displayName} Theme`,
      properties: {
        [`${ns}.showStatusBarItem`]: {
          type: 'boolean',
          default: true,
          description: `Show the ${displayName} brand chip in the status bar while a ${displayName} theme is active.`,
        },
      },
    },
    menus: {
      'view/title': [
        { command: `${ns}.openAbout`, when: `view == ${view}`, group: 'navigation' },
      ],
    },
  };
}

/**
 * Patch a parsed package.json: set main/activationEvents and merge the
 * generated contributes keys, preserving themes, iconThemes, keybindings,
 * walkthroughs and all metadata. Idempotent. Returns the same object.
 */
function mergeContributes(pkg, brandKey, displayName) {
  pkg.main = './extension.js';
  const events = new Set(pkg.activationEvents || []);
  events.add('onStartupFinished');
  pkg.activationEvents = [...events];
  pkg.contributes = { ...(pkg.contributes || {}), ...buildContributes(brandKey, displayName) };
  return pkg;
}
```

Then extend `module.exports`:

```js
module.exports = { camelCase, nsFor, monochromeSvg, buildContributes, mergeContributes };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test scripts/test/extension-build.test.js`
Expected: PASS — 9 passing tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/extension-build.js scripts/test/extension-build.test.js
git commit -m "feat(generator): merge namespaced contributes block into package.json"
```

---

## Task 12: Generator helper — render `extension.js` from the template

**Files:**
- Modify: `scripts/lib/extension-build.js`
- Test: `scripts/test/extension-build.test.js`

`renderExtensionJs` fills the `templates/extension.js` placeholders. Theme labels are read
from the extension's own `package.json` `contributes.themes` (by `uiTheme`) so a brand
whose labels differ from `<displayName> Dark` still works.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/test/extension-build.test.js`:

```js
const TEMPLATE = [
  "const BRAND = '__BRAND__';",
  "const THEME_DARK = '__THEME_DARK__';",
  "const THEME_LIGHT = '__THEME_LIGHT__';",
  "const CONFIG_NS = '__CONFIG_NS__';",
  "const VIEW_ID = '__VIEW_ID__';",
].join('\n');

const THEMES = [
  { label: 'CHARLi Dark', uiTheme: 'vs-dark', path: './themes/charli-dark.json' },
  { label: 'CHARLi Light', uiTheme: 'vs', path: './themes/charli-light.json' },
];

test('renderExtensionJs substitutes every placeholder', () => {
  const out = eb.renderExtensionJs(TEMPLATE, 'charli', 'CHARLi', THEMES);
  assert.match(out, /const BRAND = 'CHARLi';/);
  assert.match(out, /const THEME_DARK = 'CHARLi Dark';/);
  assert.match(out, /const THEME_LIGHT = 'CHARLi Light';/);
  assert.match(out, /const CONFIG_NS = 'charliTheme';/);
  assert.match(out, /const VIEW_ID = 'charliThemePalette';/);
  assert.doesNotMatch(out, /__[A-Z_]+__/);
});

test('renderExtensionJs throws when a theme label is missing', () => {
  assert.throws(() => eb.renderExtensionJs(TEMPLATE, 'charli', 'CHARLi', []));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/test/extension-build.test.js`
Expected: FAIL — `eb.renderExtensionJs is not a function`.

- [ ] **Step 3: Write the minimal implementation**

In `scripts/lib/extension-build.js`, add before `module.exports`:

```js
/**
 * Fill templates/extension.js placeholders for a brand.
 * themes — the package.json contributes.themes array (used to find labels).
 */
function renderExtensionJs(template, brandKey, displayName, themes) {
  const dark = (themes || []).find((t) => t.uiTheme === 'vs-dark');
  const light = (themes || []).find((t) => t.uiTheme === 'vs');
  if (!dark || !light) {
    throw new Error(`Brand "${brandKey}" is missing a vs-dark or vs theme label`);
  }
  const ns = nsFor(brandKey);
  return template
    .replace(/__BRAND__/g, displayName)
    .replace(/__THEME_DARK__/g, dark.label)
    .replace(/__THEME_LIGHT__/g, light.label)
    .replace(/__CONFIG_NS__/g, ns)
    .replace(/__VIEW_ID__/g, `${ns}Palette`);
}
```

Then extend `module.exports`:

```js
module.exports = {
  camelCase, nsFor, monochromeSvg, buildContributes, mergeContributes, renderExtensionJs,
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test scripts/test/extension-build.test.js`
Expected: PASS — 11 passing tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/extension-build.js scripts/test/extension-build.test.js
git commit -m "feat(generator): render extension.js from the brand template"
```

---

## Task 13: Wire the generator to emit extension assets per brand

**Files:**
- Modify: `scripts/generate.js`

- [ ] **Step 1: Require the helpers and templates**

In `scripts/generate.js`, after the existing `const path = require('path');` line (line 22), add:

```js
const eb = require('./lib/extension-build');
```

Then, inside `main()`, after the icon-template loading block (after line 154, before the
`// Discover brands` comment), add:

```js
  // Load extension runtime templates
  const extensionJsTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'extension.js'), 'utf8');
  const paletteLibSrc = fs.readFileSync(path.join(TEMPLATES_DIR, 'lib', 'palette-view.js'), 'utf8');
```

- [ ] **Step 2: Emit the extension assets inside the per-brand loop**

In `scripts/generate.js`, inside the `for (const brand of brands)` loop, immediately
after the asset-copy block that ends at `fs.copyFileSync(licSrc, licDst);` (line 193),
add:

```js
    // --- Extension runtime: activity icon, palette lib, extension.js, package.json ---
    const extPkgPath = path.join(extDir, 'package.json');
    if (fs.existsSync(extPkgPath)) {
      const extPkg = JSON.parse(fs.readFileSync(extPkgPath, 'utf8'));
      const themes = (extPkg.contributes && extPkg.contributes.themes) || [];

      // Activity-bar icon: hand-authored brands/<brand>/activity-icon.svg wins;
      // otherwise derive a monochrome icon from the brand mark icons/git.svg.
      if (!fs.existsSync(path.join(brandDir, 'activity-icon.svg'))) {
        const gitMark = path.join(brandDir, 'icons', 'git.svg');
        if (fs.existsSync(gitMark)) {
          fs.writeFileSync(
            path.join(extDir, 'activity-icon.svg'),
            eb.monochromeSvg(fs.readFileSync(gitMark, 'utf8')),
          );
        }
      }

      // Pure palette module (copied verbatim).
      fs.mkdirSync(path.join(extDir, 'lib'), { recursive: true });
      fs.writeFileSync(path.join(extDir, 'lib', 'palette-view.js'), paletteLibSrc);

      // extension.js from the template.
      fs.writeFileSync(
        path.join(extDir, 'extension.js'),
        eb.renderExtensionJs(extensionJsTemplate, brand, brandConfig.displayName, themes),
      );

      // Patch package.json contributes (idempotent).
      eb.mergeContributes(extPkg, brand, brandConfig.displayName);
      fs.writeFileSync(extPkgPath, JSON.stringify(extPkg, null, 2) + '\n');

      console.log(`  ✓ extension runtime (icon, lib, extension.js, package.json)`);
    }
```

- [ ] **Step 3: Verify a single-brand run still succeeds and stays idempotent for Lucid Labs**

Run: `npm run generate -- --brand lucid-labs && git diff --stat extensions/lucid-labs/`
Expected: generator output including `✓ extension runtime …`. The `git diff --stat`
should show **no changes** to `extensions/lucid-labs/extension.js`, `lib/palette-view.js`,
`activity-icon.svg` or `package.json` — the generated output must match the Phase 1
hand-authored files. If `package.json` differs, inspect the diff: key **ordering** changes
are acceptable to accept; any **value** change is a bug in `mergeContributes` — fix it.

- [ ] **Step 4: Run the full suite**

Run: `npm run generate && npm run lint && npm test`
Expected: all 17 brands generate, `No issues found.`, and 27 passing tests
(16 palette-view + 11 extension-build).

- [ ] **Step 5: Verify a non-Lucid extension now has the runtime**

Run: `node --check extensions/charli/extension.js && node -e "const p=require('./extensions/charli/package.json'); if(p.contributes.views.charliThemeContainer[0].type!=='webview') throw new Error('charli view not wired'); console.log('charli wired ok')"`
Expected: `charli wired ok`

- [ ] **Step 6: Commit**

```bash
git add scripts/generate.js extensions/
git commit -m "feat(generator): emit activity icon, palette lib and extension.js for every brand"
```

---

## Task 14: Roll out — version bumps, changelogs, docs, verification

**Files:**
- Modify: `extensions/*/package.json` (all 16 non-Lucid brands)
- Modify: `extensions/*/CHANGELOG.md` (all 16 non-Lucid brands)
- Modify: `CLAUDE.md` (repo root of this project)

- [ ] **Step 1: Bump every non-Lucid extension to a new minor version**

For each of the 16 brands (`act`, `ai-tour-sydney`, `aurora-dairies`,
`australian-food-fibre`, `banjo-loans`, `charli`, `icon-group`, `new-south-wales`,
`northern-territory`, `perfection-fresh`, `progenesis`, `queensland`, `south-australia`,
`tasmania`, `victoria`, `western-australia`), bump the `version` field in
`extensions/<brand>/package.json` by one minor version (e.g. `1.7.0` → `1.8.0`,
`1.5.0` → `1.6.0`). Leave `lucid-labs` at `1.15.0` from Phase 1.

- [ ] **Step 2: Add a changelog entry to every non-Lucid extension**

Prepend to each `extensions/<brand>/CHANGELOG.md` (use the brand's new version number and
its display name in place of `<X.Y.Z>` / `<Brand>`):

```markdown
## [<X.Y.Z>]

### Added

- Brand Palette sidebar view with HEX / RGB / CMYK one-click copy and a
  Dark/Light theme-role toggle.
- <Brand> brand mark as the activity-bar icon.
```

- [ ] **Step 3: Update the brand table in `CLAUDE.md`**

In `CLAUDE.md` (this repo's root), update the "Current Brands" table: add rows for
`ai-tour-sydney` and `aurora-dairies` with their extension IDs and versions, and refresh
the version numbers for every brand to the values set in Steps 1–2.

- [ ] **Step 4: Regenerate, lint, test**

Run: `npm run generate && npm run lint && npm test`
Expected: all 17 brands generate, `No issues found.`, 27 passing tests.

- [ ] **Step 5: Verify every extension has a valid runtime**

Run: `for d in extensions/*/; do node --check "$d/extension.js" || { echo "BAD: $d"; exit 1; }; done && echo "all 17 extension.js valid"`
Expected: `all 17 extension.js valid`

- [ ] **Step 5a: Verify no generated activity icon has unresolved placeholders**

`monochromeSvg` only neutralises `fill` attributes. A brand whose `icons/git.svg` colours
a `stroke` instead would leave a `{{role}}` token in its `activity-icon.svg`.

Run: `grep -l '{{' extensions/*/activity-icon.svg 2>/dev/null && echo "FOUND placeholders — fix below" || echo "all activity icons resolved"`
Expected: `all activity icons resolved`. If any file is listed, hand-author a monochrome
`brands/<brand>/activity-icon.svg` for that brand (the generator copies a hand-authored
file in preference to generating one — see Task 13 Step 2) and re-run `npm run generate`.

- [ ] **Step 6: Spot-check packaging on a non-Lucid brand**

Run: `cd extensions/charli && vsce package --out /tmp/charli-check.vsix && cd ../.. && echo "charli packaged ok"`
Expected: `charli packaged ok`

- [ ] **Step 7: Manual verification**

Open `extensions/charli` in VS Code, press `F5`, and confirm in the dev host: the CHARLi
activity-bar icon appears, the Brand Palette view opens showing **only** the Theme Roles
section (CHARLi has no `brandColors` yet — graceful degradation), the Dark/Light toggle
works, and copy buttons populate the clipboard.

- [ ] **Step 8: Commit**

```bash
git add extensions/ CLAUDE.md
git commit -m "feat: roll brand palette viewer and activity icon out to all 17 brands"
```

---

## Verification checklist (whole feature)

- [ ] `npm run generate && npm run lint && npm test` passes (27 tests, 34 themes, 0 lint issues).
- [ ] Re-running `npm run generate` produces no git diff (idempotent).
- [ ] Lucid Labs dev host: cloud-and-arrows activity icon; Brand Colours in three
      sub-groups with PANTONE; de-duped Theme Roles; HEX/RGB/CMYK copy works; Dark/Light
      toggle swaps roles without changing the editor theme.
- [ ] A non-Lucid dev host (e.g. CHARLi): activity icon present; Theme Roles section only
      (no Brand Colours), no errors.
- [ ] `vsce package` succeeds for `lucid-labs` and one non-Lucid brand.

## Future work (out of scope)

- Curate `brandColors` arrays for the other 16 brands' `brands/<name>/brand.json` so their
  viewers gain the named Brand Colours section.
- Fleet-wide keybindings and walkthroughs.
- HSL format; in-viewer search/filter; showing the `terminal` ANSI block.
