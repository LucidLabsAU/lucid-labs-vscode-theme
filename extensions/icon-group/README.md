# Icon Group Theme

A professional theme for Visual Studio Code inspired by Icon Group's brand identity. Features navy blue backgrounds, gold accents, and a healthcare-focused colour palette reflecting Icon Group's leadership in cancer care across Australia and the Asia-Pacific region.

## Features

- **Brand-Aligned Design** - Crafted using official Icon Group brand colours from icongroup.global
- **Dual Theme Support** - Both professional dark and clean light theme variants
- **System Theme Support** - Automatically follows your system's light/dark preference
- **Healthcare-Inspired Aesthetics** - Reflects Icon Group's commitment to cancer care excellence
- **Enterprise-Ready** - Perfect for client demonstrations and professional environments
- **Enhanced Navigation** - Coloured top, left, and bottom navigation bars with brand accents
- **WCAG AA Contrast** - All text colours meet or exceed WCAG AA accessibility standards
- **Easy on the Eyes** - Warm off-white text and softened terminal colours reduce eye strain

## Colour Palette

Our carefully selected colours ensure both brand consistency and optimal developer experience:

| Colour             | Hex Code  | Usage                                         |
| ------------------ | --------- | --------------------------------------------- |
| **Navy Blue**      | `#0E2A4A` | Main dark background, primary brand colour    |
| **Brand Blue**     | `#006FB9` | Functions, links, active elements             |
| **Gold Accent**    | `#FDBD10` | Highlights, brackets, warning indicators      |
| **Purple**         | `#9B6FCF` | Keywords, tags, secondary elements            |
| **Green**          | `#7BC8A4` | Strings, symbols, success indicators          |
| **Off-White**      | `#E0E8F0` | Primary text (warm, reduced glare)            |

## Installation

### From VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Icon Group Theme"
4. Click Install
5. Go to File > Preferences > Colour Theme
6. Choose your preferred variant:
   - **Icon Group Dark** - Professional dark theme
   - **Icon Group Light** - Clean light theme

### From Command Palette

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Preferences: Colour Theme"
3. Select your preferred Icon Group theme variant

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

## Brand Guidelines Compliance

This theme follows the Icon Group Brand Guidelines:

- Uses approved primary and secondary colours from icongroup.global
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

## About Icon Group

Icon Group is the largest dedicated cancer care provider in Australia and one of the top five in the world. With a comprehensive network of cancer centres, pharmacies, and research programs, Icon Group delivers world-class care across Australia, New Zealand, Singapore, and the wider Asia-Pacific region.

**Learn more:**

- Website: [icongroup.global](https://icongroup.global)

---

_"Building a world-class platform to change the way cancer is treated."_
-- Icon Group
