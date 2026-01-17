#!/bin/bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
CHANGELOG_FILE="./release-builds/CHANGELOG.md"
RELEASE_NOTES_FILE="./release-builds/release-notes.md"

echo "Starting release process for version $VERSION"

# Ensure changelog exists
if [[ ! -f "$CHANGELOG_FILE" ]]; then
  echo "⚠️ No CHANGELOG.md found — creating one."
  echo "# Changelog" > "$CHANGELOG_FILE"
fi

# Generate release notes
echo "Generating release notes..."

npx conventional-changelog -p angular -r 1 > "$RELEASE_NOTES_FILE"

# If release notes are empty, fallback to plain git
if ! grep -q "[a-zA-Z0-9]" "$RELEASE_NOTES_FILE"; then
  echo "⚠️ No conventional commits found — falling back to plain git log."
  git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s" > "$RELEASE_NOTES_FILE"
fi

echo "✔ Release notes written to $RELEASE_NOTES_FILE"

# Prepend to changelog
echo "Updating $CHANGELOG_FILE..."

{
  echo "## $VERSION - $(date +%Y-%m-%d)"
  cat "$RELEASE_NOTES_FILE"
  echo ""
  cat "$CHANGELOG_FILE"
} > "${CHANGELOG_FILE}.tmp"

mv "${CHANGELOG_FILE}.tmp" "$CHANGELOG_FILE"

# Commit + tag + push
git add -f "$CHANGELOG_FILE" "$RELEASE_NOTES_FILE"
git commit -m "chore(release): $VERSION"
git tag -a "v$VERSION" -m "Release $VERSION"
git push
git push --tags

echo "✅ Release $VERSION complete!"

