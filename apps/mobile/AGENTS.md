# AGENTS.md - apps/mobile/

---

## Directory Structure

```
apps/mobile/
  app.config.ts          ← Dynamic Expo config (reads EXPO_PUBLIC_* vars at build time)
  app/
    _layout.tsx        ← Root layout (expo-router entry, font loading, auth redirect)
    admin.tsx          ← Admin-specific entry
    (auth)/            ← Route group: login/signup screens (no auth required)
      sign-in.tsx
      sign-up.tsx
    (dashboard)/
      _layout.tsx      ← THE MAIN SHELL: role detection, tab bar, socket init, push token registration, auto-dialer start
      index.tsx        ← Redirects to role-specific home
      notifications.tsx
      chat/
      admin/           ← Flattened screen routes across all 14 role directories
      business-manager/
      channel-partner/
      closing-manager/
      director/
      finance/
      post-sales/
      post-sales-manager/
      pre-sales/
      pre-sales-manager/
      sales/
      sales-executive/
      sales-manager/
      sourcing-manager/
  components/          ← Modularized React Native components
    leads/             ← Dedicated directories (list/, profile/, timeline/, media/, site-visit/)
    inventory/         ← Dedicated directories (towers/, documents/, UnitGrid)
    brokers/           ← Dedicated directories (meetings/, profile/, tables/)
    dashboard/         ← Role-tailored metric cards and charts
    ui/                ← Buttons, inputs, headers, badges
  constants/           ← App-wide colors, themes, navigation constants
  hooks/
    useCallStatus.ts   ← Syncs auto-dialer call events and telemetry to backend
  lib/
    auth-client.ts     ← Better Auth expo client (createAuthClient + expoClient plugin)
    SocketContext.tsx  ← Socket context + useSocket() hook
    location-tracking.ts ← GPS tracking utilities for site visit verification
  modules/
    auto-dialer/       ← Custom native Android telephony module (local package)
  plugins/             ← Custom Expo config plugins (withCmakeShortPath.js)
  assets/              ← Images, fonts, icons
  google-services.json ← Firebase config - gitignored, required for push notifications
```

---

## Flattened Route Conventions

To maintain predictable navigation and fast deep linking via Expo Router 6:
- All role workspaces in `(dashboard)/` use flattened screen routes (e.g. `(dashboard)/sales-executive/leads.tsx`, `(dashboard)/sourcing-manager/meetings.tsx`).
- Subcomponents must NOT be placed directly inside `app/` as routes. Keep them in `components/<feature>/`.
- Screens import canonical types from `@brokeros/types` and constants from `@brokeros/constants`.

---

## Styling - NativeWind

- Use `className` prop with Tailwind v3 class names.
- Do not mix NativeWind and `StyleSheet` in the same component unless absolutely necessary.
- Custom colors are in `tailwind.config.js`. Check there before adding new color values.
- `global.css` is the NativeWind entry point. Do not import Tailwind from multiple places.

---

## Android Only & Native Telephony

- This project is configured strictly for **Android** (`android/` native directory).
- **Auto-Dialer & Telephony**:
  - Implemented as a native module in `modules/auto-dialer/`.
  - Android background service (`CallUploadWorker.kt`) uploads audio recordings and metadata even if the UI thread is paused.
  - Native permissions required: `READ_PHONE_STATE`, `CALL_PHONE`, `RECORD_AUDIO`, `POST_NOTIFICATIONS`.
- Build: `npx expo run:android`. OTA updates via EAS (`eas.json`).

---

## Skills

You **MUST** consult the appropriate skill before making changes, based on the task you are doing:

- **Routing & Navigation**: If the task involves screens, navigation, deep links, `<Link>`, `useRouter`, tabs, or `_layout.tsx`, read:
  `.agents/skills/expo-router-expert/SKILL.md`
- **General UI & Components**: If you are asked to build or modify UI components, surfaces, icons, or touch interactions, read:
  `.agents/skills/mobile-ui/SKILL.md`
- **UX Patterns & Interaction Architecture**: For Floating Action Buttons (FAB), bottom sheets, pull-to-refresh feeds, and empty states, read:
  `.agents/skills/mobile-interface/SKILL.md`
- **Layouts & Spacing**: When structuring screens with Flexbox, `SafeAreaView`, `FlatList`, `ScrollView`, or `KeyboardAvoidingView`, read:
  `.agents/skills/mobile-layout/SKILL.md`
- **Colors & Theming**: When applying colors, NativeWind classes, or dark mode theming, read:
  `.agents/skills/mobile-colors/SKILL.md`
- **Typography**: When working with `<Text>` components, font sizes, `numberOfLines`, or font scaling, read:
  `.agents/skills/mobile-typography/SKILL.md`
- **Animations**: When adding transitions, micro-interactions, spring physics, or Reanimated, read:
  `.agents/skills/mobile-animations/SKILL.md`
- **Accessibility (a11y)**: When ensuring components work with TalkBack, VoiceOver, or touch target sizes, read:
  `.agents/skills/mobile-accessibility/SKILL.md`
- **Testing**: When writing or updating Jest unit tests, Maestro E2E flows, or native JUnit tests, read:
  `.agents/skills/write-mobile-tests/SKILL.md`

---

## Scripts & Testing

> **CRITICAL SCRIPTING RULE:** If you are creating a new utility, migration, or maintenance script, DO NOT put it inside `apps/mobile/`. Create it in the monorepo root at `scripts/` and execute it from the root using `pnpm run script scripts/your-script.ts`.

Run from `apps/mobile/` directory (or use `pnpm --filter @brokeros/mobile <cmd>` from root):

```bash
npx expo start           # Expo dev server (Metro bundler)
npx expo run:android     # build + run on Android device/emulator
npm run lint             # ESLint (expo lint)

# Maestro Native E2E Tests (run from monorepo root):
pnpm test:mobile:e2e     # Executes scripts/test-mobile-e2e.ts (checks Maestro + runs apps/mobile/e2e/)
```
