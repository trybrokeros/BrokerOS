# AGENTS.md — apps/web/

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
    login/             ← Public page — no auth guard
    dashboard/
      layout.tsx       ← THE MAIN SHELL: role-based sidebar, NotificationBell, ChatWidget
                         Reads role from session, renders role-specific nav items
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
    leads/             ← Lead list, detail, follow-ups, call history UI
    inventory/         ← Project/unit browser UI
    brokers/           ← Broker management UI
    approvals/         ← Approval request UI
    marketing/
      shared/          ← Shared CSV/lead audience picker, stepper, preview modals
      components/      ← Shared marketing components (funnel charts, tables, cards)
      email/           ← Email components and 4-step wizard
      sms/             ← SMS components and 4-step wizard
      voice/           ← Voice components (composer studio) and 5-step wizard
      whatsapp/        ← WhatsApp components, template cards, and broadcast wizard
      ads/             ← Ad account connectors and lead form sync UI
      components/
        MarketingChannelGrid.tsx  ← Channel picker grid (Email / SMS / Voice)
        CampaignListTable.tsx     ← Unified broadcast table (all channels)
        UnifiedBroadcastsTable.tsx
        ProviderConfigCard.tsx    ← Generic provider connection card
        MergeTagSelector.tsx      ← Merge tag chip inserter (shared)
        CampaignFunnelAnalytics.tsx
        RecipientActivityTable.tsx
        AudienceSelector.tsx
        EmailTemplatePicker.tsx
        SmsCampaignListTable.tsx, SmsFunnelAnalytics.tsx
        SmsMessageEditor.tsx, SmsPhoneMockup.tsx
        SmsProviderConfigCard.tsx, SmsRecipientActivityTable.tsx
      email/
        components/
          EmailCampaignListTable.tsx
          EmailFunnelAnalytics.tsx
          EmailMergeTagSelector.tsx
          EmailProviderConfigCard.tsx
          EmailRecipientTable.tsx
          EmailTemplatePicker.tsx
        wizard/
          EmailStep1ProjectSender.tsx   ← Select project + sender identity + provider
          EmailStep2Audience.tsx        ← CSV upload or lead segment picker
          EmailStep3TemplateEditor.tsx  ← Rich HTML email template editor
          EmailStep4ReviewLaunch.tsx    ← Preview, schedule, launch
      sms/
        components/
          SmsCampaignListTable.tsx
          SmsFunnelAnalytics.tsx
          SmsMessageEditor.tsx
          SmsPhoneMockup.tsx
          SmsProviderConfigCard.tsx
          SmsRecipientTable.tsx
        wizard/
          SmsStep1ProjectGateway.tsx    ← Select project + SMS gateway
          SmsStep2Audience.tsx          ← CSV / lead audience picker
          SmsStep3MessageMockup.tsx     ← Message composer + phone mockup preview
          SmsStep4ReviewLaunch.tsx      ← Review, schedule, launch
      voice/
        components/
          InBrowserAudioPlayer.tsx      ← Web Speech API + backend TTS preview player
          VoiceCallLogsTable.tsx        ← Per-call outcome logs
          VoiceCampaignFunnel.tsx       ← Dialed/answered/converted funnel chart
          VoiceCampaignListTable.tsx    ← Campaign list with status badges
          VoiceModelSelector.tsx        ← LLM model picker cards
          VoicePickerModal.tsx          ← Voice persona browser modal (TTS catalog)
          VoiceProviderConfigCard.tsx   ← AI platform connection card
          composer/                     ← Studio subcomponents (see below)
            AgentPlatformSelector.tsx   ← Active AI voice platform grid picker + workspace agents
            StudioVapiSettings.tsx      ← Vapi STT, silence, speed, ambience, voicemail
            StudioRetellSettings.tsx    ← Retell emotion, ambient, backchannel, reminder
            StudioSarvamSettings.tsx    ← Sarvam Indic language, pace, duration
            LivePromptVariablePreview.tsx ← Real-time interpolation preview badge
            VoiceScriptEditor.tsx       ← Script templates, first message, prompt, tag chips
            index.ts                    ← Barrel export
        wizard/
          VoiceStep1ProjectSchedule.tsx  ← Select project + campaign schedule
          VoiceStep2Audience.tsx         ← CSV / lead audience picker
          VoiceStep3TelephonyCarrier.tsx ← PSTN carrier selection (Vobiz/Exotel/Twilio/Telnyx)
          VoiceStep4AgentComposer.tsx    ← AI agent composer COORDINATOR (~250 lines, delegates to composer/)
          VoiceStep5ReviewLaunch.tsx     ← Final review, test call, launch
    types.ts           ← All shared marketing TypeScript types (VoiceAgentIntegrationRecord, CsvLeadRow, etc.)
    index.ts           ← Feature barrel export

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
    auth-client.ts     ← Better Auth client (createAuthClient)
    utils.ts           ← Shared utility functions

  middleware.ts        ← Route protection (cookie check only)
  next.config.ts       ← Proxy rewrites: /api/proxy/* → BACKEND_URL/*, /api/marketing/* → BACKEND_URL/api/marketing/*
```

---

## Marketing Feature Conventions

- Each channel (email, sms, voice, whatsapp) follows the same structure: `components/` + `wizard/` (N-step wizard).
- Wizard steps are thin page-level components. Business logic lives in subcomponents in `components/`.
- `VoiceStep4AgentComposer.tsx` is a coordinator only — it must stay < 300 lines. All studio UI is in `components/composer/`.
- Shared audience picking and campaign stepping live in `features/marketing/shared/`.
- All shared TypeScript types for marketing live in `features/marketing/types.ts` — do not scatter them across wizard files.
- Merge tags, script templates, and provider catalogs are imported from `@brokeros/constants`. Never hardcode them in UI.

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

## Scripts

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
