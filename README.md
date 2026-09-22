<div align="center">

# 🏢 BrokerOS

**The Open-Source Operating System for Enterprise Real Estate Brokerages & Channel Partner Networks.**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?logo=nestjs)](apps/api/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=next.js)](apps/web/)
[![Expo](https://img.shields.io/badge/Mobile-Expo%2054-4630EB?logo=expo)](apps/mobile/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![Docker](https://img.shields.io/badge/Docker-5%20Containers-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## 💡 Why This Exists

Most real estate CRMs are built as generic sales databases or simple contact lists. BrokerOS is designed around the way real estate brokerages operate in practice, supporting two separate business models in a single platform:

- **Brokerage**: Your in-house sales team handles customer leads, schedules site visits, and closes property sales for developer projects.
- **Channel Partner (CP)**: Your team manages an external network of real estate brokers, handles on-site visits, and tracks multi-tier commission payouts.

## ✨ Features

### 📣 Marketing & Omnichannel Outreach

- **Email Campaigns**: Create, schedule, and send targeted campaigns to filtered lead segments or CSV audiences with a rich HTML template editor and dynamic merge tags. Features an interactive pre-flight validation modal, automated trigger-based drip flows, AI message drafting and a dedicated two-way Team Inbox with conversation assignment for managing inbound replies. Includes detailed deliverability analytics tracking opens, link clicks, bounces, and lead conversions.
- **SMS Campaigns**: Compose personalized SMS messages with live smartphone mockup previews, character and GSM segment counters, dynamic personalization tags, and an integrated URL shortener with click tracking. Includes automated keyword-triggered workflows, follow-up drip flows, AI message drafting, and a real-time two-way SMS Team Inbox for instant prospect conversations linked directly to CRM lead profiles.
- **WhatsApp Business & Team Inbox**: A full WhatsApp Business Cloud API workspace integrated with the CRM. It includes a shared multi-agent inbox for real-time customer conversations, conversation assignment (manual or round-robin), custom contact tags, quick replies, and deal pipelines. You can build interactive chatbot flows with buttons and lists, set up keyword and status-triggered automations, send template broadcasts, and enable AI-assisted draft replies or automated answers with human agent handoff.
- **AI Voice Calling & Carrier Bridge**: Run outbound voice outreach using AI voice agents connected to telephony carriers. Design conversational personas in dedicated assistant studios with dynamic lead variables (prospect name, project details, budget), conduct dual-mode test calls (in-browser WebRTC audio or live phone test calls), and stream bidirectional audio via WebSocket media gateways. Includes a comprehensive Call Logs Studio with in-browser recording playback, AI transcriptions, latency and sentiment analytics, and end-to-end conversion funnels.
- **Lead Ad Capture & Performance Tracking**: Ingest leads in real time through verified webhooks from Meta, Instagram ads, Google Ads (Search and Performance Max), and YouTube ads. Incoming leads are automatically matched to existing records or created as new CRM prospects with full campaign, ad creative, and form attribution. Track marketing spend, cost per lead (CPL), conversions, view metrics, and impressions across Meta, Instagram, Google, and YouTube in a unified ads dashboard and also provides cross-channel comparison studios, creative asset galleries, search keyword quality scores, video retention curves, and direct bulk lead assignment or exports.

### 🤖 Lead Management & AI

- **Lead Ingestion & Assignment**: Capture leads automatically from digital ads, CSV file uploads, or manual entry. Leads can be assigned directly to sales executives or distributed automatically across active team members using round-robin routing.
- **Direct Communication**: Initiate phone calls, launch WhatsApp conversations, schedule follow-ups, and coordinate on-site visits directly from the lead profile.
- **AI Call Transcription & Insights**: Automatically transcribes call recordings via **Groq LLMs**, generates clear conversation summaries, and extracts prospect requirements such as budget and preferred locations without overwriting existing manual entries.
- **Lead Scoring & Temperature**: Prioritize prospects by interaction quality and interest level (Hot, Warm, or Cold), helping sales agents focus their attention on high-intent buyers.
- **AI Next-Step Recommendations**: Recommends the next best follow-up action based on recent call summaries and activity logs, with one-click automated stage progression.
- **Activity Timeline**: A complete chronological timeline of every customer touchpoint, including call recordings, notes, scheduled visits, and stage transitions.

### 👥 Team Management & Analytics

- **Daily Targets & Workload Balancing**: Managers can configure daily calling targets for teams or individual executives, reassign leads on demand, and adjust project responsibilities.
- **Backlog & Follow-Up Tracking**: Incomplete calls and missed follow-ups carry over into an executive's daily backlog, ensuring prospect inquiries are not lost.
- **Attendance & Announcements**: Built-in daily attendance tracking (check-in and check-out) and announcement boards to share updates across sales teams.
- **Goals & Team Recognition**: Set monthly performance targets for calls, scheduled visits, bookings, and closed revenue, with leaderboard recognition for top performers.
- **Performance Dashboards**: Tailored views for executives, managers, and leadership showing conversion rates, daily activity logs, and team progress.

### 📱 Mobile App & Auto-Dialer

- **Sequential Auto-Dialer**: A native Android auto-dialer module built into the mobile app, allowing pre-sales agents to work through daily lead queues without manual dialing.
- **Automatic Call Sync**: Records call connections, durations, and logs directly to the CRM in the background.
- **Milestone Celebrations**: In-app recognition and achievement alerts when team members reach calling volume and performance milestones.

### 🏢 Inventory & Projects

- **Property Hierarchy**: Organize real estate inventory across Developers, Projects, Towers, Floors, and Units for residential, commercial, and mixed-use developments.
- **Unit Availability & History**: Monitor unit statuses in real time (Available, Blocked, Reserved, and Sold). Booking a unit locks it to prevent duplicate sales and links it directly to the customer's record.
- **Pricing & Payment Milestones**: Manage versioned price sheets, construction-linked payment plans, and promotional offers.
- **AI Structure Setup**: Quickly set up towers, floors, unit layouts, base prices, and commission rates using natural language prompts.

### 📍 GPS-Verified Site Visits

- **Authentic Visit Verification**: Sales executives verify on-site customer visits by capturing live GPS coordinates and a photo at the project location, ensuring visits are genuine.
- **Scheduling & Map View**: Coordinate prospect site visits directly from the lead profile, assign executives, and track visit locations on an interactive map.

### 📑 Bookings & Post-Sales

- **Structured Sales Pipeline**: Track converted sales smoothly through document collection, home loan processing, agreement registration, and final possession handover.
- **Payment Schedules & Collections**: Generate milestone-based payment schedules linked to construction progress, record customer transactions, and track outstanding collections with automated reminders.
- **Inbound Developer Commissions**: Track builder-side commissions owed to the brokerage firm for completed property sales.

### 🤝 Channel Partner (CP) Operations

- **Dedicated Partner Network**: Completely separate external broker operations from direct brokerage sales with strict project and lead scoping.
- **Sourcing Management**: Onboard real estate brokers, verify KYC and RERA registrations, log GPS-verified field meetings with selfie check-ins, and manage broker performance pipelines.
- **Closing Management**: Stationed at project sites to welcome broker-referred prospects, manage on-site negotiations, and coordinate bookings through to possession.
- **Commission Locking & Settlements**: Set flat or percentage-based commission rates per project, with structured verification and approval workflows for payouts and receipt records.
- **AI Broker Copilot**: Analyzes recent interactions with external brokers, suggests relationship milestones, and generates professional meeting notes.

### 🛡️ Approvals & Financial Workflows

- **Ticket-Based Approvals**: Request manager and finance approvals for price discounts, payment timeline adjustments, and refunds.
- **In-Ticket Chat Threads**: Discuss and resolve approval requests directly inside each ticket with managers and finance teams.
- **Financial Controls**: Multi-level review workflows for major financial decisions, commission payouts, and expense tracking.

### 💬 Team Communication & Security

- **Role-Based Internal Chat**: Real-time team messaging allowing sales executives and managers to coordinate quickly within role boundaries.
- **Live Notifications**: Instant updates in the web dashboard paired with mobile push notifications for urgent tasks, lead handoffs, and approval updates.
- **Document Management**: Secure cloud storage for property brochures, RERA certificates, customer KYC files, and payment receipts.

---

## 👥 Role-Based Workspaces & Dashboards

Each role has a dedicated dashboard with KPIs, operational tools, and permissions matching their responsibilities:

| Role | Business Line | Focus Area |
| --- | --- | --- |
| Admin | Both | User administration, permissions, and system settings |
| Director | Brokerage | Overall brokerage revenue, conversion metrics, and project sales |
| Business Manager | Both | Cross-business operations, team performance, and resource allocation |
| Marketing Manager | Both | Ad platform connections, multi-channel outreach, and lead attribution |
| Pre-Sales Manager | Brokerage | Daily call targets, backlog tracking, lead assignment, and team stats |
| Pre-Sales Executive | Brokerage | Daily lead queues, auto-dialer calling, follow-ups, and activity logs |
| Sales Manager | Brokerage | Sales pipeline velocity, site visit completions, and discount approvals |
| Sales Executive | Brokerage | Prospect follow-ups, GPS site visits, negotiations, and bookings |
| Post-Sales Manager | Brokerage | Collection tracking, loan cases, registration status, and handovers |
| Post-Sales Executive | Brokerage | Payment milestones, bank disbursement tracking, and customer handovers |
| Channel Partner | CP | CP project portfolios, broker sales, and payout summaries |
| Sourcing Manager | CP | Broker onboarding, field visits, RERA/KYC verification, and commissions |
| Closing Manager | CP | On-site walk-ins, broker-referred bookings, and payment schedules |
| Finance | Both | Commission verification, expense approvals, invoices, and payouts |

## 🏗️ Architecture

```
BrokerOS/
├── apps/
│   ├── api/          NestJS 11 REST API + Socket.IO
│   │   └── src/
│   │       ├── auth/           Better Auth session validation, roles guard & RBAC decorators
│   │       ├── leads/          Lead lifecycle (core CRUD, scoring, bookings, calls, follow-ups, GPS site visits)
│   │       ├── inventory/      Inventory management (projects, towers with Groq AI config, units, documents)
│   │       ├── brokers/        Channel Partner broker network (onboarding, meetings, referrals, KYC)
│   │       ├── approvals/      Multi-step approval engine (ApprovalRequest + FinancialApproval)
│   │       ├── chat/           Socket.IO real-time team messaging rooms & direct chats
│   │       ├── notifications/  In-app notifications + Expo Push SDK dispatch
│   │       ├── dashboard/      Role-tailored performance analytics (10+ role services)
│   │       ├── marketing/      Omnichannel outreach modules:
│   │       │   ├── whatsapp/   Meta Cloud API, shared team inbox, flows, automations, templates
│   │       │   ├── voice/      AI voice campaigns, WebSocket media stream gateway, carrier bridge dispatcher
│   │       │   ├── email/      email campaigns, 2-way team inbox, visual drip flows, tracking
│   │       │   ├── sms/        9-gateway SMS campaigns, 2-way chat inbox, keyword flows, short-links
│   │       │   └── ads/        Meta, Instagram, Google, and YouTube lead webhooks & GAQL/Graph API sync
│   │       └── lib/            Prisma ORM database module wrapper & Vercel Blob cloud storage
│   │
│   ├── web/          Next.js 16 (App Router) web dashboard
│   │   ├── app/
│   │   │   ├── login/          Authentication page
│   │   │   └── dashboard/      Authenticated shell (role sidebar, notifications, chat widget)
│   │   │       ├── [12 role dirs]/  Dedicated workspaces for all 12 system roles
│   │   │       └── marketing/  Marketing hub (WhatsApp, Voice, Email, SMS, Ads)
│   │   ├── features/           Domain UI features (leads, inventory, brokers, approvals, marketing)
│   │   ├── components/         Shared UI primitives, charts, chat, notifications
│   │   └── lib/                Auth client, API utilities
│   │
│   ├── mobile/       Expo 54 (React Native) Android app
│   │   ├── app/
│   │   │   ├── (auth)/         Mobile login screen
│   │   │   └── (dashboard)/    Tab navigation with role-specific mobile screens
│   │   ├── modules/
│   │   │   └── auto-dialer/    Custom native Android module (Java/Kotlin telephony call sync)
│   │   ├── hooks/              Auto-dialer sync hooks (useCallStatus)
│   │   └── lib/                Better Auth Expo client, SocketContext, GPS site visit tracking
│   │
│   └── workers/      BullMQ async background workers (powered by Redis 7)
│       └── src/
│           ├── main.ts         Worker cluster bootstrap (port 3334)
│           ├── workers.module.ts
│           └── processors/
│               ├── marketing-email.processor.ts    # Batch email dispatch & merge tag interpolation
│               ├── marketing-sms.processor.ts      # Multi-gateway SMS batching & DLT compliance
│               ├── marketing-voice.processor.ts    # Outbound AI voice batching + carrier bridge routing
│               ├── marketing-whatsapp.processor.ts # Meta WhatsApp Cloud API dispatcher
│               └── whatsapp/                       # Automation drips, bulk broadcasts, template syncer
│
├── packages/
│   ├── prisma/       Prisma ORM schema, migrations, seed, and generated client (@brokeros/prisma)
│   ├── storage/      Centralized Vercel Blob cloud storage wrappers (@brokeros/storage)
│   ├── types/        Shared TypeScript domain interfaces and DTOs (@brokeros/types)
│   ├── validators/   Shared Zod validation schemas for forms and API payloads (@brokeros/validators)
│   └── constants/    Pure domain constants, enums, UI palettes, and voice normalizers (@brokeros/constants)
│
├── integrations/
│   ├── voice/        AI voice platform adapters and PSTN carrier bridge (@brokeros/int-voice)
│   ├── mail/         Email provider adapters (like SendGrid, SES, Brevo, Mailgun, Mailchimp, Gmail, Outlook, Constant Contact)
│   ├── sms/          SMS gateway adapters (like Twilio, Gupshup, Sinch, Plivo, Telnyx, Vonage, Bird, Infobip, AWS SNS)
│   ├── whatsapp/     Meta WhatsApp Cloud API client with interactive builders & HMAC verification (@brokeros/int-whatsapp)
│   └── ads/          Lead ingestion & API sync: Meta (@brokeros/int-ads-meta) & Google (@brokeros/int-ads-google)
│
├── scripts/          Root deployment, database seeding, and synchronization utility scripts
└── docker-compose.yml PostgreSQL 16 + Redis 7 + API + Workers + Web container orchestration
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Backend** | NestJS 11 · TypeScript · Prisma 7 · PostgreSQL |
| **Frontend** | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Recharts · Framer Motion |
| **Mobile** | Expo 54 · Expo Router 6 · React Native · NativeWind |
| **Auth** | Better Auth (web, mobile, and API) |
| **Real-time** | Socket.IO 4 |
| **Async Jobs** | BullMQ (background campaign processors) |
| **File Storage** | Vercel Blob |
| **Push Notifications** | Expo Push SDK |
| **AI Processing** | Groq & LLM completions (call transcription, lead insights, tower generation) |
| **AI Voice & Telephony** | Voice agent platforms (Vapi, Retell, Sarvam, Bolna, ElevenLabs, etc.) bridged to carriers (Twilio, Exotel, Vobiz, Telnyx) |
| **Email Providers** | SendGrid · Brevo · Mailchimp · AWS SES |
| **SMS Gateways** | Twilio · Gupshup · Sinch · AWS SNS |
| **WhatsApp** | Meta WhatsApp Cloud API (`@brokeros/int-whatsapp`) |
| **Ad Platforms & Lead Ingest** | Meta, Instagram, Google Ads & YouTube lead form webhooks (`@brokeros/int-ads-*`) |
| **Maps** | Google Maps (web and mobile location verification) |
| **Containerization** | Docker & Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

Before cloning and running BrokerOS, ensure your system meets the minimum requirements:

- **Node.js** ≥ 22.0.0
- **pnpm** ≥ 10.0.0 (`npm install -g pnpm`)
- **Docker & Docker Compose** (Recommended — spins up PostgreSQL, Redis, API, Workers & Web in one command)
  - _OR_ **PostgreSQL 16+** and **Redis 7+** running locally if choosing manual setup.
- **Android Studio & SDK** (Optional — only required for running the native mobile auto-dialer).

---

### 🤖 AI Agent Setup (Zero Manual Effort)

If you are using an **AI IDE (like Antigravity / Cursor)** or CLI, you don't need to manually configure the environment or run commands. Simply use the built-in AI skills:

1. Type **`/setup-codebase`** in the agent chat. The AI will automatically create your `.env` files, generate secrets, discover your local IP for mobile, install all dependencies, start database services, and launch the applications.
2. Type **`/codebase-tour`** after setup to have the AI generate an exhaustive, customized markdown map of the codebase and its business logic.

---

### Step 1: Clone & Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/sumamakhan761/BrokerOS.git
cd BrokerOS

# 2. Install dependencies across all monorepo packages
pnpm install

# 3. Copy the environment templates for all workspaces
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/workers/.env.example apps/workers/.env
cp apps/mobile/.env.example apps/mobile/.env
```

> **Split Environment Architecture:**
> - **Root `/.env`**: Infrastructure secrets shared across services (Database URL, Redis URL, Better Auth secret, Groq AI key, Vercel Blob storage, Voice & Ad integrations).
> - **App-level `.env`s** (`apps/api`, `apps/web`, `apps/workers`, `apps/mobile`): Local service ports, URLs, and client keys (such as Google Maps API).

---

### Option A: Docker Setup (Recommended)

The fastest and most reliable way to run the complete BrokerOS platform. This builds and orchestrates 5 containers: **PostgreSQL 16**, **Redis 7**, **NestJS API**, **Async BullMQ Campaign Workers**, and the **Next.js Web App**.

```bash
# 1. Build and start all 5 services
docker compose up --build
# 🔑 View all demo users & passwords created: docs/role-password.md

# 4. Service Endpoints:
# 🌐 Web Dashboard:      http://localhost:3000
# 🔌 NestJS API:          http://localhost:3333
# ⚡ Background Workers:  http://localhost:3334/health
# 🐘 PostgreSQL:          localhost:5432 (user: crm, db: crm)
# 🔴 Redis:               localhost:6379
```

> **Mobile App:** Docker does not run the mobile app. To run the mobile app alongside Docker, follow the manual Mobile steps in Option B below.

---

### Option B: Manual Setup

#### 1. Backend (API) & Database Setup

```bash
# Generate, migrate, and seed the database
pnpm db:generate             # Generate Prisma client
pnpm db:migrate              # Run pending migrations
pnpm db:seed                 # Populate database with sample data (🔑 View credentials: docs/role-password.md)

# Start the API server (from root)
pnpm dev:api                 # Start dev server → http://localhost:3333
```

#### 2. Frontend (Web)

```bash
# Start the Next.js web dashboard (from root)
pnpm dev:web                 # Start dev server → http://localhost:3000
```

#### 3. Background Workers (BullMQ)

```bash
# Start the BullMQ background campaign processors
pnpm dev:workers             # Dev server → http://localhost:3334
```

#### 4. Mobile (Android Only)

```bash
# Set EXPO_PUBLIC_API_URL in apps/mobile/.env to your machine's LAN IP before starting!
pnpm dev:mobile              # Start Metro bundler (press 'a' to run on Android)
# OR compile and run natively on an Android emulator/device:
cd apps/mobile
npx expo run:android
```

### 📚 Dedicated Subsystem Guides

For deep-dive architectural specifications, environment schemas, and developer workflows for each module, check their dedicated guides:

- 🟢 **[Backend API Guide](apps/api/README.md)** — Modules, Prisma models, Better Auth, and API controllers
- 🔵 **[Frontend Web Guide](apps/web/README.md)** — Role dashboards, Next.js proxy pattern, and UI components
- ⚡ **[Background Workers Guide](apps/workers/README.md)** — BullMQ job queues, processors, and cron scanners
- 📱 **[Mobile App Guide](apps/mobile/README.md)** — Native auto-dialer, Expo Router, and Android permissions
- 🔗 **[Integrations Guide](integrations/README.md)** — Voice agents, PSTN carrier bridge, Meta/Google ads, WhatsApp, and SMS/Email adapters

---

## 📖 Documentation

| Document | Description |
| --- | --- |
| [Backend README](apps/api/README.md) | Backend architecture, API modules (leads, inventory, marketing), database, development guide |
| [Frontend README](apps/web/README.md) | Frontend architecture, role-based routing, marketing campaign tools, components, development guide |
| [Background Workers Guide](apps/workers/README.md) | BullMQ asynchronous job processors for Email, SMS, Voice, and WhatsApp campaigns |
| [Integrations Guide](integrations/README.md) | Voice agent adapters, PSTN carrier bridge, email & SMS provider adapters |
| [Contributing Guide](CONTRIBUTING.md) | How to contribute to the project |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |
| [Security Policy](SECURITY.md) | Reporting vulnerabilities |
| [Changelog](CHANGELOG.md) | Release history |
| [License](LICENSE) | MIT License |

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

---

## 🔒 Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md) for responsible disclosure. **Do not open a public issue for security vulnerabilities.**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License · Copyright (c) 2026 Sumama Khan
```

---

<div align="center">

**Built with ❤️ for the real estate industry**

[⬆ Back to top](#-BrokerOS)

</div>
