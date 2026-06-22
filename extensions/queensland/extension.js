const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pv = require('./lib/palette-view');

const BRAND = 'Queensland';
const THEME_DARK = 'Queensland Dark';
const THEME_LIGHT = 'Queensland Light';
const CONFIG_NS = 'queenslandTheme';
const VIEW_ID = 'queenslandThemePalette';
// The brand's icon-theme id (from package.json contributes.iconThemes), or ''
// for brands that ship no icon theme — the palette page hides its Icons button.
const ICON_THEME = 'queensland-icons';

// Every colour theme this extension bundles, grouped by edition (everyday plus
// any variant editions). The generator injects this from contributes.themes;
// `short` is the de-prefixed button label (e.g. 'Dark', or 'Full Beard').
const THEMES = [{"edition":"Everyday","dark":{"label":"Queensland Dark","short":"Dark"},"light":{"label":"Queensland Light","short":"Light"}}];
// Flattened {label, short, variant} entries for active-theme lookups.
const ALL_THEMES = THEMES.flatMap((g) => [
  g.dark && { ...g.dark, variant: 'dark' },
  g.light && { ...g.light, variant: 'light' },
].filter(Boolean));

// Brand-gated: an HTTP MCP server definition for brands that ship one (the
// generator substitutes an object for those brands, `null` for the rest).
const MCP_CONFIG = null;

let brandData;

function loadBrand(extensionPath) {
  if (brandData) return brandData;
  brandData = JSON.parse(fs.readFileSync(path.join(extensionPath, 'brand.json'), 'utf8'));
  return brandData;
}

function activeThemeName() {
  return vscode.workspace.getConfiguration().get('workbench.colorTheme') || '';
}

/** The bundled-theme entry currently applied as the editor theme, or null. */
function activeThemeEntry() {
  const name = activeThemeName();
  return ALL_THEMES.find((t) => t.label === name) || null;
}

function isBrandActive() {
  return !!activeThemeEntry();
}

function activeVariant() {
  const e = activeThemeEntry();
  return e ? e.variant : 'dark';
}

/** Full label of the applied brand theme (any edition), or '' if none. */
function appliedThemeLabel() {
  const e = activeThemeEntry();
  return e ? e.label : '';
}

/** Whether `label` is one of this extension's own bundled themes. */
function isOwnTheme(label) {
  return typeof label === 'string' && ALL_THEMES.some((t) => t.label === label);
}

async function setTheme(label) {
  await vscode.workspace
    .getConfiguration()
    .update('workbench.colorTheme', label, vscode.ConfigurationTarget.Global);
}

async function setIconTheme(id) {
  if (!id) return;
  await vscode.workspace
    .getConfiguration()
    .update('workbench.iconTheme', id, vscode.ConfigurationTarget.Global);
}

/** Whether the brand's icon theme is the active workbench icon theme. */
function iconsApplied() {
  return (
    !!ICON_THEME &&
    vscode.workspace.getConfiguration().get('workbench.iconTheme') === ICON_THEME
  );
}

function makeStatusBarItem(context) {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = `${CONFIG_NS}.openAbout`;
  item.tooltip = `${BRAND} theme — click for the brand palette`;
  context.subscriptions.push(item);
  return item;
}

function refreshStatusBar(item) {
  const cfg = vscode.workspace.getConfiguration(CONFIG_NS);
  if (!cfg.get('showStatusBarItem', true) || !isBrandActive()) {
    item.hide();
    return;
  }
  item.text = `$(symbol-color) ${BRAND} · ${activeVariant() === 'dark' ? 'Dark' : 'Light'}`;
  item.show();
}

/** Build the webview HTML for a given webview instance. */
function renderHtml(extensionPath, webview) {
  const brand = loadBrand(extensionPath);
  return pv.renderPaletteHtml({
    brandName: brand.displayName || BRAND,
    palette: brand,
    activeVariant: activeVariant(),
    brandColors: brand.brandColors,
    nonce: crypto.randomBytes(16).toString('hex'),
    cspSource: webview.cspSource,
    themeGroups: THEMES,
    hasIconTheme: !!ICON_THEME,
    iconsApplied: iconsApplied(),
    appliedThemeLabel: appliedThemeLabel(),
  });
}

/** Push the live apply-state (editor theme + icons) to a webview. */
function postState(webview) {
  if (!webview) return;
  webview.postMessage({ type: 'variant', value: activeVariant() });
  webview.postMessage({
    type: 'applied',
    theme: appliedThemeLabel(),
    icons: iconsApplied(),
  });
}

