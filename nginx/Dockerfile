FROM nginx:stable-alpine
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
# Web root is populated at runtime via the `frontend_dist` named volume
# (see docker-compose.yml). The default nginx image's /usr/share/nginx/html
# is left in place as a fallback; the volume mount overlays it.
EXPOSE 80
