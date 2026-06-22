# Changelog

## [1.9.0] - 2026-06-23

### Added

- **Apply to editor.** A new action bar on the brand palette view sets the colour theme, the icon theme, or both in one click, with a live active-state indicator.
- **Brand colours.** The palette view now presents the brand's named colour palette — name, hex, RGB/CMYK, and one-click copy.

### Changed

- **Named-only palette.** The palette view now shows only the named brand colours; the previous Theme Roles section and raw-hex cards have been removed.
- Opening the brand palette reuses a single panel instead of stacking duplicate tabs.
- Brand colours sourced from the official Banjo brand palette.
- Trimmed the marketplace description to fit the gallery card.

## [1.8.2] - 2026-06-06

### Fixed

- **Light-variant contrast.** Active list selection no longer uses white
  text on the pale selection fill — it now uses the dark editor foreground.

## [1.8.1] - 2026-05-26

### Changed

- Brand Palette: responsive grid layout (min/max columns), more compact cards,
  role lists truncate with hover tooltips.
- HEX / RGB / CMYK copy buttons are larger with a clipboard glyph, clearer
  hover state, and a brief `✓` confirmation on click.
- Theme Roles heading and the Dark/Light toggle now share a baseline (toggle
  right-aligned).

## [1.8.0] - 2026-05-21

### Added

- Brand Palette sidebar view with HEX / RGB / CMYK one-click copy and a
  Dark/Light theme-role toggle.
- Banjo Loans brand mark as the activity-bar icon.

## [1.7.0] - 2026-05-19

### Added
- New VS Code v1.115 agent UI colour tokens: `agentSessionSelectedBadge.border`, `agentSessionSelectedUnfocusedBadge.border`, `aiCustomizationManagement.sashBorder`, `chat.inputWorkingBorderColor1/2/3`, `editorMinimap.inlineChatRemoved`


## [1.6.0] - 2026-03-26

### Added
- New VS Code v1.113 colour tokens: `editorBracketMatch.foreground`, `quickInputList.hoverBackground`, `quickInput.border`

## [1.5.0] - 2026-03-22

### Fixed
- Improved WCAG AA contrast ratios for better accessibility across dark and light theme variants
- Fixed deprecated icon theme property and .env file icon mapping consistency

### Changed
- Aligned light theme template with dark theme role fallback patterns for better brand customisation support

## [1.2.0] - 2026-03-18

### Added
- Expanded file icon theme from 23 to 78 icons
- New language icons: Rust, Go, Java, C, C++, C#, Ruby, PHP, Swift, Kotlin, Lua, R, Vue, Angular, Svelte, AL
- New DevOps icons: Docker, Terraform, Bicep, PowerShell, Gradle, Makefile
- New data format icons: CSV, XML, GraphQL, Protobuf, Parquet, TMDL
- New document icons: PDF, Word, Excel, PowerPoint
- New .NET icons: C# project, Solution, Razor, XAML, NuGet
- New media icons: video, audio, font, archive
- New misc icons: Jupyter notebook, log, certificate, binary, source maps, draw.io, workspace

## 1.1.0 (2026-03-18)

- Full VS Code theme API coverage (896 colour keys, up from 149)
- Added testing, debug, notebook, settings, breadcrumbs, symbol icons, extensions, charts, merge editor, source control graph, terminal symbol icons, gauge, markdown alerts, agent session, and more
- Colour-coded indent guides matching bracket pair colours
- Fixed deprecated property names


## 1.0.0 (Initial Release)

### Features

- Dark theme with electric blue accents and deep purple backgrounds
- Light theme with bold blue accents and clean white backgrounds
- Full terminal ANSI colour support
- Semantic highlighting for TypeScript, JavaScript, and more
- Copilot and inline chat theming