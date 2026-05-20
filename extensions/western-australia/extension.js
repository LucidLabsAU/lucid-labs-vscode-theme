const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pv = require('./lib/palette-view');

const BRAND = 'Western Australia';
const THEME_DARK = 'Western Australia Dark';
const THEME_LIGHT = 'Western Australia Light';
const CONFIG_NS = 'westernAustraliaTheme';
const VIEW_ID = 'westernAustraliaThemePalette';

let brandData;

function loadBrand(extensionPath) {
  if (brandData) return brandData;
  brandData = JSON.parse(fs.readFileSync(path.join(extensionPath, 'brand.json'), 'utf8'));
  return brandData;
}

function activeThemeName() {
  return vscode.workspace.getConfiguration().get('workbench.colorTheme') || '';
}

function isBrandActive() {
  const name = activeThemeName();
  return name === THEME_DARK || name === THEME_LIGHT;
}

function activeVariant() {
  return activeThemeName() === THEME_LIGHT ? 'light' : 'dark';
}

async function setTheme(label) {
  await vscode.workspace
    .getConfiguration()
    .update('workbench.colorTheme', label, vscode.ConfigurationTarget.Global);
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
  });
}

/** Wire copy messages from a webview to the clipboard. */
function attachCopyHandler(webview, subscriptions) {
  subscriptions.push(
    webview.onDidReceiveMessage(async (msg) => {
      if (msg && msg.type === 'copy' && msg.value) {
        await vscode.env.clipboard.writeText(msg.value);
        vscode.window.setStatusBarMessage(`Copied ${msg.value}`, 1500);
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
    attachCopyHandler(webviewView.webview, []);
  }

  /** Tell the live view which variant the editor is now on. */
  notifyVariant() {
    if (this.view) {
      this.view.webview.postMessage({ type: 'variant', value: activeVariant() });
    }
  }
}

function openAbout(context) {
  const panel = vscode.window.createWebviewPanel(
    `${CONFIG_NS}About`,
    `${BRAND} — Brand Palette`,
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: false },
  );
  panel.webview.html = renderHtml(context.extensionPath, panel.webview);
  attachCopyHandler(panel.webview, context.subscriptions);
}

function activate(context) {
  const statusBar = makeStatusBarItem(context);
  refreshStatusBar(statusBar);

  const provider = new PaletteViewProvider(context.extensionPath);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, provider),
    vscode.window.onDidChangeActiveColorTheme(() => {
      refreshStatusBar(statusBar);
      provider.notifyVariant();
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(`${CONFIG_NS}.showStatusBarItem`)) {
        refreshStatusBar(statusBar);
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
