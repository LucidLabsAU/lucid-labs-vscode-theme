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
  return String(s).replace(/[&<>"]/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]
  ));
}

module.exports = {
  hexToRgb,
  rgbToCmyk,
  formatHex,
  formatRgb,
  formatCmyk,
  escapeHtml,
};
