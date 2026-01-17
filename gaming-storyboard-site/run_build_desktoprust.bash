#!/bin/bash
# Builds Tauri desktop app with auto-versioning from Next.js package.json
set -euo pipefail

echo "Starting Desktop Production Build"

# Step 1: Read version from root package.json
VERSION=$(node -p "require('./package.json').version")

if [[ -z "$VERSION" ]]; then
  echo "❌ Could not read version from package.json"
  exit 1
fi

echo "Version from package.json: $VERSION"

# Step 2: Update Tauri version in tauri.conf.json
TAURI_CONF="tauri-app/src-tauri/tauri.conf.json"

echo "Updating Tauri version in $TAURI_CONF"

# Replace the "version": "..." field
sed -i.bak -E "s/\"version\": \"[^\"]+\"/\"version\": \"$VERSION\"/" "$TAURI_CONF"

echo "✔ Tauri version synced to $VERSION"

# Step 3: Check Next.js static export
if [[ ! -d "out" ]]; then
  echo "❌ Next.js export failed — 'out/' folder missing"
  exit 1
fi

echo "✔ Next.js export complete"

# Step 4: Build Tauri desktop app
echo "Building Tauri desktop binaries..."
(
  cd tauri-app
  cargo tauri build
)
echo "✔ Tauri build complete"

# Step 5: Collect outputs
echo "Collecting release artifacts..."
DESKTOP_SUBFOLDER="desktop-rust"
(
  cd tauri-app/src-tauri/target/release/bundle

  mkdir -p "../../../../../release-builds/"
  mkdir -p "../../../../../release-builds/${DESKTOP_SUBFOLDER}/"

  # Copy all bundle formats (deb, rpm, appimage, dmg, msi)
  find . -type f \( -name "*.deb" -o -name "*.AppImage" -o -name "*.rpm" -o -name "*.dmg" -o -name "*.msi" \) \
    -exec cp {} "../../../../../release-builds/${DESKTOP_SUBFOLDER}/" \;
)
echo "✅ Desktop builds ready in release-builds/${DESKTOP_SUBFOLDER}/"
ls -lh "release-builds/${DESKTOP_SUBFOLDER}"

