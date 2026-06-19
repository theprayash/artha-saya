## Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache netcat-openbsd
WORKDIR /app
COPY package*.json ./
RUN npm ci

## Stage 2: Build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

## Stage 3: Production runtime
FROM node:20-alpine AS runner
RUN apk add --no-cache netcat-openbsd
WORKDIR /app
ENV NODE_ENV=production

# Only what's needed at runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Drizzle config + schema for schema push on startup
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src/lib/db ./src/lib/db

EXPOSE 3000

CMD ["sh", "-c", "until nc -z db 5432; do echo 'waiting for db...'; sleep 1; done && npx drizzle-kit push && npm start"]
