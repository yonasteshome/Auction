#!/usr/bin/env bash
set -euo pipefail

cd /workspace/apps/api

python manage.py test tests.test_price_alert_duplicate \
    --verbosity=2 \
    --no-input \
    2>&1
