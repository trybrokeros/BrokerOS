"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Phone,
  Globe,
  ArrowRight,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { CampaignItem, SmsCampaignItem, VoiceCampaignItem } from "../types";

export interface MarketingChannelGridProps {
  emailCampaigns?: CampaignItem[];
  smsCampaigns?: SmsCampaignItem[];
  voiceCampaigns?: VoiceCampaignItem[];
  metaCampaignsCount?: number;
  whatsAppBroadcastsCount?: number;
  totalAdsCount?: number;
}

export function MarketingChannelGrid({
  emailCampaigns = [],
  smsCampaigns = [],
  voiceCampaigns = [],
  metaCampaignsCount = 0,
  whatsAppBroadcastsCount = 0,
  totalAdsCount,
}: MarketingChannelGridProps) {
  const adsCount = totalAdsCount !== undefined ? totalAdsCount : metaCampaignsCount;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
            Marketing Outreach Channels
          </h2>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Manage your multichannel outreach engines, ad networks, and carrier gateways.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Ads Marketing (Meta, Facebook, Instagram, Google & YouTube) Card */}
        <Link
          href="/dashboard/marketing/ads"
          className="group relative bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-extrabold text-base">
                <Globe className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="success" className="text-[10px] font-bold">
                  Active
                </Badge>
                <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {adsCount} Synced
                </span>
              </div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
              Paid Ads Marketing
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Track campaigns, spend, CPL & ad creatives across Meta (FB/IG), Google Search & YouTube.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Open Ads Engine</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* WhatsApp CRM & Broadcasts Card */}
        <Link
          href="/dashboard/marketing/whatsapp"
          className="group relative bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Send className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="success" className="text-[10px] font-bold">
                  Live Sync
                </Badge>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {whatsAppBroadcastsCount} Active
                </span>
              </div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors">
              WhatsApp CRM
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Two-way live WhatsApp inbox, official Meta HSM broadcasts, and automated response flows.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>Open WhatsApp Hub</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* AI Voice Agent & Telephony Broadcasts Card */}
        <Link
          href="/dashboard/marketing/voice"
          className="group relative bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:border-indigo-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Phone className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="success" className="text-[10px] font-bold">
                  AI Active
                </Badge>
                <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {voiceCampaigns.length} Active
                </span>
              </div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">
              AI Voice Calling
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Conversational AI calls with Vapi, Retell, Sarvam & ElevenLabs across carrier SIP trunks.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Open Voice Engine</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Email Marketing Channel Card */}
        <Link
          href="/dashboard/marketing/email"
          className="group relative bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:border-purple-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Mail className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="success" className="text-[10px] font-bold">
                  Active
                </Badge>
                <span className="text-[11px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {emailCampaigns.length} Active
                </span>
              </div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-purple-600 transition-colors">
              Email Marketing
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Broadcast project launches, price drops, and commission alerts with AWS SES & SendGrid.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Open Email Engine</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* SMS Channel Card */}
        <Link
          href="/dashboard/marketing/sms"
          className="group relative bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <MessageSquare className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="success" className="text-[10px] font-bold">
                  Active
                </Badge>
                <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {smsCampaigns.length} Active
                </span>
              </div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-amber-600 transition-colors">
              SMS Broadcasts
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Promotional & transactional SMS routing via Twilio, AWS SNS, Sinch & Gupshup with DLT headers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>Open SMS Engine</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
