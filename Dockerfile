FROM node:20

# Use a non-root working directory
WORKDIR /app

# Install dependencies using lockfile for reproducibility
COPY package-lock.json package.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build (if present)
COPY . .
RUN if [ -f package.json ] && npm run | grep -q "build"; then npm run build; fi || true

# Default command (adjust if your app has a different entry)
CMD ["node", "server.js"]
