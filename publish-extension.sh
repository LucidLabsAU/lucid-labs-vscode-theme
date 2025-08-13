#!/bin/bash

# Lucid Labs VSCode Theme Publishing Script
# This script helps with building and publishing the VSCode extension

echo "🎨 Lucid Labs VSCode Theme Publisher"
echo "======================================"

# Change to theme directory
cd lucid-labs-theme

echo "📋 Current package information:"
echo "Name: $(jq -r '.name' package.json)"
echo "Version: $(jq -r '.version' package.json)"
echo "Publisher: $(jq -r '.publisher' package.json)"
echo ""

echo "🔧 Available commands:"
echo "1. Package only (creates .vsix file)"
echo "2. Publish to marketplace (requires authentication)"
echo "3. Pre-publish validation"
echo "4. Exit"
echo ""

read -p "Select option (1-4): " choice

case $choice in
    1)
        echo "📦 Packaging extension..."
        vsce package --out ../lucid-labs-theme-$(jq -r '.version' package.json).vsix
        echo "✅ Package created: ../lucid-labs-theme-$(jq -r '.version' package.json).vsix"
        echo ""
        echo "📋 Installation instructions:"
        echo "1. Open VSCode"
        echo "2. Go to Extensions (Ctrl+Shift+X)"
        echo "3. Click ... menu → Install from VSIX"
        echo "4. Select the .vsix file"
        ;;
    2)
        echo "🚀 Publishing to marketplace..."
        echo "⚠️  Make sure you have:"
        echo "   - Azure DevOps personal access token configured"
        echo "   - Publisher account set up at marketplace.visualstudio.com"
        echo ""
        read -p "Continue with publish? (y/N): " confirm
        if [[ $confirm == [yY]* ]]; then
            vsce publish
        else
            echo "❌ Publish cancelled"
        fi
        ;;
    3)
        echo "🔍 Running pre-publish validation..."
        vsce package --out /tmp/test-package.vsix
        echo "✅ Validation complete"
        rm -f /tmp/test-package.vsix
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "📧 For support: koak@lucidlabs.com.au"
echo "🌐 Website: https://lucidlabs.com.au"