FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

ENV API_BASE_URL=/api/v1
ENV BACKEND_ORIGIN=http://host.docker.internal:8000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.d/40-generate-config.sh /docker-entrypoint.d/40-generate-config.sh
RUN chmod +x /docker-entrypoint.d/40-generate-config.sh

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
