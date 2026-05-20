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
