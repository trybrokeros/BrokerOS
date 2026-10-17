<div align="center">

# Backend - BrokerOS

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
│   ├── auth.controller.ts     Auth endpoints (login, logout, session, TOTP challenge)
│   ├── roles.guard.ts         Global RBAC guard - checks session.user.role with supervisory bypass
│   └── roles.decorator.ts     @Roles() decorator for endpoints
│
├── leads/             Lead lifecycle management
│   ├── core/                  Lead CRUD, assignment, scoring, bulk CSV import
│   ├── call-records/          Call logging + Groq AI transcription
│   ├── follow-ups/            Scheduled follow-up management
│   ├── notes/                 Lead notes
│   └── site-visits/           GPS-verified site visits + selfie upload
│
├── bookings/          Top-level booking lifecycle
│   ├── booking.service.ts     Booking confirmation, unit lock, customer conversion
│   ├── booking-query.service.ts Scoped queries with soft-delete filtering
│   └── lead-booking.controller.ts Loan cases, builder-buyer agreements, key handover
│
├── payments/          Top-level payment management
│   ├── payments.service.ts    Installment payment schedules & transaction tracking
│   ├── payments.controller.ts Customer payment collection & receipt upload
│   └── payments-cron.service.ts Overdue demand reminder cron checks
│
├── inventory/         Property inventory
│   ├── projects/              Builder → Project management
│   ├── towers/                Tower config + AI generation (Groq)
│   ├── units/                 Unit status (Available → Blocked → Sold)
│   └── documents/             Price sheets, floor plans, offers, construction updates
│
├── brokers/           Channel Partner broker management (CRUD, meetings, referrals, KYC)
├── approvals/         Multi-step approval workflows (ApprovalRequest + FinancialApproval)
├── crm-telephony/     CRM PSTN softphone direct calling (WebRTC tokens, carrier bridge, call webhooks)
├── chat/              Socket.IO gateway - chat rooms + messages
├── notifications/     Socket.IO gateway + Expo Push SDK
│
├── dashboard/         Role-specific analytics (12 role controllers & services)
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
│   ├── email/                 Email campaigns, EmailInboxController, templates, analytics
│   ├── sms/                   SMS campaigns, SmsInboxController, keyword flows, analytics
│   ├── voice/                 AI voice campaigns, WebSocket media stream gateway, carrier bridge dispatcher
│   ├── whatsapp/              WhatsApp Cloud API, conversations controller, automations, templates
│   └── ads/                   Ad Platform Lead Ingest (Google, Meta, Instagram, YouTube webhooks)
│
└── lib/               Shared infrastructure
    ├── database/      PrismaModule wrapper around @brokeros/prisma
    ├── storage/       Vercel Blob upload/download helpers
    ├── filters/       HttpExceptionFilter and error normalizers
    └── auth.ts        Better Auth server configuration with twoFactor plugin
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
| `FRONTEND_URL` | Web app origin - allow Next.js session cookies | `http://localhost:3000` |
| `MOBILE_URL` | Mobile app origin - allow Expo dev client session cookies | `http://192.168.x.x:8081` |

**For `MOBILE_URL` - you must use your machine's LAN IP**, not `localhost`:

| OS | Command |
|---|---|
| Windows | `ipconfig \| findstr /i "ipv4"` |
| Mac / Linux | `ifconfig \| grep "inet " \| grep -v 127.0.0.1` |

URL format depends on how you run the mobile app:
- **Custom dev client** (`npx expo run:android`) → `http://192.168.x.x:8081` ← use this
- **Expo Go** (not supported — app has native modules) → `exp://192.168.x.x:8081`

### 3. Database Initialization

Database commands belong to the `@brokeros/prisma` package. Run from the root directory:

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Apply migrations
pnpm db:seed       # Seed demo users and projects
```

### 4. Running the API

```bash
# Start in watch mode from root
pnpm dev:api

# Or from apps/api:
pnpm start:dev
```

---

## Testing

```bash
# Unit tests (Jest)
pnpm --filter @brokeros/api test

# Headless E2E tests (Vitest)
pnpm test:api:e2e

# Specific E2E suite
pnpm test:api:e2e rbac-partitioning
pnpm test:api:e2e two-factor-auth
pnpm test:api:e2e lead-lifecycle
```
