const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const BRAND = 'Lucid Labs';
const THEME_DARK = 'Lucid Labs Dark';
const THEME_LIGHT = 'Lucid Labs Light';
const CONFIG_NS = 'lucidLabsTheme';

let brandPalette;

function loadPalette(extensionPath) {
  if (brandPalette) return brandPalette;
  const file = path.join(extensionPath, 'brand.json');
  brandPalette = JSON.parse(fs.readFileSync(file, 'utf8'));
  return brandPalette;
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
  item.tooltip = `${BRAND} theme — click for details`;
  context.subscriptions.push(item);
  return item;
}

function refreshStatusBar(item) {
  const cfg = vscode.workspace.getConfiguration(CONFIG_NS);
  const enabled = cfg.get('showStatusBarItem', true);
  if (!enabled || !isBrandActive()) {
    item.hide();
    return;
  }
  const variant = activeVariant();
  item.text = `$(symbol-color) ${BRAND} · ${variant === 'dark' ? 'Dark' : 'Light'}`;
  item.show();
}

class PaletteTreeProvider {
  constructor(extensionPath) {
    this.extensionPath = extensionPath;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(node) {
    return node;
  }

  getChildren(parent) {
    const palette = loadPalette(this.extensionPath);
    const variant = activeVariant();
    const colors = palette[variant] || {};
    if (!parent) {
      return Object.entries(colors)
        .filter(([, value]) => typeof value === 'string' && /^#[0-9A-Fa-f]{6,8}$/.test(value))
        .map(([role, hex]) => {
          const item = new vscode.TreeItem(role, vscode.TreeItemCollapsibleState.None);
          item.description = hex;
          item.tooltip = `${role} — ${hex}\nClick to copy`;
          item.iconPath = this.makeSwatch(hex);
          item.command = {
            command: `${CONFIG_NS}.copyColor`,
            title: 'Copy colour',
            arguments: [hex],
          };
          return item;
        });
    }
    return [];
  }

  makeSwatch(hex) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="${hex.slice(0, 7)}" stroke="#00000033"/></svg>`;
    return vscode.Uri.parse(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  }
}

function aboutWebviewHtml(palette, variant) {
  const colors = palette[variant] || {};
  const swatch = (role) => {
    const hex = colors[role] || '#000000';
    return `<div class="swatch"><span class="chip" style="background:${hex}"></span><code>${role}</code><span class="hex">${hex}</span></div>`;
  };
  const accent = colors.accent || '#339999';
  const bg = colors.background || '#271D3B';
  const fg = colors.foreground || '#E8E0F0';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';"><style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:${bg}; color:${fg}; margin:0; padding:24px; }
h1 { color:${accent}; margin:0 0 4px; font-size:24px; }
.tag { color:${colors.muted || '#CCCCCC'}; font-size:13px; margin-bottom:24px; display:block; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:8px; margin-top:16px; }
.swatch { display:flex; align-items:center; gap:8px; padding:8px 12px; background:${colors.backgroundPanel || bg}; border-radius:6px; }
.chip { display:inline-block; width:18px; height:18px; border-radius:4px; border:1px solid #00000033; }
code { color:${fg}; font-size:12px; flex:1; }
.hex { color:${colors.muted || '#CCCCCC'}; font-family:monospace; font-size:11px; }
h2 { color:${accent}; font-size:16px; margin-top:32px; }
</style></head><body>
<h1>${BRAND} Theme</h1><span class="tag">${variant === 'dark' ? 'Dark' : 'Light'} variant · brand-aligned palette</span>
<h2>Palette</h2><div class="grid">${Object.keys(colors).filter((k) => typeof colors[k] === 'string').map(swatch).join('')}</div>
</body></html>`;
}

function openAbout(context) {
  const panel = vscode.window.createWebviewPanel(
    'lucidLabsAbout',
    `${BRAND} Theme`,
    vscode.ViewColumn.Active,
    { enableScripts: false, retainContextWhenHidden: false },
  );
  const palette = loadPalette(context.extensionPath);
  panel.webview.html = aboutWebviewHtml(palette, activeVariant());
}

function activate(context) {
  const statusBar = makeStatusBarItem(context);
  refreshStatusBar(statusBar);

  const paletteProvider = new PaletteTreeProvider(context.extensionPath);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('lucidLabsPalette', paletteProvider),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveColorTheme(() => {
      refreshStatusBar(statusBar);
      paletteProvider.refresh();
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
    vscode.commands.registerCommand(`${CONFIG_NS}.copyColor`, async (hex) => {
      if (!hex) return;
      await vscode.env.clipboard.writeText(hex);
      vscode.window.setStatusBarMessage(`Copied ${hex}`, 1500);
    }),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
