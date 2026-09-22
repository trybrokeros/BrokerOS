# BrokerOS Script Repository & CLI Runner

Comprehensive utility, testing, diagnostic, and maintenance scripts for BrokerOS.

---

## ⚡ Quick Start

### 1. Interactive Command Runner
Run the interactive CLI runner to view categories, list scripts, or execute any script:

```bash
# View all available categories and usage
pnpm run:script

# List all 82 registered scripts with descriptions
pnpm run:script --list

# Filter by category (e.g. voice, mail, sms, ads, crm, ai, database, diagnostics)
pnpm run:script voice
pnpm run:script crm
pnpm run:script mail

# Search scripts by keyword
pnpm run:script -s bolna
pnpm run:script -s commission

# Execute a script directly
pnpm run:script crm/check-projects.ts
pnpm run:script check-db
```

### 2. Direct Execution via tsx
You can also run any script directly using `pnpm run script`:

```bash
pnpm run script scripts/voice/agents/test-all-voice-providers.ts
pnpm run script scripts/crm/check-projects.ts
pnpm run script scripts/database/check-db.ts
```

---

## 📁 Directory Structure

```
scripts/
├── voice/
│   ├── agents/            # AI Voice agent auth, probe, voice listing & neural TTS (27 scripts)
│   ├── telephony/         # PSTN carrier trunk auth & dialing bridges (6 scripts)
│   └── pipeline/          # End-to-end voice flow & foundational verification (3 scripts)
├── mail/                  # Email dispatch, authentication, & identity verification (8 scripts)
├── sms/                   # SMS gateways, sender IDs, & test dispatches (4 scripts)
├── ads/                   # Lead ad platform synchronization & webhooks (2 scripts)
├── crm/                   # Real estate business operations & lifecycle logic (18 scripts)
├── ai/                    # AI transcription, summarization, & lead scoring (3 scripts)
├── database/              # DB connection checks, raw queries, & data fixes (8 scripts)
├── diagnostics/           # Full system audits, type drift, & multi-channel checks (3 scripts)
├── runner.ts              # Interactive CLI runner & programmatic registry
├── README.md              # Master directory of all scripts with documentation
└── tsconfig.json          # TypeScript paths & compiler configuration
```

---

## 📚 Categorized Script Catalog

### 1. 🎙️ Voice: AI Voice Agents (`scripts/voice/agents/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `test-all-voice-providers.ts` | Validates Bolna, Sarvam, ElevenLabs, LiveKit, Vapi, Retell, and Vobiz in a single audit pass | `BOLNA_API_KEY`, `SARVAM_API_KEY`, `ELEVENLABS_API_KEY` |
| `test-bolna-agent-auth.ts` | Verifies active Bolna AI workspace API key, agent IDs, and wallet balance | `BOLNA_API_KEY` |
| `test-bolna-engine.ts` | Tests Bolna audio streaming and real estate conversation engine | `BOLNA_API_KEY` |
| `test-bolna-real-voices.ts` | Discovers available ElevenLabs, Cartesia, and Deepgram voices registered on Bolna | `BOLNA_API_KEY` |
| `test-cartesia-live.ts` | Tests Cartesia ultra-low latency voice synthesis via VoiceAudioService | `CARTESIA_API_KEY` |
| `test-cartesia-model-ids.ts` | Fetches valid Sonic model IDs from Cartesia API | `CARTESIA_API_KEY` |
| `test-cartesia-model-names.ts` | Inspects Sonic multilingual and English model names on Cartesia | `CARTESIA_API_KEY` |
| `test-cartesia-probe.ts` | Probes Cartesia REST endpoints with configured API credentials | `CARTESIA_API_KEY` |
| `test-eleven-direct.ts` | Pings ElevenLabs v1/voices API directly without abstraction | `ELEVENLABS_API_KEY` |
| `test-eleven-models.ts` | Fetches available multilingual and turbo models from ElevenLabs | `ELEVENLABS_API_KEY` |
| `test-elevenlabs-agent-auth.ts` | Validates ElevenLabs conversational AI agent authentication and subscription tier | `ELEVENLABS_API_KEY` |
| `test-elevenlabs-probe.ts` | Probes ElevenLabs accounts and lists user subscription status | `ELEVENLABS_API_KEY` |
| `test-elevenlabs-tts.ts` | Synthesizes sample real estate agent pitch using ElevenLabs Multilingual v2 | `ELEVENLABS_API_KEY` |
| `test-find-working-voices.ts` | Discovers verified working voice IDs across Cartesia, ElevenLabs, and Deepgram | `CARTESIA_API_KEY`, `ELEVENLABS_API_KEY` |
| `test-inworld-tts.ts` | Tests Inworld AI conversational voice generation endpoints | `INWORLD_API_KEY` |
| `test-minimax-fish-inworld.ts` | Probes secondary voice providers for multilingual Indic real estate dialogue | `MINIMAX_API_KEY`, `FISH_AUDIO_API_KEY` |
| `test-openai-agent-auth.ts` | Validates OpenAI API key and models endpoint for Realtime WebRTC voice agents | `OPENAI_API_KEY` |
| `test-retell-agent-auth.ts` | Authenticates Retell AI credentials and queries configured agent assistants | `RETELL_API_KEY` |
| `test-retell-audio-preview.ts` | Generates voice preview audio buffer using Retell voice synthesis | `RETELL_API_KEY` |
| `test-retell-probe.ts` | Probes Retell AI REST API status and lists active phone numbers and LLMs | `RETELL_API_KEY` |
| `test-sarvam-agent-auth.ts` | Validates Sarvam Indic voice credentials and lists available models (Bulbul, Saaras) | `SARVAM_API_KEY` |
| `test-sarvam-probe.ts` | Probes Sarvam AI TTS endpoints and verifies Hindi/Indian English support | `SARVAM_API_KEY` |
| `test-vapi-agent-auth.ts` | Validates Vapi private API key and queries configured assistants | `VAPI_API_KEY` |
| `test-vapi-catalog.ts` | Fetches full voice catalog supported on Vapi platform | `VAPI_API_KEY` |
| `test-vapi-docs-audio.ts` | Tests Vapi audio CDN and documentation sample playback links | None |
| `test-vapi-probe.ts` | Probes Vapi REST API status and validates outbound SIP trunk bindings | `VAPI_API_KEY` |
| `test-verify-voice-cdn.ts` | Validates public CDN URLs for all preview audio samples in VOICE_TTS_CATALOG | None |

