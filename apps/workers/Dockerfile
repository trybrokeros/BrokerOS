# =============================================================
# Workers Dockerfile — NestJS 11 Background Worker (Turborepo)
# Multi-stage: prune → install → build → production
# =============================================================

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
RUN npm install -g turbo
RUN apk add --no-cache libc6-compat openssl

# ── Stage 1: Prune ─────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY . .
# Extract only the packages/apps needed for @brokeros/workers
RUN turbo prune @brokeros/workers --docker

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

# Generate Prisma client and build the Workers app
RUN pnpm --filter @brokeros/prisma db:generate
RUN pnpm turbo run build --filter=@brokeros/workers...

# ── Stage 3: Production Image ──────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy hoisted node_modules and the isolated workspaces
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/integrations ./integrations
COPY --from=installer /app/apps/workers ./apps/workers
COPY --from=installer /app/package.json ./package.json

EXPOSE 3334

CMD ["node", "apps/workers/dist/main"]
