<div align="center">

# Frontend - BrokerOS

**Next.js 16 web dashboard with role-based views, unified departmental inboxes, and omnichannel marketing**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

The frontend is a Next.js 16 App Router application that serves as the enterprise web dashboard for BrokerOS. It provides 12 role-specific workspaces, a unified multi-channel departmental conversation inbox, enterprise security settings (MFA / 2FA TOTP), and a full marketing campaign management suite.

---

## Directory Structure

```
apps/web/
├── app/
│   ├── layout.tsx              Root HTML shell, fonts, providers
│   ├── globals.css             Global CSS + Tailwind v4 imports
│   ├── page.tsx                Root redirect → /dashboard or /login
│   ├── login/                  Public login page with TOTP 2FA challenge
│   └── dashboard/
│       ├── layout.tsx          MAIN SHELL - role-based sidebar, NotificationBell, ChatWidget
│       ├── page.tsx            Dashboard home (redirects to active role view)
│       ├── inbox/              Unified Departmental Inbox (accessible to all 12 roles)
│       │   ├── page.tsx        Redirects to primary channel
│       │   ├── whatsapp/       WhatsApp conversation queue
│       │   ├── sms/            SMS conversation queue
│       │   └── email/          Email conversation queue
│       ├── [12 role dirs]/     business-manager, channel-partner, closing-manager,
│       │                       director, finance, post-sales, pre-sales,
│       │                       pre-sales-manager, sales, sales-executive,
│       │                       sales-manager, sourcing-manager
│       └── marketing/
│           ├── email/          Campaigns, templates, analytics, settings
│           ├── sms/            Campaigns, phone mockup, analytics, settings
│           ├── voice/          AI voice campaigns, agent composer studio, settings
│           ├── whatsapp/       Broadcasts, chatbot flows, automations, templates, settings
│           └── ads/            Meta, Instagram, Google, and YouTube ad attribution
│
├── features/                   Domain feature UI (canonical barrels)
│   ├── leads/                  Lead list, profile cards, timeline, follow-ups
│   ├── inventory/              Project/unit browser, UnitGrid, UnitDetailsDrawer
│   ├── brokers/                Broker management, meeting tracking, KYC
│   ├── approvals/              Approval request tickets and negotiation threads
│   ├── security/               AdminSecuritySettings (MFA TOTP configuration)
│   └── marketing/
│       ├── shared/             Audience selector, campaign stepper, preview modals
│       ├── email/              Email wizard, drip flows, template editor, inboxes
│       ├── sms/                SMS wizard, phone preview, short-links, inboxes
│       ├── voice/              Voice wizard, prompt composer, audio player
│       └── whatsapp/           Broadcast wizard, flow builder, contact drawer
│
├── components/                 Shared components
│   ├── analytics/              Recharts-based chart components
│   ├── chat/                   ChatWidget (Socket.IO driven)
│   ├── commissions/            Commission display components
│   ├── dashboard/              Dashboard card/widget components
│   ├── leads/                  Lead-specific shared components
│   ├── notifications/          NotificationBell component
│   ├── payments/               Payment display components
│   └── ui/                     Primitive UI elements
│
├── lib/
│   ├── auth-client.ts          Better Auth client (with twoFactorClient plugin)
│   ├── api-client.ts           Type-safe ApiClient with error normalization
│   ├── inbox.ts                Inbox communication utilities
│   ├── inbox-scope.ts          Departmental inbox scope resolver
│   └── utils.ts                Shared utility functions
│
├── proxy.ts                    Next.js 16 route protection and role-slug verification
└── next.config.ts              Rewrites, image remote patterns, package transpilation
```

## Development

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- Running backend on port 3333

### 1. Installation

```bash
cd ../../  # Go to BrokerOS root
pnpm install
```

### 2. Environment Setup

You must configure your `apps/web/.env` file properly before starting the dev server.

```bash
cd apps/web
cp .env.example .env
```

#### A. API Configuration

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `/api/proxy` | Base URL used by all client-side API calls. Keep as `/api/proxy` in dev and production (unless frontend and API are on completely separate domains). |
| `BACKEND_URL` | `http://127.0.0.1:3333` | Server-side URL Next.js uses to forward proxied requests. **Never exposed to the browser.** In Docker, this defaults to `http://backend:3333` (compose service name). |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public URL of this web app. Used by Better Auth for callback URLs and by Socket.IO connection origin. Change to your production domain. |

The two active proxy routes:
```
/api/proxy/*      → BACKEND_URL/*
/api/marketing/*  → BACKEND_URL/api/marketing/*
```

#### B. Mapbox Token (Required for Live Agent Tracking)

> ⚠️ **Naming note:** The env variable is called `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` but the web app actually uses **Mapbox** (via `react-map-gl`) for the live GPS tracking map. The value must be a **Mapbox access token**, not a Google Maps key.

Used by: [`components/LiveTrackingMap.tsx`](components/LiveTrackingMap.tsx) — the director/manager real-time agent location view.

1. Go to [Mapbox Account](https://account.mapbox.com/).
2. Create an account and generate a **public access token**.
3. Set it in your `.env`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="pk.eyJ1...your-mapbox-token"
   ```

### 3. Run & Build

All commands should be executed from the **monorepo root**:

#### Development

```bash
# Run from repository root
pnpm dev:web

# Or from apps/web:
pnpm dev
```

---

## Testing

```bash
# Linting
pnpm --filter @brokeros/web lint

# Production build verification
pnpm --filter @brokeros/web exec next build

# Playwright E2E browser tests
pnpm test:web:e2e
```
