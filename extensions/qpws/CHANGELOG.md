# Changelog

## [1.3.0] - 2026-09-07

- Track the VS Code 1.136 colour registry: modern activity bar item keys, bar background/border/inactive background, plus editorBracketMatch.background and debugToolBar.border

## [1.2.0] - 2026-08-21

- Cover the full VS Code 1.134 colour registry: add 64 new tokens (agent sessions, modern tabs/activity bar, chat voice + find, surfaces), drop 16 removed ones

## [1.1.2] - 2026-08-02

- Add current VS Code theme tokens and migrate MCP config

## [1.1.1] - 2026-07-05

- WCAG contrast fixes (line numbers, brackets, function tokens, status bar)

## [1.1.0] - 2026-06-23

### Added

- **Apply to editor.** A new action bar on the brand palette view sets the colour theme, the icon theme, or both in one click, with a live active-state indicator.
- **Brand colours.** The palette view now presents the brand's named colour palette — name, hex, RGB/CMYK, and one-click copy.

### Changed

- **Named-only palette.** The palette view now shows only the named brand colours; the previous Theme Roles section and raw-hex cards have been removed.
- Opening the brand palette reuses a single panel instead of stacking duplicate tabs.

## [1.0.0] - 2026-06-22

### Added

- Initial release.
- Queensland Parks & Wildlife Dark and Light theme variants.
- WCAG AA contrast across syntax tokens and UI surfaces.
- Earthy palette: teal `#014F54`, cream `#DED2BF`, brown `#784F23` and white.
- Custom file icon theme using the brand palette.
- Activity-bar brand mark (a Queensland state-map silhouette) and Brand Palette
  sidebar with one-click HEX / RGB / CMYK copy and Dark/Light toggle.
