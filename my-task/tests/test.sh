#!/usr/bin/env bash
set -euo pipefail

LOGS_DIR="${LOGS_DIR:-/logs/verifier}"
mkdir -p "$LOGS_DIR"

cd /workspace

# Apply test patch if test_patch is non-empty
TEST_PATCH_FILE="/task/tests/config.json"
if [ -f "$TEST_PATCH_FILE" ]; then
    TEST_PATCH=$(python3 -c "import json,sys; d=json.load(open('$TEST_PATCH_FILE')); print(d.get('test_patch',''))")
    if [ -n "$TEST_PATCH" ]; then
        echo "$TEST_PATCH" | git apply --allow-empty - 2>/dev/null || true
    fi
fi

# Run tests and capture output
set +e
bash /task/tests/run_script.sh 2>&1 | tee /tmp/test_output.txt
set -e

RAW=$(cat /tmp/test_output.txt)

# Parse results
PARSED=$(echo "$RAW" | python3 /task/tests/parser.py)
echo "Parsed results: $PARSED"

# Load required tests from config
FAIL_TO_PASS=$(python3 -c "import json; d=json.load(open('$TEST_PATCH_FILE')); print(' '.join(d['fail_to_pass']))")
PASS_TO_PASS=$(python3 -c "import json; d=json.load(open('$TEST_PATCH_FILE')); print(' '.join(d['pass_to_pass']))")

REWARD=1

for TEST in $FAIL_TO_PASS $PASS_TO_PASS; do
    STATUS=$(echo "$PARSED" | python3 -c "
import json,sys
data=json.load(sys.stdin)
name='$TEST'
for r in data:
    if r['name'] == name:
        print(r['status'])
        sys.exit(0)
print('missing')
")
    echo "  $TEST -> $STATUS"
    if [ "$STATUS" != "pass" ]; then
        REWARD=0
    fi
done

echo "$REWARD" > "$LOGS_DIR/reward.txt"
echo "Final reward: $REWARD"
