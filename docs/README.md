# BrokerOS Enterprise Documentation

Welcome to the official documentation repository for **BrokerOS** - the enterprise real estate CRM and AI marketing engine.

## Local Development Setup

1. **Install Mintlify CLI** globally:
   ```bash
   npm i -g mint
   ```
2. **Navigate to docs** or run from repo root:
   ```bash
   mint dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser to view the documentation live with hot reload.

## Documentation Structure

BrokerOS documentation is organized into 7 core pillars:

- **Overview**: System fundamentals, architecture, and the `isCpProject` business boundary.
- **Brokerage CRM**: Direct sales operations, lead assignment, GPS site visits, and booking lifecycles.
- **Channel Partner (CP)**: External broker network, sourcing/closing managers, and commission settlements.
- **Marketing Suite**: AI Voice campaigns, WhatsApp Cloud API, bulk SMS, HTML email builder, and Meta/Google ad sync.
- **Integrations**: Telephony carriers (Vobiz, Exotel, Twilio, Telnyx), AI voice platforms (Vapi, Retell, Sarvam, Bolna), and messaging gateways.
- **Mobile App**: Native Expo React Native app, background call recording, GPS verification, and telecaller queues.
- **Developer & API Reference**: Full monorepo codebase architecture and comprehensive REST endpoints.

## Contributing & Agent Guidelines

When writing or updating documentation pages, please adhere strictly to [AGENTS.md](./AGENTS.md).
