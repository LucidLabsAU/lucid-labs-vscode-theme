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
