#!/usr/bin/env bash
# Capture marketplace screenshots for the Lucid Labs theme.
#
# Uses an isolated VS Code profile so the user's main editor is untouched.
# Targets the demo window specifically by title-substring "lucid-demo-screenshots"
# so keystrokes never leak into the user's own VS Code instance.
#
# Requires: macOS, code CLI, screencapture, osascript, oxipng (optional).
# Permissions: Screen Recording + Accessibility for whatever terminal runs this.

set -uo pipefail
trap 'echo "step failed at line $LINENO — continuing" >&2' ERR

REPO_ROOT="/Users/keithoak/Documents/GitHub/LucidLabsAU/lucid-labs-vscode-theme"
EXT_DIR="$REPO_ROOT/extensions/lucid-labs"
SHOT_DIR="$EXT_DIR/screenshots"
DEMO_DIR="/tmp/lucid-demo-screenshots"
PROFILE_DIR="/tmp/lucid-vscode-profile"
EXTS_DIR="/tmp/lucid-vscode-exts"
WIN_X=100
WIN_Y=80
WIN_W=1600
WIN_H=1000
DEMO_PID=""

cleanup() {
  pkill -f "user-data-dir=$PROFILE_DIR" 2>/dev/null || true
  rm -rf "$DEMO_DIR"
  # Keep the profile + extensions between runs so first-run modals stay dismissed.
  # Pass FRESH=1 to wipe and start clean.
  if [ "${FRESH:-0}" = "1" ]; then
    rm -rf "$PROFILE_DIR" "$EXTS_DIR"
  fi
}
trap cleanup EXIT

# SHOT env var lets you re-run only a subset of shots.
# Examples:
#   SHOT=8 ./scripts/capture-screenshots.sh         # only shot 8
#   SHOT=3-5 ./scripts/capture-screenshots.sh       # shots 3 through 5
#   SHOT=all ./scripts/capture-screenshots.sh       # all (default)
should_capture() {
  local num="$1"
  local filter="${SHOT:-all}"
  if [ "$filter" = "all" ]; then return 0; fi
  if [[ "$filter" == *-* ]]; then
    local lo="${filter%-*}"
    local hi="${filter#*-}"
    [ "$num" -ge "$lo" ] && [ "$num" -le "$hi" ]
  else
    [ "$num" = "$filter" ]
  fi
}

log() { printf '\033[36m▶\033[0m %s\n' "$*"; }

# ---------------------------------------------------------------------------
# 1. Build a .vsix if one doesn't already exist
# ---------------------------------------------------------------------------
log "Locating extension .vsix"
cd "$EXT_DIR"
VSIX="$(ls "$EXT_DIR"/lucid-labs-theme-*.vsix 2>/dev/null | head -1 || true)"
if [ -z "$VSIX" ]; then
  npx --no -y -- vsce package --no-dependencies >/dev/null
  VSIX="$(ls "$EXT_DIR"/lucid-labs-theme-*.vsix | head -1)"
fi
log "Using $(basename "$VSIX")"

# ---------------------------------------------------------------------------
# 2. Sample workspace with representative files
# ---------------------------------------------------------------------------
log "Creating sample workspace at $DEMO_DIR"
rm -rf "$DEMO_DIR"
mkdir -p "$DEMO_DIR"/{src,scripts,infra,.vscode}
cd "$DEMO_DIR"
git init -q
git config user.email "demo@lucidlabs.com.au"
git config user.name "Lucid Demo"

cat > src/api-client.ts <<'TS'
// User profile lookup with in-memory cache.
// No external dependencies — uses built-in fetch + types only.

export interface UserProfile {
  readonly id: string;
  readonly displayName: string;
  readonly mail?: string;
  readonly jobTitle?: string;
  readonly officeLocation?: string;
}

export type ProfileSource = "graph" | "cache" | "fallback";

export interface LookupResult {
  readonly profile: UserProfile;
  readonly source: ProfileSource;
  readonly elapsedMs: number;
}

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const cache = new Map<string, UserProfile>();

