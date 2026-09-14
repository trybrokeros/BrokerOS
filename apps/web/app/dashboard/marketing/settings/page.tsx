"use client";

import React from "react";
import Link from "next/link";
import {
  Settings,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Sliders,
  Sparkles,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { MarketingSettingsCardsGrid } from "@/features/marketing/components/MarketingSettingsCardsGrid";

export default function MarketingSettingsHubPage() {
  return (
    <DashboardPageWrapper
      loading={false}
      title="Marketing Settings & Integrations"
      subtitle="Centralized management of your omnichannel messaging gateways, AI voice telephony trunks, paid ad accounts, and lead ingest webhooks."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketing Overview</span>
            </Button>
          </Link>
        </div>
      }
    >

      {/* ── 8-Channel Settings Grid ── */}
      <MarketingSettingsCardsGrid />

      {/* ── Security & Webhook Ingestion Notice ── */}
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
            Encrypted Credential Storage & Environment Separation
          </h4>
          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
            All API tokens, private keys, and carrier credentials configured here are stored with application-level AES encryption. External webhook ingest endpoints for Meta Facebook, Instagram, Google Ads Lead Form, Twilio, and WhatsApp are secured with HMAC verification before mutating CRM lead scores.
          </p>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}