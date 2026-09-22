# =============================================================
# Frontend Dockerfile — Next.js 16 (App Router)
# Multi-stage: prune → install → build → standalone production runner
# =============================================================

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
RUN npm install -g turbo
RUN apk add --no-cache libc6-compat

# ── Stage 1: Prune ─────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY . .
# Extract only the packages/apps needed for @brokeros/web
RUN turbo prune @brokeros/web --docker

# ── Stage 2: Install & Build ───────────────────────────────────
FROM base AS installer
WORKDIR /app

# Copy pruned json and lockfile first for layer caching
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy the full pruned source code
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Next.js standalone output configuration
ENV NEXT_TELEMETRY_DISABLED=1

# Build args for public env vars
ARG NEXT_PUBLIC_API_URL=/api/proxy
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
ARG BACKEND_URL="http://backend:3333"

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV BACKEND_URL=$BACKEND_URL

RUN pnpm turbo run build --filter=@brokeros/web... --env-mode=loose

# ── Stage 3: Production Image ──────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone Next.js output
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Note: standalone mode outputs server.js inside apps/web folder
# Dynamically sync runtime BACKEND_URL into routes-manifest.json before starting server
CMD ["sh", "-c", "node -e \"const fs = require('fs'); const file = 'apps/web/.next/routes-manifest.json'; if (fs.existsSync(file) && process.env.BACKEND_URL) { let content = fs.readFileSync(file, 'utf8'); content = content.replace(/http:\\/\\/(?:127\\.0\\.0\\.1|backend):3333/g, process.env.BACKEND_URL); fs.writeFileSync(file, content); }\" && node apps/web/server.js"]

