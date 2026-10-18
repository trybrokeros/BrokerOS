import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './lib/database/prisma.module.js';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth.js';
import { AuthModule } from './auth/auth.module.js';
import { SignInHook } from './auth/sign-in.hook.js';
import { LeadsModule } from './leads/leads.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ApprovalsModule } from './approvals/approvals.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { BrokersModule } from './brokers/brokers.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ChatModule } from './chat/chat.module.js';
import { MarketingModule } from './marketing/marketing.module.js';
import { CrmTelephonyModule } from './crm-telephony/crm-telephony.module.js';

import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from './auth/roles.guard.js';
import { GlobalExceptionFilter } from './lib/filters/global-exception.filter.js';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),

    // ── Rate Limiting ─────────────────────────────────────────────────────────
    // Global default: 60 requests per minute per IP across all routes.
    // Sensitive routes (login) override this with tighter limits via @Throttle().
    // Storage: in-memory (single instance). For horizontal scaling, swap to
    // ThrottlerStorageRedisService pointing at your existing Redis instance.
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60_000,  // 1 minute window (ms)
        limit: 60,    // 60 requests per window
      },
    ]),
    BetterAuthModule.forRoot({
      auth,
      bodyParser: {
        json: { enabled: true },
        urlencoded: { enabled: true, extended: true },
      },
    }),
    AuthModule,
    LeadsModule,
    BookingsModule,
    PaymentsModule,
    DashboardModule,
    ApprovalsModule,
    InventoryModule,
    BrokersModule,
    NotificationsModule,
    ChatModule,
    MarketingModule,
    CrmTelephonyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SignInHook,
    // 1st guard: validates Better Auth session
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // 2nd guard: enforces rate limits (runs after auth)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // 3rd guard: enforces least-privilege role scoping whenever @Roles(...) is specified
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global filter: intercepts unhandled exceptions, logs them server-side, and masks stack traces in production
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
