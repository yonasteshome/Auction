FROM node:20

# This per-task Dockerfile often uses the approved repo image as FROM.
# Replace the FROM line with the exact approved repo image when authoring a real task.

WORKDIR /workspace

# Reset to the base commit will be handled by the harness; install deps for tests
COPY package-lock.json package.json /workspace/
RUN npm ci --no-audit --no-fund

COPY . /workspace
