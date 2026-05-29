Silver submission helpers
=========================

This repository has a minimal Dockerfile and guidance to prepare it for Silver platform repository submission.

What was added
- `Dockerfile` — pinned `FROM node:20`; runs `npm ci` if a `package-lock.json` is present and runs `npm run build` if present.
- `.dockerignore` — excludes build artifacts but does NOT exclude `.git` (the platform requires the full git history in the zip).

Pre-submission checklist
- Ensure the repo you upload is private on GitHub and that you own the IP.
- Zip the repo with the top-level folder stripped (the platform expects files at the zip root) and include the `.git` directory.
- Confirm the Dockerfile passes the static rules (≤200 lines, ≤30 RUNs, pinned base image). This Dockerfile was designed to follow those rules.

Optional next steps I can do for you
- Create a task template directory (`my-task/`) for authoring Silver tasks (instruction.md, tests/, solution/, environment/Dockerfile).
- Generate a more specific per-task `environment/Dockerfile` tailored to an app inside `apps/` or `SpendSense/` with pinned test deps.
- Run a local Harbor null/oracle test (requires Harbor + Docker on your machine).

Tell me which of the optional next steps you'd like me to take.
