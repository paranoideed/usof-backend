# --- Этап 1: Сборщик (Builder) ---
# Используем 'alpine' версию для меньшего размера образа
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и lock-файл
COPY package.json package-lock.json ./

# Ставим ВСЕ зависимости, включая devDependencies (они нужны для 'tsc')
RUN npm ci

# Копируем весь остальной код проекта
# (файлы из .dockerignore будут пропущены)
COPY . .

# Запускаем сборку TypeScript -> JavaScript
RUN npm run build

# --- Этаap 2: Финальный (Production) ---
# Начинаем с чистого, легкого образа
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и lock-файл
COPY package.json package-lock.json ./

# Ставим ТОЛЬКО production зависимости
RUN npm ci --omit=dev

# Копируем скомпилированный код из этапа 'builder'
COPY --from=builder /app/dist ./dist

# Копируем конфиг
COPY --from=builder /app/config.yaml ./config.yaml

# Копируем SQL-миграции, чтобы knex мог их найти
COPY --from=builder /app/src/data/migrations ./src/data/migrations

# Устанавливаем порт по умолчанию
ENV PORT 8080

# Открываем порт
EXPOSE 8080

# Команда для запуска.
# Мы будем запускать скомпилированный JS, а не TS через tsx.
# 'service run' взято из твоего Makefile (run-server)
ENV KV_VIPER_FILE=./config_docker.yaml

CMD ["node", "dist/index.js", "service", "run"]
