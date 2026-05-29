#!/usr/bin/env bash
set -euo pipefail

# This script should apply a unified diff that fixes the bug
# Edit the heredoc below with a git-style unified diff that applies at `base_commit`.

git apply -p0 <<'PATCH'
--- a/README.md
+++ b/README.md
@@
 - placeholder
PATCH

echo "Patch applied"
