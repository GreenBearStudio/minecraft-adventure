#!/bin/bash
set -euo pipefail

echo ""
echo "Validating static export for Android WebView..."
echo "--------------------------------------------------"

BROKEN=0

###############################################
# 1. Detect absolute URLs (FATAL in WebView)
###############################################

ABSOLUTE=$(grep -RhoP 'href="/|src="/' out || true)

if [[ -n "$ABSOLUTE" ]]; then
  echo "❌ ERROR: Found absolute URLs (these BREAK Android WebView):"
  echo "$ABSOLUTE" | sed 's/^/   - /'
  BROKEN=1
else
  echo "✔ No absolute URLs found"
fi

###############################################
# 2. Extract internal navigation links only
###############################################

LINKS=$(grep -RhoP 'href="[^"]+"' out \
  | sed 's/href="//;s/"$//' \
  | grep -v '^http' \
  | grep -v '^_next' \
  | grep -v '^\${' \
  | grep -v '^'\''+' \
  | grep -v '^#' \
  | sort -u || true)

if [[ -z "$LINKS" ]]; then
  echo "❌ No internal navigation links found"
  exit 1
fi

echo ""
echo "Internal navigation links:"
echo "$LINKS" | sed 's/^/   - /'

###############################################
# 3. Validate navigation targets
###############################################

echo ""
echo "Validating navigation targets..."

for link in $LINKS; do
  target1="out/$link/index.html"
  target2="out/$link.html"

  if [[ -f "$target1" ]]; then
    echo "   ✔ $link → $target1"
  elif [[ -f "$target2" ]]; then
    echo "   ✔ $link → $target2"
  else
    echo "   ❌ $link → Missing (expected $target1 or $target2)"
    BROKEN=1
  fi
done

###############################################
# 4. Validate _next/static assets
###############################################

echo ""
echo "Validating _next/static assets..."

NEXT_ASSETS=$(grep -RhoP 'src="_next/static/[^"]+' out || true)

if [[ -z "$NEXT_ASSETS" ]]; then
  echo "❌ No _next/static references found"
  BROKEN=1
else
  echo "$NEXT_ASSETS" | while read -r path; do
    clean="${path#src=\"}"
    file="out/$clean"

    if [[ -f "$file" ]]; then
      echo "   ✔ $clean"
    else
      echo "   ❌ Missing asset: $clean"
      BROKEN=1
    fi
  done
fi

###############################################
# Final result
###############################################

echo "--------------------------------------------------"

if [[ "$BROKEN" -eq 1 ]]; then
  echo "❌ WebView validation FAILED"
  exit 1
fi

echo "✅ WebView validation PASSED — all links and assets OK!"

