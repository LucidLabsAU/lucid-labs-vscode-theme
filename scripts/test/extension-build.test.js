const test = require('node:test');
const assert = require('node:assert/strict');
const eb = require('../lib/extension-build');

test('camelCase converts a kebab brand key', () => {
  assert.equal(eb.camelCase('new-south-wales'), 'newSouthWales');
  assert.equal(eb.camelCase('charli'), 'charli');
});

test('nsFor appends Theme to the camelCased key', () => {
  assert.equal(eb.nsFor('lucid-labs'), 'lucidLabsTheme');
  assert.equal(eb.nsFor('charli'), 'charliTheme');
});

test('monochromeSvg replaces {{role}} placeholders with currentColor', () => {
  const out = eb.monochromeSvg('<svg><path fill="{{accent}}"/></svg>');
  assert.equal(out, '<svg fill="currentColor"><path/></svg>');
});

test('monochromeSvg replaces literal hex fills with currentColor', () => {
  const out = eb.monochromeSvg('<svg><path fill="#339999"/><path fill="#ABC"/></svg>');
  assert.equal(out, '<svg fill="currentColor"><path/><path/></svg>');
});

test('monochromeSvg leaves an already-monochrome svg unchanged in meaning', () => {
  const out = eb.monochromeSvg('<svg fill="currentColor"><path d="M0 0"/></svg>');
  assert.match(out, /fill="currentColor"/);
  assert.doesNotMatch(out, /fill="currentColor"[^>]*fill="currentColor"/);
});

test('monochromeSvg handles stroke-coloured marks', () => {
  const out = eb.monochromeSvg('<svg><path stroke="{{accent}}"/></svg>');
  assert.equal(out, '<svg fill="currentColor" stroke="currentColor"><path/></svg>');
});

function samplePkg() {
  return {
    name: 'charli-health-theme',
    version: '1.7.0',
    contributes: {
      themes: [
        { label: 'CHARLi Dark', uiTheme: 'vs-dark', path: './themes/charli-dark.json' },
        { label: 'CHARLi Light', uiTheme: 'vs', path: './themes/charli-light.json' },
      ],
      iconThemes: [{ id: 'charli-icons', label: 'CHARLi Icons', path: './icon-theme.json' }],
    },
  };
}

test('mergeContributes sets main and activationEvents', () => {
  const pkg = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  assert.equal(pkg.main, './extension.js');
  assert.ok(pkg.activationEvents.includes('onStartupFinished'));
});

test('mergeContributes adds a namespaced container, webview view and commands', () => {
  const pkg = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  assert.equal(pkg.contributes.viewsContainers.activitybar[0].id, 'charliThemeContainer');
  const view = pkg.contributes.views.charliThemeContainer[0];
  assert.equal(view.id, 'charliThemePalette');
  assert.equal(view.type, 'webview');
  const cmdIds = pkg.contributes.commands.map((c) => c.command);
  assert.deepEqual(cmdIds, [
    'charliTheme.switchDark', 'charliTheme.switchLight',
    'charliTheme.toggleVariant', 'charliTheme.openAbout',
  ]);
});

test('mergeContributes preserves themes and iconThemes', () => {
  const pkg = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  assert.equal(pkg.contributes.themes.length, 2);
  assert.equal(pkg.contributes.iconThemes.length, 1);
});

test('mergeContributes is idempotent', () => {
  const once = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  const twice = eb.mergeContributes(JSON.parse(JSON.stringify(once)), 'charli', 'CHARLi');
  assert.deepEqual(twice, once);
});

test('mergeContributes preserves menu positions it does not own', () => {
  const pkg = samplePkg();
  pkg.contributes.menus = {
    'editor/context': [{ command: 'charliTheme.somethingElse', group: 'z' }],
  };
  const merged = eb.mergeContributes(pkg, 'charli', 'CHARLi');
  // generator's view/title is added
  assert.equal(merged.contributes.menus['view/title'][0].command, 'charliTheme.openAbout');
  // the hand-authored editor/context entry survives
  assert.equal(merged.contributes.menus['editor/context'][0].command, 'charliTheme.somethingElse');
});

test('mergeContributes adds an MCP provider when the brand declares one', () => {
  const pkg = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi', {
    id: 'lucidOperations', label: 'Lucid Operations', url: 'https://example/mcp',
  });
  assert.deepEqual(pkg.contributes.mcpServerDefinitionProviders, [
    { id: 'lucidOperations', label: 'Lucid Operations' },
  ]);
});

test('mergeContributes omits the MCP provider for brands without one', () => {
  const pkg = eb.mergeContributes(samplePkg(), 'charli', 'CHARLi');
  assert.equal(pkg.contributes.mcpServerDefinitionProviders, undefined);
});

test('mergeContributes strips a stale MCP provider (idempotent gate-off)', () => {
  const pkg = samplePkg();
  pkg.contributes.mcpServerDefinitionProviders = [{ id: 'old', label: 'Old' }];
  const merged = eb.mergeContributes(pkg, 'charli', 'CHARLi');
  assert.equal(merged.contributes.mcpServerDefinitionProviders, undefined);
});

const TEMPLATE = [
  "const BRAND = '__BRAND__';",
  "const THEME_DARK = '__THEME_DARK__';",
  "const THEME_LIGHT = '__THEME_LIGHT__';",
  "const CONFIG_NS = '__CONFIG_NS__';",
  "const VIEW_ID = '__VIEW_ID__';",
  'const MCP_CONFIG = __MCP_CONFIG__;',
].join('\n');

const THEMES = [
  { label: 'CHARLi Dark', uiTheme: 'vs-dark', path: './themes/charli-dark.json' },
  { label: 'CHARLi Light', uiTheme: 'vs', path: './themes/charli-light.json' },
];

test('renderExtensionJs substitutes every placeholder', () => {
  const out = eb.renderExtensionJs(TEMPLATE, 'charli', 'CHARLi', THEMES);
  assert.match(out, /const BRAND = 'CHARLi';/);
  assert.match(out, /const THEME_DARK = 'CHARLi Dark';/);
  assert.match(out, /const THEME_LIGHT = 'CHARLi Light';/);
  assert.match(out, /const CONFIG_NS = 'charliTheme';/);
  assert.match(out, /const VIEW_ID = 'charliThemePalette';/);
  assert.doesNotMatch(out, /__[A-Z_]+__/);
});

test('renderExtensionJs throws when a theme label is missing', () => {
  assert.throws(() => eb.renderExtensionJs(TEMPLATE, 'charli', 'CHARLi', []));
});

test('renderExtensionJs inlines null MCP_CONFIG when no mcp is given', () => {
  const out = eb.renderExtensionJs(TEMPLATE, 'charli', 'CHARLi', THEMES);
  assert.match(out, /const MCP_CONFIG = null;/);
  assert.doesNotMatch(out, /__[A-Z_]+__/);
});

test('renderExtensionJs inlines the mcp object as a JS literal', () => {
  const mcp = { id: 'lucidOperations', label: 'Lucid Operations', url: 'https://example/mcp' };
  const out = eb.renderExtensionJs(TEMPLATE, 'charli', 'CHARLi', THEMES, mcp);
  const m = out.match(/const MCP_CONFIG = (.+);/);
  assert.ok(m, 'MCP_CONFIG assignment present');
  assert.deepEqual(JSON.parse(m[1]), mcp);
  assert.doesNotMatch(out, /__[A-Z_]+__/);
});
