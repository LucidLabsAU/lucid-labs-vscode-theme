# Change Log

All notable changes to the Lucid Labs Theme extension will be documented in this file.

## [1.1.0](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/compare/v1.0.2...v1.1.0) (2026-02-18)


### Features

* add auto-publish and dependabot with auto-merge ([0dba6b1](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/0dba6b10c9adf8fd94817f2890c8cb700b4d130d))
* add linting for VS Code theme files and update theme properties ([f78e397](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/f78e3978e4c549b117eaf458aa2e45226542b722))
* add Release Please workflow for automated versioning ([6a76994](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/6a76994b789b964a8efba054a813831498bc762b))
* update theme files and add CLAUDE.md for project guidance ([8da5c38](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/8da5c3883af678d91215cbe4bbf3dc2ea615c230))
* use Azure OIDC and Key Vault for publishing ([ca97f26](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/ca97f26427ef4da4c90fd2149ae22c0bbafd028d))
* use draft PRs for releases with CODEOWNERS ([2c3642d](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/2c3642dad23314f2ff44b8bd080b7095845b3d84))


### Bug Fixes

* remove heavy teal borders from dark theme ([ef25c7e](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/ef25c7e45919632cca4f48815b45dc43cd2a4594))
* Resolve CodeQL security alerts ([#6](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/issues/6)) ([b1c2401](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/b1c24016dcaa270c524c0c1a013401d81f24f33e))
* Use proper regex escaping to address CodeQL incomplete-sanitization warnings ([#7](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/issues/7)) ([ce41a39](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/commit/ce41a395db2f9f821f4a4640e2e6f8620bcb6a58))

## [1.0.5] - 2025-09-13

### Fixed

- Light theme UI colors aligned to a true light palette (tabs, panels, menus, notifications, suggest widgets, terminal, inputs, dropdowns).
- Improved readability in light theme by changing multiple token colors from white to dark text.

### Changed

- Simplified GitHub workflows by removing a duplicate publish workflow.
- Cleaned repository by removing unused scripts and duplicate theme JSON.
- Added `.gitignore` and `.vscodeignore` to reduce noise and streamline packaging.

### Notes

- Prior versions 1.0.2–1.0.4 were packaging/housekeeping updates without functional theme changes.

## [1.0.1] - 2025-08-12

### Fixed

- Updated extension icon to remove unwanted purple border in VS Code marketplace
- Replaced with clean square Lucid Labs logo with proper brand colors
- Added high-quality favicon.ico with multiple icon sizes (16x16, 24x24)
- Removed personal email addresses from package.json for privacy

### Changed

- Icon now displays correctly on both light and dark marketplace backgrounds
- Improved icon visibility at all sizes (16px to 128px)

## [1.0.0] - 2025-01-12

### Added

- Initial release of Lucid Labs Theme with dual theme support
- **Lucid Labs Dark** - Professional dark theme based on Lucid Labs brand guidelines
- **Lucid Labs Light** - Clean light theme variant with brand consistency
- Brand-compliant colour palette:
  - Primary Dark Purple (#271D3B) background
  - Teal (#339999) accents and highlights
  - Light Purple (#7454B3) for keywords and secondary elements
  - Professional greys and whites for optimal readability
- Optimized syntax highlighting for:
  - PowerShell scripting
  - JSON configuration files
  - Markdown documentation
  - Azure ARM templates
  - Python automation scripts
  - JavaScript/TypeScript
  - YAML and XML files
- Cloud-inspired design elements
- Enterprise-grade aesthetics suitable for professional development environments
- Comprehensive UI theming for all VSCode interface elements
- Semantic token colouring support
- Git integration colour coding
- Terminal colour scheme matching brand palette

### Features

- **Dual Theme Support**: Both dark and light theme variants
- **System Theme Integration**: Automatically follows system preferences
- **Enhanced Navigation**: Coloured activity bar, title bar, and status bar with brand accents
- **Non-transparent Icon**: Proper background to prevent disappearing on dark surfaces
- **Favicon Support**: Micro-icons using centred cloud SVG for web integration
- **High Contrast Ratios**: Optimised for accessibility in both light and dark modes
- **Professional Appearance**: Suitable for client demonstrations and corporate environments
- **Azure & Microsoft 365 Optimised**: Perfect for PowerShell, JSON, ARM templates, and Azure development

### Brand Compliance

- Follows Lucid Labs Brand Guidelines exactly
- Uses approved primary and secondary colours
- Maintains proper colour hierarchy and contrast ratios
- Implements cloud-inspired design principles
- Suitable for corporate and client-facing environments
