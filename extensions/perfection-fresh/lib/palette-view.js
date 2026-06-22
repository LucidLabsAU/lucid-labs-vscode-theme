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
  return String(s).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

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

/** Build the three copy buttons for a colour, given pre-formatted strings. */
function copyButtons(fmt) {
  return ['hex', 'rgb', 'cmyk']
    .map((k) => `<button class="copy" data-copy="${escapeHtml(fmt[k])}" title="Copy ${escapeHtml(fmt[k])}"><span class="copy-label">${k.toUpperCase()}</span><span class="copy-icon" aria-hidden="true">⧉</span></button>`)
    .join('');
}

/** Format a role list: show all, with truncation handled in CSS, full text in title. */
function renderRoles(roles) {
  const all = roles.join(' · ');
  return `<span class="role" title="${escapeHtml(all)}">${escapeHtml(all)}</span>`;
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
      <span class="name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</span>
      <span class="hex">${escapeHtml(fmt.hex)}</span>
      ${c.role ? `<span class="role" title="${escapeHtml(c.role)}">${escapeHtml(c.role)}</span>` : ''}
      ${pantone}
    </div>
    <div class="copies">${copyButtons(fmt)}</div>
  </div>`;
}

/** One card for a de-duped theme-role colour. */
function roleCard(entry, brandColors) {
  const fmt = colourFormats(entry.hex);
  const match = (brandColors || []).find((c) => formatHex(c.hex) === entry.hex);
  const title = match ? escapeHtml(match.name) : escapeHtml(entry.hex);
  return `<div class="card">
    <span class="chip" style="background:${escapeHtml(formatHex(entry.hex))}"></span>
    <div class="meta">
      <span class="name" title="${title}">${title}</span>
      <span class="hex">${escapeHtml(fmt.hex)}</span>
      ${renderRoles(entry.roles)}
    </div>
    <div class="copies">${copyButtons(fmt)}</div>
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
  const {
    brandName, palette, activeVariant, brandColors, nonce, cspSource,
    themeGroups, hasIconTheme, iconsApplied, appliedThemeLabel,
  } = opts;
  const safeNonce = escapeHtml(nonce);
  const safeCspSource = escapeHtml(cspSource);
  // VS15 forces text (monochrome) rendering so the glyph inherits button colour.
  const glyph = (g) => `<span class="ai" aria-hidden="true">${g}︎</span>`;
  const moon = glyph('☾');
  const sun = glyph('☀');
  const groups = Array.isArray(themeGroups) ? themeGroups : [];
  const multiEdition = groups.length > 1;
  const iconBtn = hasIconTheme
    ? `<button class="action${iconsApplied ? ' active' : ''}" data-action="icons">${glyph('▦')}Icons</button>`
    : '';
  const themeBtn = (t, variant) => {
    if (!t) return '';
    const active = t.label === appliedThemeLabel ? ' active' : '';
    return `<button class="action${active}" data-action="theme" data-theme="${escapeHtml(t.label)}" data-variant="${variant}">${variant === 'dark' ? moon : sun}${escapeHtml(t.short)}</button>`;
  };
  const comboBtn = (t, variant) => {
    if (!t) return '';
    const active = t.label === appliedThemeLabel && iconsApplied ? ' active' : '';
    return `<button class="action combo${active}" data-action="both" data-theme="${escapeHtml(t.label)}" data-variant="${variant}">${variant === 'dark' ? moon : sun}${escapeHtml(t.short)} + Icons</button>`;
  };
  let applyRows;
  if (multiEdition) {
    // One labelled row per edition; the brand-wide Icons button rides the first row.
    applyRows = groups.map((g, i) => (
      `<div class="action-row edition-row">`
      + `<span class="edition">${escapeHtml(g.edition)}</span>`
      + `<span class="edition-btns">${themeBtn(g.dark, 'dark')}${themeBtn(g.light, 'light')}${i === 0 ? iconBtn : ''}</span>`
      + `</div>`
    )).join('');
  } else {
    const g = groups[0] || { dark: null, light: null };
    applyRows = `<div class="action-row">${themeBtn(g.dark, 'dark')}${themeBtn(g.light, 'light')}${iconBtn}</div>`;
    if (hasIconTheme) {
      applyRows += `<div class="action-row">${comboBtn(g.dark, 'dark')}${comboBtn(g.light, 'light')}</div>`;
    }
  }
  const darkCards = dedupeRoles(palette.dark || {})
    .map((e) => roleCard(e, brandColors)).join('');
  const lightCards = dedupeRoles(palette.light || {})
    .map((e) => roleCard(e, brandColors)).join('');
  const csp = `default-src 'none'; style-src ${safeCspSource} 'unsafe-inline'; `
    + `script-src 'nonce-${safeNonce}';`;
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
  .grid { display: grid; gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
  .card { display: flex; flex-direction: column; gap: 6px; padding: 8px;
    border-radius: 6px; min-width: 0;
    background: var(--vscode-editorWidget-background);
    border: 1px solid var(--vscode-editorWidget-border); }
  .chip { width: 100%; height: 48px; border-radius: 4px;
    border: 1px solid var(--vscode-editorWidget-border); }
  .meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .name, .role, .hex, .pantone { overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; display: block; }
  .name { font-weight: 600; font-size: 12px; }
  .role { font-size: 10px; color: var(--vscode-descriptionForeground); }
  .hex { font-family: var(--vscode-editor-font-family); font-size: 11px;
    color: var(--vscode-descriptionForeground); }
  .pantone { font-size: 10px; color: var(--vscode-descriptionForeground); }
  .copies { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;
    margin-top: auto; }
  button.copy { position: relative; font-size: 10px; padding: 5px 4px;
    cursor: pointer; display: inline-flex; align-items: center;
    justify-content: center; gap: 3px;
    color: var(--vscode-button-secondaryForeground);
    background: var(--vscode-button-secondaryBackground);
    border: 1px solid var(--vscode-button-border, transparent);
    border-radius: 3px; transition: background .12s; }
  button.copy:hover { background: var(--vscode-button-secondaryHoverBackground);
    border-color: var(--vscode-focusBorder); }
  button.copy .copy-icon { font-size: 11px; opacity: .65; }
  button.copy:hover .copy-icon { opacity: 1; }
  button.copy.copied { background: var(--vscode-button-background);
    color: var(--vscode-button-foreground); }
  button.copy.copied .copy-label::before { content: '✓ '; }
  .toggle { display: inline-flex; gap: 4px; }
  .toggle button { font-size: 10px; padding: 3px 10px; cursor: pointer; line-height: 1.4;
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground); border: none; border-radius: 3px; }
  .toggle button.active { background: var(--vscode-button-background);
    color: var(--vscode-button-foreground); }
  .actions { display: flex; flex-direction: column; gap: 6px; margin: 2px 0 10px; }
  .actions-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em;
    color: var(--vscode-descriptionForeground); }
  .action-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .action-row.edition-row { align-items: center; gap: 10px; }
  .edition { font-size: 11px; min-width: 88px; font-weight: 600;
    color: var(--vscode-descriptionForeground); }
  .edition-btns { display: flex; flex-wrap: wrap; gap: 6px; }
  button.action { display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; padding: 5px 12px; cursor: pointer; line-height: 1.5;
    color: var(--vscode-button-secondaryForeground);
    background: var(--vscode-button-secondaryBackground);
    border: 1px solid transparent; border-radius: 999px;
    transition: background .12s, border-color .12s, transform .08s; }
  button.action:hover { background: var(--vscode-button-secondaryHoverBackground);
    border-color: var(--vscode-focusBorder); }
  button.action:active { transform: translateY(1px); }
  button.action .ai { font-size: 12px; opacity: .85; line-height: 1; }
  button.action.active { background: var(--vscode-button-background);
    color: var(--vscode-button-foreground); border-color: transparent; font-weight: 600; }
  button.action.active::before { content: '✓'; font-weight: 700; }
  button.action.combo { background: transparent; color: var(--vscode-foreground);
    border-color: var(--vscode-focusBorder); }
  button.action.combo:hover { background: var(--vscode-button-secondaryHoverBackground); }
  button.action.combo.active { background: var(--vscode-button-background);
    color: var(--vscode-button-foreground); border-color: transparent; }
  button.action.flash { background: var(--vscode-button-background);
    color: var(--vscode-button-foreground); }
  .roles-header { display: flex; align-items: center; justify-content: space-between;
    gap: 12px; margin: 18px 0 6px; }
  .roles-header h2 { margin: 0; }
  body[data-variant="dark"] .roles-light { display: none; }
  body[data-variant="light"] .roles-dark { display: none; }
  .note { font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 12px; }
