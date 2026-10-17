# @brokeros/auto-dialer (Native Android Module)

Custom native Android telephony and background call synchronization module for the BrokerOS mobile application.

---

## Overview

The `auto-dialer` module bridges Android's native telephony hardware directly into the React Native environment, enabling pre-sales executives to work through high-volume daily cold call queues with automated dialing, background call recording, duration tracking, and automatic outcome logging.

---

## Core Capabilities

- **Automated Sequential Dialing**: Dispatches `android.intent.action.CALL` intents directly from the JavaScript lead queue without manual keypad interaction.
- **Telephony State Listener**: Binds to Android `PhoneStateListener` to monitor `CALL_STATE_RINGING`, `CALL_STATE_OFFHOOK`, and `CALL_STATE_IDLE`.
- **Duration & Timestamp Calculation**: Precisely records call pickup times, talk durations, and disconnection events.
- **Background Uploads (`CallUploadWorker.kt`)**: Leverages Android `WorkManager` to buffer call recordings and telemetry in local SQLite storage, guaranteeing upload to the CRM backend even if the app UI is backgrounded or network connectivity fluctuates.
- **Hardware-Protected Auth**: Uses session credentials extracted from Android Keystore-backed `expo-secure-store` to authenticate upload requests with the NestJS API.

---

## Android Permissions Required

The module requires the following Android permissions declared in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

---

## Architecture & Integration

- **Native Implementation**: Kotlin / Java sources located under `android/src/main/java/`.
- **JS Bridge**: Typed JavaScript wrapper in `src/index.ts`.
- **React Hook**: Consumed in React Native screens via `hooks/useCallStatus.ts`.
- **Local Dependency**: Installed in `apps/mobile/package.json` via `"auto-dialer": "file:modules/auto-dialer"`.
