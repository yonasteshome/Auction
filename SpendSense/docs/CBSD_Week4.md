# CBSD — Week 4 coursework (single deliverable)

SpendSense — component-based software development log. **One file** for the Google Doc mirror: **Progress**, **Ideation**, **Component model practice**, plus **process marks**.

**Allowed log rhythm:** three entries per week on **Mon–Wed–Fri**. This branch uses **2026-03-16 / 18 / 20** and **2026-03-23 / 25 / 27**.

---

## 2026-03-16 (Mon) — Progress tab — period 1

For each hash: tag as *component built*, *integration practice*, *design pattern*, or *refactoring / clean code*.

| Hash | Type | What changed |
|------|------|----------------|
| `df17717` | Component built | Django custom `User` as `AUTH_USER_MODEL`. |
| `18e5554` | Integration practice | Settings + `.env`; DB config from environment. |
| `1da540d` | Component built | Next.js + TypeScript + Tailwind app shell. |
| `e51734c` | Component built | Shared UI (e.g. Select and related pieces). |
| `f2bb9a8` | Refactoring / clean code | Client folder renamed to `spendsense-client`. |

Verify: `git log --until='2026-03-10' --oneline -12 --date=short`

**What counts (process marks):** system trials with component breakdown and ideation; independent design-pattern implementations; component-model test simulations; miscellaneous refactoring / clean-code improvements.

---

## 2026-03-18 (Wed) — Ideation tab — period 1

### Cognitive load (5–7 boxes)

One mental screen:

```text
[ Web (Next.js) ] ──REST/JWT──▶ [ Core API (Django) ] ──▶ [ PostgreSQL ]
        │                                      │
        └──────── optional ────────────────────┴──▶ [ Realtime (Express) + Prisma ]
```

### Component breakdown (maps to repo)

| Component | Responsibility | Primary location |
|-----------|----------------|------------------|
| **Identity & access** | Register, login, JWT, roles, password reset, profile, admin user ops | `apps/api/users/`, `apps/api/core_api/` |
| **Market intelligence** | Items, crowdsourced prices, moderation | `apps/api/market/` |
| **Personal finance** | Budgets, expenses, export | `apps/api/finance/` |
| **Commerce** | Vendors, listings, purchases | `apps/api/ecommerce/` |
| **API shell** | CORS, Swagger/OpenAPI, shared permissions | `apps/api/core_api/` |
| **Web presentation** | Pages, layouts, auth UI | `apps/web/src/` |
| **Shared UI kit** | Design-system components | `packages/ui/` |
| **Realtime gateway** | Socket server (optional) | `apps/realtime/` |

### Figma and connections

- Map Figma frames to routes under `apps/web/src/app/`.
- **Slide wording (interconnection):** **Docs, Gemini, Stitch with G, Figma – interconnection** — keep the same names in docs, design tools, and code paths so reviewers can follow slide → frame → folder.

---

## 2026-03-20 (Fri) — Component model practice — period 1

### Architectural unit: Django **User** (identity root)

**Object model:** one `User` type configured via `AUTH_USER_MODEL`; extensions (profile, vendor) hang off this aggregate later.

**X-MAN (actors / messages):**

| Step | Actor | Outcome |
|------|--------|---------|
| 1 | Developer | Declares `User` model + `AUTH_USER_MODEL` in settings. |
| 2 | Django | Migrations create the canonical user table. |
| 3 | API | Serializers/views add register, JWT, `/me` without forking identity per feature. |

**Test simulation ideas:** assert `get_user_model()` matches settings; create user via factory; unique constraints on email/username as defined.

**Pattern:** single **identity root** for RBAC, finance ownership, and market submissions.

---

## 2026-03-23 (Mon) — Progress tab — period 2

| Hash | Type | What changed |
|------|------|----------------|
| `a73adc1` | Integration + pattern | Generic CBVs + OpenAPI decorators for **users** and **market**. |
| `4c51c2e` | Component built (API shell) | Swagger UI Bearer JWT + schema view auth. |
| `6084fe8` | Integration / docs | JWT and 401 notes in `apps/api/ENDPOINTS.md`. |
| `0070a4c` | Component built | Prisma + DB client for **Realtime** app. |
| `13f0c98` | Refactoring / clean code | Realtime `package.json` / `server.ts` tidy. |
| `b88c10d` | Component built | Week 3 profile fields, password reset, API tests. |
| `8b2dd75` | Refactoring / clean code | Permission helper cleanup in API tests. |

Verify: `git log --until='2026-04-02' --oneline -20 --date=short`

---

## 2026-03-25 (Wed) — Ideation tab — period 2

- **Cognitive load:** keep the **API shell** (Swagger, permissions) and **Realtime** as optional side boxes so the main picture stays **Django + Postgres + Web**.
- **Figma:** shopper / vendor / admin flows; each major frame maps to a route under `apps/web/src/app/`.
- **Contracts:** behaviour in code, **Swagger** (`/swagger/`), and `apps/api/ENDPOINTS.md` for humans.
- **Interconnection (slide):** **Docs, Gemini, Stitch with G, Figma – interconnection** — documentation, AI-assisted drafts, and design files stay aligned with what is merged in the monorepo.

---

## 2026-03-27 (Fri) — Component model practice — period 2

### Architectural unit: **User aggregate** (profile + password reset)

**Location:** `apps/api/users/` — models, serializers, views, permissions; URLs in `core_api`.

**Object model:** `User` + profile fields + one-time **password reset** token with expiry and single use.

**X-MAN–friendly states:**

| State / transition | Meaning |
|--------------------|---------|
| Active session | JWT issued; `/me` and scoped endpoints. |
| Reset requested | Opaque token issued; user receives link (channel-specific). |
| Token valid | New password accepted; token invalidated. |
| Expired / reused | Reject; request new reset. |

**Component model tests:** happy path, expired token, replay, profile authz — see `apps/api/tests/test_week3_users.py`.

**Patterns:** layered API (views → serializers → models); **RBAC** for admin lists vs self-service profile.
