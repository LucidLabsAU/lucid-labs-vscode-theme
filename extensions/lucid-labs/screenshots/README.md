# Screenshots

Marketplace imagery for the Lucid Labs theme. The README in the parent folder references these via raw GitHub URLs so the VS Code Marketplace renders them on the listing page.

## Auto-capture (recommended)

From the repo root, in your terminal:

```bash
./scripts/capture-screenshots.sh
```

What it does:

- Builds a fresh `.vsix` (skipped if one already exists)
- Creates `/tmp/lucid-demo-screenshots` with representative TypeScript, PowerShell, and Bicep files
- Spawns an **isolated** VS Code instance with its own `--user-data-dir` (your main editor is untouched)
- Captures all 8 shots via AppleScript over ~2 minutes
- Optimises PNGs with `oxipng` if available
- Cleans up temp dirs on exit

First-run permissions: macOS will prompt for **Accessibility** (for AppleScript keystrokes) and **Screen Recording** (for `screencapture`) for whatever terminal app you run the script from. Grant both, then re-run.

After capture, review the PNGs in this folder, commit, and the marketplace will pick them up on next publish via the raw GitHub URLs in the parent README.

## Required shots

| File | Surface | Capture instructions |
|------|---------|----------------------|
| `01-editor-dark.png` | Editor + Activity Bar + Side Bar (dark) | Open a multi-language project (TS + PowerShell + Bicep); Explorer expanded; cursor on a function definition; minimap visible |
| `02-editor-light.png` | Same view in light variant | Identical layout to 01 but with Lucid Labs Light active |
| `03-terminal.png` | Integrated terminal | Run `git status`, `ls -la`, `az account show` to exercise ANSI colours; show prompt |
| `04-command-palette.png` | Command Palette | `Cmd+Shift+P` → type "Lucid Labs" to show our category in action |
| `05-chat.png` | Copilot Chat | A short Copilot chat exchange showing themed bubbles, code blocks, and inline diff |
| `06-walkthrough.png` | Welcome page walkthrough | Welcome page open with the Lucid Labs walkthrough highlighted; step 1 visible |
| `07-palette-tree.png` | Custom view container | Activity Bar with Lucid Labs view expanded showing the colour palette browser |
| `08-diff.png` | Diff editor | A real PR-style diff with side-by-side view and gutter markers |

## Capture process

1. **Set up a clean window**
   - Close all open editors and panels
   - Hide minimap if a shot doesn't need it: `View → Show Minimap`
   - Use a 16:10 window at ~1600×1000 (matches marketplace card aspect)
2. **Set theme + icons**
   ```text
   Cmd+K Cmd+T  →  Lucid Labs Dark (or Light)
   Cmd+K Cmd+I  →  Lucid Labs Icons (currently File → Preferences → File Icon Theme)
   ```
3. **Capture** with macOS `Cmd+Shift+4` then `Space` then click VS Code window (gives shadow-free PNG)
4. **Optimise** with `pngquant` or `oxipng` before committing:
   ```bash
   oxipng --strip safe screenshots/*.png
   ```

## Style guide

- Use the **lucidlabs/sample-project** repo as the demo workspace where possible (lives at `~/Documents/GitHub/LucidLabsAU/sample-project` — placeholder)
- Cursor visible but not selected text — selection highlights distract from theme colours
- Status bar showing `🎨 Lucid Labs · Dark` chip (proves the extension is active)
- File tree should include 5–8 entries; longer trees crop awkwardly on the marketplace card

## Marketplace constraints

- Max image width VS Code renders cleanly: **1200 px**
- Total README image bytes should stay under **2 MB** combined; the marketplace caches but slow first-paint hurts conversion
- Use raw GitHub URLs (not relative paths) in `README.md` so the marketplace fetches from `raw.githubusercontent.com/...`
