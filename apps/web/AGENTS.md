# AGENTS.md - apps/web/

---

**Tailwind v4 note:** This project uses Tailwind CSS v4, NOT v3. The config format, plugin API, and some utility names differ. Check `postcss.config.mjs` and `app/globals.css` before writing any Tailwind classes.

---

## Directory Structure

```
apps/web/
  app/
    layout.tsx         ← Root layout (HTML shell, fonts)
    globals.css        ← Global CSS + Tailwind v4 imports
    page.tsx           ← Root redirect (sends to /dashboard or /login)
    login/             ← Public page with MFA TOTP verification challenge
    dashboard/
      layout.tsx       ← THE MAIN SHELL: role-based sidebar, NotificationBell, ChatWidget
                         Reads role from session, renders role-specific nav items
      page.tsx         ← Dashboard landing page with role-based routing
      inbox/           ← UNIFIED DEPARTMENTAL INBOX (accessible to all 12 roles)
        page.tsx       ← Root inbox redirect
        whatsapp/      ← WhatsApp departmental conversation view
        sms/           ← SMS departmental conversation view
        email/         ← Email departmental conversation view
      [role-slug]/     ← One sub-dir per role (e.g., sales-executive/, pre-sales/, etc.)
      marketing/
        email/
          campaigns/[id]/   ← Email campaign detail + analytics
          campaigns/new/    ← 4-step email campaign wizard
          settings/         ← Email provider integrations settings
        sms/
          campaigns/[id]/   ← SMS campaign detail + analytics
          campaigns/new/    ← 4-step SMS campaign wizard
          settings/         ← SMS gateway integrations settings
        voice/
          campaigns/[id]/   ← Voice campaign detail + analytics
          campaigns/new/    ← 5-step voice campaign wizard
          settings/         ← AI voice platform integrations settings
        whatsapp/
          campaigns/[id]/   ← WhatsApp campaign detail + broadcast analytics
          campaigns/new/    ← WhatsApp broadcast wizard
          templates/        ← Meta template syncer and viewer
          settings/         ← Cloud API credentials and webhook verification
        ads/                ← Ad platform integrations and lead form mapping

  features/
    leads/             ← Lead list, detail, follow-ups, call history UI (canonical barrel export)
    inventory/         ← Project/unit browser UI (canonical barrel export)
    brokers/           ← Broker management UI (canonical barrel export)
    approvals/         ← Approval request UI (canonical barrel export)
    security/          ← AdminSecuritySettings.tsx (MFA / 2FA TOTP configuration & recovery codes)
    marketing/
      shared/          ← Shared CSV/lead audience picker, stepper, preview modals
      components/      ← Shared marketing components (funnel charts, tables, cards)
      email/           ← Email components, 4-step wizard, departmental & team inboxes
      sms/             ← SMS components, 4-step wizard, phone mockup, departmental & team inboxes
      voice/           ← Voice components (composer studio) and 5-step wizard
      whatsapp/        ← WhatsApp components, template cards, broadcast wizard, team inbox
      ads/             ← Ad account connectors and lead form sync UI

  components/
    analytics/         ← Recharts-based chart components
    chat/              ← ChatWidget (Socket.IO driven)
    commissions/       ← Commission display components
    dashboard/         ← Dashboard card/widget components
    leads/             ← Lead-specific shared components
    notifications/     ← NotificationBell component
    payments/          ← Payment display components
    ui/                ← Primitive UI elements (Button, Badge, etc.)

  lib/
    auth-client.ts     ← Better Auth client with twoFactorClient() plugin
    api-client.ts      ← Type-safe ApiClient with error normalization and auth headers
    inbox.ts           ← Unified inbox state and communication utilities
    inbox-scope.ts     ← Departmental inbox scope resolver for 12 CRM roles
    utils.ts           ← Shared utility functions

  proxy.ts             ← Next.js 16 route protection and role-slug verification
  next.config.ts       ← Proxy rewrites, image remote patterns, package transpilation
```

---

## Route Protection via Next.js 16 Proxy

In accordance with Next.js 16 conventions, route protection and workspace authorization are handled in `apps/web/proxy.ts`:

- Checks Better Auth session cookies (`better-auth.session_token`).
- Validates the user's role against the URL role slug (e.g. `/dashboard/sales-executive`, `/dashboard/admin`, `/dashboard/finance`).
- Redirects unauthorized users directly to their designated home dashboard or `/login`.
- Protects the unified `/dashboard/inbox` routes while allowing all authenticated CRM roles access to their department-filtered queues.

---

## Marketing & Inbox Conventions

- **Unified Departmental Inbox**:
  - Located at `app/dashboard/inbox/` (with tabs/sub-routes for `email/`, `sms/`, `whatsapp/`).
  - Scoped dynamically by user department via `lib/inbox-scope.ts`.
  - Pre-sales, Sales, Post-sales, Sourcing, Closing, and Management roles access their prospective leads without switching accounts.
- **Marketing Feature Architecture**:
  - Each channel (email, sms, voice, whatsapp) follows the structure: `components/` + `wizard/` (N-step wizard).
  - Wizard steps are thin page-level components; business logic lives in subcomponents in `components/`.
  - `VoiceStep4AgentComposer.tsx` is a coordinator only (< 300 lines). Studio UI is in `components/composer/`.
  - Shared audience picking lives in `features/marketing/shared/`.
  - Shared types live in `features/marketing/types.ts`.
  - Merge tags and catalogs are imported from `@brokeros/constants`.

---

## Skills

You **MUST** consult the appropriate skill before making changes, based on the task you are doing:

- **General UI & Components**: If you are asked to build or modify UI, read:
  `.agents/skills/better-ui/SKILL.md`
- **Interface & UX Design**: For high-level interface design and component composition, read:
  `.agents/skills/better-interface/SKILL.md`
- **Layouts & Spacing**: When structuring page layouts or modifying grid/flex structures, read:
  `.agents/skills/better-layout/SKILL.md`
- **Colors & Theming**: When applying colors or modifying the theme, read:
  `.agents/skills/better-colors/SKILL.md`
- **Typography**: When working with fonts, text sizes, or text styling, read:
  `.agents/skills/better-typography/SKILL.md`
- **Accessibility (a11y)**: When ensuring components are accessible (ARIA, screen readers, keyboard navigation), read:
  `.agents/skills/better-accessibility/SKILL.md`
- **Shadcn UI**: When adding or modifying `shadcn/ui` components, read:
  `.agents/skills/shadcn/SKILL.md`
- **Frontend Testing**: When writing or updating tests for the frontend, read:
  `.agents/skills/write-frontend-tests/SKILL.md`

---

## Scripts & Testing

> **CRITICAL SCRIPTING RULE:** If you are creating a new utility, migration, or maintenance script, DO NOT put it inside `apps/web/`. Create it in the monorepo root at `scripts/` and execute it from the root using `pnpm run script scripts/your-script.ts`.

Run from repository root:

```bash
pnpm dev:web                     # Next.js dev server (port 3000) (or pnpm --filter @brokeros/web dev)
pnpm --filter @brokeros/web build  # production build (next build)
pnpm --filter @brokeros/web exec next build  # full verified production build
pnpm --filter @brokeros/web start  # serve production build
pnpm --filter @brokeros/web lint   # ESLint

# Playwright E2E Tests:
pnpm test:web:e2e                 # Runs all Playwright specs in apps/web/e2e/specs/
pnpm --filter @brokeros/web exec playwright install chromium # Install headless browser
```
