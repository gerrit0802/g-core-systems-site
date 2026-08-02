#!/usr/bin/env sh
set -eu

required_node="24.14.0"
current_node="$(node --version 2>/dev/null || true)"

if [ "$current_node" = "v$required_node" ]; then
  echo "Node.js $required_node is available."
else
  echo "Node.js $required_node is recommended for the validation script."
  echo "No installation or replacement was performed."
fi

echo "This static website has no package dependencies and requires no build step."
echo "Run: node scripts/validate-site.mjs"
