#!/usr/bin/env node

/**
 * Bump every extension's version in one pass — the release chore behind any
 * templates/ or brands/ change, which republishes all extensions and needs a
 * new version on each or the marketplace skips them as "already exists".
 *
 * Usage:
 *   node scripts/bump-versions.js --minor -m "Palette page release"
 *   node scripts/bump-versions.js --patch -m "Contrast fixes" --brand lucid-labs
 *
 * Bumps package.json and prepends a dated entry to each CHANGELOG.md.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXTENSIONS_DIR = path.join(ROOT, 'extensions');

/**
 * Today in the machine's own timezone. toISOString() would stamp UTC, which
 * is the previous day for most of an Australian working morning.
 */
function localDate(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function bump(version, level) {
  const [major, minor, patch] = version.split('.').map(Number);
  if ([major, minor, patch].some(Number.isNaN)) {
    throw new Error(`Unparseable version "${version}"`);
  }
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function main() {
  const args = process.argv.slice(2);
  let level = 'patch';
  let message = null;
  let targetBrand = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--major') level = 'major';
    else if (args[i] === '--minor') level = 'minor';
    else if (args[i] === '--patch') level = 'patch';
    else if ((args[i] === '-m' || args[i] === '--message') && args[i + 1]) {
      message = args[++i];
    } else if (args[i] === '--brand' && args[i + 1]) {
      targetBrand = args[++i];
    } else {
      console.error(`Unknown argument: ${args[i]}`);
      console.error('Usage: node scripts/bump-versions.js [--major|--minor|--patch] -m "Changelog line" [--brand <name>]');
      process.exit(1);
    }
  }

  if (!message) {
    console.error('A changelog message is required: -m "What changed"');
    process.exit(1);
  }

  const extensions = fs
    .readdirSync(EXTENSIONS_DIR)
    .filter((dir) => {
      if (targetBrand && dir !== targetBrand) return false;
      return fs.existsSync(path.join(EXTENSIONS_DIR, dir, 'package.json'));
    })
    .sort();

  if (extensions.length === 0) {
    console.error(targetBrand ? `Extension "${targetBrand}" not found.` : 'No extensions found.');
    process.exit(1);
  }

  const date = localDate();

  for (const ext of extensions) {
    const pkgPath = path.join(EXTENSIONS_DIR, ext, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const prev = pkg.version;
    const next = bump(prev, level);
    pkg.version = next;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

    const changelogPath = path.join(EXTENSIONS_DIR, ext, 'CHANGELOG.md');
    if (fs.existsSync(changelogPath)) {
      const changelog = fs.readFileSync(changelogPath, 'utf8');
      const lines = changelog.split('\n');
      // Insert after the top-level heading (and its trailing blank line).
      let insertAt = 0;
      if (lines[0] && lines[0].startsWith('# ')) {
        insertAt = 1;
        while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;
      }
      const entry = [`## [${next}] - ${date}`, '', `- ${message}`, ''];
      lines.splice(insertAt, 0, ...entry);
      fs.writeFileSync(changelogPath, lines.join('\n'));
    }

    console.log(`  ${ext}: ${prev} -> ${next}`);
  }

  console.log(`\nBumped ${extensions.length} extension(s) (${level}). Review CHANGELOGs, then commit.`);
}

if (require.main === module) main();

module.exports = { bump, localDate };
