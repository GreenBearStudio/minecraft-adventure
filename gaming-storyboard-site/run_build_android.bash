#!/bin/bash
# android.sh — Builds and converts to android build for upload to Google Play and Amazon Store
set -e

# Step 0: Migrate capacitor.config.ts → capacitor.config.json if needed
CAPACITOR_CONFIG_TS="capacitor.config.ts"
if [ -f ${CAPACITOR_CONFIG_TS} ]; then
  echo "Found ${CAPACITOR_CONFIG_TS}, migrating to capacitor.config.json..."
  node -e "
    import fs from 'fs';
    import('./capacitor.config.ts').then(m => {
      const config = m.default || m.config || m;
      fs.writeFileSync('capacitor.config.json', JSON.stringify(config, null, 2));
      console.log('✅ Migration complete: capacitor.config.json created');
    }).catch(err => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
  "
  echo "Removing ${CAPACITOR_CONFIG_TS}"
  rm -f ${CAPACITOR_CONFIG_TS}
fi

# Step 1: Build Next.js static site
echo "Building Next.js site..."
npm run build

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
  echo "✅ local.properties created with sdk.dir=$ANDROID_HOME"
else
  echo "⚠️ ANDROID_HOME is not set. Please export ANDROID_HOME to your SDK path."
  exit 1
fi

# Step 4: Sync Capacitor with Android project
echo "Syncing Capacitor..."
npx cap sync android

# Step 5: Navigate to Android project
cd android

# Step 6: Build APK (Amazon Appstore)
echo "Building APK..."
./gradlew assembleRelease

# Step 7: Build AAB (Google Play)
echo "Building AAB..."
./gradlew bundleRelease

# Step 8: Collect outputs
cd ..
mkdir -p release-builds
cp android/app/build/outputs/apk/release/app-release.apk release-builds/
cp android/app/build/outputs/bundle/release/app-release.aab release-builds/

echo "✅ Signed builds ready:"
echo "APK: release-builds/app-release.apk"
echo "AAB: release-builds/app-release.aab"

