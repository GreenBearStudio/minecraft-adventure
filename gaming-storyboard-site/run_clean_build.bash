#!/bin/bash
# clean.sh — Reset Next.js build environment with diagnostics
set -e

echo "🧹 Cleaning Next.js build artifacts..."

# Remove Next.js build output
rm -rf .next

# Remove TypeScript and Turbo caches
rm -rf node_modules/.cache
rm -rf node_modules/.turbo

# Remove node_modules for a full reinstall
rm -rf node_modules

# Diagnostic safeguard 1: Check for duplicate type names
echo "🔍 Checking for duplicate type identifiers..."
grep -R "type PagesPageConfig" ./src ./pages ./types 2>/dev/null || echo "✅ No duplicate PagesPageConfig found in your source."

# Diagnostic safeguard 2: Verify lockfile integrity
echo "🔍 Verifying lockfile integrity..."
if [ -f package-lock.json ]; then
  npm ci --dry-run > /dev/null
  if [ $? -eq 0 ]; then
    echo "✅ package-lock.json is consistent."
  else
    echo "⚠️ Lockfile mismatch detected. Consider regenerating with 'rm package-lock.json && npm install'."
  fi
fi

# Diagnostic safeguard 3: Check for missing environment files
echo "🔍 Checking for environment files..."
for envfile in ".env" ".env.local" ".env.development" ".env.production"; do
  if [ -f $envfile ]; then
    echo "✅ Found $envfile"
  else
    echo "⚠️ Missing $envfile"
  fi
done

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install

# Run a fresh build
echo "🚀 Starting fresh build..."
npm run build

echo "✅ Clean build complete with diagnostics!"

