#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(pwd)
LOG_DIR=/logs/verifier
mkdir -p "$LOG_DIR"

python - <<'PY'
import json,sys,subprocess,os

cfg = json.load(open('tests/config.json'))
test_patch = cfg.get('test_patch','')
if test_patch:
    # apply test patch
    p = subprocess.Popen(['git','apply','-p0'], stdin=subprocess.PIPE)
    p.communicate(input=test_patch.encode())
    if p.returncode != 0:
        print('git apply failed', file=sys.stderr)
        sys.exit(2)

# run the test runner, capture stdout
with open('/tmp/runner.out','wb') as out:
    rc = subprocess.call(['bash','tests/run_script.sh'], stdout=out, stderr=subprocess.STDOUT)

with open('/tmp/runner.out','r') as f:
    runner_out = f.read()

parser = subprocess.Popen(['python','tests/parser.py'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
parsed, _ = parser.communicate(input=runner_out.encode())
try:
    results = json.loads(parsed.decode())
except Exception:
    results = []

status_map = { r['name']: r['status'] for r in results }

need_pass = cfg.get('fail_to_pass',[]) + cfg.get('pass_to_pass',[])
all_pass = True
for t in need_pass:
    if status_map.get(t) != 'passed':
        all_pass = False

os.makedirs('/logs/verifier', exist_ok=True)
with open('/logs/verifier/reward.txt','w') as f:
    f.write('1' if all_pass else '0')

print('Wrote reward:', '1' if all_pass else '0')
sys.exit(0 if all_pass else 1)
PY
