# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ---- publish stage ----
# This container is NOT a long-running service. At startup it copies the
# Vite build output into the shared `/shared` volume (mounted by compose)
# so the nginx container can serve it from /usr/share/nginx/html.
# Once the copy finishes the container exits 0 and compose uses
# `service_completed_successfully` on nginx's depends_on to gate startup.
FROM alpine:3.20 AS publish
RUN apk add --no-cache coreutils
COPY --from=build /app/dist /app/dist
CMD ["sh", "-c", "rm -rf /shared/* && cp -r /app/dist/. /shared/ && echo 'frontend assets published to shared volume'"]
