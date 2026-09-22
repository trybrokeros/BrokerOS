# AGENTS.md — apps/workers/

---

## Tech

NestJS 11 · TypeScript ESM (`"type": "module"`) · BullMQ / In-memory queue processors · Prisma 7 (`@brokeros/prisma`) · Integration Adapters (`@brokeros/int-*`) · Constants & Normalizers (`@brokeros/constants`).

---

## Purpose & Scope

`apps/workers/` executes all long-running, asynchronous, and batch tasks for BrokerOS:

- Omnichannel broadcast campaign dispatching (Email, SMS, AI Voice, WhatsApp).
- Audience lead resolution and merge tag normalization.
- External adapter routing via `integrations/`.
- Per-recipient delivery tracking and database status synchronization.

Never execute batch delivery or external platform calling inside `apps/api` request handlers. `apps/api` enqueues jobs or triggers workers via HTTP dispatch endpoints; `apps/workers` executes the work asynchronously.

---

## Directory Architecture

```
apps/workers/
├── src/
│   ├── main.ts                           ← Server bootstrapper (port 3334, root .env loader)
│   ├── workers.module.ts                 ← Root NestJS module declaring processors & controller
│   ├── workers.controller.ts             ← HTTP dispatch endpoints (/health, /dispatch, /dispatch-sms, /dispatch-voice)
│   │
│   └── processors/                       ← Campaign execution engines
│       ├── marketing-email.processor.ts  ← Email dispatch (SES, SendGrid, Brevo, Mailchimp)
│       ├── marketing-sms.processor.ts    ← SMS dispatch (Twilio, Gupshup, Sinch, AWS SNS)
│       ├── marketing-voice.processor.ts  ← Voice AI dispatch + PSTN carrier bridge dispatcher
│       ├── marketing-whatsapp.processor.ts ← WhatsApp Cloud API broadcast processor
│       │
│       └── whatsapp/                     ← WhatsApp runner modules
│           ├── whatsapp-automation.runner.ts  ← Drip sequence & trigger actions
│           ├── whatsapp-broadcast.runner.ts   ← High-volume template broadcasts
│           └── whatsapp-template.syncer.ts    ← Meta Cloud API template catalog sync
│
├── package.json
└── tsconfig.json
```

---

## Core Rules for Workers

1. **Database Access**: Always import Prisma via `@brokeros/prisma`. Never instantiate an ad-hoc PrismaClient or write raw SQL.
2. **Integration Adapters Only**: Never make direct `fetch` or HTTP calls to external SaaS providers (SendGrid, Twilio, Vapi, Retell, Meta) from processor code. Always call the typed methods on `@brokeros/int-*` adapters.
3. **Pure Logic & Normalizers**: Import merge tag replacements, pricing models, and lead normalizers from `@brokeros/constants` (e.g., `normalizeVoiceLeadVariables`). Do not duplicate string transformation logic in processors.
4. **Resilient Per-Recipient Error Handling**:
   - Process recipients in isolated `try/catch` blocks.
   - If recipient N fails (invalid number, bounced email, carrier timeout), log the error, record failure status in `CampaignRecipient` / `CallLog`, and continue with recipient N+1.
   - Never crash the entire worker process on a single failed delivery.
5. **Campaign State Updates**:
   - Update campaign status to `IN_PROGRESS` on start.
   - Atomically increment counters (`sentCount`, `deliveredCount`, `failedCount`).
   - Mark campaign `COMPLETED` or `FAILED` upon queue completion.
6. **Concurrency & Rate Limiting**:
   - Respect external carrier rate limits (e.g., telephony channels or Meta WhatsApp tiers).
   - Use concurrency caps or pacing delays where required.

---

## Scripts & Development

Run from repository root:

```bash
# Start workers in development mode (watch mode on port 3334)
pnpm dev:workers
# Or using workspace filter:
pnpm --filter @brokeros/workers start:dev

# Compile workers to dist/
pnpm --filter @brokeros/workers build

# Run workers E2E tests (Vitest)
pnpm test:workers:e2e
# Or using workspace filter:
pnpm --filter @brokeros/workers test
```
