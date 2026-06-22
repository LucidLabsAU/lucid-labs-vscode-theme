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

/**
 * Longest common prefix of two strings, cut back to a word boundary (trailing
 * space). 'Pax8 Dark'/'Pax8 Light' -> 'Pax8 '; 'Matt Lee Full Beard'/'Matt Lee
 * Shaved' -> 'Matt Lee '. Returns '' when they diverge in the first word.
 */
function wordCommonPrefix(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const sp = a.lastIndexOf(' ', i - 1);
  return sp >= 0 ? a.slice(0, sp + 1) : '';
}

/**
 * Group a package.json contributes.themes array into editions for the palette
 * page's "Apply to editor" bar. Themes are grouped by the text after ' · '
 * (e.g. 'Pax8 Dark · CTF 2026' -> edition 'CTF 2026'); themes with no suffix
 * form the default 'Everyday' group. Each group yields a `short` button label
 * with the dark/light pair's shared prefix stripped, falling back to
 * 'Dark'/'Light'. First-seen edition order is preserved.
 */
function buildThemeGroups(themes) {
  const order = [];
  const groups = new Map();
  for (const t of themes || []) {
    const parts = String(t.label).split(' · ');
    const edition = parts.length > 1 ? parts.slice(1).join(' · ') : '';
    if (!groups.has(edition)) {
      groups.set(edition, { edition, dark: null, light: null });
      order.push(edition);
    }
    const g = groups.get(edition);
    if (t.uiTheme === 'vs-dark' && !g.dark) g.dark = t.label;
    else if (t.uiTheme === 'vs' && !g.light) g.light = t.label;
  }
  return order.map((ed) => {
    const g = groups.get(ed);
    const base = (s) => (s ? s.split(' · ')[0] : '');
    const prefix = g.dark && g.light ? wordCommonPrefix(base(g.dark), base(g.light)) : '';
    const short = (full, fallback) => {
      if (!full) return fallback;
      return base(full).slice(prefix.length).trim() || fallback;
    };
    return {
      edition: ed || 'Everyday',
      dark: g.dark ? { label: g.dark, short: short(g.dark, 'Dark') } : null,
      light: g.light ? { label: g.light, short: short(g.light, 'Light') } : null,
    };
  });
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
function mergeContributes(pkg, brandKey, displayName, mcp) {
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
  // MCP server registration is brand-gated: present it only for brands that
  // declare an `mcp` config, and strip a stale entry otherwise (idempotent).
  if (mcp && mcp.id) {
    pkg.contributes.mcpServerDefinitionProviders = [
      { id: mcp.id, label: mcp.label || displayName },
    ];
  } else {
    delete pkg.contributes.mcpServerDefinitionProviders;
  }
  return pkg;
}

/**
 * Fill templates/extension.js placeholders for a brand.
 * themes — the package.json contributes.themes array (used to find labels).
 */
function renderExtensionJs(template, brandKey, displayName, themes, mcp, iconThemes) {
  const dark = (themes || []).find((t) => t.uiTheme === 'vs-dark');
  const light = (themes || []).find((t) => t.uiTheme === 'vs');
  if (!dark || !light) {
    throw new Error(`Brand "${brandKey}" is missing a vs-dark or vs theme label`);
  }
  const ns = nsFor(brandKey);
  // Inlined as a JS literal: an object for MCP-enabled brands, else `null`.
  const mcpConfig = mcp && mcp.id ? JSON.stringify(mcp) : 'null';
  // The brand's icon-theme id, or '' when the brand ships no icon theme.
  const iconTheme = (iconThemes && iconThemes[0] && iconThemes[0].id) || '';
  // All bundled themes grouped by edition, inlined as a JS literal.
  const themeGroups = JSON.stringify(buildThemeGroups(themes));
  return template
    .replace(/__BRAND__/g, displayName)
    .replace(/__THEME_DARK__/g, dark.label)
    .replace(/__THEME_LIGHT__/g, light.label)
    .replace(/__CONFIG_NS__/g, ns)
    .replace(/__VIEW_ID__/g, `${ns}Palette`)
    .replace(/__ICON_THEME__/g, iconTheme)
    .replace(/__THEMES__/g, themeGroups)
    .replace(/__MCP_CONFIG__/g, mcpConfig);
}

module.exports = {
  camelCase, nsFor, monochromeSvg, wordCommonPrefix, buildThemeGroups,
  buildContributes, mergeContributes, renderExtensionJs,
};
