# Create New Brand Theme from Issue

You are creating a new VS Code theme for the Lucid Labs theme factory. Follow the steps below precisely.

## Input

Parse the issue body for these fields:
- **Brand Name**: `{{ brand-name }}`
- **Website URL**: `{{ website-url }}`
- **Logo**: `{{ logo }}` (attached image or URL)
- **Known Brand Colours**: `{{ brand-colours }}` (optional hex values)
- **Brand Guidelines URL**: `{{ brand-guidelines-url }}` (optional)
- **Theme Emphasis**: `{{ theme-preference }}` (dark, light, or both)
- **Special Requests**: `{{ special-requests }}` (optional)

## Steps

### 1. Research the Brand

- Visit the website URL and identify the colour palette
- Look at navigation, buttons, links, headings, footer, hero sections
- Check for brand guidelines or style guide pages
- Extract 5-8 core colours that define the brand

### 2. Create the Brand Slug

Convert the brand name to kebab-case for directory/file names:
- "Acme Corporation" → `acme-corporation`
- "ABC Group" → `abc-group`

### 3. Create `brands/<slug>/brand.json`

Use `brands/lucid-labs/brand.json` as a structural reference. Map extracted colours to all semantic roles for both `dark` and `light` variants.

**Dark theme background strategy:**
- Take the brand's darkest colour and desaturate/darken further
- Create a 4-level surface hierarchy with 5-10% lightness increments

**Light theme background strategy:**
- Use `#FFFFFF` or very light tint of brand colour
- Ensure sufficient contrast for all foreground colours

### 4. Create Extension Files

Create `extensions/<slug>/` with:
- `package.json` — use `extensions/lucid-labs/package.json` as template
- `CHANGELOG.md` — version 1.0.0 initial release
- `.vscodeignore` — standard exclusions
- `LICENSE` — copy from root

### 5. Generate and Validate

```bash
node scripts/generate.js --brand <slug>
npm run lint
node scripts/check-contrast.js
```

Fix any contrast failures before proceeding.

### 6. Package

```bash
cd extensions/<slug> && vsce package
```

### 7. Update Documentation

Add the new brand to the table in `CLAUDE.md` under "Current Brands".

### 8. Open PR

Title: `feat: add <Brand Name> theme`

Include in the PR body:
- Colour palette table (role → hex for dark and light)
- Contrast check results (all passing)
- Installation instructions for testing

## Validation Checklist

- [ ] `brand.json` has all required colour roles for both variants
- [ ] Terminal colours defined (16 per variant)
- [ ] Bracket colours defined (6 per variant)
- [ ] `npm run generate` succeeds
- [ ] `npm run lint` passes
- [ ] `node scripts/check-contrast.js` passes — zero failures
- [ ] `vsce package` succeeds
- [ ] Icon is 256×256 PNG
- [ ] README describes the brand and theme features
