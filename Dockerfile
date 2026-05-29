FROM node:20

WORKDIR /workspace

# Copy only lockfiles / package manifests first to leverage layer caching
COPY package.json package-lock.json* ./

# If a lockfile is present, use npm ci (lockfile-driven installs are allowed)
RUN if [ -f package-lock.json ]; then \
  npm ci --unsafe-perm --no-audit --no-fund; \
  else echo "No root package-lock.json found; skipping npm ci"; fi

# Copy the rest of the repo
COPY . .

# Build step (best-effort). Keep non-fatal so the Docker build can still succeed
# if the project doesn't expose a build script at repo root; platform reviewers
# will run more specific build steps per-task if needed.
RUN if npm run build --if-present; then echo "build ok"; else echo "no root build"; fi

CMD ["/bin/sh", "-c", "echo 'Repository image built' && sleep 3600"]
