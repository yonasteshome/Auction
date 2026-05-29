#!/usr/bin/env bash
set -euo pipefail

# Run the project's test suite. Adjust this to match how tests run in your repo.
if [ -f package.json ]; then
  if npm test --silent; then
    exit 0
  else
    exit 1
  fi
else
  echo "No package.json; please update run_script.sh to run your tests." >&2
  exit 2
fi
