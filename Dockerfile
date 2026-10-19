FROM node:26.12.0-alpine3.23@sha256:2ae3a23c9c5d2129398f4844c7c43400c061faf6973852f0fa837323bff9a5a8 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY index.html model-manifest.json tsconfig.json vite.config.ts ./
COPY src ./src
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29.4-alpine3.23@sha256:a6c4f61f456b85b8fdf7ec7ab28cc3e299440e6fb4a9dea520e5fd8fd440025e

USER root
RUN apk add --no-cache --upgrade \
  libcrypto3=3.5.7-r0 \
  libssl3=3.5.7-r0 \
  musl=1.2.5-r23

COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf

USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
