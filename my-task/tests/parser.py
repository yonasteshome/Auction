#!/usr/bin/env python3
"""
Parse Django test runner --verbosity=2 output into JSON for Silver.
Output format: [{"name": "...", "status": "pass"|"fail"|"error"}]

Django format:
  test_method (tests.module.ClassName) ... ok
  test_method (tests.module.ClassName) ... FAIL
  test_method (tests.module.ClassName) ... ERROR
"""
import json
import re
import sys


def parse(output: str):
    results = []
    # Match: "test_foo (tests.module.ClassName) ... ok|FAIL|ERROR"
    pattern = re.compile(
        r'^(test_\w+)\s+\(([^)]+)\)\s*(?:\.\.\.\s*)?(ok|FAIL|ERROR)',
        re.MULTILINE,
    )
    for m in pattern.finditer(output):
        method = m.group(1)
        cls_path = m.group(2)  # e.g. "tests.test_price_alert_duplicate.PriceAlertDuplicateTest"
        result = m.group(3)
        # Full name: cls_path.method_name
        name = f"{cls_path}.{method}"
        status = "pass" if result == "ok" else "fail"
        results.append({"name": name, "status": status})
    return results


if __name__ == "__main__":
    raw = sys.stdin.read()
    parsed = parse(raw)
    print(json.dumps(parsed))
