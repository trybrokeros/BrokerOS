# AGENTS.md

Telegraph style. Root rules only. Read scoped `AGENTS.md` inside `apps/api/`, `apps/web/`, or `apps/mobile/` before touching that subtree. Skills own step-by-step workflows; root owns hard policy and business invariants.

---

## Project

BrokerOS is an Enterprise Real Estate CRM for a brokerage business. Two completely separate business lines run under one roof:

- **Brokerage** — Internal sales team sells properties to clients. Projects flagged `isCpProject = false`.
- **Channel Partner (CP)** — External broker network. Projects flagged `isCpProject = true`.

Same database. Same inventory. Separated by exactly one flag: `Project.isCpProject`. Never mix data across this boundary.

Stack: NestJS 11 backend · PostgreSQL + Prisma 7 · Next.js 16 frontend (App Router) · Expo 54 mobile (Expo Router 6) · BullMQ async workers. All TypeScript. Auth: Better Auth everywhere.

---

## Start

- Repo root: `BrokerOS/` — **pnpm monorepo** with Turborepo.
- Structure: `apps/` (deployable), `packages/` (shared), `integrations/` (external adapters).
- Apps: `apps/api/` (NestJS API), `apps/web/` (Next.js), `apps/mobile/` (Expo RN), `apps/workers/` (BullMQ async).
- Packages: `packages/types/` (@brokeros/types), `packages/validators/` (@brokeros/validators), `packages/prisma/` (@brokeros/prisma), `packages/storage/` (@brokeros/storage), `packages/constants/` (@brokeros/constants).
- Integrations: `integrations/voice/` (@brokeros/int-voice), `integrations/mail/`, `integrations/sms/`, `integrations/whatsapp/` (@brokeros/int-whatsapp), `integrations/ads/` — external provider adapters.

- **CRITICAL**: Before you write any code or start any task, you **MUST** read the scoped `AGENTS.md` in the corresponding subtree:
  - For ANY request related to the API, use `view_file` to read `apps/api/AGENTS.md`
  - For ANY request related to the frontend, use `view_file` to read `apps/web/AGENTS.md`
  - For ANY request related to the mobile app, use `view_file` to read `apps/mobile/AGENTS.md`
  - For ANY request related to background workers, use `view_file` to read `apps/workers/AGENTS.md`
  - For ANY request related to 3rd-party integrations, use `view_file` to read `integrations/AGENTS.md`
- Before proposing any custom system, check if an existing service/module/hook already handles it.

- **Environment Law:** Never hardcode secrets. We use a split architecture:
  - **Root `/.env`** is for heavy infrastructure: Database URLs, Better Auth secrets, Groq AI keys, Vercel Blob tokens and telephony, AI voice API keys when using marketing deparment.
  - **App-level `.env`s** (`apps/web`, `apps/mobile`, `apps/api`) are ONLY for local routing URLs and specific client keys (like Google Maps).
- Use repo-root-relative paths in all references: `apps/api/src/leads/leads.service.ts`, not absolute paths.

---

## Packages & Shared Logic

We are migrating shared business logic out of the apps and into the `packages/` directory using Turborepo workspaces.

- **`@brokeros/constants`**: Pure TS constants, enums, UI colors, and pure utility functions. Includes domain modules: `campaign.ts`, `email.ts`, `sms.ts`, `voice/` (telephony, agents, voices, scripts, pricing, normalizer). Decomposed into sub-modules — never add a monolithic flat file.
- **`@brokeros/types`**: Shared TypeScript interfaces and DTO definitions. Includes domain modules: `common.ts`, `email.ts`, `sms.ts`, `voice/` (telephony, agent, options, webhook, analytics, streaming).
- **`@brokeros/validators`**: Shared Zod schemas for form validation and API payloads.
- **`@brokeros/prisma`**: The central Prisma ORM client, schema, and migrations.
- **`@brokeros/storage`**: Centralized Vercel Blob storage wrappers.

**CRITICAL RULES FOR AGENTS:**

1. **Gradual Migration:** This is an ongoing, chunk-by-chunk migration. Many legacy types/constants still live locally in `apps/web/` and `apps/mobile/`. **Do NOT** perform massive sweeping refactors to move hundreds of files at once.
2. **New Code:** When creating _new_ shared constants, types, or Zod validators that are used across the API and frontend/mobile, put them in the respective `packages/` folder.
3. **Importing:** Import them into apps using the package name (e.g., `import { LEAD_STATUS } from '@brokeros/constants'`).
4. **No Side Effects:** Packages must be pure TypeScript. Do not include React, Next.js, or NestJS specific dependencies in `packages/`.

---

## Integrations

External service adapters live in `integrations/` — one directory per channel. Each integration is a self-contained TypeScript package.

