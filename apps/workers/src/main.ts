/**
 * apps/workers — BrokerOS Async Job Workers
 *
 * This app handles all background/async work:
 * - SMS & WhatsApp blast jobs (Gupshup, WATI)
 * - Real estate portal sync (99acres, MagicBricks, Housing.com)
 * - AI voice agent callbacks (Serveom AI, Vona AI, 11Labs)
 * - Email campaigns (Amazon SES, MailChimp)
 * - Payment webhook processing (Razorpay, PayU)
 *
 * Stack: NestJS Microservice + BullMQ + Redis
 * Status: SKELETON — not yet functional. Add BullMQ when ready.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { NestFactory } from '@nestjs/core';
import { WorkersModule } from './workers.module.js';

// Load root .env (for shared secrets & API_PUBLIC_URL) and local .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnv = path.resolve(__dirname, '../../../.env');
try { process.loadEnvFile(rootEnv); } catch { }
try { process.loadEnvFile(); } catch { }

async function bootstrap() {
  const app = await NestFactory.create(WorkersModule);
  const port = process.env.PORT ?? 3334;
  await app.listen(port, '0.0.0.0');
  console.log(`Workers app running on port ${port}`);
}

bootstrap();