/** Wire webview messages: copy-to-clipboard, apply theme, apply icon theme. */
function attachMessageHandler(webview, subscriptions) {
  subscriptions.push(
    webview.onDidReceiveMessage(async (msg) => {
      if (!msg) return;
      if (msg.type === 'copy' && msg.value) {
        await vscode.env.clipboard.writeText(msg.value);
        vscode.window.setStatusBarMessage(`Copied ${msg.value}`, 1500);
      } else if (msg.type === 'setThemeByLabel' && isOwnTheme(msg.label)) {
        await setTheme(msg.label);
      } else if (msg.type === 'setIcons') {
        await setIconTheme(ICON_THEME);
      } else if (msg.type === 'setThemeAndIconsByLabel' && isOwnTheme(msg.label)) {
        await setTheme(msg.label);
        await setIconTheme(ICON_THEME);
      }
    }),
  );
}

class PaletteViewProvider {
  constructor(extensionPath) {
    this.extensionPath = extensionPath;
    this.view = null;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = renderHtml(this.extensionPath, webviewView.webview);
    attachMessageHandler(webviewView.webview, []);
  }

  /** Push the live editor-theme/icon state to the sidebar view. */
  notifyState() {
    if (this.view) postState(this.view.webview);
  }
}

// A single shared "Brand Palette" editor panel — reused so repeated invocations
// reveal the existing tab instead of stacking duplicates.
let aboutPanel = null;

function openAbout(context) {
  if (aboutPanel) {
    aboutPanel.reveal(vscode.ViewColumn.Active);
    return;
  }
  aboutPanel = vscode.window.createWebviewPanel(
    `${CONFIG_NS}About`,
    `${BRAND} — Brand Palette`,
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: false },
  );
  aboutPanel.onDidDispose(() => { aboutPanel = null; }, null, context.subscriptions);
  aboutPanel.webview.html = renderHtml(context.extensionPath, aboutPanel.webview);
  attachMessageHandler(aboutPanel.webview, context.subscriptions);
}

/**
 * Register the brand's hosted MCP server with VS Code so it appears in the
 * MCP server list without the user hand-editing `.vscode/mcp.json`. No-op for
 * brands without an `mcp` config, and on hosts too old to expose the API.
 * Authentication is handled by VS Code: on a 401 the server advertises its
 * OAuth protected-resource metadata and VS Code drives the sign-in flow.
 */
function registerMcpProvider(context) {
  const cfg = MCP_CONFIG;
  if (!cfg || !cfg.url) {
    return;
  }
  if (
    !vscode.lm ||
    typeof vscode.lm.registerMcpServerDefinitionProvider !== 'function' ||
    typeof vscode.McpHttpServerDefinition !== 'function'
  ) {
    return;
  }
  const provider = {
    provideMcpServerDefinitions() {
      return [
        new vscode.McpHttpServerDefinition(
          cfg.label || BRAND,
          vscode.Uri.parse(cfg.url),
          cfg.headers || {},
          cfg.version,
        ),
      ];
    },
    resolveMcpServerDefinition(server) {
      // VS Code negotiates OAuth from the server's protected-resource metadata.
      return server;
    },
  };
  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider(cfg.id || `${CONFIG_NS}Mcp`, provider),
  );
}

function activate(context) {
  registerMcpProvider(context);
  const statusBar = makeStatusBarItem(context);
  refreshStatusBar(statusBar);

  const provider = new PaletteViewProvider(context.extensionPath);
  const refreshViews = () => {
    refreshStatusBar(statusBar);
    provider.notifyState();
    if (aboutPanel) postState(aboutPanel.webview);
  };
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, provider),
    vscode.window.onDidChangeActiveColorTheme(refreshViews),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(`${CONFIG_NS}.showStatusBarItem`)) {
        refreshStatusBar(statusBar);
      }
      if (event.affectsConfiguration('workbench.iconTheme')) {
        refreshViews();
      }
    }),
    vscode.commands.registerCommand(`${CONFIG_NS}.switchDark`, () => setTheme(THEME_DARK)),
    vscode.commands.registerCommand(`${CONFIG_NS}.switchLight`, () => setTheme(THEME_LIGHT)),
    vscode.commands.registerCommand(`${CONFIG_NS}.toggleVariant`, () =>
      setTheme(activeVariant() === 'dark' ? THEME_LIGHT : THEME_DARK),
    ),
    vscode.commands.registerCommand(`${CONFIG_NS}.openAbout`, () => openAbout(context)),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
