<div align="center">

# Frontend — BrokerOS

**Next.js 16 web dashboard with role-based views and omnichannel marketing campaigns**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

The frontend is a Next.js 16 App Router application that serves as the web dashboard for the CRM. It provides 12 role-specific views and a full omnichannel marketing platform (Email, SMS, AI Voice, WhatsApp campaigns, and Ads lead attribution) accessible to the Marketing role.

## Directory Structure

```
apps/web/
├── app/
│   ├── layout.tsx              Root HTML shell, fonts, providers
│   ├── globals.css             Global CSS + Tailwind v4 imports
│   ├── page.tsx                Root redirect → /dashboard or /login
│   ├── login/                  Public login page (no auth guard)
│   └── dashboard/
│       ├── layout.tsx          THE MAIN SHELL — role-based sidebar, NotificationBell, ChatWidget
│       ├── page.tsx            Dashboard home (redirects to role view)
│       ├── [12 role dirs]/     business-manager, channel-partner, closing-manager,
│       │                       director, finance, post-sales, pre-sales,
│       │                       pre-sales-manager, sales, sales-executive,
│       │                       sales-manager, sourcing-manager
│       └── marketing/
│           ├── email/
│           │   ├── campaigns/new/     4-step email campaign wizard
│           │   ├── campaigns/[id]/    Campaign detail + analytics
│           │   └── settings/          Email provider integrations
│           ├── sms/
│           │   ├── campaigns/new/     4-step SMS campaign wizard
│           │   ├── campaigns/[id]/    Campaign detail + analytics
│           │   └── settings/          SMS gateway integrations
│           ├── voice/
│           │   ├── campaigns/new/     5-step AI voice campaign wizard
│           │   ├── campaigns/[id]/    Campaign detail + analytics
│           │   └── settings/          AI voice platform integrations
│           ├── whatsapp/
│           │   ├── inbox/             Multi-agent shared team inbox
│           │   ├── broadcasts/        WhatsApp template broadcasts
│           │   ├── flows/             Interactive chatbot flow builder
│           │   ├── automations/       Keyword and trigger-based automations
│           │   ├── pipelines/         Deal pipelines and stages
│           │   ├── contacts/          Contact directory, tags, and custom fields
│           │   ├── templates/         Meta template catalog syncer
│           │   └── settings/          Cloud API configuration and AI assistant
│           └── ads/                   Meta, Instagram, Google, and YouTube ad management
│
├── features/                   Domain feature UI
│   ├── leads/                  Lead list, detail, follow-ups, call history
│   ├── inventory/              Project/unit browser
│   ├── brokers/                Broker management
│   ├── approvals/              Approval request UI
│   └── marketing/
│       ├── shared/
│       │   ├── AudienceSelector.tsx   Shared CSV/lead audience picker
│       │   └── CampaignWizardStepper.tsx  Shared step progress bar
│       ├── components/         Shared marketing components (funnels, provider cards, etc.)
│       ├── email/
│       │   ├── components/     EmailCampaignListTable, EmailFunnelAnalytics,
│       │   │                   EmailTemplatePicker, EmailProviderConfigCard, etc.
│       │   └── wizard/
│       │       ├── EmailStep1ProjectSender.tsx   Project + sender identity + provider
│       │       ├── EmailStep2Audience.tsx         CSV upload or lead segment
│       │       ├── EmailStep3TemplateEditor.tsx   Rich HTML template editor
│       │       └── EmailStep4ReviewLaunch.tsx     Preview, schedule, launch
│       ├── sms/
│       │   ├── components/     SmsCampaignListTable, SmsFunnelAnalytics,
│       │   │                   SmsMessageEditor, SmsPhoneMockup, etc.
│       │   └── wizard/
│       │       ├── SmsStep1ProjectGateway.tsx     Project + SMS gateway
│       │       ├── SmsStep2Audience.tsx            CSV / lead audience
│       │       ├── SmsStep3MessageMockup.tsx       Message + phone preview
│       │       └── SmsStep4ReviewLaunch.tsx        Review + launch
│       └── voice/
│           ├── components/
│           │   ├── InBrowserAudioPlayer.tsx        TTS preview player
│           │   ├── VoiceCampaignListTable.tsx
│           │   ├── VoiceCampaignFunnel.tsx
│           │   ├── VoiceCallLogsTable.tsx
│           │   ├── VoiceModelSelector.tsx           LLM model picker
│           │   ├── VoicePickerModal.tsx             TTS voice persona browser
│           │   ├── VoiceProviderConfigCard.tsx
│           │   └── composer/                        Studio subcomponents
│           │       ├── AgentPlatformSelector.tsx    Platform grid + workspace agents
│           │       ├── StudioVapiSettings.tsx        Vapi STT, silence, ambience
│           │       ├── StudioRetellSettings.tsx      Retell emotion, ambient, backchannel
│           │       ├── StudioSarvamSettings.tsx      Sarvam Indic language + pace
│           │       ├── LivePromptVariablePreview.tsx Real-time variable interpolation
│           │       ├── VoiceScriptEditor.tsx         Script templates + prompt composer
│           │       └── index.ts                      Barrel export
│           └── wizard/
│               ├── VoiceStep1ProjectSchedule.tsx   Project + schedule
│               ├── VoiceStep2Audience.tsx           CSV / lead audience
│               ├── VoiceStep3TelephonyCarrier.tsx   PSTN carrier (Vobiz/Exotel/Twilio/Telnyx)
│               ├── VoiceStep4AgentComposer.tsx       Coordinator (~250 lines) — imports composer/
│               └── VoiceStep5ReviewLaunch.tsx        Review + test call + launch
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
│   ├── auth-client.ts          Better Auth client (createAuthClient)
│   └── utils.ts                Shared utility functions
│
└── middleware.ts               Route protection (cookie-based session check)
```

