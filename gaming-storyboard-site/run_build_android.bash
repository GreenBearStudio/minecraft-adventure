#!/bin/bash
# Builds and converts to android build for upload to Google Play and Amazon Store
set -euo pipefail

# Step 1: Migrate capacitor.config.ts → capacitor.config.json if needed
CAPACITOR_CONFIG_TS="capacitor.config.ts"
if [ -f ${CAPACITOR_CONFIG_TS} ]; then
  echo "Found ${CAPACITOR_CONFIG_TS}, migrating to capacitor.config.json..."
  node -e "
    import fs from 'fs';
    import('./capacitor.config.ts').then(m => {
      const config = m.default || m.config || m;
      fs.writeFileSync('capacitor.config.json', JSON.stringify(config, null, 2));
      console.log('✔ Migration complete: capacitor.config.json created');
    }).catch(err => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
  "
  echo "Removing ${CAPACITOR_CONFIG_TS}"
  rm -f ${CAPACITOR_CONFIG_TS}
fi

# Step 2: Initialize Capacitor (safe to rerun)
APP_NAME=$(node -p "require('./package.json').name")
APP_ID=$(node -p "require('./package.json').appId || 'com.amunishk.' + require('./package.json').name")
WEB_DIR="out"

echo "Initializing Capacitor with:"
echo "  App Name: $APP_NAME"
echo "  App ID:   $APP_ID"
echo "  Web Dir:  $WEB_DIR"

npx cap init "$APP_NAME" "$APP_ID" --web-dir "$WEB_DIR" || true

# Step 3: Add Android platform if missing
if [ ! -d "android" ]; then
  echo "Adding Android platform..."
  npx cap add android
fi

# Keystore environment variables
export KEYSTORE_FILE="$HOME/secure/my-release-key.jks"
export KEYSTORE_PASSWORD="32AMZ#aa"
export KEY_ALIAS="storyboardKey"
export KEY_PASSWORD=$KEYSTORE_PASSWORD # same as keystore

# Step 3a: Ensure local.properties exists with SDK path
if [ -n "$ANDROID_HOME" ]; then
  echo "Ensuring local.properties points to SDK..."
  echo "sdk.dir=$ANDROID_HOME" > android/local.properties
  echo "✔ local.properties created with sdk.dir=$ANDROID_HOME"
else
  echo "⚠️ ANDROID_HOME is not set. Please export ANDROID_HOME to your SDK path."
  exit 1
fi

# Step 4a: Sync Capacitor with Android project
echo "Syncing Capacitor..."
npx cap sync android

# Step 4b: Sync Android version with package.json
echo "Syncing Android version with package.json..."

VERSION=$(node -p "require('./package.json').version")

if [[ -z "$VERSION" ]]; then
  echo "❌ Could not read version from package.json"
  exit 1
fi

echo "Version from package.json: $VERSION"

# Convert version (e.g. 1.4.0) → versionCode (e.g. 10400)
VERSION_CODE=$(echo "$VERSION" | awk -F. '{ printf("%d%d%d", $1, $2, $3) }' | sed 's/^0*//')

echo "Computed versionCode: $VERSION_CODE"

GRADLE_FILE="android/app/build.gradle"

echo "Updating $GRADLE_FILE..."

# Update versionName
sed -i.bak -E "s/versionName \".*\"/versionName \"$VERSION\"/" "$GRADLE_FILE"

# Update versionCode
sed -i.bak -E "s/versionCode [0-9]+/versionCode $VERSION_CODE/" "$GRADLE_FILE"

echo "✔ Android version synced:"
echo "  versionName = $VERSION"
echo "  versionCode = $VERSION_CODE"

# Step 5: Navigate to Android project
(
  cd android

  # Step 5a: Build APK (Amazon Appstore)
  echo "Building APK..."
  ./gradlew assembleRelease

  # Step 5b: Build AAB (Google Play)
  echo "Building AAB..."
  ./gradlew bundleRelease
)

# Step 6: Collect outputs
mkdir -p release-builds
cp android/app/build/outputs/apk/release/app-release.apk release-builds/
cp android/app/build/outputs/bundle/release/app-release.aab release-builds/

echo "✅ Signed builds ready:"
echo "APK: release-builds/app-release.apk"
echo "AAB: release-builds/app-release.aab"

