# Change Log

## [1.10.0] - 2026-06-23

### Added

- **Apply to editor.** A new action bar on the brand palette view sets the colour theme, the icon theme, or both in one click, with a live active-state indicator.
- **Brand colours.** The palette view now presents the brand's named colour palette — name, hex, RGB/CMYK, and one-click copy.

### Changed

- **Named-only palette.** The palette view now shows only the named brand colours; the previous Theme Roles section and raw-hex cards have been removed.
- Opening the brand palette reuses a single panel instead of stacking duplicate tabs.
- Trimmed the marketplace description to fit the gallery card.

## [1.9.2] - 2026-06-06

### Fixed

- **Light-variant contrast.** Active list selection no longer uses white
  text on the pale selection fill — it now uses the dark editor foreground.
- **Black-on-bright text.** Buttons, badges and prominent items use near-black
  text on the bright brand accent (dark theme) instead of low-contrast white.

## [1.9.1] - 2026-05-26

### Changed

- Brand Palette: responsive grid layout (min/max columns), more compact cards,
  role lists truncate with hover tooltips.
- HEX / RGB / CMYK copy buttons are larger with a clipboard glyph, clearer
  hover state, and a brief `✓` confirmation on click.
- Theme Roles heading and the Dark/Light toggle now share a baseline (toggle
  right-aligned).

## [1.9.0] - 2026-05-21

### Added

- Brand Palette sidebar view with HEX / RGB / CMYK one-click copy and a
  Dark/Light theme-role toggle.
- Icon Group brand mark as the activity-bar icon.

## [1.8.0] - 2026-05-19

### Added
- New VS Code v1.115 agent UI colour tokens: `agentSessionSelectedBadge.border`, `agentSessionSelectedUnfocusedBadge.border`, `aiCustomizationManagement.sashBorder`, `chat.inputWorkingBorderColor1/2/3`, `editorMinimap.inlineChatRemoved`


## [1.7.0] - 2026-03-26

### Added
- New VS Code v1.113 colour tokens: `editorBracketMatch.foreground`, `quickInputList.hoverBackground`, `quickInput.border`

## [1.6.0] - 2026-03-22

### Fixed
- Improved WCAG AA contrast ratios for better accessibility across dark and light theme variants
- Fixed deprecated icon theme property and .env file icon mapping consistency

### Changed
- Aligned light theme template with dark theme role fallback patterns for better brand customisation support

## [1.3.0] - 2026-03-18

### Added
- Expanded file icon theme from 23 to 78 icons
- New language icons: Rust, Go, Java, C, C++, C#, Ruby, PHP, Swift, Kotlin, Lua, R, Vue, Angular, Svelte, AL
- New DevOps icons: Docker, Terraform, Bicep, PowerShell, Gradle, Makefile
- New data format icons: CSV, XML, GraphQL, Protobuf, Parquet, TMDL
- New document icons: PDF, Word, Excel, PowerPoint
- New .NET icons: C# project, Solution, Razor, XAML, NuGet
- New media icons: video, audio, font, archive
- New misc icons: Jupyter notebook, log, certificate, binary, source maps, draw.io, workspace

## 1.2.0 (2026-03-18)

- Custom branded git icon using the "O" from the ICON logo with
  multicoloured segments (yellow, green, purple, blue)

## 1.1.0 (2026-03-18)

- Full VS Code theme API coverage (896 colour keys, up from 149)
- Added testing, debug, notebook, settings, breadcrumbs, symbol icons, extensions, charts, merge editor, source control graph, terminal symbol icons, gauge, markdown alerts, agent session, and more
- Colour-coded indent guides matching bracket pair colours
- Fixed deprecated property names


All notable changes to the Icon Group Theme extension will be documented in this file.

## [1.0.0] - 2026-03-18

### Added

- Initial release of Icon Group Theme with dual theme support
- **Icon Group Dark** - Professional dark theme with navy blue backgrounds and gold accents
- **Icon Group Light** - Clean light theme variant with brand blue and purple highlights
- Brand-compliant colour palette:
  - Navy Blue (#0E2A4A) dark background
  - Brand Blue (#006FB9) for functions and active elements
  - Gold (#FDBD10) accents and highlights
  - Purple (#9B6FCF) for keywords and secondary elements
  - Green (#7BC8A4) for strings and success indicators
- Optimised syntax highlighting for all major languages
- Comprehensive UI theming for all VS Code interface elements
- Semantic token colouring support
- Git integration colour coding
- Terminal colour scheme matching brand palette
- WCAG AA compliant contrast ratios
- Custom branded file icon theme