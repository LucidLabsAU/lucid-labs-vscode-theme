'use strict';

/**
 * Strip JSONC extensions (// and /* *\/ comments, trailing commas) from text
 * so it can be handed to JSON.parse. A real character scan, not regexes:
 * string contents are tracked so a "//" or ",}" inside a value is never
 * mangled. Comments are replaced with spaces to preserve line/column numbers
 * in any downstream JSON.parse error.
 */
function stripJsonc(text) {
  let out = '';
  let i = 0;
  const n = text.length;
  let inString = false;

  while (i < n) {
    const ch = text[i];

    if (inString) {
      out += ch;
      if (ch === '\\' && i + 1 < n) {
        out += text[i + 1];
        i += 2;
        continue;
      }
      if (ch === '"') inString = false;
      i++;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      i++;
      continue;
    }

    if (ch === '/' && text[i + 1] === '/') {
      while (i < n && text[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }

    if (ch === '/' && text[i + 1] === '*') {
      out += '  ';
      i += 2;
      while (i < n && !(text[i] === '*' && text[i + 1] === '/')) {
        out += text[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i < n) {
        out += '  ';
        i += 2;
      }
      continue;
    }

    // Trailing comma: a comma whose next non-whitespace/non-comment char
    // closes the container. Look ahead through whitespace only — comments
    // between a trailing comma and the brace are handled because they are
    // already blanked to spaces on subsequent passes of the scan.
    if (ch === ',') {
      let j = i + 1;
      while (j < n) {
        const c = text[j];
        if (/\s/.test(c)) { j++; continue; }
        if (c === '/' && text[j + 1] === '/') {
          while (j < n && text[j] !== '\n') j++;
          continue;
        }
        if (c === '/' && text[j + 1] === '*') {
          j += 2;
          while (j < n && !(text[j] === '*' && text[j + 1] === '/')) j++;
          j += 2;
          continue;
        }
        break;
      }
      if (j < n && (text[j] === '}' || text[j] === ']')) {
        out += ' ';
        i++;
        continue;
      }
      out += ch;
      i++;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

/** Parse JSONC text: strip comments and trailing commas, then JSON.parse. */
function parseJsonc(text) {
  return JSON.parse(stripJsonc(text));
}

module.exports = { stripJsonc, parseJsonc };
