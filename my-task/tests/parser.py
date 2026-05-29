#!/usr/bin/env python3
"""
Minimal parser example: adapt to your test runner's output format.
Expected to read test runner stdout from stdin and emit JSON list of {name, status}.
Status should be one of: "passed", "failed".
"""
import sys
import json

lines = sys.stdin.read().splitlines()
results = []
for ln in lines:
    ln = ln.strip()
    # This is a naive matcher; replace with a parser for your runner (jest/pytest/etc.)
    if ln.startswith("PASS ") or ln.startswith("ok "):
        name = ln.split(None, 1)[1] if len(ln.split(None,1))>1 else ln
        results.append({"name": name, "status": "passed"})
    elif ln.startswith("FAIL ") or ln.startswith("not ok "):
        name = ln.split(None, 1)[1] if len(ln.split(None,1))>1 else ln
        results.append({"name": name, "status": "failed"})

print(json.dumps(results))
