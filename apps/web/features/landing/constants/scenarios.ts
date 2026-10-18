import {
  ShieldCheck,
  Compass,
  MapPin,
  DollarSign,
  Radio,
  Database,
  PhoneCall,
  MessageSquare,
  Bot,
  Inbox,
  Building2,
  Users,
  Smartphone,
  Layers,
  Sparkles,
} from "lucide-react";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export type CockpitTabId =
  | "executive"
  | "omnichannel"
  | "inbox"
  | "field-sales"
  | "cp-network"
  | "inventory";

export interface CockpitTabConfig {
  id: CockpitTabId;
  label: string;
  badge: string;
  badgeColor: string;
  headline: string;
  subheadline: string;
  stat1: { label: string; value: string; change: string; positive?: boolean };
  stat2: { label: string; value: string; change: string; positive?: boolean };
  stat3: { label: string; value: string; change: string; positive?: boolean };
}

export const COCKPIT_TABS: CockpitTabConfig[] = [
  {
    id: "executive",
    label: "Executive Cockpit",
    badge: "14-Role Universal Oversight",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    headline: "Unified revenue velocity & quota attainment across both business lines",
    subheadline:
      "Universal supervisory bypass for Directors and Admins. Monitor company-wide sales pace, quarterly target absorption, hot deal pipeline, and department conversion bottlenecks in real time.",
    stat1: { label: "Quarterly GMV", value: "₹148.5 Cr", change: "+31.4% YoY", positive: true },
    stat2: { label: "Target Quota Pace", value: "84.2%", change: "+6.8% vs plan", positive: true },
    stat3: { label: "Avg Cycle Length", value: "12.8 Days", change: "-2.4 days faster", positive: true },
  },
  {
    id: "omnichannel",
    label: "AI Voice & Marketing",
    badge: "Omnichannel Suite",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200/80",
    headline: "Autonomous AI voice agents, Meta WhatsApp Cloud API & broadcast engines",
    subheadline:
      "Dial thousands of leads with sub-second latency via carrier-bridged AI voice agents (Vapi, Retell, Twilio). Deliver rich Meta-verified WhatsApp interactive campaigns with 98%+ open rates.",
    stat1: { label: "AI Voice Minutes", value: "14,280 min", change: "99.2% connection", positive: true },
    stat2: { label: "WhatsApp Open Rate", value: "98.4%", change: "+42% vs email", positive: true },
    stat3: { label: "Instant Lead Sync", value: "< 240 ms", change: "Meta / Google Ads", positive: true },
  },
  {
    id: "inbox",
    label: "Department Inbox",
    badge: "Zero-Leakage Multi-Channel",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    headline: "One synchronized inbox for WhatsApp, SMS, and Email scoped by role",
    subheadline:
      "All buyer and broker interactions across WhatsApp, SMS, and Email flow into a unified timeline. Dynamically filtered by department so Pre-Sales, Sales, and Sourcing reps never cross boundaries.",
    stat1: { label: "Open Conversations", value: "184 active", change: "100% assigned", positive: true },
    stat2: { label: "Avg First Response", value: "3.2 min", change: "-58% reduction", positive: true },
    stat3: { label: "Cross-Channel Sync", value: "3 Channels", change: "WA + SMS + Mail", positive: true },
  },
  {
    id: "field-sales",
    label: "Sales & Site Visits",
    badge: "Internal Sales (isCpProject = false)",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200/80",
    headline: "GPS-verified field check-ins and governed price negotiation workflows",
    subheadline:
      "Eliminate phantom site visits with tamper-proof GPS coordinates and mandatory field selfies. Hold units in real time and enforce manager sign-off on discounts prior to booking lock.",
    stat1: { label: "Site Visits Verified", value: "54 this week", change: "100% GPS matched", positive: true },
    stat2: { label: "Approved Discounts", value: "₹42.5 L", change: "Manager governed", positive: true },
    stat3: { label: "Inventory Reserved", value: "16 Units", change: "Live sync lock", positive: true },
  },
  {
    id: "cp-network",
    label: "Channel Partner Network",
    badge: "External Brokerage (isCpProject = true)",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200/80",
    headline: "Dedicated external broker allocations & multi-tiered payout calculations",
    subheadline:
      "Strict data boundary preventing external brokers from viewing internal direct sales inventory. Automated tier slabs (2.0% - 3.5%), TDS/GST deductions, and finance settlement approvals.",
    stat1: { label: "Active CP Brokers", value: "342 registered", change: "+24 this month", positive: true },
    stat2: { label: "CP GMV Contribution", value: "₹52.3 Cr", change: "35% of total", positive: true },
    stat3: { label: "Avg Settlement Turn", value: "48 Hours", change: "Automated batch", positive: true },
  },
  {
    id: "inventory",
    label: "Unit Inventory & Stock",
    badge: "Real-Time Unit Guard",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200/80",
    headline: "Live unit par-level inventory, tower mapping, and double-booking guards",
    subheadline:
      "Wharf-inspired inventory visualizer displaying available, held, and sold units against par thresholds. Atomic PostgreSQL transaction locks prevent concurrent booking conflicts.",
    stat1: { label: "Total Active Units", value: "480 units", change: "Across 4 towers", positive: true },
    stat2: { label: "Absorption Rate", value: "68.4%", change: "+12% this quarter", positive: true },
    stat3: { label: "Double-Booking Risk", value: "0.00%", change: "Prisma locks", positive: true },
  },
];

