import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import path from 'path';
import { fileURLToPath } from 'url';

// Load root .env (for shared secrets) and local .env (for API configs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnv = path.resolve(__dirname, '../../../.env');
try {
  process.loadEnvFile(rootEnv);
} catch { }
try {
  process.loadEnvFile();
} catch { }

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth raw body parsing
    logger: isProduction
      ? ['error', 'warn']
      : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ── Security Headers (Helmet) ─────────────────────────────────────────────
  // helmet() sets 15 HTTP security headers in one call.
  // Tuning notes:
  //   - crossOriginOpenerPolicy: false — required for Socket.IO (chat, voice,
  //     notifications, WhatsApp realtime) to work across tabs.
  //   - contentSecurityPolicy: false — the NestJS API is a pure JSON API with
  //     no HTML pages, so CSP is enforced at the Next.js layer (next.config.ts).
  //     If you ever add Swagger UI, set it to report-only first and tune from there.
  app.use(
    helmet({
      crossOriginOpenerPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // Explicit CORS — only allow known origins, never wildcard.
  // Set ALLOWED_ORIGINS in root .env as a comma-separated list:
  //   Dev:  ALLOWED_ORIGINS=http://localhost:3000,exp://192.168.0.105:8081
  //   Prod: ALLOWED_ORIGINS=https://app.brokeros.com,https://crm.brokeros.com
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (server-to-server, mobile app, curl)
      if (!requestOrigin) return callback(null, true);
      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${requestOrigin}' is not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Required for session cookies (Better Auth)
  });

  await app.listen(process.env.PORT ?? 3333, '0.0.0.0');
}
bootstrap();
