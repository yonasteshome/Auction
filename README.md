# Auction (Turborepo Monorepo)

## Structure

- `apps/web` — Next.js frontend
- `apps/api` — Express/Mongo backend
- `packages/ui` — Shared UI components (shadcn primitives)

## Commands

From the repo root:

- `npm install`
- `npm run dev` — run dev tasks (web + api)
- `npm run build` — build all packages

You can also run a single app:

- `cd apps/web && npm run dev`
- `cd apps/api && npm run dev`
