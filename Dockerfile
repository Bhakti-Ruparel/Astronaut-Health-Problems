FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app
ARG VITE_NEON_AUTH_URL
ENV VITE_NEON_AUTH_URL=${VITE_NEON_AUTH_URL}

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        gettext-base \
        nginx \
        python3 \
        python3-venv \
        supervisor \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY scripts/neon_data.py scripts/telemetry_api.py ./scripts/
COPY requirements-web.txt ./
COPY --from=frontend-build /app/dist ./dist
COPY deploy/nginx.conf.template ./deploy/nginx.conf.template
COPY deploy/supervisord.conf /etc/supervisor/conf.d/astromind.conf
COPY deploy/entrypoint.sh /entrypoint.sh

RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements-web.txt \
    && chmod +x /entrypoint.sh

EXPOSE 10000
ENTRYPOINT ["/entrypoint.sh"]
