"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Phone,
  Send,
  Globe,
  Sparkles,
  Settings,
  Users,
  Sliders,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { InstagramIcon as Instagram } from "@/features/marketing/ads/instagram/components/InstagramIcon";

import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/Button";
import { EmailCampaignListTable } from "@/features/marketing/email/components/EmailCampaignListTable";
import { SmsCampaignListTable } from "@/features/marketing/sms/components/SmsCampaignListTable";
import { VoiceCampaignListTable } from "@/features/marketing/voice/components/VoiceCampaignListTable";
import { MarketingChannelGrid } from "@/features/marketing/components/MarketingChannelGrid";
import { MarketingSettingsCardsGrid } from "@/features/marketing/components/MarketingSettingsCardsGrid";
import {
  UnifiedBroadcastsTable,
  type UnifiedBroadcastItem,
  type UnifiedMarketingChannelType,
} from "@/features/marketing/components/UnifiedBroadcastsTable";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { YouTubeIcon } from "@/features/marketing/ads/youtube/components/YouTubeIcon";
import type { CampaignItem, SmsCampaignItem, VoiceCampaignItem } from "@/features/marketing/types";

export default function MarketingHubPage() {
  const [emailCampaigns, setEmailCampaigns] = useState<CampaignItem[]>([]);
  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaignItem[]>([]);
  const [voiceCampaigns, setVoiceCampaigns] = useState<VoiceCampaignItem[]>([]);
  const [whatsAppBroadcasts, setWhatsAppBroadcasts] = useState<any[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<any[]>([]);
  const [instagramCampaigns, setInstagramCampaigns] = useState<any[]>([]);
  const [googleCampaigns, setGoogleCampaigns] = useState<any[]>([]);
  const [youtubeCampaigns, setYoutubeCampaigns] = useState<any[]>([]);
  const [metaKpis, setMetaKpis] = useState<any>(null);
  const [igKpis, setIgKpis] = useState<any>(null);
  const [googleKpis, setGoogleKpis] = useState<any>(null);
  const [youtubeKpis, setYoutubeKpis] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChannelTab, setActiveChannelTab] = useState<
    "ALL" | UnifiedMarketingChannelType
  >("ALL");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  useEffect(() => {
    async function loadMarketingData() {
      try {
        setLoading(true);
        setError(null);

        const [
          emailRes,
          smsRes,
          voiceRes,
          waRes,
          metaRes,
          igRes,
          googleRes,
          ytRes,
        ] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/campaigns`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/sms/campaigns`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/voice/campaigns`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/broadcasts`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/ads/meta/campaigns`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/ads/instagram/overview`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/ads/google/campaigns`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/ads/youtube/overview`).catch(() => null),
        ]);

        if (emailRes && emailRes.ok) {
          const data = await emailRes.json();
          setEmailCampaigns(data?.items || []);
        }

        if (smsRes && smsRes.ok) {
          const data = await smsRes.json();
          setSmsCampaigns(data?.items || []);
        }

        if (voiceRes && voiceRes.ok) {
          const data = await voiceRes.json();
          setVoiceCampaigns(data?.items || []);
        }

        if (waRes && waRes.ok) {
          const data = await waRes.json();
          setWhatsAppBroadcasts(data?.items || []);
        }

        if (metaRes && metaRes.ok) {
          const data = await metaRes.json();
          setMetaCampaigns(data?.items || []);
          if (data?.kpis) setMetaKpis(data.kpis);
        }

        if (igRes && igRes.ok) {
          const data = await igRes.json();
          setInstagramCampaigns(data?.items || []);
          if (data?.kpis) setIgKpis(data.kpis);
        }

        if (googleRes && googleRes.ok) {
          const data = await googleRes.json();
          setGoogleCampaigns(data?.items || []);
          if (data?.kpis) setGoogleKpis(data.kpis);
        }

        if (ytRes && ytRes.ok) {
          const data = await ytRes.json();
          setYoutubeCampaigns(data?.items || []);
          if (data?.kpis) setYoutubeKpis(data.kpis);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load marketing dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadMarketingData();
  }, [baseUrl]);

  // Calculations across Outreaches
  const emailSent = emailCampaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const emailDelivered = emailCampaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const smsSent = smsCampaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const smsDelivered = smsCampaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const voiceDials = voiceCampaigns.reduce((acc, c) => acc + (c.totalRecipients || 0), 0);
  const voiceCompleted = voiceCampaigns.reduce((acc, c) => acc + (c.completedCalls || 0), 0);
  const waDelivered = whatsAppBroadcasts.reduce((acc, b) => acc + (b.deliveredCount || 0), 0);

  // Calculations across Paid Ads
  const metaSpend = metaKpis?.totalSpend ?? metaCampaigns.reduce((acc, m) => acc + (m.spend || 0), 0);
  const metaImpressions = metaKpis?.totalImpressions ?? metaCampaigns.reduce((acc, m) => acc + (m.impressions || 0), 0);
  const metaLeads = metaKpis?.totalLeads ?? metaCampaigns.reduce((acc, m) => acc + (m.leadsCount || 0), 0);

  const igSpend = igKpis?.totalSpend ?? instagramCampaigns.reduce((acc, i) => acc + (i.spend || 0), 0);
  const igImpressions = igKpis?.totalImpressions ?? instagramCampaigns.reduce((acc, i) => acc + (i.impressions || 0), 0);
  const igLeads = igKpis?.totalLeads ?? instagramCampaigns.reduce((acc, i) => acc + (i.leadsCount || 0), 0);

  const googleSpend = googleKpis?.totalSpend ?? googleCampaigns.reduce((acc, g) => acc + (g.spend || 0), 0);
  const googleImpressions = googleKpis?.totalImpressions ?? googleCampaigns.reduce((acc, g) => acc + (g.impressions || 0), 0);
  const googleLeads = googleKpis?.totalLeads ?? googleCampaigns.reduce((acc, g) => acc + (g.leadsCount || 0), 0);

  const ytSpend = youtubeKpis?.totalSpend ?? youtubeCampaigns.reduce((acc, y) => acc + (y.spend || 0), 0);
  const ytImpressions = youtubeKpis?.totalImpressions ?? youtubeCampaigns.reduce((acc, y) => acc + (y.impressions || 0), 0);
  const ytLeads = youtubeKpis?.totalLeads ?? youtubeCampaigns.reduce((acc, y) => acc + (y.leadsCount || 0), 0);

  // Aggregate Totals
  const totalOmnichannelImpressions =
    emailDelivered +
    smsDelivered +
    voiceCompleted +
    waDelivered +
    metaImpressions +
    igImpressions +
    googleImpressions +
    ytImpressions;

  const totalAcquiredLeads = metaLeads + igLeads + googleLeads + ytLeads;
  const totalDigitalSpend = metaSpend + igSpend + googleSpend + ytSpend;

  const totalCampaignsCount =
    emailCampaigns.length +
    smsCampaigns.length +
    voiceCampaigns.length +
    whatsAppBroadcasts.length +
    metaCampaigns.length +
    instagramCampaigns.length +
    googleCampaigns.length +
    youtubeCampaigns.length;

  const totalAdsCount =
    metaCampaigns.length +
    instagramCampaigns.length +
    googleCampaigns.length +
    youtubeCampaigns.length;

  // Blended Top KPI cards
  const statItems = [
    {
      label: "Omnichannel Reach & Impressions",
      value: totalOmnichannelImpressions > 0 ? totalOmnichannelImpressions.toLocaleString() : "0",
      icon: Sparkles,
      accent: "oklch(0.55 0.22 310)",
      sub: `${(emailDelivered + smsDelivered + waDelivered).toLocaleString()} direct messages · ${(metaImpressions + igImpressions + googleImpressions + ytImpressions).toLocaleString()} ad views`,
    },
    {
      label: "Total Acquired CRM Leads",
      value: totalAcquiredLeads > 0 ? totalAcquiredLeads.toLocaleString() : "0",
      icon: Users,
      accent: "oklch(0.60 0.19 140)",
      sub: `Meta (${metaLeads}) · Google (${googleLeads}) · IG (${igLeads}) · YouTube (${ytLeads})`,
    },
    {
      label: "Active Campaigns Across 8 Engines",
      value: totalCampaignsCount.toLocaleString(),
      icon: TrendingUp,
      accent: "oklch(0.55 0.22 260)",
      sub: `${emailCampaigns.length + smsCampaigns.length + voiceCampaigns.length + whatsAppBroadcasts.length} outreaches · ${totalAdsCount} paid ad campaigns`,
    },
    {
      label: "Digital Ad Investment",
      value: totalDigitalSpend > 0 ? `₹${totalDigitalSpend.toLocaleString("en-IN")}` : "",
      icon: DollarSign,
      accent: "oklch(0.60 0.19 45)",
      sub: `Blended CPL: ₹${totalAcquiredLeads > 0 ? Math.round(totalDigitalSpend / totalAcquiredLeads).toLocaleString("en-IN") : ""} per verified buyer`,
    },
  ];

  // Map and compile ALL 8 channel campaigns into unified stream
  const unifiedBroadcasts: UnifiedBroadcastItem[] = useMemo(() => {
    const list: UnifiedBroadcastItem[] = [];

    // 1. WhatsApp Broadcasts
    whatsAppBroadcasts.forEach((b) => {
      list.push({
        id: b.id,
        type: "WHATSAPP",
        title: b.name || "WhatsApp Broadcast",
        previewText: `Template: ${b.templateName || "Marketing Update"}`,
        status: b.status || "COMPLETED",
        totalRecipients: b.totalRecipients || 0,
        sentCount: b.sentCount || 0,
        deliveredCount: b.deliveredCount || 0,
        openedCount: b.readCount || 0,
        clickedCount: 0,
        createdAt: b.createdAt || new Date().toISOString(),
        projectName: b.projectName || "WhatsApp Audience",
        providerName: "Meta Cloud API",
        detailUrl: `/dashboard/marketing/whatsapp/broadcasts/${b.id}`,
      });
    });

    // 2. Email Campaigns
    emailCampaigns.forEach((c) => {
      list.push({
        id: c.id,
        type: "EMAIL",
        title: c.title,
        previewText: c.subject,
        status: c.status,
        totalRecipients: c.totalRecipients || 0,
        sentCount: c.sentCount || 0,
        deliveredCount: c.deliveredCount || 0,
        openedCount: c.openedCount || 0,
        clickedCount: c.clickedCount || 0,
        createdAt: c.createdAt,
        projectName: c.project?.name,
        providerName: c.providerType || "AWS SES",
        detailUrl: `/dashboard/marketing/email/campaigns/${c.id}`,
      });
    });

    // 3. SMS Campaigns
    smsCampaigns.forEach((s) => {
      list.push({
        id: s.id,
        type: "SMS",
        title: s.title,
        previewText: s.messageContent,
        status: s.status,
        totalRecipients: s.totalRecipients || 0,
        sentCount: s.sentCount || 0,
        deliveredCount: s.deliveredCount || 0,
        clickedCount: s.clickedCount || 0,
        createdAt: s.createdAt,
        projectName: s.project?.name,
        providerName: s.providerType || "Twilio",
        detailUrl: `/dashboard/marketing/sms/campaigns/${s.id}`,
      });
    });

    // 4. Voice Campaigns
    voiceCampaigns.forEach((v) => {
      list.push({
        id: v.id,
        type: "VOICE",
        title: v.title,
        previewText: `${v.agentIntegration?.platform || "AI Speech"} (${v.voiceName || "Agent"})`,
        status: v.status,
        totalRecipients: v.totalRecipients || 0,
        sentCount: v.completedCalls || 0,
        deliveredCount: v.completedCalls || 0,
        clickedCount: 0,
        createdAt: v.createdAt,
        projectName: v.project?.name,
        providerName: v.telephony?.provider || "Twilio SIP",
        detailUrl: `/dashboard/marketing/voice/campaigns/${v.id}`,
      });
    });

    // 5. Facebook / Meta Ads
    metaCampaigns.forEach((m) => {
      list.push({
        id: m.id,
        type: "FACEBOOK",
        title: m.campaignName || m.name || "Meta Facebook Ad Campaign",
        previewText: `Objective: ${m.objective || "LEAD_GENERATION"}`,
        status: m.status || "ACTIVE",
        totalRecipients: m.reach || 0,
        sentCount: m.impressions || 0,
        deliveredCount: m.impressions || 0,
        clickedCount: m.clicks || 0,
        leadsCount: m.leadsCount || 0,
        spend: m.spend || 0,
        createdAt: m.createdAt || new Date().toISOString(),
        projectName: m.integration?.name || "Facebook Feed / Story",
        providerName: "Meta Graph API",
        detailUrl: `/dashboard/marketing/ads/meta/campaigns/${m.id}`,
      });
    });

    // 6. Instagram Ads
    instagramCampaigns.forEach((ig) => {
      list.push({
        id: ig.id,
        type: "INSTAGRAM",
        title: ig.name || "Instagram Vertical Reels Campaign",
        previewText: `Placement: 9:16 Vertical Reels & Stories`,
        status: ig.status || "ACTIVE",
        totalRecipients: ig.reach || 0,
        sentCount: ig.impressions || 0,
        deliveredCount: ig.impressions || 0,
        clickedCount: ig.clicks || 0,
        leadsCount: ig.leadsCount || 0,
        spend: ig.spend || 0,
        createdAt: ig.createdAt || new Date().toISOString(),
        projectName: "Instagram Business",
        providerName: "Instagram Graph API",
        detailUrl: `/dashboard/marketing/ads/instagram/campaigns/${ig.id}`,
      });
    });

    // 7. Google Ads
    googleCampaigns.forEach((g) => {
      list.push({
        id: g.id,
        type: "GOOGLE",
        title: g.name || "Google Search & Display Lead Form",
        previewText: `Network: Google Search & Discovery Network`,
        status: g.status || "ACTIVE",
        totalRecipients: g.impressions || 0,
        sentCount: g.impressions || 0,
        deliveredCount: g.impressions || 0,
        clickedCount: g.clicks || 0,
        leadsCount: g.leadsCount || 0,
        spend: g.spend || 0,
        createdAt: g.createdAt || new Date().toISOString(),
        projectName: "Google Ads MCC",
        providerName: "Google Ads API",
        detailUrl: `/dashboard/marketing/ads/google/campaigns/${g.id}`,
      });
    });

    // 8. YouTube Video Ads
    youtubeCampaigns.forEach((y) => {
      list.push({
        id: y.id,
        type: "YOUTUBE",
        title: y.name || "YouTube TrueView Video Campaign",
        previewText: `Format: Skippable In-Stream & Video Action`,
        status: y.status || "ACTIVE",
        totalRecipients: y.impressions || 0,
        sentCount: y.impressions || 0,
        deliveredCount: y.impressions || 0,
        clickedCount: y.clicks || 0,
        leadsCount: y.leadsCount || 0,
        spend: y.spend || 0,
        createdAt: y.createdAt || new Date().toISOString(),
        projectName: "YouTube Video Action",
        providerName: "Google Video Partner",
        detailUrl: `/dashboard/marketing/ads/youtube/campaigns/${y.id}`,
      });
    });

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [
    whatsAppBroadcasts,
    emailCampaigns,
    smsCampaigns,
    voiceCampaigns,
    metaCampaigns,
    instagramCampaigns,
    googleCampaigns,
    youtubeCampaigns,
  ]);

  // Filtered broadcast stream based on active channel tab
  const filteredBroadcasts = useMemo(() => {
    if (activeChannelTab === "ALL") return unifiedBroadcasts;
    return unifiedBroadcasts.filter((b) => b.type === activeChannelTab);
  }, [unifiedBroadcasts, activeChannelTab]);

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="Marketing Suite & Omnichannel Hub"
      subtitle="Unified campaign delivery and lead acquisition across WhatsApp, AI Voice, Email, SMS, Google Ads, YouTube, Facebook, and Instagram."
      headerRight={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/marketing/analytics">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Analytics Studio</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/settings">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold hover:bg-slate-50"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Channel Settings</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/ads">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Ads Studio</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/whatsapp/inbox">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Inbox</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/voice/campaigns/new">
            <Button
              size="sm"
              className="gap-1.5 shadow-xs text-xs font-bold bg-indigo-600 hover:bg-indigo-700"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>New Voice Call</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms/campaigns/new">
            <Button
              size="sm"
              className="gap-1.5 shadow-xs text-xs font-bold bg-amber-600 hover:bg-amber-700"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>New SMS</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email/campaigns/new">
            <Button
              size="sm"
              className="gap-1.5 shadow-xs text-xs font-bold bg-purple-600 hover:bg-purple-700"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>New Email</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── Top Metric KPI Cards (Omnichannel Blended Reach & Leads) ── */}
      <StatCards items={statItems} />

      {/* ── Marketing Channels Matrix (Ads, WhatsApp, Voice, Email, SMS) ── */}
      <MarketingChannelGrid
        emailCampaigns={emailCampaigns}
        smsCampaigns={smsCampaigns}
        voiceCampaigns={voiceCampaigns}
        whatsAppBroadcastsCount={whatsAppBroadcasts.length}
        totalAdsCount={totalAdsCount}
      />

      {/* ── Broadcasts & Campaigns Section with All 8 Channel Tabs ── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              All Marketing Campaigns & Broadcasts
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Live multi-channel delivery stream across WhatsApp, AI Voice, Email, SMS, Facebook, Instagram, Google, and YouTube.
            </p>
          </div>

          {/* Channel Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveChannelTab("ALL")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "ALL"
                ? "bg-white text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <span>All ({unifiedBroadcasts.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("WHATSAPP")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "WHATSAPP"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp ({whatsAppBroadcasts.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("VOICE")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "VOICE"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Voice ({voiceCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("EMAIL")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "EMAIL"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Email ({emailCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("SMS")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "SMS"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>SMS ({smsCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("FACEBOOK")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "FACEBOOK"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Facebook ({metaCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("INSTAGRAM")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "INSTAGRAM"
                ? "bg-white text-pink-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>Instagram ({instagramCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("GOOGLE")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "GOOGLE"
                ? "bg-white text-red-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <GoogleIcon size={14} />
              <span>Google ({googleCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("YOUTUBE")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${activeChannelTab === "YOUTUBE"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <YouTubeIcon size={14} />
              <span>YouTube ({youtubeCampaigns.length})</span>
            </button>
          </div>
        </div>

        {/* Tab View: Unified Table for all channels */}
        {activeChannelTab === "VOICE" && voiceCampaigns.length > 0 ? (
          <VoiceCampaignListTable campaigns={voiceCampaigns} />
        ) : activeChannelTab === "EMAIL" && emailCampaigns.length > 0 ? (
          <EmailCampaignListTable campaigns={emailCampaigns} isLoading={loading} />
        ) : activeChannelTab === "SMS" && smsCampaigns.length > 0 ? (
          <SmsCampaignListTable campaigns={smsCampaigns} isLoading={loading} />
        ) : (
          <UnifiedBroadcastsTable broadcasts={filteredBroadcasts} isLoading={loading} />
        )}
      </div>
    </DashboardPageWrapper>
  );
}
