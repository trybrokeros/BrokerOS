# @brokeros/validators

Shared Zod validation schemas for forms, API endpoints, and data ingestion in BrokerOS.

---

## Overview

`@brokeros/validators` provides runtime validation schemas ensuring data integrity between client inputs (Web / Mobile) and server processing (API / Workers).

---

## Core Schemas & Enums

- **`PhoneSchema`**: E.164 international phone number format validation (`/^\+?[1-9]\d{6,14}$/`).
- **`LeadTemperatureEnum`**: `HOT`, `WARM`, `COLD`.
- **`LeadStatusEnum`**: `NEW`, `CONTACTED`, `FOLLOW_UP_SCHEDULED`, `SITE_VISIT_SCHEDULED`, `SITE_VISIT_COMPLETED`, `NEGOTIATION`, `BOOKED`, `LOST`.
- **`CreateLeadSchema`**: Real estate prospect ingestion schema (name, phone, temperature, budget, project ID, source, notes).
- **`CampaignChannelEnum`**: `EMAIL`, `SMS`, `VOICE`, `WHATSAPP`.
- **`AudienceSourceEnum`**: `CRM_DATABASE`, `CSV_UPLOAD`, `HYBRID`.
- **`CreateCampaignSchema`**: Omnichannel broadcast campaign validator (title, channel, project ID, isCpCampaign, audienceSource, scheduledAt, messageContent, scriptPrompt).
- **`SiteVisitVerificationSchema`**: GPS verification coordinates (latitude, longitude) and photo selfie URL checks.

---

## Inferred Types

- `CreateLeadInput`: Inferred from `CreateLeadSchema`
- `CreateCampaignInput`: Inferred from `CreateCampaignSchema`
- `SiteVisitVerificationInput`: Inferred from `SiteVisitVerificationSchema`

---

## Usage

```typescript
import {
  CreateLeadSchema,
  PhoneSchema,
  SiteVisitVerificationSchema,
  type CreateLeadInput,
} from '@brokeros/validators';

const result = CreateLeadSchema.safeParse(req.body);
if (!result.success) {
  throw new BadRequestException(result.error.format());
}
```

---

## Testing

```bash
# Run validator tests:
pnpm test:packages
```
