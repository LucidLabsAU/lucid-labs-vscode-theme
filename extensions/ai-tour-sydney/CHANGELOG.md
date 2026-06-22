# Changelog

## [1.4.0] - 2026-06-23

### Added

- **Apply to editor.** A new action bar on the brand palette view sets the colour theme, the icon theme, or both in one click, with a live active-state indicator.
- **Brand colours.** The palette view now presents the brand's named colour palette — name, hex, RGB/CMYK, and one-click copy.

### Changed

- **Named-only palette.** The palette view now shows only the named brand colours; the previous Theme Roles section and raw-hex cards have been removed.
- Opening the brand palette reuses a single panel instead of stacking duplicate tabs.
- Registered the bundled file icon theme so it can now be selected.
- Tidied marketplace metadata (gallery banner, Q&A, category) and README.

## [1.3.2] - 2026-06-06

### Fixed

- **Button/badge text.** Crisp white on the blue accent for buttons, badges and
  prominent items, lifting them to WCAG AA.

## [1.3.1] - 2026-05-26

### Changed

- Brand Palette: responsive grid layout (min/max columns), more compact cards,
  role lists truncate with hover tooltips.
- HEX / RGB / CMYK copy buttons are larger with a clipboard glyph, clearer
  hover state, and a brief `✓` confirmation on click.
- Theme Roles heading and the Dark/Light toggle now share a baseline (toggle
  right-aligned).

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-05-21

### Added

- Brand Palette sidebar view with HEX / RGB / CMYK one-click copy and a
  Dark/Light theme-role toggle.
- AI Tour Sydney brand mark as the activity-bar icon.

## [1.2.0] - 2026-05-19

### Added
- New VS Code v1.115 agent UI colour tokens: `agentSessionSelectedBadge.border`, `agentSessionSelectedUnfocusedBadge.border`, `aiCustomizationManagement.sashBorder`, `chat.inputWorkingBorderColor1/2/3`, `editorMinimap.inlineChatRemoved`

### Fixed
- Replaced corrupted placeholder `icon.png` with the proper 1024×1024 brand logo (the previous file was 96 bytes of base64 text and rendered as no icon in the marketplace)


## [1.1.0] - 2026-04-20

### Changed
- Rebalanced palette to match the AI Tour Sydney landing page — promoted mint-teal family (`#4ECDC4`, `#7FE5D8`, `#B8F1E6`) alongside navy/blue
- Keywords, strings, modified diff, JSON headers, markdown raw, and merge-incoming now teal-leaning
- Functions shift from pure blue to teal (`#1E9BA5`) to break up blue dominance
- Terminal cyan/magenta and rainbow brackets refreshed to the teal family

## [1.0.0] - 2026-04-20

### Added
- Initial release of AI Tour Sydney theme
- Dark theme with navy backgrounds and cyan accents
- Light theme variant for bright environments
- Full VS Code API coverage with semantic tokens
- Optimised contrast ratios for code readability
- Terminal colour scheme aligned with visual identity