export async function getProfile(
  upn: string,
  token: string,
): Promise<LookupResult> {
  const started = performance.now();
  if (cache.has(upn)) {
    return {
      profile: cache.get(upn)!,
      source: "cache",
      elapsedMs: performance.now() - started,
    };
  }
  const response = await fetch(`${GRAPH_BASE}/users/${upn}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Graph lookup failed: ${response.status}`);
  }
  const user = (await response.json()) as Partial<UserProfile> & {
    userPrincipalName?: string;
  };
  const profile: UserProfile = {
    id: user.id ?? crypto.randomUUID(),
    displayName: user.displayName ?? upn,
    mail: user.mail ?? user.userPrincipalName,
    jobTitle: user.jobTitle,
    officeLocation: user.officeLocation,
  };
  cache.set(upn, profile);
  return { profile, source: "graph", elapsedMs: performance.now() - started };
}

export function clearCache(): void {
  cache.clear();
}
TS

cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "lib": ["ES2022", "DOM"],
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}
JSON

cat > scripts/Get-TenantHealth.ps1 <<'PS1'
<#
.SYNOPSIS
  Quick health check for an Azure tenant.
.DESCRIPTION
  Reports resource-group tagging compliance against the standard Lucid Labs schema.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [string]$TenantId,

    [ValidateSet('prod', 'nonprod', 'dev', 'staging')]
    [string]$Environment = 'prod'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$requiredTags = @('project', 'environment', 'managedBy', 'costCentre', 'application', 'owner')

function Test-TagCompliance {
    param([hashtable]$Tags)
    $missing = $requiredTags | Where-Object { -not $Tags.ContainsKey($_) }
    return [PSCustomObject]@{
        Compliant = ($missing.Count -eq 0)
        Missing   = $missing
    }
}

Write-Host "Auditing tenant $TenantId ($Environment)" -ForegroundColor Cyan
$report = @()
foreach ($rg in @('rg-platform', 'rg-data', 'rg-identity')) {
    $report += [PSCustomObject]@{
        ResourceGroup = $rg
        Environment   = $Environment
        Status        = 'Compliant'
    }
}
$report | Format-Table -AutoSize
PS1

cat > infra/main.bicep <<'BICEP'
@description('Resource location')
param location string = resourceGroup().location

@description('Lucid Labs standard tag set')
param tags object = {
  project: 'lucid-operations'
  environment: 'prod'
  managedBy: 'Bicep'
  costCentre: 'Platform'
  application: 'Lucid Hub + MCP Server'
  owner: 'keith@oakai.au'
  mapping_tag: guid('LucidLabsAU/lucid-operations', 'infra/main.bicep')
}

resource kv 'Microsoft.KeyVault/vaults@2024-04-01-preview' = {
  name: 'kv-lucid-${uniqueString(resourceGroup().id)}'
  location: location
  tags: tags
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
  }
}

output keyVaultName string = kv.name
BICEP

cat > .vscode/settings.json <<'JSON'
{
  "editor.formatOnSave": true,
  "editor.minimap.enabled": true,
  "editor.bracketPairColorization.enabled": true,
  "files.exclude": {
    "**/.git": false
  }
}
JSON

cat > README.md <<'MD'
# lucid-demo

Sample workspace for Lucid Labs theme screenshots.

## Stack

- **TypeScript** — Azure Identity + Microsoft Graph
- **PowerShell** — Lucid Labs cmdlet conventions
- **Bicep** — Standard Lucid Labs tag schema
MD

git add -A
git commit -q -m "initial: sample workspace"

cat >> src/api-client.ts <<'TS'

// Bulk lookup for a batch of UPNs, returning resolved profiles in order.
export async function getProfiles(
  upns: readonly string[],
  token: string,
): Promise<readonly LookupResult[]> {
  return Promise.all(upns.map((upn) => getProfile(upn, token)));
}
TS

# ---------------------------------------------------------------------------
# 3. Install Lucid Labs into isolated profile
# ---------------------------------------------------------------------------
log "Installing extension into isolated profile (re-uses existing profile unless FRESH=1)"
if [ "${FRESH:-0}" = "1" ]; then
  rm -rf "$PROFILE_DIR" "$EXTS_DIR"
