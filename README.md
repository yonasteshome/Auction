# 🛒 SpendSense Ethiopia

**Cost of Living Tracker, Budget Assistant & Smart Shopping Platform**

SpendSense Ethiopia is a comprehensive, hybrid-architecture web platform designed to help Ethiopian consumers track the rising cost of living, manage personal budgets, and make smart shopping decisions. The platform leverages crowdsourced market data, vendor integrations, and machine learning to forecast prices and recommend the most cost-effective shopping options.

*This project is submitted to the Department of Software Engineering, College of Electrical Engineering and Computing at Adama Science and Technology University (ASTU).*

## 👥 Meet the Team
* **Yonas Zekariyas**
* * **Yonas Adane**
* **Azariel Tesfaye**
* **Yonas Teshome**
* **Sumaya Adem**
---

## ✨ Core Features

* **Financial Management:** Users can set monthly budget limits across various essential categories and track their daily expenses.
* **Market Intelligence (Crowdsourcing):** Shoppers can submit real-time prices for essential goods (e.g., Teff, Charcoal, Cooking Oil) to help maintain an accurate, localized cost-of-living index.
* **Smart Shopping & Vendor Marketplace:** Verified local vendors can list their inventory. The system uses a proprietary algorithm to recommend vendors based on the lowest price, reliability, and proximity.
* **Real-Time Alerts:** Get instant WebSocket notifications when you are approaching your budget limits or when there is a sudden spike in tracked essential items.
* **Machine Learning Price Forecasting:** Uses a SARIMA model pipeline to analyze historical pricing data and forecast market inflation for the upcoming 1-4 weeks.

---

## 🛠️ Tech Stack

This project utilizes a modern, decoupled hybrid architecture:

* **Frontend:** Next.js (React), Tailwind CSS
* **Core Backend (API & ML):** Django, Django REST Framework, Python (pandas, statsmodels)
* **Real-Time Backend:** Express.js, Node.js, Socket.io
* **Database:** PostgreSQL
* **Authentication:** JSON Web Tokens (JWT)

---

## 📂 Repository Structure

The project is structured as a monorepo containing the frontend and the dual-backend architecture.
```text
SpendSense/
├── apps/
│   ├── api/                           # Django REST API + ML-oriented backend
│   ├── realtime/                      # Standalone Express + Socket.io real-time server
│   └── web/                           # Next.js frontend
├── packages/                          # Shared internal packages
│   ├── ui/                            # Shared UI component library
│   ├── logger/                        # Shared logging utilities
│   ├── eslint-config/                 # Shared lint configuration
│   ├── jest-presets/                  # Shared Jest presets
│   ├── tailwind-config/               # Shared Tailwind/PostCSS config
│   └── typescript-config/             # Shared TypeScript base configs
├── docs/                              # Project documentation and planning artifacts
├── docker-compose.yml                 # Local multi-service orchestration
├── turbo.json                         # Turborepo pipeline configuration
├── package.json                       # Root workspace scripts/dependencies
└── README-monorepo.md                 # Monorepo usage notes
```



