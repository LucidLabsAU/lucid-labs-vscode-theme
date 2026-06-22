# Changelog

## [1.1.0] - 2026-06-23

### Added

- **Apply to editor.** A new action bar on the brand palette view sets the colour theme, the icon theme, or both in one click, with a live active-state indicator.
- **Brand colours.** The palette view now presents the brand's named colour palette — name, hex, RGB/CMYK, and one-click copy.

### Changed

- **Named-only palette.** The palette view now shows only the named brand colours; the previous Theme Roles section and raw-hex cards have been removed.
- Opening the brand palette reuses a single panel instead of stacking duplicate tabs.

## [1.0.2] - 2026-06-06

### Changed

- **Marketplace description.** Trimmed so the gallery card shows a complete
  sentence instead of clipping mid-word; the publisher and trademark line now
  lives in the README footer only.
- **Manifest.** Added `$schema` for package.json validation.

## [1.0.1] - 2026-06-06

### Fixed

- **Light-variant contrast.** Active list selection no longer uses white
  text on the pale selection fill — it now uses the dark editor foreground.
- **Black-on-bright text.** Buttons, badges and prominent items use near-black
  text on the bright brand accent (dark theme) instead of low-contrast white.

## [1.0.0] - 2026-05-26

### Added

- Initial release.
- Asplundh Dark and Asplundh Light theme variants.
- WCAG AA contrast across syntax tokens and UI surfaces.
- Custom file icon theme using the Asplundh palette.
- Activity-bar brand mark (the Asplundh "A") and Brand Palette sidebar with
  one-click HEX / RGB / CMYK copy and Dark/Light theme-role toggle.
