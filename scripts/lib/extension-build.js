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
 * generated contributes keys, preserving themes, iconThemes, keybindings,
 * walkthroughs and all metadata. Idempotent. Returns the same object.
 */
function mergeContributes(pkg, brandKey, displayName) {
  pkg.main = './extension.js';
  const events = new Set(pkg.activationEvents || []);
  events.add('onStartupFinished');
  pkg.activationEvents = [...events];
  pkg.contributes = { ...(pkg.contributes || {}), ...buildContributes(brandKey, displayName) };
  return pkg;
}

module.exports = { camelCase, nsFor, monochromeSvg, buildContributes, mergeContributes };
