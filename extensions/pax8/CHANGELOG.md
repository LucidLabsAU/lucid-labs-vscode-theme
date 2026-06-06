# Changelog

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
