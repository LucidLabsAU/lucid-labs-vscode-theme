# Lucid Labs Theme

A professional dark theme for Visual Studio Code that brings the sophisticated Lucid Labs brand identity to your development environment. Perfect for Azure developers, PowerShell scripters, and enterprise teams seeking a consistent, professional coding experience.

![Lucid Labs Theme Preview](https://lucidlabs.gallerycdn.vsassets.io/extensions/lucidlabs/lucid-labs-theme/1.0.1/1755041913219/Microsoft.VisualStudio.Services.Icons.Default)

## Features

- **Brand-Aligned Design** - Meticulously crafted using official Lucid Labs brand guidelines
- **Dual Theme Support** - Both professional dark and clean light theme variants
- **System Theme Support** - Automatically follows your system's light/dark preference
- **Cloud-Inspired Aesthetics** - Reflects Lucid Labs' expertise in cloud technologies
- **Enterprise-Ready** - Perfect for client demonstrations and professional environments
- **Enhanced Navigation** - Coloured top, left, and bottom navigation bars with brand accents
- **WCAG AA Contrast** - All text colours meet or exceed WCAG AA accessibility standards
- **Easy on the Eyes** - Warm off-white text and softened terminal colours reduce eye strain

## Colour Palette

Our carefully selected colours ensure both brand consistency and optimal developer experience:

| Colour             | Hex Code  | Usage                                         |
| ------------------ | --------- | --------------------------------------------- |
| **Primary Purple** | `#271D3B` | Main background, primary brand colour         |
| **Teal Accent**    | `#339999` | Highlights, links, functions, active elements |
| **Light Purple**   | `#9B7ED9` | Keywords, tags, secondary elements            |
| **Sage Green**     | `#C3D7CD` | Strings, symbols, inherited classes           |
| **Off-White**      | `#E8E0F0` | Primary text (warm, reduced glare)            |
| **Dark Grey**      | `#101820` | Panels, status bar, containers                |

## Installation

### From VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Lucid Labs Theme"
4. Click Install
5. Go to File > Preferences > Colour Theme
6. Choose your preferred variant:
   - **Lucid Labs Dark** - Professional dark theme
   - **Lucid Labs Light** - Clean light theme

### From Command Palette

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Preferences: Colour Theme"
3. Select your preferred Lucid Labs theme variant

### System Theme Support

The extension provides both light and dark variants that automatically follow your system preferences when using VS Code's "Auto" theme setting.

### Manual Installation

1. Download the `.vsix` file from releases
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the three dots menu (...)
5. Select "Install from VSIX..."
6. Choose the downloaded file

### Development

To build from source:

- Install VSCE: `npm install -g @vscode/vsce`
- Package the extension: `vsce package`
- Install the generated `.vsix` in VS Code via Extensions > `...` > Install from VSIX

## Automated Releases and Publishing

- Automated releases use [Release Please](https://github.com/googleapis/release-please). It opens a release PR that bumps `package.json`, updates `CHANGELOG.md`, and proposes a tag.
- When you merge the release PR, Release Please creates a GitHub release and tag.
- The Auto Publish workflow detects changes to themes or `package.json` and:
  - Authenticates to Azure via OIDC
  - Retrieves the VSCE PAT from Azure Key Vault
  - Packages the extension (`vsce package`)
  - Publishes to the VS Code Marketplace (`vsce publish`)

## Brand Guidelines Compliance

This theme follows the Lucid Labs Brand Guidelines:

- Uses approved primary and secondary colours
- Maintains brand consistency across all UI elements
- Implements proper colour hierarchy and contrast ratios
- All text meets WCAG AA minimum contrast requirements

## Supported Languages

The theme provides enhanced syntax highlighting for:

**Microsoft Technologies:**

- PowerShell (.ps1, .psm1, .psd1)
- Azure ARM Templates (.json)
- Azure DevOps YAML Pipelines
- Microsoft Graph API responses

**Web Development:**

- JavaScript/TypeScript
- JSON configuration files
- HTML/XML markup
- CSS/SCSS styling

**Documentation and Configuration:**

- Markdown (.md)
- YAML (.yml, .yaml)
- INI configuration files
- Log files

**General Programming:**

- Python (.py)
- C# (.cs)
- PHP (.php)
- SQL (.sql)

## Contributing

We welcome contributions! To suggest improvements or report issues:

1. Visit our [GitHub repository](https://github.com/LucidLabsAU/lucid-labs-vscode-theme)
2. Create an issue with detailed feedback
3. Use the "theme" label for categorisation
4. Follow our contribution guidelines

## Requirements

- Visual Studio Code version 1.107.0 or higher
- No additional dependencies required

## Updates

This extension is actively maintained. Check the [changelog](CHANGELOG.md) for the latest updates and improvements.

## Licence

MIT Licence - See [LICENSE](LICENSE) file for full details.

## About Lucid Labs

Lucid Labs is a leading Microsoft Partner specialising in:

- Azure cloud solutions and migrations
- Microsoft 365 security and compliance
- Enterprise automation and DevOps
- Data analytics and AI solutions

**Contact us:**

- Website: [lucidlabs.com.au](https://lucidlabs.com.au/contact)
- Location: Brisbane, Queensland, Australia

---

_"Guidelines transform a brand into a lasting impression."_
-- Lucid Labs Brand Guidelines