---

### 2. 📞 Voice: Telephony Carrier Trunks (`scripts/voice/telephony/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `test-exotel-voice-auth.ts` | Validates Exotel Account SID, Token, and Subdomain against Exotel India Telecom API | `EXOTEL_ACCOUNT_SID`, `EXOTEL_AUTH_TOKEN` |
| `test-telnyx-voice-auth.ts` | Validates Telnyx API Key and queries Call Control applications and active phone numbers | `TELNYX_API_KEY` |
| `test-twilio-voice-auth.ts` | Validates Twilio Account SID and Auth Token, fetching verified caller IDs and account status | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` |
| `test-vobiz-voice-auth.ts` | Validates Vobiz Telecom Auth ID and Auth Token for high-volume automated dialing | `VOBIZ_AUTH_ID`, `VOBIZ_AUTH_TOKEN` |
| `test-outbound-dispatch.ts` | Simulates dispatching an outbound AI phone call via configured PSTN carrier | `DATABASE_URL` |
| `test-preview-endpoint.ts` | Tests local VoiceAudioService preview audio endpoint generation | None |

---

### 3. 🔄 Voice: Pipeline & Foundation (`scripts/voice/pipeline/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `check-voice-foundation.ts` | Audits database tables, campaign recipients, integrations, and pricing configuration | `DATABASE_URL` |
| `test-voice-api-flow.ts` | Tests audience segmentation, cost calculation, and campaign creation workflow | `DATABASE_URL` |
| `test-voice-integrations.ts` | Iterates through all configured voice telephony and agent integrations in the database | `DATABASE_URL` |

---

### 4. ✉️ Email Marketing Adapters (`scripts/mail/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `test-aws-auth.ts` | Validates AWS SES Access Key, Secret Key, and Region, querying sending quotas | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` |
| `test-aws-dispatch.ts` | Dispatches a live verification test email via Amazon Simple Email Service (SES) | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| `test-brevo-auth.ts` | Authenticates Brevo (Sendinblue) API v3 key and retrieves account email credits | `BREVO_API_KEY` |
| `test-brevo-dispatch.ts` | Sends a branded test email via Brevo transactional SMTP API | `BREVO_API_KEY` |
| `test-mailchimp-ping.ts` | Pings Mailchimp / Mandrill Transactional API to confirm key validity | `MAILCHIMP_API_KEY` |
| `test-mailchimp-dispatch.ts` | Dispatches a test marketing campaign email through Mandrill transactional API | `MAILCHIMP_API_KEY` |
| `test-sendgrid-dispatch.ts` | Sends a test email via Twilio SendGrid Mail Send v3 API with tracking verification | `SENDGRID_API_KEY` |
| `verify-recipient-ses.ts` | Sends an AWS SES sandbox recipient identity verification email to an address | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |

---

### 5. 💬 SMS Gateways & Dispatchers (`scripts/sms/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `check-sms-integrations.ts` | Queries active SMS integrations (Twilio, Gupshup, Sinch, AWS SNS) and verifies credentials | `DATABASE_URL` |
| `debug-sms-db.ts` | Inspects raw SMS campaign dispatches, sender pools, and delivery logs in PostgreSQL | `DATABASE_URL` |
| `send-test-sms.ts` | Dispatches a live test SMS message to a phone number using the configured SMS gateway | `DATABASE_URL` |
| `test-twilio-auth.ts` | Validates Twilio Account SID and Auth Token, checking active messaging services | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` |

---

### 6. 📢 Advertising Ingestion (`scripts/ads/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `test-google-ads-sync.ts` | Tests Google Ads lead form submission webhook processing and CRM lead creation | `DATABASE_URL` |
| `test-meta-full-sync.ts` | Syncs Meta ad campaigns, ad sets, and lead form submissions via Meta Graph API | `DATABASE_URL`, `META_ACCESS_TOKEN` |

