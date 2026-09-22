# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Ads Management & Attribution (`apps/api/src/marketing/ads/`, `apps/web/features/marketing/ads/`)**:
  - Meta Lead Ads integration with real-time HMAC SHA-256 webhook verification (`x-hub-signature-256`) and automated prospect form data retrieval via `@brokeros/int-ads-meta`.
  - Google Ads Lead Form Asset webhooks and GAQL (Google Ads Query Language) on-demand/scheduled sync for Search and Performance Max campaigns via `@brokeros/int-ads-google`.
  - Master Ads Overview Dashboard in Next.js web frontend featuring channel status cards, cross-channel Comparison Studio, ad creative galleries, search keyword quality scores, YouTube audience retention curves, and direct bulk lead assignment to pre-sales reps.
- **Omnichannel Marketing Suite Enhancements (`apps/web/features/marketing/`, `apps/api/src/marketing/`)**:
  - Multi-provider email management across 8 providers (AWS SES, SendGrid, Brevo, Mailgun, Mailchimp, Constant Contact, Gmail, Outlook) with 2-way shared team inboxes, pre-flight verification modals, and automated drip flows.
  - Multi-gateway SMS management across 9 gateways (Twilio, Infobip, Sinch, Plivo, Telnyx, Vonage, Bird, Gupshup, AWS SNS) with live smartphone mockups, GSM counters, short-link click tracking, and 2-way chat inboxes.
  - AI Voice Assistant Composer Studio supporting 8 AI voice platforms, 4 PSTN carrier bridges, dual-mode test calling (in-browser WebRTC and live phone), WebSocket bidirectional media stream gateway, and in-browser audio recording playback with AI transcripts.
  
## [1.1.0] - 2026-09-09

### Added

- **Background Workers (`apps/workers`)**:
  - BullMQ processor suite for asynchronous campaign dispatch: `marketing-email`, `marketing-sms`, `marketing-voice`, and `marketing-whatsapp`.
  - WhatsApp worker subcomponents: `whatsapp-automation.runner`, `whatsapp-broadcast.runner`, and `whatsapp-template.syncer`.
- **Integrations Expansion (`integrations/`)**:
  - Meta WhatsApp Cloud API integration (`@brokeros/int-whatsapp`) for template syncing and broadcast messaging.
  - Lead webhook ingestion adapters for Google Ads (`@brokeros/int-ads-google`) and Meta Ads (`@brokeros/int-ads-meta`).
  - Telephony and AI Voice Bridge dispatcher supporting 8 voice AI engines and 4 PSTN carriers.

### Changed

- **Seed Architecture Overhaul (`packages/prisma/seed.ts`)**:
  - Restructured demo data around two distinct projects: Brokerage (`Luxury Villas`) and CP (`Grand Horizon CP`).
  - Created exactly 20 Pre-Sales leads (early-funnel: `NEW`, `CONTACTED`, `INTERESTED` with rich notes and timelines) distributed among `presales1-3`.
  - Created exactly 20 Sales Executive leads (mid/late-funnel: site visits, negotiations, bookings) distributed 10/6/4 across `salesexec1-3`.
  - Added 5 direct bookings with reserved units (101, 102, 201, 202 `RESERVED`; 301 `SOLD`), managed by `postsales1`.
  - Added 3 external brokers with 2 Channel Partner bookings and 2% commission brokerage records.
  - Added `--if-empty` flag to seed script for non-destructive automatic initialization.
- **Docker & Deployment**:
  - Enhanced API container startup to auto-migrate (`prisma migrate deploy`) and auto-seed on clean volumes (`tsx seed.ts --if-empty`).
  - Optimized Docker build layer caching with `--ignore-scripts` during pnpm fetch.
  - Streamlined `apps/web/Dockerfile` by removing redundant Prisma build steps.

## [1.0.0] - Initial Open Source Release

### Architecture (Monorepo)

- Migrated the codebase to a strict `pnpm` monorepo using Turborepo.
- Separated applications into `apps/api`, `apps/web`, `apps/mobile`, and `apps/workers`.
- Created shared package structure under `packages/` for `@brokeros/types`, `@brokeros/validators`, and `@brokeros/constants` to facilitate future extraction of shared domain logic.

### Added

- **Core CRM**: Built specifically for real estate brokerages with two distinct business lines (Brokerage and Channel Partner) managed under one platform.
- **Backend (NestJS 11)**:
  - 8 domain modules (leads, inventory, brokers, approvals, chat, notifications, dashboard, auth).
  - Robust PostgreSQL database schema with 74 models and 43 enums (Prisma 7).
  - Role-based access control (RBAC) supporting 12 distinct roles.
  - Better Auth integration for secure, cookie-based session management.
  - Vercel Blob integration for secure document storage.
  - Socket.IO gateway for real-time chat and notifications.
- **Frontend (Next.js 16)**:
  - 12 role-specific dashboards with customized views and features.
  - Comprehensive lead management interface (scoring, temperature, call logs, follow-ups).
  - Inventory browser for projects, towers, floors, and units.
  - Channel Partner management tools (broker onboarding, project assignments).
  - Real-time chat widget and notification bell.
  - Tailwind CSS v4 styling with HeroUI and Framer Motion.
- **Mobile (Expo 54 / React Native)**:
  - Android application optimized for field teams.
  - 14 role-specific screen layouts.
  - **Auto-Dialer**: Custom native Android module for sequential cold calling.
  - GPS-verified site visits with selfie capture.
  - Push notifications via Expo Push SDK.
- **Infrastructure**:
  - Multi-stage Dockerfiles for backend and frontend.
  - Unified `docker-compose.yml` for simplified local development and deployment.
- **Documentation**:
  - Comprehensive READMEs for the root project and all subtrees.
  - `CONTRIBUTING.md` guide for open-source contributors.
  - `CODE_OF_CONDUCT.md` based on Contributor Covenant v2.1.
  - `SECURITY.md` policy for responsible vulnerability disclosure.
