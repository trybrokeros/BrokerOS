# @brokeros/storage

Centralized Vercel Blob cloud storage wrappers for BrokerOS.

---

## Overview

`@brokeros/storage` provides standard file upload and media management wrappers across the monorepo, used for uploading property brochures, unit floor plans, site visit GPS verification selfies, call recordings, and campaign creative assets.

---

## Exported Functions & Types

- **`uploadFileToBlob(fileBuffer, fileName, token?)`**: Uploads binary data to Vercel Blob and returns the public CDN URL.
- **`fetchBlobBuffer(url, token?)`**: Securely fetches remote blob content and returns the raw `Buffer` and `contentType`.
- **`BlobBufferResult`**: Type definition containing `{ buffer: Buffer; contentType: string }`.

---

## Usage

```typescript
import { uploadFileToBlob, fetchBlobBuffer } from '@brokeros/storage';

// Upload asset
const publicUrl = await uploadFileToBlob(buffer, 'project-brochure.pdf');

// Fetch asset
const { buffer: fileBuffer, contentType } = await fetchBlobBuffer(publicUrl);
```

---

## Environment

Requires `BLOB_READ_WRITE_TOKEN` configured in root `/.env`.
