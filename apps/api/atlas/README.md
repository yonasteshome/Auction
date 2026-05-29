# Atlas API (MarketSight)

`apps/api/atlas` contains the new analytics, market intelligence, commerce lifecycle, finance automation, and realtime endpoint surface for MarketSight.

## Overview

The Atlas app exposes a public insights layer on top of vendor, market, finance, refund, dispute, and realtime activity.

### Primary route

- `GET /api/atlas/` is the Atlas manifest root for family metadata and snapshot details.

### Key feature groups

- `GET /api/atlas/vendor-analytics/`
- `GET /api/atlas/vendor-analytics/<vendor_uuid>/`
- `GET /api/atlas/vendor-funnel/`
- `GET /api/atlas/vendor-funnel/<vendor_uuid>/`
- `GET /api/atlas/vendor-risk/`
- `GET /api/atlas/vendor-risk/<vendor_uuid>/`
- `GET /api/atlas/inventory-health/`
- `GET /api/atlas/inventory-health/<vendor_uuid>/`
- `GET /api/atlas/reconciliation-summary/`
- `GET /api/atlas/reconciliation-summary/<vendor_uuid>/`
- `GET /api/atlas/market-benchmarks/`
- `GET /api/atlas/compliance-alerts/`
- `GET /api/atlas/dynamic-pricing/`
- `GET /api/atlas/dynamic-pricing/<vendor_uuid>/`
- `GET /api/atlas/delivery-promises/`
- `GET /api/atlas/action-playbook/`
- `GET /api/atlas/insights/`
- `GET /api/atlas/insights/report/`
- `GET /api/atlas/insights/groups/`
- `GET /api/atlas/insights/<slug>/`
- `GET /api/atlas/market-intelligence/`
- `GET /api/atlas/market-intelligence/anomalies/`
- `GET /api/atlas/refunds/`
- `POST /api/atlas/refunds/`
- `GET /api/atlas/refunds/<refund_id>/`
- `PATCH /api/atlas/refunds/<refund_id>/`
- `GET /api/atlas/disputes/`
- `POST /api/atlas/disputes/`
- `GET /api/atlas/disputes/<dispute_id>/`
- `PATCH /api/atlas/disputes/<dispute_id>/`
- `GET /api/atlas/budget-rules/`
- `POST /api/atlas/budget-rules/`
- `GET /api/atlas/cashflow-forecast/`
- `GET /api/atlas/tax-export/`
- `GET /api/atlas/realtime-events/`
- `POST /api/atlas/realtime-events/`
- `GET /api/atlas/realtime-subscriptions/`
- `POST /api/atlas/realtime-subscriptions/`
- `GET /api/atlas/realtime-status/`

### Atlas family routes

Existing atlas family views remain available for all blueprint families:

- `/api/atlas/overview/`
- `/api/atlas/signals/`
- `/api/atlas/rituals/`
- `/api/atlas/archetypes/`
- `/api/atlas/trends/`
- `/api/atlas/forecasts/`
- `/api/atlas/benchmarks/`
- `/api/atlas/comparisons/`
- `/api/atlas/maps/`
- `/api/atlas/scores/`
- `/api/atlas/chronicles/`
- `/api/atlas/experiments/`
- `/api/atlas/playbooks/`

Each family also supports `summary`, `compare`, `export`, and `detail` endpoints.

## Example requests

### Get platform analytics

```bash
curl -X GET "http://127.0.0.1:8000/api/atlas/vendor-analytics/"
```

### Get vendor funnel data

```bash
curl -X GET "http://127.0.0.1:8000/api/atlas/vendor-funnel/<vendor_uuid>/"
```

### Create a refund request

```bash
curl -X POST "http://127.0.0.1:8000/api/atlas/refunds/" \
  -H "Content-Type: application/json" \
  -d '{
    "requested_by": "<user_uuid>",
    "vendor": "<vendor_uuid>",
    "transaction_reference": "TX-12345",
    "amount": "750.00",
    "reason": "Item not delivered"
  }'
```

### Submit a realtime event

```bash
curl -X POST "http://127.0.0.1:8000/api/atlas/realtime-events/" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "price_tick",
    "channel": "global",
    "payload": {"item": "Teff", "price": 5000}
  }'
```

### Get vendor risk and pricing recommendations

```bash
curl -X GET "http://127.0.0.1:8000/api/atlas/vendor-risk/<vendor_uuid>/"
```

```bash
curl -X GET "http://127.0.0.1:8000/api/atlas/dynamic-pricing/<vendor_uuid>/"
```

## Local migration and run instructions

When developing locally, use SQLite for the simplest path.

```bash
cd apps/api
set USE_SQLITE=true
py -3 -m pip install -r requirements.txt
py -3 manage.py makemigrations atlas
py -3 manage.py migrate
py -3 manage.py runserver
```

If you want the full app schema including other apps:

```bash
py -3 manage.py makemigrations
py -3 manage.py migrate
```

## API docs

Swagger is available at:

- `http://127.0.0.1:8000/swagger/`
- `http://127.0.0.1:8000/redoc/`
