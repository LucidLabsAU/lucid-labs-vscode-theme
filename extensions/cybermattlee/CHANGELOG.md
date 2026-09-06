# Changelog

## [1.3.0] - 2026-09-06

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

## 1.0.0 (2026-06-08)

- Initial release with dual theme variants: **Matt Lee Full Beard** (dark) and **Matt Lee Shaved** (light)
- Hot-magenta-on-midnight palette inspired by the CyberMattLee brand
- Cyber / beard / cycling-themed colour roles (Beard Magenta, Midnight SOC, Tide Blue, Yellow Jersey, Packet Cyan…)
- Custom file-icon theme using the magenta beard mark as the Git icon
- Brand Palette sidebar with one-click HEX / RGB / CMYK copy
