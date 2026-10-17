import { PrismaClient } from "../generated/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Robust root .env loader:
// Guarantees DATABASE_URL is populated regardless of whether execution cwd is
// repo root, apps/api, apps/workers, apps/web, or packages/prisma.
if (!process.env.DATABASE_URL) {
  const candidateEnvPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../../../.env'),
  ];

  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      try {
        if (typeof process.loadEnvFile === 'function') {
          process.loadEnvFile(envPath);
        } else {
          dotenv.config({ path: envPath });
        }
      } catch {
        dotenv.config({ path: envPath });
      }
      if (process.env.DATABASE_URL) {
        break;
      }
    }
  }
}

import pg from 'pg';

const connectionString = (process.env.DATABASE_URL as string) || '';

// Configure resilient connection pool tailored for serverless PgBouncer (Neon):
// - Enables TCP keepAlive so cloud load balancers and PgBouncer don't silently drop idle sockets.
// - Sets reasonable pool limits to avoid exceeding serverless concurrency quotas.
// - Adds an idle pool client error handler to prevent unhandled 'Connection terminated unexpectedly' crashes.
const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err: any) => {
  // PgBouncer / Neon idle connection drops are normal in serverless architectures.
  // Catching this prevents unhandled 'Connection terminated unexpectedly' crashes.
  const msg = err?.message || String(err);
  if (
    msg.includes('Connection terminated') ||
    msg.includes('connection closed') ||
    err?.code === 'ECONNRESET'
  ) {
    // Expected transient idle drop; pool will automatically create a fresh client on next query.
    return;
  }
  console.warn('[PrismaPg Pool Warning]', msg);
});

const adapter = new PrismaPg(pool);

const isProduction = process.env.NODE_ENV === 'production';

export const prismaClient = new PrismaClient({
  adapter,
  log: isProduction ? ['error'] : ['error', 'warn'],
});

// Re-export PrismaClient class and ALL generated types/enums so that
// apps/api, apps/workers, integrations/ can all import from '@brokeros/prisma'
// instead of using a local generated path.
export { PrismaClient };
export * from "../generated/client/index.js";
