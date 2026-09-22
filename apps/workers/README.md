<div align="center">

# Background Workers — BrokerOS

**Asynchronous campaign dispatchers, voice AI bridges, and queue processors**

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![BullMQ](https://img.shields.io/badge/Queue-BullMQ-orange)](https://bullmq.io/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ESM-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

`apps/workers` is the dedicated background processing service for BrokerOS. It handles all compute-intensive, high-latency, and batch I/O operations outside of the user-facing NestJS API cycle.

When a marketing user schedules or launches a broadcast (Email, SMS, AI Voice, or WhatsApp) from the web dashboard, `apps/api` delegates the dispatch execution to this worker service.

---

## Architecture

```
apps/workers/
├── src/
│   ├── main.ts                         # Server bootstrap on port 3334
│   ├── workers.module.ts               # Root NestJS module
│   ├── workers.controller.ts           # HTTP dispatch & health endpoints
│   │
│   └── processors/
│       ├── marketing-email.processor.ts    # Email campaigns (SES, SendGrid, Brevo, Mailchimp)
│       ├── marketing-sms.processor.ts      # SMS campaigns (Twilio, Gupshup, Sinch, AWS SNS)
│       ├── marketing-voice.processor.ts    # AI Voice calls + PSTN carrier bridge
│       ├── marketing-whatsapp.processor.ts # Meta WhatsApp Cloud API dispatcher
│       │
│       └── whatsapp/
│           ├── whatsapp-automation.runner.ts  # Event-triggered automation drips
│           ├── whatsapp-broadcast.runner.ts   # Bulk message broadcasting
│           └── whatsapp-template.syncer.ts    # Sync template library from Meta
```

---

## Processors

### 1. Marketing Email Processor (`marketing-email.processor.ts`)

- Loads campaign configuration and resolves target audience (CRM leads or CSV rows).
- Interpolates merge tags (`{{lead.name}}`, `{{project.name}}`, etc.).
- Routes dispatch through the chosen provider package (`@brokeros/int-mail-ses`, `@brokeros/int-mail-sendgrid`, etc.).
- Records individual delivery logs and updates aggregate campaign metrics.

### 2. Marketing SMS Processor (`marketing-sms.processor.ts`)

- Connects to configured SMS gateways (`@brokeros/int-sms-twilio`, `@brokeros/int-sms-gupshup`, etc.).
- Formats messages according to regional DLT templates or international standards.
- Dispatches messages in controlled batches with per-recipient error recovery.

### 3. Marketing Voice Processor (`marketing-voice.processor.ts`)

- Bridges 8 AI voice platforms (Vapi, Retell, Sarvam Bulbul v3, Bolna, ElevenLabs, LiveKit, OpenAI Realtime, Pipecat) to 4 PSTN carriers (Vobiz, Exotel, Twilio, Telnyx).
- Uses `normalizeVoiceLeadVariables` from `@brokeros/constants` to format merge tags for voice agents.
- Invokes `tryCarrierBridgeDispatch` from `@brokeros/int-voice` to initiate physical phone calls.
- Ingests call completion status and webhook analytics.

### 4. Marketing WhatsApp Processor (`marketing-whatsapp.processor.ts`)

- Connects via `@brokeros/int-whatsapp` to Meta WhatsApp Cloud API.
- Sub-components:
  - `whatsapp-broadcast.runner.ts`: High-throughput template broadcast queue.
  - `whatsapp-automation.runner.ts`: Drip sequence triggers (e.g. follow-up after site visit).
  - `whatsapp-template.syncer.ts`: Synchronizes approved message templates from Meta Business Manager into the CRM.

---

## Environment & Configuration

Workers use a **two-file loading strategy** (see [`src/main.ts`](src/main.ts)):
1. **Root `/.env`** — loaded first. Contains all heavy infrastructure and provider credentials.
2. **`apps/workers/.env`** — loaded second. Workers-only overrides.

---

## Development

All commands should be executed from the **monorepo root**:

```bash
# Start worker service in watch mode (port 3334)
pnpm dev:workers

# Production build
pnpm --filter @brokeros/workers build

# Run production build
pnpm --filter @brokeros/workers start:prod

# Run worker E2E tests (Vitest)
pnpm test:workers:e2e
# Or using workspace filter directly:
pnpm --filter @brokeros/workers test
```

---

## Docker

The worker service uses a multi-stage Dockerfile powered by Turborepo:
1. **Stage 1 (Prune):** Runs `turbo prune @brokeros/workers --docker` to isolate only the worker code and its workspace dependencies (`packages/`, `integrations/`).
2. **Stage 2 (Installer):** Installs dependencies with layer caching, generates the Prisma client, and compiles the NestJS microservice.
3. **Stage 3 (Runner):** Lightweight Node 22 Alpine production image exposing port 3334.

**Crucial Note:** Because it relies on Turborepo, the Dockerfile **must be built from the monorepo root context**, not from inside `apps/workers/`.

```bash
# Run via docker compose from the repo root (recommended):
docker compose up --build workers
```

---

## HTTP Endpoints

The worker exposes HTTP triggers used by `apps/api` for job delegation:

| Method | Endpoint          | Description                          | Payload                      |
| ------ | ----------------- | ------------------------------------ | ---------------------------- |
| `GET`  | `/health`         | Service health probe                 | None                         |
| `POST` | `/dispatch`       | Trigger email campaign processing    | `{ "campaignId": "string" }` |
| `POST` | `/dispatch-sms`   | Trigger SMS campaign processing      | `{ "campaignId": "string" }` |
| `POST` | `/dispatch-voice` | Trigger AI Voice campaign processing | `{ "campaignId": "string" }` |

---

<div align="center">

**[← Back to main README](../../README.md)**

</div>
