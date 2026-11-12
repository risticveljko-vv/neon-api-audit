#!/bin/sh
# Fetch Neon's API spec and check it against the frozen SHA-256.
# The spec is licensed "Proprietary", so this repo doesn't redistribute it.
# Usage: npm run fetch-spec            (live URL, falls back to the archive)
#        npm run fetch-spec -- archive (Internet Archive copy only)
set -eu
SHA=64a2beee00eb38d9fddc61c5ce38552f08ec6655741393924574cebefc322827
LIVE=https://neon.com/api_spec/release/v2.json
ARCHIVE=https://web.archive.org/web/20261112155523id_/https://neon.com/api_spec/release/v2.json
mkdir -p spec
check() { [ "$(shasum -a 256 spec/v2.json | cut -d' ' -f1)" = "$SHA" ]; }
if [ "${1:-}" != "archive" ]; then
  curl -fsSL --compressed -o spec/v2.json "$LIVE" && check && { echo "spec/v2.json: live copy matches the frozen SHA"; exit 0; }
  echo "Live copy differs from the frozen spec (or failed); trying the archive."
fi
curl -fsSL "$ARCHIVE" | gunzip -c > spec/v2.json 2>/dev/null || curl -fsSL "$ARCHIVE" -o spec/v2.json
check && echo "spec/v2.json: archived copy matches the frozen SHA" || { echo "SHA mismatch: not the frozen spec" >&2; exit 1; }
