# Changelog

## [1.2.0] - 2026-06-23

### Added

- **Apply to editor.** A new action bar on the brand palette view sets the colour theme, the icon theme, or both in one click, with a live active-state indicator.
- **Brand colours.** The palette view now presents the brand's named colour palette — name, hex, RGB/CMYK, and one-click copy.

### Changed

- **Named-only palette.** The palette view now shows only the named brand colours; the previous Theme Roles section and raw-hex cards have been removed.
- Opening the brand palette reuses a single panel instead of stacking duplicate tabs.

## [1.1.3] - 2026-06-06

### Changed

- **Marketplace description.** Trimmed so the gallery card shows a complete
  sentence instead of clipping mid-word; the publisher and trademark line now
  lives in the README footer only.
- **Manifest.** Added `$schema` for package.json validation.

## [1.1.2] - 2026-06-06

### Fixed

- **Light-variant contrast.** Active list selection no longer uses white
  text on the pale selection fill — it now uses the dark editor foreground.

## [1.1.1] - 2026-05-26

### Changed

- Brand Palette: responsive grid layout (min/max columns), more compact cards,
  role lists truncate with hover tooltips.
- HEX / RGB / CMYK copy buttons are larger with a clipboard glyph, clearer
  hover state, and a brief `✓` confirmation on click.
- Theme Roles heading and the Dark/Light toggle now share a baseline (toggle
  right-aligned).

## [1.1.0] - 2026-05-21

### Added

- Brand Palette sidebar view with HEX / RGB / CMYK one-click copy and a
  Dark/Light theme-role toggle.
- Aurora Dairies brand mark as the activity-bar icon.

## 1.0.0 (2026-05-19)

### Added

- Initial release with dark and light theme variants
- Aurora Blue (`#003599`) primary brand colour
- Pasture-green strings, dawn-gold constants, sky-blue keywords
- Full terminal ANSI colour support
- Semantic highlighting for TypeScript, Python, and more
- Copilot and inline chat theming
- Custom file icon theme with Aurora Dairies "U with splash" Git icon
