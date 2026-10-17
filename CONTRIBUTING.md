# Contributing to BrokerOS

Thank you for your interest in contributing! This guide will help you get started with our enterprise architecture and development standards.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Security Vulnerabilities](#security-vulnerabilities)

---

## Code of Conduct

This project follows standard open source conduct expectations. By participating, you are expected to uphold a professional, respectful, and inclusive environment.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/BrokerOS.git
   cd BrokerOS
   ```
3. **Create a branch** for your work:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Development Setup

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- PostgreSQL 16+ & Redis 7+ (or Docker)
- Android Studio (for native mobile work only)

### AI Agent Setup

If you are using an **AI IDE (like Antigravity / Cursor)** or CLI, you can skip running commands manually. Use the built-in agent skills:

- Type **`/setup-codebase`** in the chat to have the AI automatically install dependencies, copy `.env` files, run migrations, and start all services.
- Type **`/codebase-tour`** to have the AI generate a deep-dive, customized architectural map of the system to help you understand where to make your changes.

### Quick Start with Docker

```bash
# Copy all environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/workers/.env.example apps/workers/.env

# Note: The root /.env file is the most important one!
# Edit it with your Database URL, Better Auth secret, etc.
# Sub-app .env files are pre-filled with local development routing.

# If you have previous containers or volumes running, perform a clean reset:
docker compose down -v --remove-orphans

# Build and start all 5 services (PostgreSQL, Redis, Backend, Workers, Frontend)
docker compose up --build

# Note: The backend container automatically deploys migrations and seeds
# demo accounts on initial boot if the database is empty (--if-empty flag).
# To manually re-seed at any time:
docker exec -it crm-backend pnpm db:seed
# View demo credentials in docs/role-password.md

# Endpoints:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:3333
# Workers:   http://localhost:3334/health
# DBs:       PostgreSQL (5432) · Redis (6379)
```

### Manual Setup

If you're working locally without Docker, follow these steps. With Turborepo and pnpm workspaces, you can install everything from the root:

**1. Install all dependencies & set up environment variables (Run at root):**

```bash
pnpm install

# Copy all required environment templates
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/workers/.env.example apps/workers/.env
cp apps/mobile/.env.example apps/mobile/.env

# IMPORTANT:
# 1. Edit the root /.env file with your Database URL, Auth secret, Groq API key, etc.
# 2. Edit apps/mobile/.env and set EXPO_PUBLIC_API_URL to your machine's LAN IP address.
# 3. For apps/web, apps/api, and apps/workers, the defaults are usually fine for local development.
```

**2. Backend (API) & Database Setup:**

```bash
# Generate and seed the database using Prisma (run from root)
pnpm db:generate
pnpm db:migrate
pnpm db:seed                 # Populate database with sample data
pnpm dev:api                 # Start API server → http://localhost:3333
```

**3. Frontend (Web):**

```bash
# Start the Next.js web dashboard (run from root)
pnpm dev:web                 # Start Web dashboard → http://localhost:3000
```

**4. Background Workers:**

```bash
# Start BullMQ asynchronous queue processors (run from root)
pnpm dev:workers             # Start Workers → http://localhost:3334/health
```

**5. Mobile (Android Only):**

```bash
# Start Metro bundler (run from root)
pnpm dev:mobile
# Or compile and run custom native client:
cd apps/mobile && npx expo run:android
```

---

## Project Structure

```
BrokerOS/
├── apps/
│   ├── api/       NestJS 11 REST API + Socket.IO server (TypeScript ESM)
│   │              Modules: auth, leads, bookings, payments, inventory, brokers,
│   │              approvals, crm-telephony, chat, notifications, dashboard,
│   │              marketing (email, sms, voice, whatsapp, ads)
│   ├── web/       Next.js 16 App Router web dashboard (React 19 + Tailwind CSS v4)
│   │              Features: leads, inventory, brokers, approvals, security (MFA 2FA),
│   │              unified inbox (/dashboard/inbox for email, sms, whatsapp),
│   │              marketing (email, sms, voice, whatsapp, ads)
│   ├── mobile/    Expo 54 React Native Android app for field teams (native auto-dialer)
│   │              Workspaces: 14 role workspaces with flattened screen routes
│   └── workers/   BullMQ async background processors (powered by Redis 7)
│                  (marketing-email, marketing-sms, marketing-voice, marketing-whatsapp,
│                   scheduled-messages)
├── packages/
│   ├── prisma/      Prisma ORM schema, migrations, and client (@brokeros/prisma)
│   ├── storage/     Centralized Vercel Blob cloud storage wrappers (@brokeros/storage)
│   ├── messaging/   Cross-channel message dispatch engine with atomic lock (@brokeros/messaging)
│   ├── types/       Shared TS interfaces with domain sub-modules (@brokeros/types)
│   ├── validators/  Shared Zod validation schemas (@brokeros/validators)
│   └── constants/   Shared constants, enums, UI palettes, and voice normalizers (@brokeros/constants)
├── integrations/
│   ├── voice/       @brokeros/int-voice - 8 AI voice agents + 4 PSTN telephony carriers
│   ├── mail/        Email provider adapters (SES, SendGrid, Brevo, Mailchimp, Mailgun, Gmail, Outlook, Constant Contact)
│   ├── sms/         SMS gateway adapters (Twilio, Gupshup, Sinch, AWS SNS, Bird, Infobip, Plivo, Telnyx, Vonage)
│   ├── whatsapp/    @brokeros/int-whatsapp - Meta WhatsApp Cloud API client & interactive builders
│   └── ads/         Lead ingestion adapters (@brokeros/int-ads-google, @brokeros/int-ads-meta)
└── scripts/         Root deployment, database seeding, and synchronization utility scripts
```

This is a **pnpm monorepo** managed by Turborepo. You can run commands globally via `pnpm --filter <package_name> <command>`, or work within specific subtrees.

---

## Making Changes

### Key Conventions

1. **Always read the scoped `AGENTS.md`** before touching a subtree:
   - `apps/api/AGENTS.md` - for backend changes
   - `apps/web/AGENTS.md` - for frontend changes
   - `apps/mobile/AGENTS.md` - for mobile changes
   - `apps/workers/AGENTS.md` - for background job processors
   - `integrations/AGENTS.md` - for third-party service adapters

2. **Shared constants/types** go in `packages/constants/` or `packages/types/`, not in app-level files.

3. **External API calls** must go through `integrations/` adapters, not directly in NestJS services.

4. **Database** - use Prisma only. No raw SQL. Multi-model writes use `$transaction`. Soft deletes require `deletedAt: null`.

5. **Auth & Security** - use Better Auth only. Sessions are validated on the server. Global `AuthGuard` and `RolesGuard` enforce access control. Supervisory bypass applies to `ADMIN` and `DIRECTOR` roles.

6. **Workers** - any heavy I/O (CSV parsing, external batch dispatch) must be enqueued to BullMQ, not executed inline in the request cycle.

---

## Pull Request Process

1. **Ensure your code passes tests and linting:**
   - Type checks and linters from root: `pnpm lint` and `pnpm build`
   - Headless API E2E tests: `pnpm test:api:e2e`
   - Background worker E2E tests: `pnpm test:workers:e2e`
   - Shared packages & integrations tests: `pnpm test:packages`
   - Run all headless suites: `pnpm test:all:e2e`
   - Browser Web E2E tests (Playwright): `pnpm test:web:e2e`
   - Mobile E2E tests (Maestro): `pnpm test:mobile:e2e`

2. **Write a clear PR description:**
   - What does this PR do?
   - Why is this change needed?
   - How was it tested?
   - Screenshots for UI changes

3. **Keep PRs focused** - One logical feature, bug fix, or refactor per PR.

---

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Description |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons (no code change) |
| `refactor` | Code restructuring (no feature or fix) |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependency updates |

### Scopes

Use the app, package, or domain module name: `api`, `web`, `mobile`, `workers`, `types`, `validators`, `constants`, `messaging`, `storage`, `prisma`, `integrations`, `leads`, `bookings`, `payments`, `inventory`, `brokers`, `auth`, `dashboard`, `marketing`, `email`, `sms`, `voice`, `whatsapp`, `ads`, `security`, `docs`.

---

## Reporting Bugs

Open an issue with:

1. **Title**: Clear, concise description
2. **Environment**: OS, Node.js version, browser / device
3. **Steps to reproduce**: Numbered steps to trigger the bug
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Screenshots / logs**: If applicable

---

## Suggesting Features

Open an issue with:

1. **Problem**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Target role(s)**: Which of the system roles would use this?
4. **Business line**: Brokerage (`isCpProject = false`), Channel Partner (`isCpProject = true`), or both?
5. **Channel (if marketing)**: Email, SMS, AI Voice, WhatsApp, or Ads?

---

## Security Vulnerabilities

**Do not open public issues for security vulnerabilities.** Please follow our [Security Policy](SECURITY.md) for responsible disclosure.

---

## Questions?

If you have questions about contributing, open a [Discussion](https://github.com/sumamakhan761/BrokerOS/discussions) on GitHub.
