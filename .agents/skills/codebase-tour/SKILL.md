---
name: codebase-tour
description: Acts as a relentless deep-dive tour guide for the codebase. Creates an exhaustive, detailed markdown artifact mapping business logic, roles, departments, and codebase structure using aggressive code search.
---

This skill turns the agent into a relentless, code-first tour guide for the BrokerOS CRM. The goal is to produce an exhaustive, deep-dive `.md` Artifact that maps the codebase in extreme detail.

You must fight **premature completion**. Do not act lazy or stop after reading a high-level README. You must perform exhaustive **legwork** to explore the active codebase.

Follow these steps in strict sequence:

## 1. Map the Human Layer

First, understand exactly who uses the system.
Use `view_file` to read `docs/role-password.md`.
**Completion Criterion**: You have exhaustively mapped every single department, every single role, and which people/passwords belong to them. Do not proceed until you understand the complete human hierarchy.

## 2. Gather Ground Truth Context

Read the foundational rules across the entire monorepo:
- Read `AGENTS.md` and `README.md` at the project root.
- Read the subtree rules:
  - `apps/api/AGENTS.md` (Backend REST API & Socket.IO)
  - `apps/web/AGENTS.md` (Next.js 16 Web Dashboard & Feature Architecture)
  - `apps/mobile/AGENTS.md` (Expo 54 Android App & Auto-Dialer)
  - `apps/workers/AGENTS.md` (BullMQ Background Workers & Redis 7)
  - `integrations/AGENTS.md` (Third-party adapters & Integration Laws)
**Completion Criterion**: You understand the core business logic (e.g., the strict separation of Brokerage vs Channel Partner via the `Project.isCpProject` flag, the 12 system roles, and the 5 omnichannel marketing pillars: WhatsApp, AI Voice, Email, SMS, and Ads).

## 3. Examine the Data Layer

- Open `packages/prisma/schema.prisma`. Locate every model related to the feature, department, or flow requested by the user.
- Open `packages/prisma/seed.ts`. Trace exactly how those models are populated with initial data (Brokerage `Luxury Villas` vs CP `Grand Horizon CP`, 20 Pre-Sales leads, 20 Sales Exec leads, bookings, units, external brokers).
**Completion Criterion**: You have traced relational links, enums, soft-delete patterns (`deletedAt`), and boolean flags for the requested domain.

## 4. Explore the Shared Packages

Explore the centralized packages under `packages/`:
- `packages/prisma/` — Central Prisma ORM schema, migrations, seed, and generated client (`@brokeros/prisma`).
- `packages/storage/` — Centralized Vercel Blob cloud storage wrappers (`@brokeros/storage`).
- `packages/types/src/` — Shared TypeScript domain interfaces and DTOs (`@brokeros/types`). Sub-modules: `common.ts`, `email.ts`, `sms.ts`, `voice/` (telephony, agent, options, webhook, analytics, streaming).
- `packages/constants/src/` — Pure constants, enums, UI palettes, and utility functions (`@brokeros/constants`). Sub-modules: `campaign.ts`, `email.ts`, `sms.ts`, `voice/` (telephony, agents, voices, scripts, pricing, normalizer).
- `packages/validators/src/` — Shared Zod validation schemas (`@brokeros/validators`).
**Completion Criterion**: You understand what lives in each shared package and can trace how types and constants flow into apps without circular dependencies.

## 5. Explore the Integrations Layer

Explore `integrations/` packages (`@brokeros/int-*`):
- Read `integrations/README.md` and `integrations/AGENTS.md`.
- `integrations/voice/` (`@brokeros/int-voice`) — 8 AI voice agent adapters (`vapi`, `retell`, `sarvam`, `bolna`, `elevenlabs`, `livekit`, `openai-realtime`, `pipecat`) + 4 PSTN carrier bridges (`exotel`, `telnyx`, `twilio`, `vobiz`) routed via `carrier-bridge-dispatcher.ts`.
- `integrations/mail/` — 8 email provider adapters (`@brokeros/int-mail-*`): SendGrid, AWS SES, Brevo, Mailgun, Mailchimp, Gmail, Outlook, and Constant Contact.
- `integrations/sms/` — 9 SMS gateway adapters (`@brokeros/int-sms-*`): Twilio, Infobip, Sinch, Plivo, Telnyx, Vonage, Gupshup, Bird, and AWS SNS.
- `integrations/whatsapp/` (`@brokeros/int-whatsapp`) — Meta WhatsApp Cloud API client, interactive message builders (buttons, lists), and HMAC signature verification.
- `integrations/ads/` — Ad webhook & sync adapters: Meta Lead Ads (`@brokeros/int-ads-meta`) and Google Ads / YouTube (`@brokeros/int-ads-google`).
**Completion Criterion**: You can explain how external API calls are strictly routed through integration adapters and never called directly or inlined inside NestJS controllers or services.

