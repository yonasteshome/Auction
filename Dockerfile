FROM node:20

WORKDIR /workspace

COPY auction/package.json auction/package-lock.json ./auction/
COPY backend/package.json backend/package-lock.json ./backend/

RUN cd auction && npm ci --unsafe-perm --no-audit --no-fund && \
    cd ../backend && npm ci --unsafe-perm --no-audit --no-fund

COPY auction ./auction
COPY backend ./backend

RUN cd auction && npm run build

CMD ["/bin/sh", "-c", "echo 'Auction repository image built successfully'"]
