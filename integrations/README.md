# BrokerOS Integrations

External service adapters for the BrokerOS platform. Each sub-directory is an isolated adapter for one external service channel. The `apps/api` backend consumes these adapters — it never calls third-party SDKs directly.

---

## Directory

```
integrations/
├── voice/              AI Voice Agents + PSTN Telephony (@brokeros/int-voice)
│   ├── agents/         8 AI voice agent adapters
│   │   ├── vapi/       Vapi assistant management + webhook dispatch
│   │   ├── retell/     Retell AI agent management + webhook dispatch
│   │   ├── sarvam/     Sarvam AI (Bulbul v3) Indic neural TTS + calls
│   │   ├── bolna/      Bolna AI voice agent adapter
│   │   ├── elevenlabs/ ElevenLabs conversational AI adapter
│   │   ├── livekit/    LiveKit WebRTC-based voice pipeline adapter
│   │   ├── openai-realtime/ OpenAI Realtime API adapter
│   │   └── pipecat/    Pipecat open-source voice pipeline adapter
│   ├── bridge/
│   │   └── carrier-bridge-dispatcher.ts  Central PSTN carrier router
│   ├── telephony/      PSTN carrier adapters (Vobiz, Exotel, Twilio, Telnyx)
│   ├── index.ts        Barrel export — exports all adapters + tryCarrierBridgeDispatch
│   └── package.json    Package name: @brokeros/int-voice
│
├── mail/               Email provider adapters (8 providers)
│   ├── aws-ses/        AWS SES (@brokeros/int-mail-ses)
│   ├── sendgrid/       SendGrid transactional + marketing (@brokeros/int-mail-sendgrid)
│   ├── brevo/          Brevo (Sendinblue) (@brokeros/int-mail-brevo)
│   ├── mailchimp/      Mailchimp bulk email (@brokeros/int-mail-mailchimp)
│   ├── mailgun/        Mailgun (@brokeros/int-mail-mailgun)
│   ├── gmail/          Gmail SMTP adapter (@brokeros/int-mail-gmail)
│   ├── outlook/        Microsoft Outlook/Exchange (@brokeros/int-mail-outlook)
│   └── constant-contact/ Constant Contact (@brokeros/int-mail-constant-contact)
│
├── sms/                SMS gateway adapters (9 providers)
│   ├── twilio/         Twilio SMS (@brokeros/int-sms-twilio)
│   ├── gupshup/        Gupshup SMS — India-focused (@brokeros/int-sms-gupshup)
│   ├── sinch/          Sinch SMS (@brokeros/int-sms-sinch)
│   ├── aws-sns/        AWS SNS SMS (@brokeros/int-sms-aws-sns)
│   ├── bird/           Bird (MessageBird) SMS (@brokeros/int-sms-bird)
│   ├── infobip/        Infobip SMS (@brokeros/int-sms-infobip)
│   ├── plivo/          Plivo SMS (@brokeros/int-sms-plivo)
│   ├── telnyx/         Telnyx SMS (@brokeros/int-sms-telnyx)
│   └── vonage/         Vonage (Nexmo) SMS (@brokeros/int-sms-vonage)
│
├── whatsapp/           Meta WhatsApp Cloud API adapter (@brokeros/int-whatsapp)
│   └── src/
│       ├── meta-api.ts         Core Meta Cloud API client (send/receive messages)
│       ├── interactive.ts      Interactive message builders (buttons, lists)
│       ├── webhook-sign.ts     X-Hub-Signature-256 HMAC verification
│       ├── ssrf-guard.ts       SSRF protection for media attachment URLs
│       ├── encryption.ts       AES-GCM token encryption utilities
│       ├── phone-utils.ts      E.164 normalization + retry phone variants
│       └── index.ts            Barrel export
│
└── ads/                Ad platform lead ingestion adapters
    ├── google/         Google Ads lead form webhook ingest (@brokeros/int-ads-google)
    └── meta/           Meta (FB/IG) Lead Ads webhook ingest (@brokeros/int-ads-meta)
```

---

## Voice Integration (`@brokeros/int-voice`)

The voice integration package manages two separate layers:

### AI Agent Layer (`integrations/voice/agents/`)

Each AI platform adapter handles:

- **Agent/assistant listing** — fetch all configured agents from the platform workspace
- **Call dispatch** — initiate an outbound AI call to a phone number
- **Catalog fetch** — list available LLM models and TTS voices
- **Webhook processing** — handle inbound call status events

### PSTN Carrier Layer (`integrations/voice/bridge/`)

The `carrier-bridge-dispatcher.ts` provides `tryCarrierBridgeDispatch(phone, config)` — a single function that:

1. Determines the configured telephony carrier (Vobiz / Exotel / Twilio / Telnyx)
2. Dials the number via that carrier's PSTN API
3. Returns a result with the carrier call ID and status

