#!/usr/bin/env node

/**
 * Theme Factory Generator
 *
 * Reads brand configs and templates, substitutes {{role}} placeholders
 * with brand colours, and outputs valid theme JSON files.
 *
 * Placeholder syntax:
 *   {{role}}        — resolves to the brand colour for that role
 *   {{role}}XX      — resolves to the brand colour + hex alpha suffix XX
 *   {{a|b|c}}       — fallback chain: tries a, then b, then c
 *   {{a|b}}XX       — fallback chain with alpha suffix
 *   {{#RRGGBB}}     — literal hex colour (passthrough)
 *
 * Usage:
 *   node scripts/generate.js            # generate all brands
 *   node scripts/generate.js --brand x  # generate one brand
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BRANDS_DIR = path.join(ROOT, 'brands');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const EXTENSIONS_DIR = path.join(ROOT, 'extensions');

/**
 * Strip JSONC comments and trailing commas, then parse as JSON.
 */
function parseJsonc(text) {
  // Remove single-line comments (// ...)
  let cleaned = text.replace(/^\s*\/\/.*$/gm, '');
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(cleaned);
}

/**
 * Flatten a nested object into dot-notation keys.
 * e.g. { terminal: { black: "#000" } } → { "terminal.black": "#000" }
 */
function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

/**
 * Resolve a placeholder like {{role}} or {{a|b|c}} against the palette.
 * Returns the resolved colour string or null if not found.
 */
function resolveRole(placeholder, palette) {
  const roles = placeholder.split('|');
  for (const role of roles) {
    const trimmed = role.trim();
    // Literal hex passthrough
    if (trimmed.startsWith('#')) return trimmed;
    if (palette[trimmed]) return palette[trimmed];
  }
  return null;
}

/**
 * Substitute all {{...}} placeholders in a string.
 * Supports {{role}}XX where XX is a hex alpha suffix.
 */
function substitute(text, palette) {
  const errors = [];

  const result = text.replace(/\{\{([^}]+)\}\}([0-9A-Fa-f]{2})?/g, (match, roleExpr, alphaSuffix) => {
    const colour = resolveRole(roleExpr, palette);
    if (!colour) {
      errors.push(`Unresolved placeholder: ${match}`);
      return match; // leave as-is for debugging
    }
    return alphaSuffix ? `${colour}${alphaSuffix}` : colour;
  });

  return { result, errors };
}

/**
 * Generate a single theme file.
 */
function generateTheme(brandName, variant, brandConfig, template) {
  const variantConfig = brandConfig[variant];
  if (!variantConfig) {
    console.error(`  No "${variant}" config in ${brandName}/brand.json`);
    return null;
  }

  // Flatten nested objects (e.g. terminal.black)
  const palette = flatten(variantConfig);

  const templateStr = JSON.stringify(template, null, 2);
  const { result, errors } = substitute(templateStr, palette);

  if (errors.length > 0) {
    console.error(`  Errors in ${brandName} ${variant}:`);
    errors.forEach(e => console.error(`    ${e}`));
    return null;
  }

  // Parse to validate JSON and get clean object
  const theme = JSON.parse(result);

  // Add metadata
  theme.name = `${brandConfig.name} ${variant === 'dark' ? 'Dark' : 'Light'}`;
  theme.displayName = `${brandConfig.displayName} ${variant === 'dark' ? 'Dark' : 'Light'}`;
  theme.description = brandConfig.description;
  theme.version = '1.0.0';
  theme.publisher = brandConfig.publisher;

  return theme;
}

