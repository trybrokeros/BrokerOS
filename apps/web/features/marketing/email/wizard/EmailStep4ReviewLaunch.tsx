"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShieldCheck,
  Layers,
  Sliders,
  Check,
  Plus,
  RefreshCw,
  Info,
  Server,
  Globe,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EMAIL_PROVIDERS, EMAIL_PROVIDER_PRICING_ESTIMATES } from "@brokeros/constants";
import { EmailPreFlightModal } from "../components/EmailPreFlightModal";
import type {
  AudienceSourceType,
  CsvLeadRow,
  EmailIntegrationItem,
  EmailProviderType,
} from "@/features/marketing/types";
import type {
  CampaignSenderPoolConfig,
  PreFlightCostSummary,
} from "@brokeros/types";

export interface EmailStep4ReviewLaunchProps {
  audienceSource: AudienceSourceType;
  csvRecipients: CsvLeadRow[];
  totalAudienceCount?: number;
  projectName?: string;
  isCpCampaign: boolean;
  fromName: string;
  fromEmail: string;
  providerType: EmailProviderType;
  onProviderTypeChange: (val: EmailProviderType) => void;
  integrations: EmailIntegrationItem[];
  // Multi-Domain Sender Pools
  senderPools: CampaignSenderPoolConfig[];
  onSenderPoolsChange: (pools: CampaignSenderPoolConfig[]) => void;
  allocationMode: "AUTO_EVEN" | "CUSTOM_PERCENTAGE";
  onAllocationModeChange: (mode: "AUTO_EVEN" | "CUSTOM_PERCENTAGE") => void;
  // Test send
  testEmail: string;
  onTestEmailChange: (val: string) => void;
  onSendTest: () => void;
  isSendingTest: boolean;
  testSendStatus: { ok: boolean; msg: string } | null;
  // Launch
  isSubmitting: boolean;
  onLaunch: () => void;
  onBack: () => void;
  // Cost Estimate
  costEstimate?: PreFlightCostSummary | null;
  isLoadingEstimate?: boolean;
}

