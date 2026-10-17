# @brokeros/messaging

Centralized cross-channel message dispatch engine (SMS, Email, WhatsApp) providing atomic reservation, credential resolution, and provider dispatch across BrokerOS.

---

## Overview

`@brokeros/messaging` provides unified outbound messaging capabilities across `apps/api` (for immediate user replies in departmental inboxes) and `apps/workers` (for high-volume scheduled batch broadcasts).

It solves the critical double-send problem in high-concurrency environments by implementing atomic row reservation locks at the database level.

---

## Key Architectural Features

1. **Atomic Reservation Locking**:
   - Updates message status from `SCHEDULED` to `PROCESSING` in a conditional database query.
   - Prevents duplicate sends between background cron scanners and concurrent manual user actions.
2. **Dynamic Credential Resolution**:
   - Resolves provider credentials from the active database integration configuration.
   - Gracefully falls back to root environment variables when integrations are unconfigured or in development mode.
3. **Lazy Provider Adapter Registries**:
   - Instantiates and caches provider adapters (`Twilio`, `Gupshup`, `Sinch`, `SendGrid`, `Brevo`, `AWS SES`, `Meta Cloud API`) on first use.
4. **In-Place Lifecycle Tracking**:
   - Updates delivery status (`SENT`, `DELIVERED`, `FAILED`) and provider message IDs directly on the conversation message record, preserving audit trails without orphan records.

---

## Channel Support

- **SMS**: Dispatches via 9 SMS gateway adapters (`@brokeros/int-sms-*`), supporting international E.164 phone numbers and regional DLT templates.
- **Email**: Dispatches via 8 email adapters (`@brokeros/int-mail-*`), supporting HTML bodies, text fallbacks, attachments, and tracking headers.
- **WhatsApp**: Dispatches via `@brokeros/int-whatsapp`, supporting text messages, media attachments, and approved Meta templates.

---

## Exported Functions

- **`dispatchScheduledMessage(prisma, options)`**: Atomically claims and dispatches a scheduled message for any channel.
- **`dispatchDirectSms(prisma, options)`**: Immediate SMS send within an active conversation thread.
- **`dispatchDirectEmail(prisma, options)`**: Immediate Email send within an active conversation thread.
- **`dispatchDirectWhatsApp(prisma, options)`**: Immediate WhatsApp send with template or free-form text.

---

## Usage Example

```typescript
import { prismaClient } from '@brokeros/prisma';
import { dispatchScheduledMessage } from '@brokeros/messaging';

const result = await dispatchScheduledMessage(prismaClient, {
  channel: 'SMS',
  messageId: 'sms_msg_98765',
  triggeredBy: 'worker-cron',
});

if (result.success) {
  console.log('Message delivered:', result.providerMsgId);
}
```

---

## Testing

```bash
# Run messaging test suite:
pnpm test:packages
```
