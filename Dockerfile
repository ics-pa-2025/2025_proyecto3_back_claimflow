# =========================
# Etapa 1: Build
# =========================
FROM node:20 AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# =========================
# Etapa 2: Producción
# =========================
FROM node:20-alpine AS production-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build-stage /app/dist ./dist

RUN mkdir -p /app/public/images
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main.js"]
