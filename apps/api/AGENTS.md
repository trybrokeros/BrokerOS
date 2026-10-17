# AGENTS.md - apps/api/

---

## Tech

NestJS 11 · TypeScript ESM (`"type": "module"` in package.json) · Prisma 7 (`@brokeros/prisma`) · PostgreSQL · Better Auth 1.x (with twoFactor TOTP plugin) · Socket.IO 4 · BullMQ (job enqueuing) · `@nestjs/schedule` for cron jobs · Helmet & NestJS Throttler for security.

---

## Prisma Rules

- Import client via `@brokeros/prisma` (from `packages/prisma/generated/client`) or inject `PrismaService` from `PrismaModule`. Never import from `@prisma/client` directly.
- Prisma client schema and migrations live in `packages/prisma/`. Do not edit generated files.
- After any schema change: `pnpm --filter @brokeros/prisma db:generate` then `pnpm --filter @brokeros/prisma db:migrate`.
- `DashboardCache` model exists for caching heavy dashboard queries. Check it before hitting raw Prisma in high-traffic dashboard endpoints.
- Multi-model writes must always use `prisma.$transaction`.
- Soft-delete rule: All sensitive models implement `deletedAt DateTime?`. Filter `deletedAt: null` in all list queries.

---

## Security & RBAC Architecture

1. **Global AuthGuard**:
   - Registered as `APP_GUARD` in `app.module.ts` via `@thallesp/nestjs-better-auth`.
   - All controller routes require an active session by default.
   - Public routes (e.g. webhook receivers) must be explicitly decorated with `@Public()`.
2. **Global RolesGuard & Least Privilege**:
   - Registered as `APP_GUARD` in `app.module.ts` (`apps/api/src/auth/roles.guard.ts`).
   - Controllers and routes declare required roles via `@Roles(...)`.
   - User role is read server-side from `session.user.role`. Request body or query roles are ignored.
3. **Supervisory Bypass Policy**:
   - Implemented in `roles.guard.ts`: Users with role `ADMIN` or `DIRECTOR` hold universal administrative oversight and automatically pass all role checks across every module.
4. **Multi-Factor Authentication (MFA / 2FA)**:
   - Better Auth `twoFactor({ issuer: 'BrokerOS' })` configured in `src/lib/auth.ts`.
   - Intercepts credential logins when enabled on the user account.
5. **Rate Limiting & Headers**:
   - `ThrottlerModule` configured in `app.module.ts` (60 req/min per IP default).
   - Auth endpoints in `auth.controller.ts` throttled to 5 req/min.
   - `helmet()` middleware in `main.ts` sets secure HTTP headers.
   - CORS origin whitelist in `main.ts` prevents unauthorized cross-origin requests.
6. **Webhook Signature Verification**:
   - Meta Ads & WhatsApp: Enforce HMAC-SHA256 signature checks.
   - Google Ads: Enforce developer verification key check.
   - Voice webhooks: Enforce verification token check.

---

## Module Architecture

```
apps/api/src/
├── auth/              Better Auth + RBAC guards (roles.guard.ts, roles.decorator.ts)
├── leads/             Lead lifecycle
│   ├── core/          Lead CRUD, assignment, scoring, media
│   ├── call-records/  Call logging + Groq AI transcription
│   ├── follow-ups/    Scheduled follow-up management
│   ├── notes/         Lead notes
│   └── site-visits/   GPS-verified site visits + selfie upload
│
├── bookings/          Top-level booking lifecycle, queries, status, customer conversion, agreements, handovers
├── payments/          Top-level installment payment schedules, receipts, closing manager cron checks
│
├── inventory/         Property inventory
│   ├── projects/      Builder → Project management
│   ├── towers/        Tower config + AI generation (Groq)
│   ├── units/         Unit status (Available → Blocked → Sold)
│   └── documents/     Price sheets, floor plans, offers, construction updates
│
├── brokers/           CP broker management (CRUD, meetings, referrals, settlements, KYC)
├── approvals/         Multi-step approval workflows (ApprovalRequest + FinancialApproval)
├── crm-telephony/     CRM PSTN direct calling (Twilio/Exotel/Vobiz tokens, carrier bridge, call webhooks)
├── chat/              Socket.IO gateway - chat rooms + messages
├── notifications/     Socket.IO gateway + Expo Push SDK
│
├── dashboard/         12 role-specific analytics modules
│   ├── pre-sales/     Pre-sales exec daily performance (analytics, daily-tasks, leaderboard, pipeline, widgets)
│   ├── sales-exec/    Sales pipeline & conversion (analytics, daily-tasks, leaderboard, widgets)
│   ├── sales-manager/ Team oversight & approvals
│   ├── post-sales/    Loan, agreement, possession tracking
│   ├── sourcing-manager/ Broker recruitment metrics
│   ├── closing-manager/  On-site booking analytics
│   ├── channel-partner/  CP-wide performance
│   ├── business-manager/ Cross-business overview
│   ├── manager/       Shared manager utilities
│   └── employees/     Employee performance tracking
│
├── marketing/         Omnichannel marketing campaigns (Email · SMS · AI Voice · WhatsApp · Ads)
│   ├── marketing.module.ts   Root module, registers all sub-modules + services
│   ├── shared/        shared/sample-csv.controller.ts - CSV template downloads
│   │
│   ├── email/         Email Campaign Module (campaigns, templates, EmailInboxController, facade)
│   ├── sms/           SMS Campaign Module (campaigns, SmsInboxController, keyword flows, facade)
│   ├── voice/         AI Voice Campaign Module (campaigns, WebSocket media stream gateway, carrier bridge dispatcher, facade)
│   ├── whatsapp/      WhatsApp Cloud API Module (broadcasts, automations, templates, conversations controller, webhooks)
│   └── ads/           Ad platform lead ingestion (google, meta, instagram, youtube webhooks)
│
└── lib/               Shared infrastructure
    ├── database/      PrismaModule wrapper around @brokeros/prisma
    ├── storage/       Vercel Blob upload/download helpers
    ├── filters/       HttpExceptionFilter and error normalizers
    └── auth.ts        Better Auth server configuration with twoFactor plugin
```

