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
 * Turn a brand mark SVG into a single-colour activity-bar icon: strip every
 * per-element fill and stroke colour value (template placeholders and literal
 * hex) and set fill="currentColor" on the root <svg> — plus stroke="currentColor"
 * when the mark was stroke-coloured. Marks that still cannot be flattened (e.g.
 * gradient url() fills) should get a hand-authored brands/<brand>/activity-icon.svg.
 */
function monochromeSvg(svg) {
  const usesStroke = /\sstroke="(?:\{\{[^}]+\}\}|#[0-9A-Fa-f]{3,8})"/.test(svg);
  const out = svg.replace(/\s*(?:fill|stroke)="(?:\{\{[^}]+\}\}|#[0-9A-Fa-f]{3,8})"/g, '');
  if (/<svg[^>]*\s(?:fill|stroke)="currentColor"/.test(out)) return out;
  const attr = usesStroke
    ? 'fill="currentColor" stroke="currentColor"'
    : 'fill="currentColor"';
  return out.replace(/<svg\b/, `<svg ${attr}`);
}

/** Build the generated contributes keys for a brand. */
function buildContributes(brandKey, displayName) {
  const ns = nsFor(brandKey);
  const container = `${ns}Container`;
  const view = `${ns}Palette`;
  return {
    viewsContainers: {
      activitybar: [
        { id: container, title: displayName, icon: 'activity-icon.svg' },
      ],
    },
    views: {
      [container]: [
        {
          id: view,
          name: 'Brand Palette',
          type: 'webview',
          icon: 'activity-icon.svg',
          contextualTitle: displayName,
        },
      ],
    },
    commands: [
      { command: `${ns}.switchDark`, title: `Switch to ${displayName} Dark`, category: displayName },
      { command: `${ns}.switchLight`, title: `Switch to ${displayName} Light`, category: displayName },
      { command: `${ns}.toggleVariant`, title: 'Toggle Dark/Light Variant', category: displayName },
      { command: `${ns}.openAbout`, title: 'Open Brand Palette', category: displayName, icon: '$(symbol-color)' },
    ],
    configuration: {
      title: `${displayName} Theme`,
      properties: {
        [`${ns}.showStatusBarItem`]: {
          type: 'boolean',
          default: true,
          description: `Show the ${displayName} brand chip in the status bar while a ${displayName} theme is active.`,
        },
      },
    },
    menus: {
      'view/title': [
        { command: `${ns}.openAbout`, when: `view == ${view}`, group: 'navigation' },
      ],
    },
  };
}

/**
 * Patch a parsed package.json: set main/activationEvents and merge the
 * generated contributes keys. Keys the generator does not own — themes,
 * iconThemes, keybindings, walkthroughs — are left untouched. The generated
 * keys (viewsContainers, views, commands, configuration) replace any existing
 * value. `menus` is merged one level deep, so the generated `view/title`
 * entry is regenerated while any other menu positions are preserved.
 * Idempotent. Returns the same object.
 */
function mergeContributes(pkg, brandKey, displayName) {
  pkg.main = './extension.js';
  const events = new Set(pkg.activationEvents || []);
  events.add('onStartupFinished');
  pkg.activationEvents = [...events];
  const existing = pkg.contributes || {};
  const generated = buildContributes(brandKey, displayName);
  pkg.contributes = {
    ...existing,
    ...generated,
    menus: { ...(existing.menus || {}), ...generated.menus },
  };
  return pkg;
}

/**
 * Fill templates/extension.js placeholders for a brand.
 * themes — the package.json contributes.themes array (used to find labels).
 */
function renderExtensionJs(template, brandKey, displayName, themes) {
  const dark = (themes || []).find((t) => t.uiTheme === 'vs-dark');
  const light = (themes || []).find((t) => t.uiTheme === 'vs');
  if (!dark || !light) {
    throw new Error(`Brand "${brandKey}" is missing a vs-dark or vs theme label`);
  }
  const ns = nsFor(brandKey);
  return template
    .replace(/__BRAND__/g, displayName)
    .replace(/__THEME_DARK__/g, dark.label)
    .replace(/__THEME_LIGHT__/g, light.label)
    .replace(/__CONFIG_NS__/g, ns)
    .replace(/__VIEW_ID__/g, `${ns}Palette`);
}

module.exports = {
  camelCase, nsFor, monochromeSvg, buildContributes, mergeContributes, renderExtensionJs,
};