fi
code --user-data-dir "$PROFILE_DIR" --extensions-dir "$EXTS_DIR" \
     --install-extension "$VSIX" --force >/dev/null 2>&1

mkdir -p "$PROFILE_DIR/User"
cat > "$PROFILE_DIR/User/settings.json" <<'JSON'
{
  "workbench.colorTheme": "Lucid Labs Dark",
  "workbench.iconTheme": "lucid-labs-icons",
  "workbench.startupEditor": "none",
  "window.commandCenter": true,
  "window.titleBarStyle": "custom",
  "editor.fontSize": 13,
  "editor.fontFamily": "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
  "editor.minimap.enabled": true,
  "editor.minimap.renderCharacters": false,
  "workbench.activityBar.location": "default",
  "terminal.integrated.fontSize": 12,
  "window.title": "${rootName} — lucid-demo-screenshots",
  "telemetry.telemetryLevel": "off",
  "workbench.welcomePage.walkthroughs.openOnInstall": false,
  "chat.commandCenter.enabled": false,
  "chat.experimental.detectParticipant.enabled": false,
  "chat.experimental.statusIndicator.enabled": false,
  "workbench.experimental.share.enabled": false,
  "accounts.experimental.showEntitlements": false,
  "github.copilot.chat.welcomeMessage": "never",
  "github.copilot.editor.enableAutoCompletions": false,
  "github.copilot.advanced": {},
  "extensions.ignoreRecommendations": true,
  "extensions.autoCheckUpdates": false,
  "extensions.autoUpdate": false,
  "update.mode": "none",
  "update.showReleaseNotes": false,
  "workbench.tips.enabled": false,
  "workbench.startupEditor": "none"
}
JSON

# ---------------------------------------------------------------------------
# 4. AppleScript helpers — target demo window by PID
# ---------------------------------------------------------------------------
focus_demo() {
  if [ -z "$DEMO_PID" ]; then
    echo "DEMO_PID not set" >&2
    return 1
  fi
  osascript <<APPLESCRIPT
tell application "System Events"
  try
    set demoProc to (first process whose unix id is $DEMO_PID)
  on error
    error "demo PID $DEMO_PID not found"
  end try
  set frontmost of demoProc to true
  delay 0.3
  tell demoProc
    if (count of windows) > 0 then
      set position of window 1 to {$WIN_X, $WIN_Y}
      set size of window 1 to {$WIN_W, $WIN_H}
    end if
  end tell
end tell
APPLESCRIPT
}

wait_for_demo() {
  for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    if focus_demo 2>/dev/null; then
      return 0
    fi
    sleep 1
  done
  echo "demo window never came up" >&2
  return 1
}

dismiss_modal() {
  # Press Escape once. Cheap, used between steps.
  focus_demo 2>/dev/null || true
  sleep 0.2
  osascript -e 'tell application "System Events" to key code 53' 2>/dev/null || true
  sleep 0.2
}

dismiss_signin_modal() {
  # The GitHub Copilot "Sign in to continue" modal appears on a delay (1–4s after
  # the workbench finishes loading). Press Escape repeatedly across a window of
  # time and ALSO try to click "Continue without Signing In" by button label.
  for i in 1 2 3 4 5 6 7 8; do
    focus_demo 2>/dev/null || true
    sleep 0.4
    # Try button click first (works while modal is up)
    osascript <<APPLESCRIPT 2>/dev/null || true
tell application "System Events"
  try
    set demoProc to (first process whose unix id is $DEMO_PID)
    tell demoProc
      -- traverse for the dismiss button by label match
      set allButtons to (every button of every window whose name contains "Continue") & ¬
        (every button of every UI element of every window whose name contains "Continue")
      repeat with b in allButtons
        try
          click b
          return
        end try
      end repeat
    end tell
  end try
end tell
APPLESCRIPT
    # Then Escape as a fallback
    osascript -e 'tell application "System Events" to key code 53' 2>/dev/null || true
    sleep 0.4
  done
}

send_keystroke() {
  # send_keystroke "<modifier-list>" "<keystroke>"
  focus_demo
  sleep 0.15
  osascript -e "tell application \"System Events\" to keystroke \"$2\" using {$1}"
}

