# Change Log

## [1.15.0]

### Added

- Brand Palette sidebar view: canonical Lucid Labs colours grouped into Primary,
  Secondary and Other palettes, with HEX / RGB / CMYK one-click copy and PANTONE
  references.
- Theme Roles section with a Dark/Light toggle and hex de-duplication, so each
  colour appears once with every role that uses it.

### Changed

- Activity-bar icon is now the Lucid Labs cloud-and-arrows brand mark.

## [1.14.1] - 2026-05-19

### Changed
- Documentation cleanup

## [1.14.0] - 2026-05-19

Maintenance release.

## [1.13.0] - 2026-05-19

### Added
- **Walkthrough onboarding** — 5-step guided setup that opens automatically after install, covering activation, variant switching, file icons, the brand palette, and next steps
- **Brand Palette view** — dedicated Activity Bar view container that lists every colour role in the active variant with one-click copy-to-clipboard
- **Theme Reference webview** — full-page interactive colour reference rendered live in the active variant (`Lucid Labs: Open Theme Reference`)
- **Status bar chip** — confirms the active brand and variant; toggleable via `lucidLabsTheme.showStatusBarItem`
- **Quick-switch commands** — `Lucid Labs: Switch to Dark`, `Switch to Light`, `Toggle Variant`, `Open Theme Reference`
- **Toggle keybinding** — `Cmd+Alt+L` / `Ctrl+Alt+L` cycles between dark and light variants

### Changed
- Extension is no longer themes-only — now contributes commands, views, walkthrough, configuration, and a keybinding (still UI-kind, no workspace access)

## [1.12.0] - 2026-05-19

### Added
- New VS Code v1.115 agent UI colour tokens: `agentSessionSelectedBadge.border`, `agentSessionSelectedUnfocusedBadge.border`, `aiCustomizationManagement.sashBorder`, `chat.inputWorkingBorderColor1/2/3`, `editorMinimap.inlineChatRemoved`


## [1.11.0] - 2026-03-26

### Added
- New VS Code v1.113 colour tokens: `editorBracketMatch.foreground`, `quickInputList.hoverBackground`, `quickInput.border`

## [1.10.0] - 2026-03-22

### Fixed
- Improved WCAG AA contrast ratios for better accessibility across dark and light theme variants
- Fixed deprecated icon theme property and .env file icon mapping consistency

### Changed
- Aligned light theme template with dark theme role fallback patterns for better brand customisation support

## [1.7.0] - 2026-03-18

### Added
- Expanded file icon theme from 23 to 78 icons
- New language icons: Rust, Go, Java, C, C++, C#, Ruby, PHP, Swift, Kotlin, Lua, R, Vue, Angular, Svelte, AL
- New DevOps icons: Docker, Terraform, Bicep, PowerShell, Gradle, Makefile
- New data format icons: CSV, XML, GraphQL, Protobuf, Parquet, TMDL
- New document icons: PDF, Word, Excel, PowerPoint
- New .NET icons: C# project, Solution, Razor, XAML, NuGet
- New media icons: video, audio, font, archive
- New misc icons: Jupyter notebook, log, certificate, binary, source maps, draw.io, workspace

## 1.6.0 (2026-03-18)

- Full VS Code theme API coverage (896 colour keys, up from 149)
- Added testing, debug, notebook, settings, breadcrumbs, symbol icons, extensions, charts, merge editor, source control graph, terminal symbol icons, gauge, markdown alerts, agent session, and more
- Colour-coded indent guides matching bracket pair colours
- Fixed deprecated property names


All notable changes to the Lucid Labs Theme extension will be documented in this file.

## [1.2.0](https://github.com/LucidLabsAU/lucid-labs-vscode-theme/compare/lucid-labs-theme-v1.1.2...lucid-labs-theme-v1.2.0) (2026-02-18)


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