---

### 7. 🏢 CRM Business Logic & Commissions (`scripts/crm/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `check-bookings.ts` | Inspects confirmed, pending, and cancelled bookings and token payment amounts | `DATABASE_URL` |
| `test-booking.ts` | Tests booking reservation workflow and financial calculation | `DATABASE_URL` |
| `check-projects.ts` | Queries projects, towers, floors, and reserved/sold unit allocations in database | `DATABASE_URL` |
| `check-luxury-villas.ts` | Inspects specific unit status breakdown for the flagship Luxury Villas project | `DATABASE_URL` |
| `check-cp2.ts` | Audits Channel Partner project separation (isCpProject = true) and broker commissions | `DATABASE_URL` |
| `get-assignments.ts` | Lists project assignments for Sourcing Managers and Calling Managers | `DATABASE_URL` |
| `check-roles.ts` | Lists all system users and validates their assigned RBAC permissions | `DATABASE_URL` |
| `test-user.ts` | Queries specific user record and role hierarchy | `DATABASE_URL` |
| `assign-manager.cjs` | Reassigns Sales Executives to a specific Sales Manager in bulk | `DATABASE_URL` |
| `test-commission.ts` | Validates broker commission and inbound builder commission calculation logic | `DATABASE_URL` |
| `e2e-commission-test.ts` | End-to-end simulation of booking, commission record generation, and settlement payout | `DATABASE_URL` |
| `test-dashboard-commissions.ts` | Validates commission metrics aggregated in manager dashboards | `DATABASE_URL` |
| `fix-zero-commissions.ts` | Maintenance script to recalculate and backfill zero-amount commission records | `DATABASE_URL` |
| `compare-dashboards.ts` | Compares KPI computations between Pre-Sales and Sales Manager views | `DATABASE_URL` |
| `test-dashboard-query.ts` | Benchmarks performance of CRM dashboard aggregations | `DATABASE_URL` |
| `test-payment.ts` | Verifies booking milestone payments and transaction records | `DATABASE_URL` |
| `test-followups.js` | Queries overdue and scheduled follow-ups for lead nurturing | `DATABASE_URL` |
| `test-location.ts` | Tests GPS coordinate matching for site visit verification | `DATABASE_URL` |

---

### 8. 🧠 AI Scoring, Summarization & Transcription (`scripts/ai/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `test-scoring.ts` | Tests AI lead intent scoring model (HOT/WARM/COLD) based on interactions | `GROQ_API_KEY` |
| `test-summarization.ts` | Tests LLM call transcript summarization and key outcome extraction | `GROQ_API_KEY` |
| `test-transcription.ts` | Tests audio call recording transcription using Whisper via Groq | `GROQ_API_KEY` |

---

### 9. 🗄️ Database Checks & Maintenance (`scripts/database/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `check-db.ts` | Pings PostgreSQL database via Prisma client and prints connection stats (TS) | `DATABASE_URL` |
| `check-db.cjs` | Lightweight CommonJS database ping script | `DATABASE_URL` |
| `check.js` | Quick table inventory and row count checker in plain JavaScript | `DATABASE_URL` |
| `test-check.ts` | Basic sanity check for PostgreSQL client connectivity | `DATABASE_URL` |
| `test-direct.ts` | Direct query runner to benchmark Prisma execution times | `DATABASE_URL` |
| `test-query.ts` | Tests complex joins and nested relations on Leads, Users, and Projects | `DATABASE_URL` |
| `fix-db.ts` | Reassigns orphan Sales Executives and project assignments to valid managers | `DATABASE_URL` |
| `reprocess.ts` | Resets failed or stalled background jobs and queue entries | `DATABASE_URL` |

---

### 10. 🔍 Auditing & Diagnostics (`scripts/diagnostics/`)

| Script | Purpose | Env Vars |
| :--- | :--- | :--- |
| `test-all-integrations.ts` | Comprehensive automated audit across Telephony, Voice AI, Mail, and SMS | `DATABASE_URL` |
| `check-integrations.ts` | Lists all connected integrations across all marketing channels in PostgreSQL | `DATABASE_URL` |
| `scan-types-constants.ts` | Scans codebase to detect un-migrated types and legacy constant definitions | None |
| `test-mobile-e2e.ts` | Maestro CLI detection and native mobile E2E test suite runner | None |

---

## 🛠️ Adding a New Script

1. Place your script in the appropriate category folder: `scripts/<category>/your-script.ts`.
2. Register it in `scripts/runner.ts` under `SCRIPT_REGISTRY` with `id`, `category`, `title`, `description`, and `requiresEnv`.
3. Add it to the table in `scripts/README.md`.
4. Run `pnpm exec tsc --project scripts/tsconfig.json --noEmit` to verify type safety.
