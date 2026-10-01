import { PrismaClient } from "../generated/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

import path from 'path';
import { fileURLToPath } from 'url';

// Load root .env if available, regardless of where this script is executed from
const rootEnv = path.resolve(process.cwd(), '.env');
try { process.loadEnvFile(rootEnv); } catch {}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

export const prismaClient = new PrismaClient({ adapter });

// Re-export PrismaClient class and ALL generated types/enums so that
// apps/api, apps/workers, integrations/ can all import from '@brokeros/prisma'
// instead of using a local generated path.
export { PrismaClient };
export * from "../generated/client/index.js";
