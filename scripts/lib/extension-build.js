'use strict';

/** kebab-case -> camelCase. */
function camelCase(s) {
  return String(s).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/** Brand key -> command/config namespace, e.g. 'lucid-labs' -> 'lucidLabsTheme'. */
function nsFor(brandKey) {
  return camelCase(brandKey) + 'Theme';
}

/**
 * Turn a brand mark SVG into a single-colour activity-bar icon:
 * strip every per-element fill (template placeholders and literal hex) and set
 * fill="currentColor" once on the root <svg>.
 */
function monochromeSvg(svg) {
  let out = svg.replace(/\s*fill="(\{\{[^}]+\}\}|#[0-9A-Fa-f]{3,8})"/g, '');
  if (/<svg[^>]*\sfill="currentColor"/.test(out)) return out;
  return out.replace(/<svg\b/, '<svg fill="currentColor"');
}

module.exports = { camelCase, nsFor, monochromeSvg };