- **`integrations/voice/`** (`@brokeros/int-voice`): AI voice agent adapters (`vapi`, `retell`, `sarvam`, `bolna`, `elevenlabs`, `livekit`, `openai-realtime`, `pipecat`) and PSTN carrier adapters (`vobiz`, `exotel`, `twilio`, `telnyx`) via `bridge/carrier-bridge-dispatcher.ts`.
- **`integrations/mail/`**: Email provider adapters (`sendgrid`, `brevo`, `mailchimp`, `aws-ses`).
- **`integrations/sms/`**: SMS gateway adapters (`twilio`, `gupshup`, `sinch`, `aws-sns`).
- **`integrations/whatsapp/`** (`@brokeros/int-whatsapp`): Meta WhatsApp Cloud API adapter for templates, interactive messages, and webhook handling.
- **`integrations/ads/`**: Ad platform lead webhook ingest adapters (`@brokeros/int-ads-google`, `@brokeros/int-ads-meta`).

**CRITICAL RULES FOR AGENTS:**

- Never call external APIs directly from `apps/api/`. Route all external calls through the corresponding `integrations/` adapter.
- Never inline provider credentials or API keys inside integration code. Use the root `.env` exclusively.
- When adding a new provider, create a new sub-directory inside the appropriate `integrations/` channel folder.

---

## Auth Law

- **Better Auth is the only auth system.** Do not implement custom JWT minting, custom session management, or custom password hashing.
- Backend: `@thallesp/nestjs-better-auth`. Sessions validated via the `better-auth` server instance in `apps/api/src/auth/`.
- Frontend: `better-auth` client in `apps/web/lib/auth-client.ts`. Route protection via `apps/web/proxy.ts` (Next.js 16 convention).
- Mobile: `@better-auth/expo` with `expo-secure-store` for token persistence.
- Role is read from `session.user.role`. Never accept role from request body or query string.
- Do not add any new passport strategy. Existing `passport-jwt` is legacy-only.

---

## Database Law

- **Prisma only.** No raw SQL strings in application code. Use the Prisma query API.
- Prisma client generated to `packages/prisma/generated/client`. Import from there via `@brokeros/prisma`.
- After any `schema.prisma` change: `pnpm --filter @brokeros/prisma db:generate` → `pnpm --filter @brokeros/prisma db:migrate`.
- Schema file: `packages/prisma/schema.prisma` — single source of truth. Seed: `packages/prisma/seed.ts`.
- Multi-model writes must use Prisma transactions (`prisma.$transaction`).
- For syntax and query patterns, read the root skill: `.agents/skills/prisma-client-api/SKILL.md`.
- Never delete or edit applied migration files.
- Soft-delete pattern: `deletedAt DateTime?`. Filter `deletedAt: null` in all list queries.

---

## Domain Glossary

| Term                      | Definition                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Brokerage**             | Internal sales operation. All projects: `isCpProject = false`                                                                 |
| **CP / Channel Partner**  | External broker network operation. All projects: `isCpProject = true`                                                         |
| **Broker**                | External real-estate agent. NOT a system user. Managed as `Broker` DB record by a Sourcing Manager                            |
| **Lead**                  | A potential buyer. Fields: `status`, `temperature` (HOT/WARM/COLD), `score` (AI int), `brokerId` (CP world), `assignedUserId` |
| **Site Visit**            | Physical visit to a project. GPS-verified via `SiteVisitVerification` (selfie + coordinates)                                  |
| **Negotiation**           | Discount discussion record. Required before creating a discounted booking                                                     |
| **Booking**               | Confirmed sale. Linked to a `Unit` (now SOLD), `Customer`, optionally a `Broker`                                              |
| **Customer**              | Created from Lead when booking is created. Holds post-sales identity                                                          |
| **BrokerageRecord**       | Commission record per CP booking. Leads to `BrokerageSettlement` for actual payment                                           |
| **InboundCommission**     | Commission FROM the builder TO the brokerage firm for selling their unit. Tracked by Post-Sales                               |
| **ProjectAssignment**     | Scoping table. Links a SM or CM to a specific CP project                                                                      |
| **ManagerTask**           | Daily cold call target set by PRE_SALES_MANAGER or SALES_MANAGER per exec                                                     |
| **DailyPerformanceLog**   | Daily snapshot per exec: calls done, target, follow-ups done, missed follow-up IDs                                            |
| **isCpProject**           | The single boolean that separates the two entire business worlds                                                              |
| **MarketingCampaign**     | A broadcast campaign — Email, SMS, or AI Voice — targeting a set of leads from a project                                      |
| **VoiceAgentIntegration** | A connected AI voice platform (Vapi, Retell, Sarvam, Bolna, etc.) configured by admin                                         |
| **CsvLeadRow**            | A single row from an uploaded CSV file used as audience for a campaign                                                        |
| **CarrierBridge**         | The PSTN telephony layer that physically dials numbers (Vobiz, Exotel, Twilio, Telnyx)                                        |

