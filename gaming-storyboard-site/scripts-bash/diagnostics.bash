#!/bin/bash
set -euo pipefail

echo "Running Capacitor + Next.js + MDX diagnostics..."
echo "---------------------------------------------------"

# 1. Check Next.js dynamic route file
echo "Checking Next.js dynamic route..."
if [[ -f "pages/episodes/[slug].tsx" ]]; then
  echo "   ✔ pages/episodes/[slug].tsx exists"
else
  echo "   ❌ Missing pages/episodes/[slug].tsx"
  exit 1
fi

# 2. Check MDX content folder
echo "Checking MDX content folder..."
if [[ -d "content/episodes" ]]; then
  echo "   ✔ content/episodes exists"
else
  echo "   ❌ Missing content/episodes directory"
  exit 1
fi

# 3. Check MDX files
echo "Checking MDX episode files..."
MDX_FILES=$(ls content/episodes/*.mdx 2>/dev/null || true)
if [[ -z "$MDX_FILES" ]]; then
  echo "   ❌ No .mdx files found in content/episodes"
  exit 1
else
  echo "   ✔ Found MDX files:"
  echo "$MDX_FILES" | sed 's/^/      - /'
fi

# 4. Check Capacitor config
echo "Checking capacitor.config..."
if [[ -f "capacitor.config.json" ]]; then
  echo "   ✔ capacitor.config.json exists"
else
  echo "   ❌ Missing capacitor.config.json"
  exit 1
fi

echo "---------------------------------------------------"
echo "✅ Diagnostics complete!"

