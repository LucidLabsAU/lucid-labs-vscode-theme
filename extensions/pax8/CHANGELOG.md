# Changelog

## [1.4.0] - 2026-06-23

### Added

- **Apply to editor.** A new action bar on the brand palette view sets the colour theme, the icon theme, or both in one click, with a live active-state indicator.
- **Brand colours.** The palette view now presents the brand's named colour palette — name, hex, RGB/CMYK, and one-click copy.

### Changed

- **Named-only palette.** The palette view now shows only the named brand colours; the previous Theme Roles section and raw-hex cards have been removed.
- Opening the brand palette reuses a single panel instead of stacking duplicate tabs.
- Apply bar shows one row per edition (Everyday, Beyond 2026, Beyond 2026 Copenhagen, CTF 2026).

## [1.3.2] - 2026-06-06

### Changed

- **Marketplace description.** Trimmed so the gallery card shows a complete
  sentence instead of clipping mid-word; the publisher and trademark line now
  lives in the README footer only.
- **Manifest.** Added `$schema` for package.json validation.

## [1.3.1] - 2026-06-06

### Fixed

- **CTF 2026 light contrast.** Black text on the (darkened) terminal-green
  buttons and badges in the light variant, lifting them to WCAG AA.

## [1.3.0] - 2026-06-06

### Changed

- **Theme ordering.** Themes are now named `Pax8 <Dark|Light> · <edition>`, so the
  everyday **Pax8 Dark / Light** sort to the top of the theme picker (which sorts
  by `localeCompare`) and the editions group beneath each variant.

### Fixed

- **Light-variant contrast.** Removed white-on-pale text on the active list
  selection (it now uses the dark editor foreground). Full electric-fill
  contrast sweep across all 8 themes passes.

## [1.2.0] - 2026-06-06

### Changed

- **Black-on-mint text.** Buttons, badges and prominent items now use near-black
  text on the mint/brand fills (dark themes), matching Pax8's own black-on-green
  usage instead of low-contrast white. New `accentFg` brand role drives it.
- **Brand Palette sidebar** now leads with a named, grouped **Brand Colours**
  section (Mint, Pax8 Blue, the Beyond press-kit colours with Pantone/CMYK, and
  the CTF colours) before the exhaustive theme-role dump.

## [1.1.0] - 2026-06-06

### Changed

- Consolidated all Pax8 themes into this single extension. The standalone
  `pax8-beyond-2026`, `pax8-beyond-2026-copenhagen` and `pax8-ctf-2026`
  extensions are retired — their themes now ship here.
- New marketplace icon: white Pax8 cloud with red/yellow/blue Beyond side stripes.

### Added

- **Pax8 Beyond 2026** Dark/Light — Innovation Blue (Salt Lake City, blue-forward).
- **Pax8 Beyond 2026 Copenhagen** Dark/Light — Community Red (EMEA, red-forward).
- **Pax8 CTF 2026** Dark/Light — neon terminal green (Pax8 + Microsoft Beyond CTF).

## [1.0.0] - 2026-06-06

### Added

- Initial release.
- Pax8 Dark and Pax8 Light theme variants.
- Black-first palette built on Pax8 Mint (`#03DE91`) and Pax8 Blue (`#0447BF`).
- WCAG AA contrast across syntax tokens and UI surfaces.
- Custom file icon theme using the Pax8 palette.
- Activity-bar brand mark (the Pax8 cloud) and Brand Palette sidebar with
  one-click HEX / RGB / CMYK copy and Dark/Light theme-role toggle.
