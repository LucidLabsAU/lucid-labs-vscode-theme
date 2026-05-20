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
  // #339999 -> rgb(51,153,153): k = 1 - 0.6 = 0.4; C = (1-0.2-0.4)/0.6 ≈ 0.667 -> 67%
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

test('escapeHtml neutralises ampersands, angle brackets and quotes', () => {
  assert.equal(pv.escapeHtml(`& <a 'b' "c">`), '&amp; &lt;a &#39;b&#39; &quot;c&quot;&gt;');
});

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

test('renderPaletteHtml escapes HTML-special characters in brand data', () => {
  const html = pv.renderPaletteHtml({
    brandName: '<script>x</script>',
    palette: SAMPLE,
    activeVariant: 'dark',
    brandColors: [{
      name: 'Evil "<b>"', hex: '#339999', rgb: [51, 153, 153],
      cmyk: [67, 0, 0, 40], pantone: 'P&Q', group: 'primary', role: 'r',
    }],
    nonce: 'n', cspSource: 'x',
  });
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
  assert.match(html, /Evil &quot;&lt;b&gt;&quot;/);
});
