# @brokeros/prisma

Prisma 7 ORM client, database schema, migrations, and seed scripts for BrokerOS.

---

## Overview

`@brokeros/prisma` contains the centralized PostgreSQL data model for BrokerOS. The generated Prisma Client is stored under `generated/client` and consumed across the monorepo via `@brokeros/prisma`.

---

## Core Commands (Run from Monorepo Root)

```bash
# Generate Prisma Client
pnpm db:generate

# Run migrations against active database
pnpm db:migrate

# Seed demo projects, users, units, and leads
pnpm db:seed

# Open Prisma Studio web inspector
pnpm --filter @brokeros/prisma db:studio

# Format schema.prisma file
pnpm --filter @brokeros/prisma db:format
```

---

## Structure

- **`schema.prisma`**: Single source of truth database model (Leads, Projects, Towers, Units, Bookings, Payments, TwoFactor MFA, Marketing Campaigns, Approvals, Chat, Better Auth).
- **`seed.ts`**: Comprehensive test database seeder creating full hierarchies for direct sales and CP partner networks.
- **`src/index.ts`**: Exports the singleton `prismaClient` instance and all generated model types.

---

## Key Database Laws

1. **The Inviolable Business Boundary**:
   BrokerOS strictly separates the **Brokerage** (internal direct sales) and **Channel Partner (CP)** networks using the boolean flag `Project.isCpProject`. Data must never be mixed across this boundary.
2. **Soft Deletes**:
   All sensitive models implement `deletedAt DateTime?`. Filter `deletedAt: null` in all query listing methods.
3. **Atomic Multi-Model Transactions**:
   All multi-model state changes (such as booking unit reservation, payment receipt creation, and commission allocation) must use `prisma.$transaction`.
4. **Dashboard Caching**:
   `DashboardCache` exists for caching heavy analytics computations. Check it before executing expensive raw aggregations in dashboard endpoints.
