"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Phone,
  Send,
  Globe,
  ArrowRight,
  Settings,
  Sliders,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { InstagramIcon as Instagram } from "@/features/marketing/ads/instagram/components/InstagramIcon";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { YouTubeIcon } from "@/features/marketing/ads/youtube/components/YouTubeIcon";

export interface SettingsCardItem {
  id: string;
  title: string;
  channel: string;
  description: string;
  badge: string;
  badgeColor: string;
  href: string;
  iconBg: string;
  iconColor: string;
  renderIcon: () => React.ReactNode;
  tags: string[];
}

const SETTINGS_CARDS: SettingsCardItem[] = [
  {
    id: "whatsapp",
    title: "WhatsApp Cloud API",
    channel: "WhatsApp Business",
    description:
      "Configure Meta Graph API credentials, Phone Number ID, WABA ID, webhook verification tokens, and 2-way bot automation.",
    badge: "Official Meta API",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    href: "/dashboard/marketing/whatsapp/settings",
    iconBg: "bg-emerald-50 text-emerald-600",
    iconColor: "text-emerald-600",
    renderIcon: () => <Send className="w-5 h-5" />,
    tags: ["Meta Cloud API", "HSM Templates", "Webhooks", "Live Inbox"],
  },
  {
    id: "voice",
    title: "AI Voice & Telephony",
    channel: "Conversational AI & PSTN",
    description:
      "Configure AI Voice engines (Vapi, Retell, Sarvam, Bolna, ElevenLabs) & PSTN carrier trunks (Twilio, Vobiz, Exotel, Telnyx).",
    badge: "PSTN + AI Speech",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    href: "/dashboard/marketing/voice/settings",
    iconBg: "bg-indigo-50 text-indigo-600",
    iconColor: "text-indigo-600",
    renderIcon: () => <Phone className="w-5 h-5" />,
    tags: ["Twilio SIP", "Vapi / Retell", "Voice Webhooks", "Call Recordings"],
  },
  {
    id: "email",
    title: "Email Gateways & SMTP",
    channel: "Outbound Broadcasts",
    description:
      "Connect AWS SES, SendGrid, Brevo, or Mailchimp with automated SPF/DKIM verification, custom sender domains, and bounce webhooks.",
    badge: "Multi-Provider BYO",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200/80",
    href: "/dashboard/marketing/email/settings",
    iconBg: "bg-purple-50 text-purple-600",
    iconColor: "text-purple-600",
    renderIcon: () => <Mail className="w-5 h-5" />,
    tags: ["AWS SES", "SendGrid", "DKIM / SPF", "Bounce Webhooks"],
  },
  {
    id: "sms",
    title: "SMS Gateways & DLT",
    channel: "Carrier Routing",
    description:
      "Manage carrier numbers and routes across Twilio, AWS SNS, Sinch, and Gupshup with Indian TRAI/DLT header registration.",
    badge: "DLT / 10DLC Compliant",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200/80",
    href: "/dashboard/marketing/sms/settings",
    iconBg: "bg-amber-50 text-amber-600",
    iconColor: "text-amber-600",
    renderIcon: () => <MessageSquare className="w-5 h-5" />,
    tags: ["Twilio / Sinch", "DLT Headers", "Short Links", "Opt-Out Webhooks"],
  },
  {
    id: "meta-ads",
    title: "Meta & Facebook Ads",
    channel: "Paid Social Leads",
    description:
      "Connect Meta Graph API, authenticate Ad Accounts, map Facebook Lead Generation forms, and set real-time Webhook subscriptions.",
    badge: "Instant Sync",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200/80",
    href: "/dashboard/marketing/ads/meta/settings",
    iconBg: "bg-blue-50 text-blue-600",
    iconColor: "text-blue-600",
    renderIcon: () => <Globe className="w-5 h-5" />,
    tags: ["Facebook Lead Ads", "Graph API v21", "Lead Form Ingest", "CPL Tracking"],
  },
  {
    id: "instagram-ads",
    title: "Instagram Ads Engine",
    channel: "Reels & Story Leads",
    description:
      "Configure Instagram Professional Ad Accounts, 9:16 vertical video creative tracking, Reels Lead Forms, and story swipe-up funnels.",
    badge: "9:16 Vertical Leads",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200/80",
    href: "/dashboard/marketing/ads/instagram/settings",
    iconBg: "bg-pink-50 text-pink-600",
    iconColor: "text-pink-600",
    renderIcon: () => <Instagram className="w-5 h-5" />,
    tags: ["Reels Lead Forms", "Story Swipe-Ups", "IG Graph API", "Creative Tracking"],
  },
  {
    id: "google-ads",
    title: "Google Ads Engine",
    channel: "Search & Display Ads",
    description:
      "OAuth 2.0 connection, Google Ads Developer Token, MCC Customer ID mapping, and Search Lead Form webhook ingestion with quality score audit.",
    badge: "GAQL Search API",
    badgeColor: "bg-red-50 text-red-700 border-red-200/80",
    href: "/dashboard/marketing/ads/google/settings",
    iconBg: "bg-red-50 text-red-600",
    iconColor: "text-red-600",
    renderIcon: () => <GoogleIcon size={20} />,
    tags: ["Google Lead Forms", "Developer Token", "OAuth 2.0", "Quality Score"],
  },
  {
    id: "youtube-ads",
    title: "YouTube Video Ads",
    channel: "Video Action Campaigns",
    description:
      "Sync YouTube TrueView and Video Action Campaigns, track viewer retention funnels, and capture in-stream lead extensions.",
    badge: "TrueView & Action",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200/80",
    href: "/dashboard/marketing/ads/youtube",
    iconBg: "bg-rose-50 text-rose-600",
    iconColor: "text-rose-600",
    renderIcon: () => <YouTubeIcon size={20} />,
    tags: ["Video Action Ads", "Retention Funnel", "Lead Extensions", "View Rates"],
  },
];

export function MarketingSettingsCardsGrid() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">
              Marketing Integrations & Channel Settings
            </h3>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Click any channel card to manage API keys, webhooks, sender accounts, and carrier gateways.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SETTINGS_CARDS.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
                >
                  {card.renderIcon()}
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              </div>

              {/* Title & Channel */}
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                {card.channel}
              </span>
              <h4 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-[var(--brand-600)] transition-colors mt-0.5">
                {card.title}
              </h4>

              {/* Description */}
              <p className="text-xs text-[var(--text-tertiary)] mt-2 line-clamp-3 leading-relaxed">
                {card.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                {card.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer / CTA */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[var(--brand-600)] group-hover:text-[var(--brand-700)]">
              <span>Configure Settings</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
