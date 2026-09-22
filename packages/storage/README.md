# @brokeros/storage

Centralized Vercel Blob cloud storage wrappers for BrokerOS.

---

## Overview

`@brokeros/storage` provides standard file upload and media management wrappers across the monorepo, used for uploading property brochures, unit floor plans, site visit GPS verification selfies, and campaign creative assets.

## Usage

```typescript
import { uploadFileToBlob } from '@brokeros/storage';

const publicUrl = await uploadFileToBlob(buffer, 'project-brochure.pdf');
```

## Environment

Requires `BLOB_READ_WRITE_TOKEN` configured in root `/.env`.