const PALETTE_COLORS = [
  { bg: "bg-purple-600", text: "text-purple-700", border: "border-purple-300", lightBg: "bg-purple-50" },
  { bg: "bg-sky-600", text: "text-sky-700", border: "border-sky-300", lightBg: "bg-sky-50" },
  { bg: "bg-emerald-600", text: "text-emerald-700", border: "border-emerald-300", lightBg: "bg-emerald-50" },
  { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-300", lightBg: "bg-amber-50" },
  { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-300", lightBg: "bg-rose-50" },
  { bg: "bg-indigo-600", text: "text-indigo-700", border: "border-indigo-300", lightBg: "bg-indigo-50" },
];

export function EmailStep4ReviewLaunch({
  audienceSource,
  csvRecipients,
  totalAudienceCount,
  projectName,
  isCpCampaign,
  fromName,
  fromEmail,
  providerType,
  onProviderTypeChange,
  integrations,
  senderPools,
  onSenderPoolsChange,
  allocationMode,
  onAllocationModeChange,
  testEmail,
  onTestEmailChange,
  onSendTest,
  isSendingTest,
  testSendStatus,
  isSubmitting,
  onLaunch,
  onBack,
  costEstimate,
  isLoadingEstimate = false,
}: EmailStep4ReviewLaunchProps) {
  const [isPreFlightOpen, setIsPreFlightOpen] = useState(false);

  // Compute total audience number
  const totalAudience = useMemo(() => {
    if (audienceSource === "CSV_UPLOAD") {
      return csvRecipients.length;
    }
    return totalAudienceCount || 1000;
  }, [audienceSource, csvRecipients.length, totalAudienceCount]);

  // Available domain candidates from active integrations
  const availableDomains = useMemo(() => {
    const list: Array<{
      candidateId: string;
      integrationId: string;
      integrationName: string;
      domainId?: string;
      domain: string;
      fromEmail: string;
      fromName: string;
      provider: EmailProviderType;
      dailyQuota: number;
      isWarmupMode: boolean;
      isVerified: boolean;
    }> = [];

    // Connected Integrations & their senderDomains
    integrations
      .filter((int) => int.isActive)
      .forEach((int) => {
        const intName = int.name || `${int.provider} Account`;
        if (int.senderDomains && int.senderDomains.length > 0) {
          int.senderDomains.forEach((dom) => {
            const email = dom.fromEmail || int.fromEmail || "";
            const domain = dom.domain || (email.includes("@") ? email.split("@")[1] : email);
            list.push({
              candidateId: `${int.id}::${dom.id}::${email}`,
              integrationId: int.id,
              integrationName: intName,
              domainId: dom.id,
              domain,
              fromEmail: email,
              fromName: dom.fromName || int.fromName || "Sales Team",
              provider: int.provider,
              dailyQuota: dom.dailyQuota,
              isWarmupMode: dom.isWarmupMode,
              isVerified: dom.isVerified,
            });
          });
        } else if (int.fromEmail) {
          // If no specific domains configured yet, use integration's primary mailbox
          const email = int.fromEmail;
          const domain = email.includes("@") ? email.split("@")[1] : email;
          list.push({
            candidateId: `${int.id}::primary::${email}`,
            integrationId: int.id,
            integrationName: intName,
            domainId: `primary-${int.id}`,
            domain,
            fromEmail: email,
            fromName: int.fromName || "Sales Team",
            provider: int.provider,
            dailyQuota: 25000,
            isWarmupMode: false,
            isVerified: true,
          });
        }
      });

    return list;
  }, [integrations]);

  // Helper: check if a specific candidate account is in the current pools
  const isCandidateInPool = (
    cand: (typeof availableDomains)[0],
    pools: CampaignSenderPoolConfig[]
  ) => {
    return pools.some((p) => {
      if (p.integrationId && cand.integrationId) {
        return (
          p.integrationId === cand.integrationId &&
          (p.fromEmail || "").toLowerCase() === (cand.fromEmail || "").toLowerCase()
        );
      }
      if (p.senderDomainId && cand.domainId && !cand.domainId.startsWith("primary-")) {
        return p.senderDomainId === cand.domainId;
      }
      return (
        (p.fromEmail || "").toLowerCase() === (cand.fromEmail || "").toLowerCase() &&
        p.provider === cand.provider
      );
    });
  };

  // Helper: auto-even balance pools
  const autoEvenBalance = (pools: CampaignSenderPoolConfig[]): CampaignSenderPoolConfig[] => {
    if (pools.length === 0) return [];
    const base = Math.floor(100 / pools.length);
    const remainder = 100 % pools.length;
    return pools.map((p, idx) => ({
      ...p,
      allocationPercentage: base + (idx < remainder ? 1 : 0),
    }));
  };

  // Helper: auto-balance custom slider pools
  const autoBalanceCustom = (pools: CampaignSenderPoolConfig[]): CampaignSenderPoolConfig[] => {
    if (pools.length === 0) return [];
    const currentTotal = pools.reduce((acc, p) => acc + (p.allocationPercentage || 0), 0);
    if (currentTotal === 0) return autoEvenBalance(pools);

    let distributed = 0;
    return pools.map((p, idx) => {
      if (idx === pools.length - 1) {
        return { ...p, allocationPercentage: Math.max(1, 100 - distributed) };
      }
      const share = Math.max(1, Math.round(((p.allocationPercentage || 0) / currentTotal) * 100));
      distributed += share;
      return { ...p, allocationPercentage: share };
    });
  };

  // Initialize sender pools if empty
  useEffect(() => {
    if (senderPools.length === 0 && availableDomains.length > 0) {
      const defaultDomain = availableDomains[0];
      const initialPool: CampaignSenderPoolConfig = {
        senderDomainId: defaultDomain.domainId?.startsWith("primary-") ? undefined : defaultDomain.domainId,
        integrationId: defaultDomain.integrationId,
        accountName: defaultDomain.integrationName,
        fromEmail: defaultDomain.fromEmail,
        fromName: defaultDomain.fromName,
        domain: defaultDomain.domain,
        provider: defaultDomain.provider,
        allocationPercentage: 100,
      };
      onSenderPoolsChange([initialPool]);
    }
  }, [availableDomains, senderPools.length, onSenderPoolsChange]);

  // Toggle a specific account on/off
  const handleToggleDomain = (item: (typeof availableDomains)[0]) => {
    const isAlreadySelected = isCandidateInPool(item, senderPools);

    let nextPools: CampaignSenderPoolConfig[];

    if (isAlreadySelected) {
      if (senderPools.length === 1) {
        // Don't allow unchecking the last domain
        return;
      }
      nextPools = senderPools.filter((p) => {
        if (p.integrationId && item.integrationId) {
          return !(
            p.integrationId === item.integrationId &&
            (p.fromEmail || "").toLowerCase() === (item.fromEmail || "").toLowerCase()
          );
        }
        if (p.senderDomainId && item.domainId && !item.domainId.startsWith("primary-")) {
          return p.senderDomainId !== item.domainId;
        }
        return !(
          (p.fromEmail || "").toLowerCase() === (item.fromEmail || "").toLowerCase() &&
          p.provider === item.provider
        );
      });
    } else {
      const newPool: CampaignSenderPoolConfig = {
        senderDomainId: item.domainId?.startsWith("primary-") ? undefined : item.domainId,
        integrationId: item.integrationId,
        accountName: item.integrationName,
        fromEmail: item.fromEmail,
        fromName: item.fromName,
        domain: item.domain,
        provider: item.provider,
        allocationPercentage: 0,
      };
      nextPools = [...senderPools, newPool];
    }

    if (allocationMode === "AUTO_EVEN") {
      nextPools = autoEvenBalance(nextPools);
    } else {
      nextPools = autoBalanceCustom(nextPools);
    }

    // Also update providerType to MULTI_PROVIDER if multiple selected
    if (nextPools.length > 1) {
      onProviderTypeChange("MULTI_PROVIDER");
    } else if (nextPools.length === 1 && nextPools[0].provider) {
      onProviderTypeChange(nextPools[0].provider);
    }

    onSenderPoolsChange(nextPools);
  };

  // Slider change for custom percentage
  const handleSliderChange = (index: number, newPct: number) => {
    const updated = [...senderPools];
    updated[index] = { ...updated[index], allocationPercentage: Math.max(0, Math.min(100, newPct)) };
    onSenderPoolsChange(updated);
  };

  // Switch allocation mode
  const handleModeChange = (mode: "AUTO_EVEN" | "CUSTOM_PERCENTAGE") => {
    onAllocationModeChange(mode);
    if (mode === "AUTO_EVEN") {
      onSenderPoolsChange(autoEvenBalance(senderPools));
    }
  };

  // Sum of percentages
  const totalPercentage = useMemo(() => {
    return senderPools.reduce((acc, p) => acc + (p.allocationPercentage || 0), 0);
  }, [senderPools]);

  const isAllocationValid = totalPercentage === 100;

  return (
    <div className="space-y-6 animate-enter">
      {/* ── 1. PRE-FLIGHT CAMPAIGN OVERVIEW ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Pre-Flight Campaign Summary
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Review parameters, verified domains, and rate throttle distribution.
            </p>
          </div>
          <Badge variant="success" className="text-[10px]">
            Ready for Pre-Flight
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
              Target Audience
            </div>
            <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1">
              {audienceSource === "CRM_DATABASE" ? "CRM Filtered Leads" : "CSV Contact List"}
            </div>
            <div className="text-[11px] font-bold text-[var(--brand-600)] mt-0.5">
              {totalAudience.toLocaleString()} Target Leads
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
              Associated Project
            </div>
            <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
              {projectName || "Direct Broadcast"}
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              {isCpCampaign ? "Channel Partner Network" : "Direct Buyer Sales"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
              Sender Configuration
            </div>
            <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
              {senderPools.length} Sending Mailbox{senderPools.length > 1 ? "es" : ""}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
              Multi-Stream Dispatching
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
              Routing Engine
            </div>
            <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
              {senderPools.length > 1 ? "Distributed Multi-Provider" : ((EMAIL_PROVIDERS as Record<string, any>)[providerType]?.name || providerType)}
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              Provider Rate Throttle Active
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MULTI-PROVIDER & DOMAIN ALLOCATION MATRIX ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--brand-600)]" />
              <span>Multi-Provider & Domain Outbound Matrix</span>
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Select one or multiple verified sender domains to distribute your broadcast load.
            </p>
          </div>

          {/* Allocation Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleModeChange("AUTO_EVEN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${allocationMode === "AUTO_EVEN"
                ? "bg-white text-[var(--brand-700)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              Auto-Even Split
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("CUSTOM_PERCENTAGE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${allocationMode === "CUSTOM_PERCENTAGE"
                ? "bg-white text-[var(--brand-700)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Custom Weights</span>
            </button>
          </div>
        </div>

        {/* Domain Selection Grid */}
        {availableDomains.length === 0 ? (
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-2.5">
            <div className="flex items-center gap-2 font-extrabold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>No Connected Email Providers or Senders Found</span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              You do not have any active email providers (SendGrid, Brevo, AWS SES, or Mailchimp) configured with sender domains.
              Please configure an email provider in Settings to send campaigns.
            </p>
            <div className="pt-1">
              <a
                href="/dashboard/marketing/email/settings"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-50 transition-all"
              >
                Go to Email Settings
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {availableDomains.map((item) => {
              const isSelected = isCandidateInPool(item, senderPools);
              const poolItem = senderPools.find((p) => {
                if (p.integrationId && item.integrationId) {
                  return (
                    p.integrationId === item.integrationId &&
                    (p.fromEmail || "").toLowerCase() === (item.fromEmail || "").toLowerCase()
                  );
                }
                if (p.senderDomainId && item.domainId && !item.domainId.startsWith("primary-")) {
                  return p.senderDomainId === item.domainId;
                }
                return (
                  (p.fromEmail || "").toLowerCase() === (item.fromEmail || "").toLowerCase() &&
                  p.provider === item.provider
                );
              });
              const pricing =
                (EMAIL_PROVIDER_PRICING_ESTIMATES as Record<string, any>)[item.provider] ||
                EMAIL_PROVIDER_PRICING_ESTIMATES.SYSTEM_DEFAULT;

              return (
                <div
                  key={item.candidateId}
                  onClick={() => handleToggleDomain(item)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                    ? "border-[var(--brand-500)] bg-purple-50/40 shadow-xs ring-2 ring-purple-500/15"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected
                          ? "bg-[var(--brand-600)] border-[var(--brand-600)] text-white"
                          : "border-slate-300 bg-white"
                          }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[var(--text-primary)]">
                            {item.integrationName}
                          </span>
                          {item.isVerified && (
                            <Badge variant="success" className="text-[9px] py-0 px-1.5">
                              Verified
                            </Badge>
                          )}
                          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-slate-100 px-1.5 py-0.5 rounded">
                            @{item.domain}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] font-semibold truncate max-w-[220px] mt-0.5">
                          {item.fromEmail}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="default" className="text-[10px] font-extrabold">
                        {(EMAIL_PROVIDERS as Record<string, any>)[item.provider]?.name || item.provider}
                      </Badge>
                      <div className="text-[10px] text-[var(--text-muted)] font-medium mt-1">
                        ${pricing.costPer1kUSD}/1k
                      </div>
                    </div>
                  </div>

                  {isSelected && poolItem && (
                    <div className="mt-3 pt-3 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-900">
                      <span className="text-[11px] text-purple-700">Allocated Volume:</span>
                      <span>
                        {poolItem.allocationPercentage}% •{" "}
                        {Math.round((totalAudience * (poolItem.allocationPercentage || 0)) / 100).toLocaleString()}{" "}
                        leads
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── VISUAL STACKED DISTRIBUTION BAR ── */}
        <div className="pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
              Audience Traffic Distribution
            </h4>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold ${isAllocationValid ? "text-emerald-600" : "text-rose-600"
                  }`}
              >
                Total: {totalPercentage}%
              </span>
              {allocationMode === "CUSTOM_PERCENTAGE" && !isAllocationValid && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSenderPoolsChange(autoBalanceCustom(senderPools))}
                  className="gap-1.5 text-[11px] font-bold py-1 h-7"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto-Balance</span>
                </Button>
              )}
            </div>
          </div>

          {/* Stacked Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {senderPools.map((pool, idx) => {
              const color = PALETTE_COLORS[idx % PALETTE_COLORS.length];
              return (
                <div
                  key={idx}
                  style={{ width: `${pool.allocationPercentage}%` }}
                  className={`${color.bg} h-full transition-all relative group cursor-default`}
                  title={`${pool.domain || pool.fromEmail}: ${pool.allocationPercentage}%`}
                />
              );
            })}
          </div>

          {/* Legend and Custom Sliders */}
          <div className="space-y-2.5 pt-2">
            {senderPools.map((pool, idx) => {
              const color = PALETTE_COLORS[idx % PALETTE_COLORS.length];
              const leadCount = Math.round((totalAudience * (pool.allocationPercentage || 0)) / 100);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${color.border} ${color.lightBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-2.5 min-w-[200px]">
                    <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                    <div>
                      <div className="text-xs font-extrabold text-[var(--text-primary)]">
                        {pool.accountName || pool.fromEmail}
                      </div>
                      <div className="text-[10px] font-medium text-[var(--text-muted)] truncate max-w-[220px]">
                        {pool.fromEmail} ({(EMAIL_PROVIDERS as Record<string, any>)[pool.provider || "SYSTEM_DEFAULT"]?.name || "System"})
                      </div>
                    </div>
                  </div>

                  {allocationMode === "CUSTOM_PERCENTAGE" ? (
                    <div className="flex items-center gap-3 flex-1 max-w-sm">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pool.allocationPercentage}
                        onChange={(e) => handleSliderChange(idx, parseInt(e.target.value, 10) || 0)}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                      <div className="w-14 text-right">
                        <span className="text-xs font-black text-slate-800 tabular-nums">
                          {pool.allocationPercentage}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-purple-900 tabular-nums">
                        {pool.allocationPercentage}%
                      </span>
                    </div>
                  )}

                  <div className="text-right sm:min-w-[100px]">
                    <span className="text-xs font-extrabold text-slate-700 tabular-nums">
                      {leadCount.toLocaleString()} leads
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {!isAllocationValid && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Domain allocation must equal 100% (currently {totalPercentage}%). Click Auto-Balance or adjust sliders to proceed.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. TEST SEND CARD ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <div>
          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
            Send Instant Test Email (Optional)
          </h4>
          <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
            Send a sample email to your personal inbox to inspect formatting and mobile layout.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            placeholder="Enter test email address (e.g. personal@gmail.com)..."
            value={testEmail}
            onChange={(e) => onTestEmailChange(e.target.value)}
            className="flex-1 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSendTest}
            disabled={isSendingTest}
            className="w-full sm:w-auto"
          >
            {isSendingTest ? "Dispatching Test..." : "Send Test Preview"}
          </Button>
        </div>

        {testSendStatus && (
          <p
            className={`text-xs font-bold ${testSendStatus.ok ? "text-emerald-600" : "text-rose-600"
              }`}
          >
            {testSendStatus.msg}
          </p>
        )}
      </div>

      {/* ── NAVIGATION FOOTER ── */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Button>

        <Button
          type="button"
          variant="luxury"
          size="default"
          onClick={() => setIsPreFlightOpen(true)}
          disabled={isSubmitting || !isAllocationValid}
          className="gap-2 font-extrabold shadow-md px-6"
        >
          {isSubmitting ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{isSubmitting ? "Initiating Broadcast..." : "Launch Campaign Now"}</span>
        </Button>
      </div>

      {/* ── PRE-FLIGHT CONFIRMATION MODAL ── */}
      <EmailPreFlightModal
        isOpen={isPreFlightOpen}
        onClose={() => setIsPreFlightOpen(false)}
        onConfirm={() => {
          setIsPreFlightOpen(false);
          onLaunch();
        }}
        isLaunching={isSubmitting}
        campaignTitle={projectName ? `${projectName} Broadcast` : "Outbound Email Campaign"}
        totalAudience={totalAudience}
        senderPools={senderPools}
        allocationMode={allocationMode}
        costEstimate={costEstimate}
        isLoadingEstimate={isLoadingEstimate}
      />
    </div>
  );
}
