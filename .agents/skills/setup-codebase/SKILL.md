---
name: setup-codebase
description: Use when the user asks to "setup the codebase", "run locally", or "get started". Sets up the complete BrokerOS codebase locally via Docker Compose or native manual pnpm monorepo commands.
---

This skill guides the agent to set up the entire BrokerOS project for the user. Execute these steps systematically.

**Important Context**: Before you begin, or if you run into any setup issues, refer to the subsystem documentation:
- `apps/api/README.md` (NestJS REST API & Socket.IO)
- `apps/web/README.md` (Next.js 16 Web Dashboard)
- `apps/mobile/README.md` (Expo 54 Android App & Native Auto-Dialer)
- `apps/workers/README.md` (BullMQ Campaign Workers & Redis 7)
- `integrations/README.md` (External provider adapters)

---

## 1. Prerequisite Check

Verify the user's host environment by checking installed versions:
- `node -v` (requires Node.js ≥ 22)
- `pnpm -v` (requires pnpm ≥ 10)
- `docker -v` (for full Docker stack or local Postgres/Redis containers)

If any critical tool is missing, provide instructions for the user to install it before proceeding.

---

## 2. Choose Setup Workflow (Ask the User)

Ask the user how they would like to run BrokerOS:

> **"How would you like to set up BrokerOS?"**
>
> 1. **Option A: Quick Start with Docker (Recommended for full stack)**
>    - Spins up all 5 containerized services simultaneously: PostgreSQL 16, Redis 7, NestJS API, BullMQ Workers, and Next.js Web Dashboard.
>    - Automatically runs database migrations and seeds demo data on initial boot.
>
> 2. **Option B: Manual Monorepo Setup (Native pnpm)**
>    - Runs services directly on your host machine via Turborepo (`pnpm dev:api`, `pnpm dev:web`, `pnpm dev:workers`).
>    - Choose whether to spin up PostgreSQL & Redis via Docker (`docker compose up postgres redis -d`) or connect an external cloud database (e.g., Neon & Upstash).

---

## 🚀 Flow A: Quick Start with Docker

If the user chooses Docker, execute the following steps:

### A1. Copy Environment Files
Run shell commands (or fallback to file tools) to copy the required templates:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/workers/.env.example apps/workers/.env
```

### A2. Automate Non-Sensitive Variables
- **Generate Auth Secret**: Generate a secure 32-character random hex string and inject it into the **root `/.env`** as `BETTER_AUTH_SECRET`.
- Inform the user that the sub-app `.env` files already contain the pre-configured container networking routes (`http://crm-backend:3333`, `http://crm-frontend:3000`, `http://crm-workers:3334`).

### A3. Clean Reset (If Prior Containers Exist)
If previous containers or volumes exist, run a clean teardown:
```bash
docker compose down -v --remove-orphans
```

### A4. Build and Start All Services
```bash
docker compose up --build
```

### A5. Verification
Verify service availability:
- Web Dashboard: `http://localhost:3000`
- Backend API: `http://localhost:3333`
- Workers Health: `http://localhost:3334/health`
- Demo credentials reference: `docs/role-password.md`

---

## 🛠️ Flow B: Manual Monorepo Setup (Native pnpm)

If the user chooses Manual Setup, execute these steps:

### B1. Copy Environments & Automate Configuration
Copy all required `.env` templates:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/workers/.env.example apps/workers/.env
cp apps/mobile/.env.example apps/mobile/.env
```

Automate non-sensitive variables:
1. **Generate Auth Secret**: Generate a 32-character random hex string and save into **root `/.env`** as `BETTER_AUTH_SECRET`.
2. **Fetch Local LAN IP**: Run `ipconfig` (Windows) or `ifconfig` / `ip a` (Mac/Linux), parse the IPv4 address, and set:
   - `MOBILE_URL="exp://<LAN_IP>:8081"` in `apps/api/.env`
   - `EXPO_PUBLIC_API_URL="http://<LAN_IP>:3333"` in `apps/mobile/.env`

### B2. Ask User About Database & Redis Preference
Ask the user directly:

> **"How would you like to run your database and Redis queue?"**
>
> - **Option 1: Local Docker Containers (Easiest)**
>   We spin up Postgres (port 5432) and Redis (port 6379) locally using:
>   `docker compose up postgres redis -d`
>   (Default `DATABASE_URL` and `REDIS_URL` in root `.env` are already configured for this).
>
> - **Option 2: Cloud Services**
>   You supply your cloud credentials in root `/.env`:
>   - `DATABASE_URL` from [Neon](https://neon.tech/) or another PostgreSQL provider.
>   - `REDIS_URL` from [Upstash](https://console.upstash.com/) or another Redis provider.

Remind them to also paste:
- `GROQ_API_KEY` in root `/.env` (from [Groq Console](https://console.groq.com/keys) — free tier available).
- `BLOB_READ_WRITE_TOKEN` in root `/.env` (from [Vercel Storage](https://vercel.com/storage/blob)).
- Ask the user to reply with **"done"** once their root `.env` is updated.

**Completion criterion**: Wait for the user to confirm before proceeding.

### B3. Install Dependencies
Run from the monorepo root:
```bash
pnpm install
```

### B4. Initialize Database
1. If using Local Docker for DB:
   ```bash
   docker compose up postgres redis -d
   ```
   Verify containers are healthy via `docker ps`.

2. Run Prisma migrations and seed sample real estate data:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```
   *(All demo login credentials are saved in `docs/role-password.md`).*

### B5. Start Services
Launch services as background processes:
- **Backend API**: `pnpm dev:api` → `http://localhost:3333`
- **Next.js Web Dashboard**: `pnpm dev:web` → `http://localhost:3000`
- **BullMQ Campaign Workers**: `pnpm dev:workers` → `http://localhost:3334/health`
- **Mobile App (Optional)**:
  - Metro bundler: `pnpm dev:mobile`
  - Or native Android build:
    ```powershell
    # On Windows:
    $env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; cd apps/mobile; npx expo run:android
    ```

---

## 3. Optional Setup — AI Voice Platform Keys

If the user wants to test the AI Voice Campaign Studio (`marketing/voice`), they can add optional AI voice provider keys to the **root `/.env`**:
- `ELEVENLABS_API_KEY` (Conversational AI + TTS: https://elevenlabs.io/)
- `DEEPGRAM_API_KEY` (STT transcription: https://deepgram.com/)
- `CARTESIA_API_KEY` (Sonic neural TTS: https://cartesia.ai/)
- `SARVAM_API_KEY` (Indic language neural TTS: https://sarvam.ai/)

*Note: Telephony carriers (Twilio, Exotel, Vobiz, Telnyx), Email providers (SendGrid, SES, Brevo), and SMS gateways are connected dynamically inside the Web App UI under Marketing Settings.*

---

## 4. Final Verification & Completion Summary

1. Hit `http://localhost:3333` — verify NestJS API responds.
2. Hit `http://localhost:3000` — verify Next.js login screen renders without console errors.
3. Hit `http://localhost:3334/health` — verify BullMQ workers report healthy Redis status.
4. Present a clear summary to the user:
   - Running services, ports, and health status.
   - Credentials link: `docs/role-password.md`.
   - Recommend exploring the system by typing `/codebase-tour`.