send_keycode() {
  # send_keycode "<modifier-list>" "<key code>"
  focus_demo
  sleep 0.15
  osascript -e "tell application \"System Events\" to key code $2 using {$1}"
}

type_text() {
  focus_demo
  sleep 0.15
  osascript -e "tell application \"System Events\" to keystroke \"$1\""
}

press_return() {
  focus_demo
  sleep 0.15
  osascript -e 'tell application "System Events" to key code 36'
}

press_escape() {
  focus_demo
  sleep 0.15
  osascript -e 'tell application "System Events" to key code 53'
}

run_palette_command() {
  focus_editor
  send_keystroke "command down, shift down" "p"
  sleep 0.5
  osascript -e "tell application \"System Events\" to keystroke \"$1\""
  sleep 0.5
  press_return
  sleep 0.8
}

focus_editor() {
  # Forces focus into the editor group (Cmd+1) so subsequent keystrokes
  # don't get captured by the chat input or other side panels.
  focus_demo 2>/dev/null || true
  sleep 0.2
  osascript -e 'tell application "System Events" to keystroke "1" using {command down}' 2>/dev/null || true
  sleep 0.3
}

capture() {
  local file="$1"
  focus_demo
  sleep 0.5
  screencapture -o -R"${WIN_X},${WIN_Y},${WIN_W},${WIN_H}" "$SHOT_DIR/$file"
  log "Captured $file"
}

set_theme() {
  python3 - "$1" <<PY
import json, sys, pathlib
theme = sys.argv[1]
path = pathlib.Path("$PROFILE_DIR/User/settings.json")
data = json.loads(path.read_text())
data["workbench.colorTheme"] = theme
path.write_text(json.dumps(data, indent=2))
PY
  sleep 1.5
}

# ---------------------------------------------------------------------------
# 5. Launch isolated VS Code, capture its PID
# ---------------------------------------------------------------------------
log "Capturing baseline VS Code PIDs"
BEFORE_PIDS="$(pgrep -x Code | sort -u | tr '\n' ' ')"

log "Launching isolated VS Code"
code --user-data-dir "$PROFILE_DIR" --extensions-dir "$EXTS_DIR" \
     --disable-extension GitHub.copilot \
     --disable-extension GitHub.copilot-chat \
     --new-window "$DEMO_DIR" \
     --goto "$DEMO_DIR/src/api-client.ts:14" \
     >/dev/null 2>&1 &

# Discover the new VS Code PID (whichever didn't exist before launch)
for _ in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1
  AFTER_PIDS="$(pgrep -x Code | sort -u | tr '\n' ' ')"
  for pid in $AFTER_PIDS; do
    if ! echo " $BEFORE_PIDS " | grep -q " $pid "; then
      DEMO_PID="$pid"
      break 2
    fi
  done
done

if [ -z "$DEMO_PID" ]; then
  echo "Could not identify demo VS Code PID" >&2
  exit 1
fi
log "Demo VS Code PID: $DEMO_PID"

sleep 4
wait_for_demo

log "Dismissing first-run modals (Copilot sign-in, account prompts)"
dismiss_signin_modal

log "Closing auxiliary (chat) bar to hide Sign In badge + chat panel"
# Focus the editor first so the keystroke isn't swallowed by the chat input.
focus_editor
# Use the Command Palette to invoke the close command — more reliable than
# the Cmd+Alt+B keybinding which can be overridden by extensions.
send_keystroke "command down, shift down" "p"
sleep 0.5
type_text "View: Close Auxiliary Bar"
sleep 0.4
press_return
sleep 0.8
# Belt and braces — also send the keybinding
focus_editor
osascript -e 'tell application "System Events" to keystroke "b" using {command down, option down}' 2>/dev/null || true
sleep 0.6

mkdir -p "$SHOT_DIR"

# ---------------------------------------------------------------------------
# 6. Shot 01 — Editor (dark)
# ---------------------------------------------------------------------------
if should_capture 1; then
  log "Shot 01 — editor dark"
  sleep 1
  capture "01-editor-dark.png"
fi