The `apps/workers` `marketing-voice.processor.ts` calls `tryCarrierBridgeDispatch` after dispatching an AI agent call for each lead row in a campaign batch.

---

## Mail Integrations (`integrations/mail/`)

8 provider adapters covering major email platforms. Each exports:

- `sendEmail(payload)` — send a single transactional or marketing email
- `validateConfig(config)` — verify API key is valid
- Provider-specific webhook signature verification helpers

| Package | Provider |
|---|---|
| `@brokeros/int-mail-ses` | AWS SES |
| `@brokeros/int-mail-sendgrid` | SendGrid |
| `@brokeros/int-mail-brevo` | Brevo (Sendinblue) |
| `@brokeros/int-mail-mailchimp` | Mailchimp |
| `@brokeros/int-mail-mailgun` | Mailgun |
| `@brokeros/int-mail-gmail` | Gmail SMTP |
| `@brokeros/int-mail-outlook` | Microsoft Outlook/Exchange |
| `@brokeros/int-mail-constant-contact` | Constant Contact |

---

## SMS Integrations (`integrations/sms/`)

9 provider adapters covering global and India-specific SMS gateways. Each exports:

- `sendSms(payload)` — dispatch a single SMS message
- `validateConfig(config)` — verify API key is valid
- Provider-specific DLR (delivery receipt) webhook parsers

| Package | Provider |
|---|---|
| `@brokeros/int-sms-twilio` | Twilio |
| `@brokeros/int-sms-gupshup` | Gupshup (India) |
| `@brokeros/int-sms-sinch` | Sinch |
| `@brokeros/int-sms-aws-sns` | AWS SNS |
| `@brokeros/int-sms-bird` | Bird (MessageBird) |
| `@brokeros/int-sms-infobip` | Infobip |
| `@brokeros/int-sms-plivo` | Plivo |
| `@brokeros/int-sms-telnyx` | Telnyx |
| `@brokeros/int-sms-vonage` | Vonage (Nexmo) |

---

## WhatsApp Integration (`@brokeros/int-whatsapp`)

The WhatsApp package manages direct communication with Meta's WhatsApp Cloud API:

- **`meta-api.ts`**: Core Cloud API client — send text, image, document, audio, and template messages.
- **`interactive.ts`**: Builders for interactive messages (button replies, list messages, quick replies).
- **`webhook-sign.ts`**: Validates incoming Meta `X-Hub-Signature-256` HMAC signatures and parses delivery/read receipts.
- **`ssrf-guard.ts`**: SSRF protection guard against media attachment URL exploits.
- **`encryption.ts`**: AES-GCM token encryption utilities for storing WABA credentials in the DB.
- **`phone-utils.ts`**: E.164 phone number normalization and retry phone number variants.

---

## Ads Integrations (`integrations/ads/`)

Ingestion adapters for paid advertising lead generation:

- **Google & YouTube Ads (`@brokeros/int-ads-google`)**: Ingests Google Search, Performance Max, and YouTube Lead Form Webhooks, verifies security headers, and transforms lead payloads into standard CRM lead records.
- **Meta & Instagram Ads (`@brokeros/int-ads-meta`)**: Handles Meta and Instagram Lead Ads webhooks, fetches full leadgen field values via Meta Graph API, and attributes source campaign/ad set metadata.

---

## Rules

1. **Never add provider credentials inside integration code.** All keys come from the root `.env` or are stored encrypted in the `VoiceAgentIntegration` / `EmailIntegration` / `SmsIntegration` DB records.
2. **Never import integrations directly in API controllers.** Route through the corresponding `*-integrations.service.ts` inside `apps/api/src/marketing/`.
3. **When adding a new provider**, create a new sub-directory inside the appropriate channel folder. Export its adapter from the channel's `index.ts`.
4. **Keep adapters thin.** SDK initialization, error normalization, and retry logic only. Business logic stays in `apps/api` and `apps/workers`.

---

## Testing

Integration tests verify payload mapping, header signing, and error handling across external services without making real billed network calls:

```bash
# Run all integration adapter unit tests:
pnpm test:packages

# Run specifically against integrations directory:
pnpm vitest run integrations
```

Test suites exist for:
- SendGrid transactional & marketing mail (`integrations/mail/sendgrid/__tests__/sendgrid-mail.test.ts`)
- Twilio SMS normalization & segment limits (`integrations/sms/twilio/__tests__/twilio-sms.test.ts`)
- Carrier Bridge PSTN routing (`integrations/voice/__tests__/carrier-bridge.test.ts`)
- WhatsApp Cloud API HMAC signatures & payloads (`integrations/whatsapp/__tests__/whatsapp-integration.test.ts`)
- Meta Lead Ads webhook ingestion (`integrations/ads/meta/__tests__/meta-ads.test.ts`)

---

<div align="center">

**[← Back to main README](../README.md)**

</div>