export const MARKETING_CHANNELS = [
  {
    icon: PhoneCall,
    badge: "Autonomous Telephony",
    title: "AI Voice Agents & Carrier Bridge",
    description:
      "Deploy natural, latency-free conversational AI agents (Vapi, Retell, Sarvam, Bolna) coupled with PSTN carrier bridging (Twilio, Exotel, Vobiz, Telnyx). Auto-qualify cold leads, score intent, and trigger instant callbacks.",
    stats: "Sub-400ms latency · Full call recording & sentiment scoring",
    accent: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    icon: MessageSquare,
    badge: "Official Meta Cloud API",
    title: "WhatsApp Cloud API Suite",
    description:
      "Verified green-badge messaging with pre-approved interactive templates, catalog carousels, automated bot triage flows, and bulk broadcast scheduling directly linked to CRM lead status.",
    stats: "98.4% open rate · Rich media & quick-reply buttons",
    accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    icon: Inbox,
    badge: "Department Scoped",
    title: "Unified Departmental Inbox",
    description:
      "A consolidated communication hub for all 14 roles. WhatsApp chats, SMS threads, and customer emails exist on a single timeline, scoped dynamically so internal sales never see CP conversations.",
    stats: "Multi-channel timeline · Instant sentiment analysis",
    accent: "text-sky-600 bg-sky-50 border-sky-200",
  },
  {
    icon: Smartphone,
    badge: "Mobile Field Suite",
    title: "Native Auto-Dialer & Offline App",
    description:
      "Built with Expo 54 for field sales reps. Daily cold-call queue targets, click-to-dial integration, automatic call duration logging, and offline GPS site-visit check-ins with selfie uploads.",
    stats: "Background queue · GPS coordinates & camera verification",
    accent: "text-amber-600 bg-amber-50 border-amber-200",
  },
];

export const CORE_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Better Auth + RFC 6238 MFA TOTP",
    description:
      "Zero custom JWT minting or insecure password storage. Server-validated sessions, two-factor authenticator support, and hashed backup recovery codes.",
    accent: "text-purple-600 bg-purple-50",
  },
  {
    icon: Compass,
    title: "Single-Flag Clean Partition (`isCpProject`)",
    description:
      "Internal sales (`isCpProject = false`) and external broker network (`isCpProject = true`) coexist in one database with zero data leakage across boundaries.",
    accent: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: MapPin,
    title: "GPS-Verified Site Visits",
    description:
      "Field check-in coordinates validated against project boundaries with mandatory geotagged selfies, eliminating phantom visits and validating travel.",
    accent: "text-sky-600 bg-sky-50",
  },
  {
    icon: DollarSign,
    title: "Dual Commission & Settlement Engine",
    description:
      "Tracks inbound builder receivables for direct sales and computes automated multi-tier payout slabs with TDS and GST for external CP brokers.",
    accent: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Radio,
    title: "Real-Time WebSockets & BullMQ",
    description:
      "Instant inventory lock notifications, live chat messages, and background asynchronous jobs handled by dedicated BullMQ workers.",
    accent: "text-amber-600 bg-amber-50",
  },
  {
    icon: Database,
    title: "PostgreSQL & Prisma 7 Transactions",
    description:
      "Atomic transactional booking guarantees, strict soft-delete auditing (`deletedAt: null`), and full referential integrity across all models.",
    accent: "text-rose-600 bg-rose-50",
  },
];
