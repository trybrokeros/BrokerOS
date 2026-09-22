# @brokeros/types

Shared TypeScript type definitions and interfaces for BrokerOS applications and packages.

---

## Overview

`@brokeros/types` acts as the single source of truth for contract types, DTO structures, and channel options shared between the NestJS backend, Next.js frontend, Expo mobile app, and background workers.

## Modules

- **`common.ts`**: Standard API response wrappers, pagination types, and user identity shapes.
- **`email.ts`**: Email campaign payloads, provider options, recipient rows, and deliverability metrics.
- **`sms.ts`**: SMS message payloads, gateway options, scientific notation phone numbers, and delivery statuses.
- **`voice/`**:
  - `agent.ts`: AI voice agent configs, persona parameters, and speech engine options.
  - `telephony.ts`: PSTN carrier dispatch credentials and call routing data.
  - `options.ts`: Voice campaign creation DTOs and filters.
  - `streaming.ts`: Real-time WebSocket media stream and bidirectional audio event types.
- **`whatsapp/`**: WABA message payloads, template component structures, and webhook event interfaces.
- **`ads/`**: Meta, Instagram, Google, and YouTube ad campaign schemas and lead form payload types.

## Usage

```typescript
import type {
  VoiceCampaignCreationOptions,
  SmsCampaignPayload,
  EmailRecipientRecord,
  AdLeadWebhookPayload,
} from '@brokeros/types';
```
