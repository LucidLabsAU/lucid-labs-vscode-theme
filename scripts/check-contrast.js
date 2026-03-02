#!/usr/bin/env node

/**
 * WCAG Contrast Ratio Checker for VS Code Themes
 *
 * Checks key foreground/background pairs against WCAG 2.1 guidelines:
 *   - AA normal text: 4.5:1
 *   - AA large text / UI components: 3:1
 *   - AAA normal text: 7:1
 */

const fs = require('fs');
const path = require('path');

const EXTENSIONS_DIR = path.join(__dirname, '..', 'extensions');

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  // Strip alpha suffix if present
  if (hex.length === 8) hex = hex.substring(0, 6);
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function grade(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-lg';
  return 'FAIL';
}

// Key pairs to check: [fg property, bg property, description, min ratio]
const CHECKS = [
  // Editor text
  ['editor.foreground', 'editor.background', 'Editor text', 4.5],
  // Comments
  ['editorLineNumber.foreground', 'editor.background', 'Line numbers', 3],
  // Sidebar text
  ['sideBar.foreground', 'sideBar.background', 'Sidebar text', 4.5],
  // Title bar
  ['titleBar.activeForeground', 'titleBar.activeBackground', 'Title bar text', 4.5],
  // Status bar
  ['statusBar.foreground', 'statusBar.background', 'Status bar text', 4.5],
  // Activity bar
  ['activityBar.foreground', 'activityBar.background', 'Activity bar icons', 3],
  // List selection
  ['list.highlightForeground', 'editor.background', 'List highlight', 3],
  // Command centre
  ['commandCenter.foreground', 'titleBar.activeBackground', 'Command centre on title bar', 4.5],
  // Bracket colours on editor bg
  ['editorBracketHighlight.foreground1', 'editor.background', 'Bracket 1', 3],
  ['editorBracketHighlight.foreground2', 'editor.background', 'Bracket 2', 3],
  ['editorBracketHighlight.foreground3', 'editor.background', 'Bracket 3', 3],
];

// Token colour checks against editor background
const TOKEN_CHECKS = [
  ['keyword', 'Keywords'],
  ['string', 'Strings'],
  ['constant', 'Constants'],
  ['function', 'Functions'],
  ['comment', 'Comments'],
  ['variable', 'Variables'],
  ['type', 'Types'],
];

function findTokenColour(theme, scopeName) {
  if (!theme.tokenColors) return null;
  for (const tc of theme.tokenColors) {
    const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope];
    for (const s of scopes) {
      if (s && s.includes(scopeName)) {
        return tc.settings?.foreground;
      }
    }
  }
  return null;
}

function checkTheme(filePath) {
  const theme = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const colours = theme.colors || {};
  const name = theme.name || path.basename(filePath);
  const editorBg = colours['editor.background'];

  const issues = [];
  const results = [];

  // UI colour checks
  for (const [fgProp, bgProp, desc, minRatio] of CHECKS) {
    const fg = colours[fgProp];
    const bg = colours[bgProp];
    if (!fg || !bg) continue;
    // Skip colours with alpha
    if (fg.length > 7 || bg.length > 7) continue;
    const ratio = contrastRatio(fg, bg);
    const g = grade(ratio);
    const pass = ratio >= minRatio;
    results.push({ desc, fg, bg, ratio, grade: g, pass });
    if (!pass) issues.push({ desc, fg, bg, ratio, grade: g, required: minRatio });
  }

  // Token colour checks
  if (editorBg) {
    for (const [scope, desc] of TOKEN_CHECKS) {
      const fg = findTokenColour(theme, scope);
      if (!fg || fg.length > 7) continue;
      const ratio = contrastRatio(fg, editorBg);
      const g = grade(ratio);
      const pass = ratio >= 4.5;
      results.push({ desc: `Token: ${desc}`, fg, bg: editorBg, ratio, grade: g, pass });
      if (!pass) issues.push({ desc: `Token: ${desc}`, fg, bg: editorBg, ratio, grade: g, required: 4.5 });
    }
  }

  return { name, results, issues };
}

function main() {
  const themeFiles = [];
  const extensions = fs.readdirSync(EXTENSIONS_DIR);

  for (const ext of extensions) {
    const themesDir = path.join(EXTENSIONS_DIR, ext, 'themes');
    if (!fs.existsSync(themesDir)) continue;
    for (const f of fs.readdirSync(themesDir)) {
      if (f.endsWith('.json')) {
        themeFiles.push(path.join(themesDir, f));
      }
    }
  }

  let totalIssues = 0;

  for (const file of themeFiles) {
    const { name, results, issues } = checkTheme(file);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${name}`);
    console.log('='.repeat(60));

    // Print all results as a table
    console.log(`  ${'Element'.padEnd(28)} ${'Ratio'.padEnd(8)} ${'Grade'.padEnd(6)} ${'Status'}`);
    console.log(`  ${'-'.repeat(28)} ${'-'.repeat(8)} ${'-'.repeat(6)} ${'-'.repeat(6)}`);
    for (const r of results) {
      const status = r.pass ? '  OK' : '  FAIL';
      const marker = r.pass ? '' : ' <<<';
      console.log(`  ${r.desc.padEnd(28)} ${r.ratio.toFixed(1).padStart(6)}:1 ${r.grade.padEnd(6)} ${status}${marker}`);
    }

    if (issues.length > 0) {
      console.log(`\n  ISSUES (${issues.length}):`);
      for (const i of issues) {
        console.log(`    ${i.desc}: ${i.fg} on ${i.bg} = ${i.ratio.toFixed(1)}:1 (need ${i.required}:1)`);
      }
    } else {
      console.log('\n  All checks passed.');
    }

    totalIssues += issues.length;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Total: ${themeFiles.length} themes, ${totalIssues} issue(s)`);
  console.log('='.repeat(60));

  if (totalIssues > 0) process.exit(1);
}

main();
