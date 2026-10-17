# @brokeros/constants

Shared, pure TypeScript constants, enums, UI palettes, and normalizer utilities across the BrokerOS monorepo.

---

## Overview

`@brokeros/constants` provides centralized domain values used across `apps/api`, `apps/web`, `apps/mobile`, and `apps/workers`. It contains zero framework dependencies and has no side effects.

---

## Module Structure

- **`roles.ts`**:
  - The 14 official system roles (`ROLES`, `ROLE_CODES`).
  - Human-readable role labels (`ROLE_LABELS`).
  - Supervisory bypass and department boundary helpers (`isCpRole`, `isBrokerageRole`, `isManagementRole`).
- **`crm/`**:
  - `lead.ts`: Lead statuses (`LEAD_STATUS_CONFIG`), temperatures (`LEAD_TEMPERATURE_CONFIG`), and source types.
  - `inventory.ts`: Unit availability statuses (`UNIT_STATUS_CONFIG`) and project status configurations.
  - `booking.ts`: Booking lifecycle stages (`BOOKING_STATUS_CONFIG`), payment milestone statuses, and loan cases.
  - `broker.ts`: Broker network statuses (`BROKER_STATUS_CONFIG`) and commission settlement stages.
  - `approvals.ts`: Multi-step approval statuses (`APPROVAL_STATUS_CONFIG`), site visit states, and discount tiers.
- **`utils/phone.ts`**: Canonical phone normalization and sanitization utilities (`normalizePhoneNumber`, `sanitizePhoneForMeta`, `normalizePhone`, `phonesMatch`, `isValidE164`, `phoneVariants`).
- **`campaign.ts`**: Unified marketing campaign statuses, channel definitions, and budget bounds.
- **`email.ts`**: Email provider catalogs, merge tags, default templates, and provider throttle limits.
- **`sms.ts`**: SMS gateway configurations, GSM 7-bit character sets, segment calculators, and DLT templates.
- **`voice/`**:
  - `agents.ts`: Catalogs for 8 AI voice platforms (Vapi, Retell, Sarvam, Bolna, ElevenLabs, LiveKit, OpenAI Realtime, Pipecat).
  - `telephony.ts`: PSTN carrier settings (Vobiz, Exotel, Twilio, Telnyx).
  - `scripts.ts`: Real estate sales scripts, objections handling, and persona prompts.
  - `normalizer.ts`: Dynamic variable interpolation and lead data formatting (`normalizeVoiceLeadVariables`).
- **`whatsapp/`**: Template categories, message formats, and Cloud API error codes.
- **`ads/`**: Ad channel mappings (Google, Meta, Instagram, YouTube) and attribution tags.
- **`export.ts`**: RFC-4180 CSV lead formatter (`formatLeadsToCsv`) and standalone responsive HTML report generator (`generateAnalyticsHtmlReport`).

---

## Usage

```typescript
import {
  ROLES,
  LEAD_STATUS_CONFIG,
  UNIT_STATUS_CONFIG,
  SMS_PROVIDER_THROTTLE_LIMITS,
  calculateSmsSegments,
  VOICE_AGENT_PLATFORMS,
  normalizeVoiceLeadVariables,
  normalizePhoneNumber,
} from '@brokeros/constants';
```

---

## Testing

```bash
# Run constants test suite:
pnpm test:packages
```
