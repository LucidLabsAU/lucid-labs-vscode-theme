# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code color theme extension for Lucid Labs. It provides dark and light theme variants based on the Lucid Labs brand guidelines.

## Commands

```bash
# Package the extension into a .vsix file
npm run package    # or: vsce package

# Publish to VS Code Marketplace (requires VSCE_PAT)
npm run publish    # or: vsce publish
```

Note: Requires `@vscode/vsce` to be installed globally (`npm install -g @vscode/vsce`).

## Architecture

- **Theme Files**: `themes/lucid-labs-color-theme.json` (dark) and `themes/lucid-labs-light-theme.json` (light)
- **Extension Manifest**: `package.json` defines the extension metadata and theme contributions
- **Release Automation**: GitHub Actions workflows in `.github/workflows/` handle Release Please and marketplace publishing

## Brand Color Palette

| Color          | Hex       | Usage                              |
|----------------|-----------|-----------------------------------|
| Primary Purple | `#271D3B` | Main background                   |
| Teal Accent    | `#339999` | Highlights, links, active elements|
| Light Purple   | `#7454B3` | Keywords, secondary elements      |
| Light Grey     | `#CCCCCC` | Secondary text, inactive elements |
| Dark Grey      | `#101820` | Panels, status bar                |
| White          | `#FFFFFF` | Primary text                      |

## Release Process

1. Push to `main` using conventional commits
2. Release Please opens a release PR with version bump and changelog
3. Merging the release PR creates a GitHub release and tag
4. The publish workflow automatically packages and publishes to VS Code Marketplace