---

## Skills

You **MUST** consult the appropriate skill before making changes, based on the task you are doing:

- **Building/Modifying Features**: If you are asked to build a new feature, endpoint, or modify a module, services, specs, e2e read:
  `.agents/skills/build-backend-feature/SKILL.md`
- **NestJS Architecture & Patterns**: For specific instructions on routing, dependency injection, DTOs, and controllers, read:
  `.agents/skills/nestjs-expert/SKILL.md`
- **Auth & Sessions**: If the task involves Better Auth, user sessions, or plugins, read:
  `.agents/skills/better-auth-best-practices/SKILL.md`
- **Database & Prisma**: If the task involves complex queries, relations, or transactions, read:
  `../../.agents/skills/prisma-client-api/SKILL.md` (Monorepo root)

---

## Marketing Module Conventions

- Channels (email, sms, voice, whatsapp, ads) follow the established pattern: controllers → services → dto.
- Facades (`email.service.ts`, `sms.service.ts`, `voice.service.ts`, `whatsapp.service.ts`) are coordinator-only - they delegate to sub-services and must stay < 200 lines.
- All sub-services are single-responsibility:
  - Voice: `voice-campaign.service.ts` (lifecycle), `voice-dispatcher.service.ts` (dispatch via carrier bridge), `voice-analytics.service.ts`, `voice-audience.service.ts`.
  - WhatsApp: `broadcasts/`, `automations/`, `templates/`, `messages/`, `webhooks/`, `conversations/`.
  - Ads: Ingestion webhooks for Google, Meta, Instagram, and YouTube.
- All external provider calls go through `integrations/` adapters. Never call external SDKs (Vapi/Retell/SendGrid/WhatsApp Cloud API) directly from a NestJS service.
- Heavy broadcast dispatch jobs MUST be enqueued to BullMQ (`apps/workers`) rather than run inside the request thread.
- DTO decomposition: split into focused DTOs and re-export cleanly.

---

## Scripts & Testing

> **CRITICAL SCRIPTING RULE:** If you are creating a new utility, database migration, or maintenance script, DO NOT put it inside `apps/api/scripts/`. Create it in the monorepo root at `scripts/` and execute it from the root using `pnpm run script scripts/your-script.ts`.

Run from repository root:

```bash
pnpm dev:api                     # dev server (watch mode) (or pnpm --filter @brokeros/api start:dev)
pnpm --filter @brokeros/api build # compile to dist/
pnpm --filter @brokeros/api test  # Jest unit tests

# Headless E2E Tests (Vitest):
pnpm test:api:e2e                 # Runs all Vitest E2E suites (rbac-partitioning, two-factor-auth, lead-lifecycle, etc.)

# Database commands belong to the @brokeros/prisma package. Run from root:
pnpm db:generate                 # or pnpm --filter @brokeros/prisma db:generate
pnpm db:migrate                  # or pnpm --filter @brokeros/prisma db:migrate
pnpm db:seed                     # or pnpm --filter @brokeros/prisma db:seed
pnpm --filter @brokeros/prisma db:studio
pnpm --filter @brokeros/prisma db:format
```