# ---------------------------------------------------------------------------
# 7. Shot 02 — Editor (light)
# ---------------------------------------------------------------------------
if should_capture 2; then
  log "Shot 02 — editor light"
  set_theme "Lucid Labs Light"
  sleep 1.2
  capture "02-editor-light.png"
  set_theme "Lucid Labs Dark"
  sleep 1.2
fi

# ---------------------------------------------------------------------------
# 8. Shot 03 — Terminal
# ---------------------------------------------------------------------------
if should_capture 3; then
  log "Shot 03 — terminal"
  send_keycode "control down" 50  # Ctrl+` toggles terminal
  sleep 1.0
  type_text "git log --oneline --all --decorate"
  press_return
  sleep 0.6
  type_text "ls -la src/"
  press_return
  sleep 0.6
  type_text "echo Lucid Labs theme demo"
  press_return
  sleep 0.8
  capture "03-terminal.png"
  send_keystroke "command down" "j"  # Close panel
  sleep 0.5
fi

# ---------------------------------------------------------------------------
# 9. Shot 04 — Command Palette
# ---------------------------------------------------------------------------
if should_capture 4; then
  log "Shot 04 — command palette"
  send_keystroke "command down, shift down" "p"
  sleep 0.6
  type_text "Lucid Labs"
  sleep 0.8
  capture "04-command-palette.png"
  press_escape
  sleep 0.5
fi

# ---------------------------------------------------------------------------
# 10. Shot 05 — Settings
# ---------------------------------------------------------------------------
if should_capture 5; then
  log "Shot 05 — settings"
  send_keystroke "command down" ","
  sleep 1.2
  type_text "lucidLabsTheme"
  sleep 1.0
  capture "05-settings.png"
  send_keystroke "command down" "w"
  sleep 0.6
fi

# ---------------------------------------------------------------------------
# 11. Shot 06 — Walkthrough (filter the picker to ensure we pick OUR walkthrough)
# ---------------------------------------------------------------------------
if should_capture 6; then
  log "Shot 06 — walkthrough"
  send_keystroke "command down, shift down" "p"
  sleep 0.6
  type_text "Welcome: Open Walkthrough"
  sleep 0.4
  press_return
  sleep 1.2
  type_text "Lucid Labs"
  sleep 0.6
  press_return
  sleep 2.0
  capture "06-walkthrough.png"
  send_keystroke "command down" "w"
  sleep 0.5
fi

# ---------------------------------------------------------------------------
# 12. Shot 07 — Brand Palette view
# ---------------------------------------------------------------------------
if should_capture 7; then
  log "Shot 07 — palette tree"
  run_palette_command "View: Show Brand Palette"
  sleep 1.5
  capture "07-palette-tree.png"
fi

# ---------------------------------------------------------------------------
# 13. Shot 08 — Diff editor (via code --diff against a temp HEAD snapshot)
# ---------------------------------------------------------------------------
if should_capture 8; then
  log "Shot 08 — diff editor"
  # Materialise the HEAD version of the file so VS Code can diff against it
  mkdir -p "$DEMO_DIR/.snapshots"
  (cd "$DEMO_DIR" && git show HEAD:src/api-client.ts) > "$DEMO_DIR/.snapshots/api-client.head.ts"

  # Open the diff in the existing demo window via --reuse-window.
  # --user-data-dir disambiguates which VS Code instance to reuse.
  code --user-data-dir "$PROFILE_DIR" --extensions-dir "$EXTS_DIR" \
       --reuse-window \
       --diff "$DEMO_DIR/.snapshots/api-client.head.ts" "$DEMO_DIR/src/api-client.ts" \
       >/dev/null 2>&1
  sleep 2.5
  focus_demo
  sleep 0.6
  capture "08-diff.png"
fi

# ---------------------------------------------------------------------------
# 14. Optimise PNGs
# ---------------------------------------------------------------------------
log "Optimising PNGs"
if command -v oxipng >/dev/null; then
  oxipng --strip safe "$SHOT_DIR"/*.png >/dev/null 2>&1 || true
fi

log "Done."
ls -lh "$SHOT_DIR"/*.png 2>/dev/null | awk '{print $5, $9}'
