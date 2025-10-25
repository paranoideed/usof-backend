FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config.yaml ./config.yaml
COPY --from=builder /app/src ./src
COPY --from=builder /app/assets ./assets

ENV PORT 8080
EXPOSE 8080
CMD ["node", "dist/index.js", "service", "run"]
