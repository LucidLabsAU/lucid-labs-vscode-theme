# Fix WCAG Contrast Failures

You are fixing WCAG contrast failures identified by `node scripts/check-contrast.js`.

## Input

Run the contrast checker first:

```bash
node scripts/check-contrast.js
```

## Process

### 1. Parse Failures

Identify each failing pair from the output:
- **Element** — what UI element failed (e.g. "Editor text", "Token: Keywords")
- **Foreground colour** — the hex colour of the text/icon
- **Background colour** — the hex colour behind it
- **Current ratio** — the measured contrast ratio
- **Required ratio** — 4.5:1 for normal text, 3:1 for large text/UI

### 2. Trace to Brand Colour Role

For each failing colour, determine which `brand.json` role produces it:

1. Find the colour in the generated theme file (`extensions/<name>/themes/*.json`)
2. Find the corresponding template placeholder in `templates/base-dark.jsonc` or `templates/base-light.jsonc`
3. Map the placeholder back to the brand colour role in `brands/<name>/brand.json`

### 3. Calculate Fix

For each failing role, calculate the minimum adjustment:

**Dark themes (light text on dark background):**
- Increase the foreground colour's luminance until it meets the minimum ratio
- Preserve the hue and saturation as much as possible
- If lightening desaturates too much, compensate by increasing saturation

**Light themes (dark text on light background):**
- Decrease the foreground colour's luminance until it meets the minimum ratio
- Preserve the hue and saturation as much as possible

**Target ratios:**
- Aim for 5:1+ (comfortably above AA 4.5:1 minimum)
- For text that's also used in other contexts, check those pairings too

### 4. Apply Fix

Edit the relevant `brands/<name>/brand.json` to update the colour role values.

**Rules:**
- Never change `background`, `backgroundDeep`, or `backgroundPanel` — these define the brand identity
- Prefer adjusting foreground/accent colours
- Check that the fix doesn't break other pairings that use the same role
- Maintain visual hierarchy (primary text brighter than muted text)

### 5. Regenerate and Verify

```bash
npm run generate
npm run lint
node scripts/check-contrast.js
```

Confirm:
- [ ] All previously failing checks now pass
- [ ] No new failures introduced
- [ ] Theme still looks visually cohesive (colours aren't washed out)

### 6. Open PR

Title: `fix: improve contrast ratios for <Brand Name> theme`

Include a table of changes:

| Role | Old Value | New Value | Old Ratio | New Ratio |
|------|-----------|-----------|-----------|-----------|
| `keyword` | `#7454B3` | `#9B7ED9` | 2.8:1 | 4.8:1 |
