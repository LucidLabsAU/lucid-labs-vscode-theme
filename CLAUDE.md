# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code colour theme extension for Lucid Labs. It provides dark and light theme variants based on the Lucid Labs brand guidelines.

## Commands

```bash
# Package the extension into a .vsix file
npm run package    # or: vsce package

# Publish to VS Code Marketplace (PAT fetched from Azure Key Vault)
npm run publish    # or: vsce publish
```

Note: Requires `@vscode/vsce` to be installed globally (`npm install -g @vscode/vsce`).

## Architecture

- **Theme Files**: `themes/lucid-labs-color-theme.json` (dark) and `themes/lucid-labs-light-theme.json` (light)
- **Extension Manifest**: `package.json` defines the extension metadata and theme contributions
- **Release Automation**: GitHub Actions workflows in `.github/workflows/` handle Release Please and marketplace publishing
- **VSIX Packaging**: `.vscodeignore` excludes dev files (scripts, .claude, .husky, etc.)

## Brand Colour Palette (Dark Theme)

| Colour         | Hex       | Contrast | Usage                              |
|----------------|-----------|----------|------------------------------------|
| Primary Purple | `#271D3B` | -        | Main background                    |
| Teal Accent    | `#339999` | 4.6:1    | Highlights, links, active elements |
| Light Purple   | `#9B7ED9` | 4.8:1    | Keywords, secondary elements       |
| Sage Green     | `#C3D7CD` | 10.5:1   | Strings, symbols                   |
| Off-White      | `#E8E0F0` | 12.3:1   | Primary text (warm, reduced glare) |
| Dark Grey      | `#101820` | -        | Panels, status bar                 |

All text colours meet WCAG AA minimum contrast (4.5:1) against backgrounds.

## Release Process

1. Push to `main` using conventional commits
2. Release Please opens a release PR with version bump and changelog
3. Merging the release PR creates a GitHub release and tag
4. The Auto Publish workflow authenticates via Azure OIDC, fetches the VSCE PAT from Key Vault, and publishes to the VS Code Marketplace
