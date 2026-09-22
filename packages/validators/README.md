# @brokeros/validators

Shared Zod validation schemas for forms, API endpoints, and data ingestion in BrokerOS.

---

## Overview

`@brokeros/validators` provides runtime validation schemas ensuring data integrity between client inputs (Web / Mobile) and server processing (API / Workers).

## Core Schemas

- **`PhoneSchema`**: E.164 international phone number format validation.
- **`CreateLeadSchema`**: Real estate prospect ingestion schema (name, phone, temperature, budget, project).
- **`CreateCampaignSchema`**: Omnichannel broadcast campaign validator (Email, SMS, Voice, WhatsApp).
- **`SiteVisitVerificationSchema`**: GPS verification coordinates (latitude, longitude) and photo selfie URL checks.

## Usage

```typescript
import {
  CreateLeadSchema,
  PhoneSchema,
  SiteVisitVerificationSchema,
} from '@brokeros/validators';

const result = CreateLeadSchema.safeParse(req.body);
if (!result.success) {
  throw new BadRequestException(result.error.format());
}
```

## Testing

```bash
pnpm test:packages
```