function main() {
  const args = process.argv.slice(2);
  let targetBrand = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--brand' && args[i + 1]) {
      targetBrand = args[i + 1];
      i++;
    }
  }

  // Load templates
  const darkTemplate = parseJsonc(fs.readFileSync(path.join(TEMPLATES_DIR, 'base-dark.jsonc'), 'utf8'));
  const lightTemplate = parseJsonc(fs.readFileSync(path.join(TEMPLATES_DIR, 'base-light.jsonc'), 'utf8'));

  // Load icon templates
  const iconTemplateDir = path.join(TEMPLATES_DIR, 'icons');
  const iconThemeTemplatePath = path.join(TEMPLATES_DIR, 'icon-theme.jsonc');
  const hasIconTemplates = fs.existsSync(iconTemplateDir) && fs.existsSync(iconThemeTemplatePath);
  let iconSvgTemplates = {};
  let iconThemeTemplate = null;
  if (hasIconTemplates) {
    iconThemeTemplate = parseJsonc(fs.readFileSync(iconThemeTemplatePath, 'utf8'));
    for (const file of fs.readdirSync(iconTemplateDir)) {
      if (file.endsWith('.svg')) {
        iconSvgTemplates[file] = fs.readFileSync(path.join(iconTemplateDir, file), 'utf8');
      }
    }
  }

  // Discover brands
  const brands = fs.readdirSync(BRANDS_DIR).filter(dir => {
    if (targetBrand && dir !== targetBrand) return false;
    const brandPath = path.join(BRANDS_DIR, dir, 'brand.json');
    return fs.existsSync(brandPath);
  });

  if (brands.length === 0) {
    console.error(targetBrand ? `Brand "${targetBrand}" not found.` : 'No brands found.');
    process.exit(1);
  }

  let hasErrors = false;

  for (const brand of brands) {
    console.log(`Generating ${brand}...`);
    const brandConfig = JSON.parse(fs.readFileSync(path.join(BRANDS_DIR, brand, 'brand.json'), 'utf8'));

    const extDir = path.join(EXTENSIONS_DIR, brand);
    const brandDir = path.join(BRANDS_DIR, brand);

    // Ensure output directory exists
    const outDir = path.join(extDir, 'themes');
    fs.mkdirSync(outDir, { recursive: true });

    // Copy brand assets into extension dir for local packaging
    for (const asset of ['icon.png', 'README.md']) {
      const src = path.join(brandDir, asset);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(extDir, asset));
      }
    }
    // Copy root LICENSE if not already present
    const licSrc = path.join(ROOT, 'LICENSE');
    const licDst = path.join(extDir, 'LICENSE');
    if (fs.existsSync(licSrc) && !fs.existsSync(licDst)) {
      fs.copyFileSync(licSrc, licDst);
    }

    // Generate dark theme
    const darkTheme = generateTheme(brand, 'dark', brandConfig, darkTemplate);
    if (darkTheme) {
      const darkPath = path.join(outDir, `${brand}-dark.json`);
      fs.writeFileSync(darkPath, JSON.stringify(darkTheme, null, 2) + '\n');
      console.log(`  ✓ ${brand}-dark.json`);
    } else {
      hasErrors = true;
    }

    // Generate light theme
    const lightTheme = generateTheme(brand, 'light', brandConfig, lightTemplate);
    if (lightTheme) {
      const lightPath = path.join(outDir, `${brand}-light.json`);
      fs.writeFileSync(lightPath, JSON.stringify(lightTheme, null, 2) + '\n');
      console.log(`  ✓ ${brand}-light.json`);
    } else {
      hasErrors = true;
    }

    // Generate icon theme (uses dark palette for icons)
    if (hasIconTemplates && brandConfig.dark) {
      const iconOutDir = path.join(extDir, 'icons');
      fs.mkdirSync(iconOutDir, { recursive: true });

      const palette = flatten(brandConfig.dark);
      let iconErrors = false;

      // Substitute SVG templates
      for (const [file, svgTemplate] of Object.entries(iconSvgTemplates)) {
        const { result, errors } = substitute(svgTemplate, palette);
        if (errors.length > 0) {
          console.error(`  SVG errors in ${file}:`, errors);
          iconErrors = true;
        } else {
          fs.writeFileSync(path.join(iconOutDir, file), result);
        }
      }

      // Write icon theme definition (no substitution needed, just copy)
      fs.writeFileSync(
        path.join(extDir, 'icon-theme.json'),
        JSON.stringify(iconThemeTemplate, null, 2) + '\n'
      );

      if (!iconErrors) {
        console.log(`  ✓ icon-theme.json (${Object.keys(iconSvgTemplates).length} icons)`);
      } else {
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.error('\nGeneration completed with errors.');
    process.exit(1);
  }

  console.log('\nAll themes generated successfully.');
}

main();
