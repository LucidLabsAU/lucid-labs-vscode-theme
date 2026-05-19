# Lucid Labs Theme

A professional VS Code theme that brings the official **Lucid Labs** brand identity into your development environment — deep purple base, teal accents, warm off-white text. Designed for Azure developers, PowerShell scripters, and enterprise teams.

> Now ships with a guided walkthrough, a Brand Palette view in the activity bar, a status bar chip, and quick-switch commands.

## Features

- **906 themed UI tokens** — 100% VS Code colour API coverage across editor, terminal, chat, notebook, debug, diff, status bar, peek view
- **Dual variants** — professional dark + clean light, both WCAG AA
- **System theme follow** — works with VS Code's "Auto" colour mode
- **Brand-aligned icon theme** — 78+ icons for the Microsoft, web, data, and DevOps stack
- **Walkthrough onboarding** — opens automatically after install; walks you through activation, variants, icons, and the palette browser
- **Brand Palette view** — dedicated Activity Bar view that lists every colour role with one-click copy-to-clipboard
- **Theme Reference webview** — full-page interactive reference, rendered live in the active variant
- **Status bar chip** — confirms the active brand and variant (toggleable in settings)
- **Quick commands** — `Lucid Labs: Switch to Dark`, `Switch to Light`, `Toggle Variant`, `Open Theme Reference`
- **Keybinding** — `Cmd+Alt+L` / `Ctrl+Alt+L` to toggle dark/light instantly

## Colour Palette

| Role | Dark | Light | Usage |
|------|------|-------|-------|
| **Background** | `#271D3B` | `#FFFFFF` | Editor base |
| **Foreground** | `#E8E0F0` | `#271D3B` | Primary text |
| **Accent (teal)** | `#339999` | `#339999` | Links, functions, active elements |
| **Keyword (purple)** | `#9B7ED9` | `#7454B3` | Keywords, tags |
| **String (sage)** | `#C3D7CD` | `#2E7D32` | Strings, symbols |
| **Constant** | `#F0F0E1` | `#B87333` | Constants, numbers |
| **Error** | `#D96560` | `#D96560` | Diagnostics |
| **Success** | `#5BBF7A` | `#28A745` | Git additions, success states |

## Installation

1. Open VS Code
2. **Extensions** → search `Lucid Labs Theme`
3. Click **Install**
4. The walkthrough opens automatically; follow the steps to activate your preferred variant
5. Or open the picker directly: `Cmd+K Cmd+T` / `Ctrl+K Ctrl+T` → choose **Lucid Labs Dark** or **Lucid Labs Light**

### Manual install (.vsix)

Download from [GitHub Releases](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/releases) → Extensions panel → `…` → **Install from VSIX**.

## Commands

| Command | Default keybinding |
|---------|--------------------|
| `Lucid Labs: Switch to Dark` | — |
| `Lucid Labs: Switch to Light` | — |
| `Lucid Labs: Toggle Variant` | `Cmd+Alt+L` / `Ctrl+Alt+L` |
| `Lucid Labs: Open Theme Reference` | — |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `lucidLabsTheme.showStatusBarItem` | `true` | Toggle the brand chip in the status bar |

## Brand Guidelines Compliance

This theme follows the official Lucid Labs brand guidelines:

- Approved primary and secondary colour set
- WCAG AA minimum contrast across all UI text
- Consistent colour hierarchy across editor, terminal, chat, and diff views

## Supported Languages (enhanced highlighting)

**Microsoft stack:** PowerShell, Bicep, ARM templates, C#, F#, .NET, Azure DevOps YAML, Microsoft Graph

**Web:** TypeScript, JavaScript, React, Vue, Svelte, HTML, CSS, SCSS

**Data:** JSON, YAML, CSV, Parquet, TMDL, SQL, KQL

**General:** Python, Go, Rust, Java, Ruby, PHP, Swift, Kotlin, Markdown

## Requirements

- VS Code 1.107.0 or higher

## Contributing

- [Open an issue](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/issues)
- [Read the contribution guide](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/blob/main/.github/copilot-instructions.md)

## Licence

MIT — see [LICENSE](LICENSE)

## About Lucid Labs

Microsoft Partner specialising in Azure, M365 security and compliance, enterprise automation, and data + AI solutions.

- Website: [lucidlabs.com.au](https://lucidlabs.com.au)
- Brisbane, Queensland, Australia

---

_"Guidelines transform a brand into a lasting impression."_ — Lucid Labs Brand Guidelines
