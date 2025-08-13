#!/bin/bash

# Lucid Labs Theme Installation Script
# This script installs the Lucid Labs VSCode theme and configures it for the workspace

echo "🎨 Installing Lucid Labs VSCode Theme..."

# Create VSCode extensions directory if it doesn't exist
VSCODE_EXTENSIONS_DIR="$HOME/.vscode/extensions"
THEME_DIR="$VSCODE_EXTENSIONS_DIR/lucidlabs.lucid-labs-theme-1.0.0"

echo "📁 Creating extension directory: $THEME_DIR"
mkdir -p "$THEME_DIR"

# Copy theme files
echo "📋 Copying theme files..."
cp -r lucid-labs-theme/* "$THEME_DIR/"

# Update workspace settings to use the theme
echo "⚙️  Updating workspace settings..."

# Create backup of current settings
if [ -f .vscode/settings.json ]; then
    cp .vscode/settings.json .vscode/settings.json.backup
    echo "✅ Backed up existing settings to settings.json.backup"
fi

# Add theme setting to workspace settings
if [ -f .vscode/settings.json ]; then
    # Use jq if available, otherwise manual edit
    if command -v jq &> /dev/null; then
        jq '. + {"workbench.colorTheme": "Lucid Labs"}' .vscode/settings.json > .vscode/settings.json.tmp && mv .vscode/settings.json.tmp .vscode/settings.json
        echo "✅ Updated settings with jq"
    else
        # Manual addition - add the theme setting before the last closing brace
        sed -i.bak '$s/}/,\n  "workbench.colorTheme": "Lucid Labs"\n}/' .vscode/settings.json
        echo "✅ Updated settings manually"
    fi
else
    # Create new settings file
    mkdir -p .vscode
    cat > .vscode/settings.json << 'EOF'
{
  "workbench.colorTheme": "Lucid Labs"
}
EOF
    echo "✅ Created new settings file"
fi

echo ""
echo "🎉 Lucid Labs Theme Installation Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Restart VSCode or reload the window (Ctrl+Shift+P → 'Developer: Reload Window')"
echo "2. The Lucid Labs theme should be automatically applied"
echo "3. If not applied automatically, go to:"
echo "   File → Preferences → Color Theme → Select 'Lucid Labs'"
echo ""
echo "🎨 Theme Features:"
echo "   • Dark Purple background (#271D3B) - Lucid Labs primary brand color"
echo "   • Teal accents (#339999) - Brand highlight color"
echo "   • Professional cloud-inspired design"
echo "   • Optimized for PowerShell, JSON, and Azure development"
echo ""
echo "📧 For support or feedback: koak@lucidlabs.com.au"
echo "🌐 Visit: https://lucidlabs.com.au"