</style></head>
<body data-variant="${escapeHtml(activeVariant)}">
<h1>${escapeHtml(brandName)} — Brand Palette</h1>
<div class="actions">
  <span class="actions-label">Apply to editor</span>
  ${applyRows}
</div>
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
<script nonce="${safeNonce}">
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
      b.classList.add('copied');
      setTimeout(() => b.classList.remove('copied'), 900);
    });
  });
  function syncApplied(state) {
    document.querySelectorAll('.action[data-action="theme"]').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === state.theme);
    });
    document.querySelectorAll('.action[data-action="icons"]').forEach((b) => {
      b.classList.toggle('active', !!state.icons);
    });
    document.querySelectorAll('.action[data-action="both"]').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === state.theme && !!state.icons);
    });
  }
  document.querySelectorAll('.action').forEach((b) => {
    b.addEventListener('click', () => {
      const a = b.dataset.action;
      if (a === 'theme') {
        vscode.postMessage({ type: 'setThemeByLabel', label: b.dataset.theme });
      } else if (a === 'icons') {
        vscode.postMessage({ type: 'setIcons' });
      } else if (a === 'both') {
        vscode.postMessage({ type: 'setThemeAndIconsByLabel', label: b.dataset.theme });
      }
      b.classList.add('flash');
      setTimeout(() => b.classList.remove('flash'), 400);
    });
  });
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'variant'
        && (e.data.value === 'dark' || e.data.value === 'light')) {
      document.body.dataset.variant = e.data.value;
      syncToggle();
    } else if (e.data.type === 'applied') {
      syncApplied(e.data);
    }
  });
  syncToggle();
</script>
</body></html>`;
}

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
