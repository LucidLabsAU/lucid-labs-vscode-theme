#!/usr/bin/env node

/**
 * Lint VS Code theme files for issues
 *
 * Checks for:
 * - Deprecated VS Code theme properties
 * - JSON comments (not permitted in strict JSON)
 * - Colors that must be transparent (would obscure content)
 *
 * Configuration is stored in scripts/lint-config.json
 * Reference: https://code.visualstudio.com/api/references/theme-color
 */

const fs = require('fs');
const path = require('path');

// Load config
const CONFIG_PATH = path.join(__dirname, 'lint-config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const DEPRECATED_PROPERTIES = config.deprecatedProperties;
const REQUIRES_TRANSPARENCY = config.requiresTransparency;

const THEMES_DIR = path.join(__dirname, '..', 'themes');

/**
 * Escape special regex characters in a string
 * This properly escapes ALL regex metacharacters including backslashes
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a hex color has transparency (alpha channel)
 * Valid formats: #RRGGBBAA or #RGBA
 */
function hasTransparency(color) {
  if (!color || typeof color !== 'string') return false;
  // #RRGGBBAA format (9 chars) or #RGBA format (5 chars)
  return color.length === 9 || color.length === 5;
}

function lintThemeFile(filePath) {
  const errors = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileName = path.basename(filePath);

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for JSON comments
    const commentMatch = line.match(/^\s*\/\//);
    if (commentMatch) {
      errors.push({
        type: 'comment',
        file: fileName,
        line: lineNum,
        message: 'Comments are not permitted in JSON',
        content: line.trim(),
      });
    }

    // Check for deprecated properties
    for (const [deprecated, info] of Object.entries(DEPRECATED_PROPERTIES)) {
      const regex = new RegExp(`"${escapeRegex(deprecated)}"\\s*:`);
      if (regex.test(line)) {
        errors.push({
          type: 'deprecated',
          file: fileName,
          line: lineNum,
          message: `Deprecated property (since VS Code ${info.since})`,
          deprecated,
          replacement: info.replacement,
          content: line.trim(),
        });
      }
    }

    // Check for properties that require transparency
    for (const prop of REQUIRES_TRANSPARENCY) {
      const regex = new RegExp(`"${escapeRegex(prop)}"\\s*:\\s*"(#[0-9A-Fa-f]+)"`);
      const match = line.match(regex);
      if (match) {
        const color = match[1];
        if (!hasTransparency(color)) {
          errors.push({
            type: 'transparency',
            file: fileName,
            line: lineNum,
            message: 'This color must be transparent or it will obscure content',
            property: prop,
            color,
            content: line.trim(),
          });
        }
      }
    }
  });

  return errors;
}

function main() {
  console.log('Linting VS Code theme files...\n');

  // Check if config file exists
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Error: Config file not found at ${CONFIG_PATH}`);
    process.exit(1);
  }

  const themeFiles = fs.readdirSync(THEMES_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(THEMES_DIR, file));

  if (themeFiles.length === 0) {
    console.log('No theme files found in themes/ directory.');
    process.exit(0);
  }

  let allErrors = [];

  for (const file of themeFiles) {
    const errors = lintThemeFile(file);
    allErrors = allErrors.concat(errors);
  }

  if (allErrors.length > 0) {
    // Group errors by type
    const commentErrors = allErrors.filter(e => e.type === 'comment');
    const deprecatedErrors = allErrors.filter(e => e.type === 'deprecated');
    const transparencyErrors = allErrors.filter(e => e.type === 'transparency');

    if (commentErrors.length > 0) {
      console.error('JSON Comment Errors:\n');
      for (const error of commentErrors) {
        console.error(`  ${error.file}:${error.line}`);
        console.error(`    ${error.message}`);
        console.error(`    Line: ${error.content}\n`);
      }
    }

    if (deprecatedErrors.length > 0) {
      console.error('Deprecated Property Errors:\n');
      for (const error of deprecatedErrors) {
        console.error(`  ${error.file}:${error.line}`);
        console.error(`    ${error.message}`);
        console.error(`    Deprecated: "${error.deprecated}"`);
        console.error(`    Use instead: "${error.replacement}"`);
        console.error(`    Line: ${error.content}\n`);
      }
    }

    if (transparencyErrors.length > 0) {
      console.error('Transparency Required Errors:\n');
      for (const error of transparencyErrors) {
        console.error(`  ${error.file}:${error.line}`);
        console.error(`    ${error.message}`);
        console.error(`    Property: "${error.property}"`);
        console.error(`    Current: "${error.color}" (needs alpha, e.g., "${error.color}CC")`);
        console.error(`    Line: ${error.content}\n`);
      }
    }

    console.error(`\nTotal: ${allErrors.length} error(s) found.`);
    console.error('Please fix these issues before committing.\n');
    console.error('Reference: https://code.visualstudio.com/api/references/theme-color\n');
    process.exit(1);
  }

  console.log(`Checked ${themeFiles.length} theme file(s). No issues found.`);
  process.exit(0);
}

main();
