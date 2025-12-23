#!/bin/bash
set -e

APK_PATH="release-builds/app-release.apk"

echo "Installing APK to connected Android device..."

# 1. Check ADB
if ! command -v adb >/dev/null 2>&1; then
  echo "❌ adb not found. Install Android Platform Tools and ensure adb is in your PATH."
  exit 1
fi

# 2. Check APK exists
if [[ ! -f "$APK_PATH" ]]; then
  echo "❌ APK not found at: $APK_PATH"
  exit 1
fi

# 3. Check device connection
echo "Waiting for ADB to detect your device..."
adb start-server
adb wait-for-device

DEVICE_COUNT=$(adb devices | grep -w "device" | wc -l)

if [[ "$DEVICE_COUNT" -eq 0 ]]; then
  echo "❌ No Android device detected."
  exit 1
fi

echo "Device detected. Proceeding with install..."

# 4. Install APK
adb install -r "$APK_PATH"

echo "✅ Install complete! Launching app..."

# 5. Launch the app
APP_ID=$(node -p "require('./package.json').appId || 'com.amunishk.' + require('./package.json').name")
adb shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1

echo "App launched on device."

# 6. Enable WebView debugging
echo "Enabling WebView debugging..."
adb shell setprop debug.webview.remote-debugging 1
echo "Open Chrome → chrome://inspect/#devices"

# 7. Start Logcat
echo "Starting Logcat (filtered)..."
adb logcat | grep -E "Capacitor|SystemWebViewClient|chromium|$APP_ID|LocalServer"
#adb logcat | grep LocalServer