---

## Workers Law

- **BullMQ only.** All async jobs are enqueued via BullMQ and processed by `apps/workers/`.
- Workers: `marketing-email.processor.ts`, `marketing-sms.processor.ts`, `marketing-voice.processor.ts`, `marketing-whatsapp.processor.ts`.
- Marketing voice processor: integrates `normalizeVoiceLeadVariables` from `@brokeros/constants` and `tryCarrierBridgeDispatch` from `@brokeros/int-voice`.
- Never do heavy I/O (external API calls, file processing, CSV parsing) inside the NestJS request cycle. Enqueue a BullMQ job instead.

---

## Scripts Policy

As BrokerOS grows to include background workers, 3rd-party integrations, and new documentation generators, all general utility, deployment, database migration, and syncing scripts must live at the root.

- **Location:** `scripts/` (Repo root)
- **Execution:** We use `tsx` mapped in the root `package.json`. To run a script, use: `pnpm run script scripts/your-script.ts`
- **Rule:** Never create scripts locked inside `apps/api/scripts/` unless they are strictly bound to API-only internals that will never be used by other parts of the monorepo. When in doubt, put them in root `scripts/`.

---

## Testing Law

- **Vitest for headless suites:**
  - `pnpm test:api:e2e` runs API E2E tests (`apps/api/test/e2e/`).
  - `pnpm test:workers:e2e` runs background worker E2E tests (`apps/workers/test/e2e/`).
  - `pnpm test:packages` runs tests across packages and integrations.
  - `pnpm test:all:e2e` runs all headless test suites in a single pass.
- **Playwright for web E2E:** `pnpm test:web:e2e` runs browser specs (`apps/web/e2e/specs/`). Playwright automatically boots the Next.js dev server on port 3000 via `webServer`. Headless browser binaries are installed via `pnpm --filter @brokeros/web exec playwright install chromium`.
- **Maestro for mobile E2E:** `pnpm test:mobile:e2e` executes `scripts/test-mobile-e2e.ts`, which tests Maestro availability and runs native Android flows in `apps/mobile/e2e/`.

---

## Map

- API modules (`apps/api/src/`): `auth`, `leads`, `inventory`, `brokers`, `approvals`, `chat`, `notifications`, `dashboard`, `marketing` (whatsapp, voice, email, sms, ads sub-modules).
- Marketing API sub-modules (`apps/api/src/marketing/`):
  - `whatsapp/` — inbox conversations, messages, contacts, flows, automations, pipelines, templates, AI assistant, broadcasts, webhooks, realtime gateway.
  - `voice/` — campaigns, integrations, prompt editor, audio service, test calling, webhooks, carrier bridge dispatcher, WebSocket media stream gateway.
  - `email/` — campaigns, integrations, audience, analytics, tracking, webhooks, facade.
  - `sms/` — campaigns, integrations, audience, analytics, tracking, webhooks, facade.
  - `ads/` — Meta, Instagram, Google, and YouTube lead webhook ingestion and campaign sync services.
- Web routes (`apps/web/app/`): `login` (public), `dashboard` (role-protected shell + role-specific workspaces), `dashboard/marketing/` (whatsapp/voice/email/sms/ads).
- Web marketing features (`apps/web/features/marketing/`):
  - `whatsapp/` — team inbox, chatbot flows, automations, broadcasts, contacts, pipelines, templates, settings.
  - `voice/` — campaign creator, agent composer studio, prompt editor, voice picker modal, analytics.
  - `email/` — campaign creator, HTML template editor, audience selector, analytics.
  - `sms/` — campaign creator, phone mockup preview, short-link generator, analytics.
  - `ads/` — Meta & Google ad account connector, campaign sync, KPI overview.
- Mobile route groups (`apps/mobile/app/`): `(auth)` (login/signup), `(dashboard)` (role-specific screen views + native auto-dialer module).
- Workers (`apps/workers/src/`): BullMQ processors for async jobs — `marketing-email.processor.ts`, `marketing-sms.processor.ts`, `marketing-voice.processor.ts`, `marketing-whatsapp.processor.ts`.
- Shared packages: `packages/prisma/` (Schema & DB Client), `packages/storage/` (Blob wrappers), `packages/types/` (TS interfaces with domain sub-modules), `packages/validators/` (Zod schemas), `packages/constants/` (Pure constants with domain sub-modules).
- Integrations: `integrations/voice/` (AI agents + PSTN carriers), `integrations/mail/` (email providers), `integrations/sms/` (SMS gateways), `integrations/whatsapp/` (WhatsApp Cloud API), `integrations/ads/` (Google & Meta Ads lead webhooks).
- Skills: `.agents/skills/` (root), `apps/api/.agents/skills/`, `apps/web/.agents/skills/`, `apps/mobile/.agents/skills/`.

---
