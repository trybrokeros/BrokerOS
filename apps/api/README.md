<div align="center">

# Backend — BrokerOS

**NestJS 11 REST API + Socket.IO real-time server + BullMQ workers**

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ESM-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

The backend is a modular NestJS 11 application written in TypeScript ESM. It serves the REST API consumed by the Next.js frontend and the Expo mobile app, runs Socket.IO gateways for real-time chat and notifications, and enqueues async jobs to the BullMQ worker cluster.

---

## Module Architecture

```
apps/api/src/
├── auth/              Authentication & authorization
│   ├── auth.controller.ts     Auth endpoints (login, logout, session)
│   ├── roles.guard.ts         RBAC guard — checks session.user.role
│   └── roles.decorator.ts     @Roles() decorator for endpoints
│
├── leads/             Lead lifecycle management
│   ├── core/                  Lead CRUD, assignment, scoring
│   ├── bookings/              Booking creation, customer conversion, post-sales, payments
│   ├── call-records/          Call logging + Groq AI transcription
│   ├── follow-ups/            Scheduled follow-up management
│   ├── notes/                 Lead notes
│   └── site-visits/           GPS-verified site visits + selfie upload
│
├── inventory/         Property inventory
│   ├── projects/              Builder → Project management
│   ├── towers/                Tower config + AI generation (Groq)
│   ├── units/                 Unit status (Available → Blocked → Sold)
│   └── documents/             Price sheets, floor plans, offers, construction updates
│
├── brokers/           Channel Partner broker management (CRUD, meetings, referrals, KYC)
├── approvals/         Multi-step approval workflows (ApprovalRequest + FinancialApproval)
├── chat/              Socket.IO gateway — chat rooms + messages
├── notifications/     Socket.IO gateway + Expo Push SDK
│
├── dashboard/         Role-specific analytics (largest module)
│   ├── pre-sales/     Pre-sales exec daily performance
│   ├── sales-exec/    Sales pipeline & conversion metrics
│   ├── sales-manager/ Team oversight & approvals
│   ├── post-sales/    Loan, agreement, possession tracking
│   ├── sourcing-manager/ Broker recruitment metrics
│   ├── closing-manager/  On-site booking analytics
│   ├── channel-partner/  CP-wide performance
│   ├── business-manager/ Cross-business overview
│   ├── manager/       Shared manager utilities
│   └── employees/     Employee performance tracking
│
├── marketing/         Omnichannel marketing campaigns (Email · SMS · Voice · WhatsApp · Ads)
│   ├── marketing.module.ts    Root module
│   ├── shared/                CSV template download controller
│   │
│   ├── email/                 Email Campaign Module (controllers, services, facade)
│   ├── sms/                   SMS Campaign Module (controllers, services, facade)
│   ├── voice/                 AI Voice Campaign Module (controllers, gateway, services, facade)
│   ├── whatsapp/              WhatsApp Cloud API Module (broadcasts, automations, templates, webhooks)
│   └── ads/                   Ad Platform Lead Ingest (Google, Meta, Instagram, YouTube webhooks)
│
└── lib/               Shared infrastructure
    ├── database/      PrismaModule wrapper around @brokeros/prisma
    └── storage/       Vercel Blob upload/download helpers
```

## Development

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- PostgreSQL 16+ (via Docker, local install, or cloud like [Neon](https://neon.tech))

### 1. Installation

This project is part of a pnpm monorepo. Install dependencies from the root directory:

```bash
cd ../../  # Go to BrokerOS root
pnpm install
```

### 2. Environment Setup

```bash
cp apps/api/.env.example apps/api/.env
```
Populate these in `apps/api/.env`:

| Variable | Purpose | Default |
|---|---|---|
| `FRONTEND_URL` | Web app origin — allow Next.js session cookies | `http://localhost:3000` |
| `MOBILE_URL` | Mobile app origin — allow Expo dev client session cookies | `http://192.168.x.x:8081` |

**For `MOBILE_URL` — you must use your machine's LAN IP**, not `localhost`:

| OS | Command |
|---|---|
| Windows | `ipconfig \| findstr /i "ipv4"` |
| Mac / Linux | `ifconfig \| grep "inet " \| grep -v 127.0.0.1` |

URL format depends on how you run the mobile app:
- **Custom dev client** (`npx expo run:android`) → `http://192.168.x.x:8081` ← use this
- **Expo Go** (not supported — app has native modules) → `exp://192.168.x.x:8081`

### 3. Database Initialization

Once your `.env` is configured, set up Prisma (now located in `@brokeros/prisma`):

```bash
pnpm --filter @brokeros/prisma db:generate           # Generate Prisma client
pnpm --filter @brokeros/prisma db:migrate            # Run migrations to create tables
pnpm --filter @brokeros/prisma db:seed               # Populate database with sample data
```

### 4. Run & Test

All commands should be executed from the **monorepo root**:

```bash
# Start API dev server (from root)
pnpm dev:api                                  # Dev server with watch mode → http://localhost:3333
# OR using workspace filter directly:
pnpm --filter @brokeros/api start:dev

# Production build & start
pnpm --filter @brokeros/api build             # Compile to dist/
pnpm --filter @brokeros/api start:prod        # Run production build

# Testing & Typechecking
pnpm --filter @brokeros/api test              # Run all Jest unit tests (*.spec.ts)
pnpm --filter @brokeros/api test:e2e          # Run end-to-end tests
```

---

## Docker

The backend uses a highly optimized multi-stage Dockerfile powered by Turborepo:

1. **Stage 1 (Prune):** Runs `turbo prune @brokeros/api --docker` to isolate only the backend code and its workspace dependencies (`packages/`, `integrations/`).
2. **Stage 2 (Installer):** Installs dependencies with frozen lockfile, generates the Prisma client, and compiles the NestJS distribution.
3. **Stage 3 (Runner):** Lightweight Node 22 Alpine production image that automatically runs pending migrations (`prisma migrate deploy`), seeds demo data if the DB is unseeded (`tsx seed.ts --if-empty`), and launches the API.

**Crucial Note:** Because it relies on Turborepo, the Dockerfile **must be built from the root context**, not from inside `apps/api/`.

```bash
# Run via docker compose from the repo root (recommended):
docker compose up --build backend
```

The backend runs on port **3333** by default.

<div align="center">

**[← Back to main README](../../README.md)**

</div>
