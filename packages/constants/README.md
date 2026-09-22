# @brokeros/constants

Shared, pure TypeScript constants, enums, UI colors, and normalizer utilities across the BrokerOS monorepo.

---

## Overview

`@brokeros/constants` provides centralized domain values used across `apps/api`, `apps/web`, `apps/mobile`, and `apps/workers`. It contains zero framework dependencies and has no side effects.

## Module Structure

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

## Usage

```typescript
import {
  SMS_PROVIDER_THROTTLE_LIMITS,
  calculateSmsSegments,
  VOICE_AGENT_PLATFORMS,
  normalizeVoiceLeadVariables,
} from '@brokeros/constants';
```

## Testing

```bash
# Run constants test suite:
pnpm test:packages
```