## Development

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- Running backend (for API calls)

### 1. Installation

This project is part of a pnpm monorepo. Install dependencies from the root directory:

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

The frontend uses a **proxy pattern** via Next.js rewrites (see [`next.config.ts`](next.config.ts)). In local dev, all API calls from the browser go through Next.js to avoid CORS:

| Variable | Default | Purpose |
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
pnpm dev:web                                  # Dev server → http://localhost:3000
# OR using workspace filter directly:
pnpm --filter @brokeros/web dev
```

#### Production

```bash
pnpm --filter @brokeros/web exec next build   # Full verified production build
pnpm --filter @brokeros/web start             # Serve production build
```

#### Testing (Playwright E2E)

The web dashboard includes comprehensive Playwright browser E2E test specs located in `apps/web/e2e/specs/`:
- `01-auth.spec.ts`: Authentication, login branding, credential validation, and role redirection.
- `02-lead-pipeline.spec.ts`: Lead board rendering, search filters, and detail modals.
- `03-marketing-wizards.spec.ts`: Omnichannel campaign wizards (SMS, Voice, Email).
- `04-inventory.spec.ts`: Property inventory matrix, towers, units, and CP/Brokerage isolation.
- `05-commissions.spec.ts`: Commission settlement summaries and payouts.

```bash
# Run all web E2E tests (automatically launches Next.js dev server on port 3000 if not running):
pnpm test:web:e2e

# If Chromium headless shell is not yet installed:
pnpm --filter @brokeros/web exec playwright install chromium
```

---

## API Communication

The frontend uses a proxy pattern to communicate with the backend:

- **Client-side:** Requests go to `/api/proxy/*` which Next.js proxies to the backend.
- **Server-side:** Uses the `BACKEND_URL` environment variable directly.
- **Real-time:** Socket.IO client connects directly to the backend for chat and notifications.

---

## Docker

The frontend uses a highly optimized multi-stage Dockerfile powered by Turborepo:

1. **Stage 1 (Prune):** Runs `turbo prune @brokeros/web` to isolate only the frontend code and its internal workspace dependencies (like `@brokeros/constants`).
2. **Stage 2 (Installer):** Installs dependencies, bakes `NEXT_PUBLIC_*` env vars, and runs the Next.js standalone build.
3. **Stage 3 (Runner):** A lightweight Alpine image that runs the compiled Next.js standalone server as a non-root user.

**Crucial Note:** Because it relies on Turborepo, the Dockerfile **must be built from the monorepo root context**, not from inside `apps/web/`.

```bash
# Run via docker compose from the repo root (recommended):
docker compose up --build frontend
```

The frontend runs on port **3000** by default.

---

<div align="center">

**[← Back to main README](../../README.md)**

</div>