## 6. Relentless Code Search

Perform the heavy **legwork**. Do not guess folder names. Aggressively search and verify the active codebase:
- Use `list_dir` and `grep_search` to explore:
  - `apps/api/src/` (auth, leads, inventory, brokers, approvals, chat, notifications, dashboard, marketing)
  - `apps/web/app/` (login, 12 role dashboards, marketing hubs)
  - `apps/web/features/marketing/` (email, sms, voice, whatsapp, ads, shared components)
  - `apps/mobile/app/` & `apps/mobile/modules/auto-dialer/` (role screens, native Android auto-dialer module, GPS tracking)
  - `apps/workers/src/` (main bootstrap, BullMQ processors for email, sms, voice, whatsapp)
- For the marketing modules specifically, trace the complete execution pipeline: UI wizard / studio → NestJS API controller & service → BullMQ job queue → worker processor → integration adapter → external API.
**Completion Criterion**: You have identified the exact, verified file paths for backend controllers/services, frontend UI pages, worker processors, and mobile modules.

## 7. Explore Tooling & Commands

Read `package.json` at root and within each sub-app to understand how the system is operated:
- **Docker Compose**: `docker compose up --build`, clean resets (`docker compose down -v --remove-orphans`), and manual seeding (`docker exec -it crm-backend pnpm db:seed`).
- **Turborepo Root Commands**: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:workers`, `pnpm dev:mobile`.
- **Database Scripts**: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`.
- **Build & Verification**: `pnpm build`, `pnpm build:packages`, `pnpm lint`, `pnpm test`.
**Completion Criterion**: You have mapped out the operational toolchain and commands.

## 8. Produce the Tour Artifact

Do not output the entire tour in standard chat text. You MUST use the `write_to_file` tool to create a new markdown artifact named `<topic_name>_tour.md` in the artifact directory with `ArtifactMetadata` (`UserFacing: true`).

The tour artifact must be exhaustive and structured as follows:

### Required Sections

1. **Executive Summary & Monorepo Map**: High-level overview of the monorepo architecture, Turborepo setup, and the core business separation (`isCpProject`).
2. **Departments & Human Hierarchy**: Exhaustively list all 12 roles across Brokerage, Channel Partner, and Cross-business operations with credentials from `docs/role-password.md`.
3. **Database Architecture & Seed**: Deep dive into `schema.prisma` models, enums, soft-delete patterns, and seed data from `packages/prisma/seed.ts`.
4. **Shared Packages Architecture**: Detailed explanation of `@brokeros/types`, `@brokeros/constants`, `@brokeros/validators`, `@brokeros/storage`, and `@brokeros/prisma`.
5. **Integrations Layer Architecture**: Complete inventory of all external adapters (Voice, Email, SMS, WhatsApp, Ads) and the Integration Laws (zero credential hardcoding, adapter purity).
6. **Core Operational Commands**: Full guide for Docker Compose and manual monorepo workflows (database migrations, development servers, worker processors, mobile builds).
7. **End-to-End Architectural Flows**: Step-by-step breakdown of how data flows across the system with **at least 15 clickable `file:///` links** to actual implementation files:
   - Lead lifecycle flow (ingestion → AI transcription via Groq → scoring → follow-up)
   - Booking & negotiation flow (lead → negotiation approval → booking → unit marked SOLD → brokerage settlement)
   - Mobile Auto-Dialer flow (native Java/Kotlin module → call status sync hook → CRM call record)
   - Authentication & RBAC flow (Better Auth session → `roles.guard.ts` → `@Roles()` decorator)
8. **Omnichannel Marketing Suite Deep Dive**:
   - **WhatsApp**: Meta Cloud API, shared team inbox, visual flow builder, keyword automations, template sync.
   - **AI Voice**: 8 agent platforms, 4 PSTN carrier bridges, assistant studios (`Retell`, `Vapi`, `ElevenLabs`), dual-mode test calls, WebSocket media stream gateway, call logs studio with audio player.
   - **Email**: 8 email providers, 4-step campaign wizard, HTML template editor, pre-flight safety modal, 2-way team inbox.
   - **SMS**: 9 SMS gateways, live smartphone mockup preview, GSM segment counter, URL shortener with click tracking, 2-way chat inbox.
   - **Ads**: Meta and Google Lead Ads webhooks (HMAC SHA-256 verification), GAQL/Graph API sync, cross-channel Comparison Studio, ad creative galleries, search keyword quality scores, YouTube retention curves, and bulk lead assignment.

**Completion Criterion**: The artifact is written to disk, is exhaustively detailed, contains at least 15 clickable file links to verified code files, covers all major business flows and the full marketing suite, and you respond to the user pointing them to the new artifact.
