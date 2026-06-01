FROM node:20.19.2

WORKDIR /app

COPY package-lock.json package.json ./
RUN npm ci --no-audit --no-fund

COPY . .

CMD ["node", "apps/api/realtime_service/index.js"]
