#!/bin/bash
# Reset Next.js build environment with diagnostics
set -euo pipefail

echo "Cleaning Next.js build artifacts..."
rm -rf .next node_modules node_modules/.cache node_modules/.turbo out

# Diagnostic safeguard 1: Check for duplicate type names
echo "Checking for duplicate type identifiers..."
grep -R "type PagesPageConfig" ./src ./pages ./types 2>/dev/null || echo "✔ No duplicate PagesPageConfig found in your source."

# Diagnostic safeguard 2: Verify lockfile integrity
echo "Verifying lockfile integrity..."
if [ -f package-lock.json ]; then
  npm ci --dry-run > /dev/null
  if [ $? -eq 0 ]; then
    echo "✔ package-lock.json is consistent."
  else
    echo "⚠️ Lockfile mismatch detected. Consider regenerating with 'rm package-lock.json && npm install'."
    exit 1
  fi
fi

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Pre build testing
bash ./scripts-bash/diagnostics.bash

# Run a fresh build
echo "Starting fresh build..."
npm run build

# Post build testing
#bash ./scripts-bash/simulate_navigation.bash 

echo "✅ Build pipeline complete — ready for Android build!"

