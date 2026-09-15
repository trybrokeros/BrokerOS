"use client";

import React, { useState, useMemo } from "react";
import {
  Smartphone,
  Calendar,
  Send,
  Zap,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sliders,
  Check,
  Plus,
  Info,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  SMS_PROVIDERS,
  SMS_PROVIDER_PRICING_ESTIMATES,
  calculateSmsSegments,
} from "@brokeros/constants";
import { SmsPreFlightModal } from "../components/SmsPreFlightModal";
import type {
  AudienceSourceType,
  CsvLeadRow,
  SmsProviderType,
} from "@/features/marketing/types";
import type {
  CampaignSmsSenderPoolConfig,
  SmsPreFlightCostSummary,
} from "@brokeros/types";

export interface SmsStep4ReviewLaunchProps {
  audienceSource: AudienceSourceType;
  csvRecipients: CsvLeadRow[];
  totalAudienceCount?: number;
  fromSender: string;
  providerType: SmsProviderType;
  projectName?: string;
  messageContent: string;
  integrations?: any[];
  // Multi-Phone Pools
  senderPools?: CampaignSmsSenderPoolConfig[];
  onSenderPoolsChange?: (pools: CampaignSmsSenderPoolConfig[]) => void;
  allocationMode?: "AUTO_EVEN" | "CUSTOM_PERCENTAGE";
  onAllocationModeChange?: (mode: "AUTO_EVEN" | "CUSTOM_PERCENTAGE") => void;
  // Test Send
  testPhone: string;
  onTestPhoneChange: (val: string) => void;
  onSendTest: () => void;
  isSendingTest: boolean;
  testSendStatus: { ok: boolean; msg: string } | null;
  // Schedule
  scheduledAt: string;
  onScheduledAtChange: (val: string) => void;
  // Submission & Launch
  isSubmitting: boolean;
  onLaunch: () => void;
  onBack: () => void;
  costEstimate?: SmsPreFlightCostSummary | null;
  isLoadingEstimate?: boolean;
}

const POOL_COLORS = [
  { bg: "bg-amber-500", text: "text-amber-800", border: "border-amber-300", lightBg: "bg-amber-50" },
  { bg: "bg-purple-600", text: "text-purple-700", border: "border-purple-300", lightBg: "bg-purple-50" },
  { bg: "bg-emerald-600", text: "text-emerald-700", border: "border-emerald-300", lightBg: "bg-emerald-50" },
  { bg: "bg-sky-600", text: "text-sky-700", border: "border-sky-300", lightBg: "bg-sky-50" },
  { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-300", lightBg: "bg-rose-50" },
  { bg: "bg-indigo-600", text: "text-indigo-700", border: "border-indigo-300", lightBg: "bg-indigo-50" },
];

export function SmsStep4ReviewLaunch({
  audienceSource,
  csvRecipients,
  totalAudienceCount,
  fromSender,
  providerType,
  projectName,
  messageContent,
  integrations = [],
  senderPools = [],
  onSenderPoolsChange,
  allocationMode = "AUTO_EVEN",
  onAllocationModeChange,
  testPhone,
  onTestPhoneChange,
  onSendTest,
  isSendingTest,
  testSendStatus,
  scheduledAt,
  onScheduledAtChange,
  isSubmitting,
  onLaunch,
  onBack,
  costEstimate,
  isLoadingEstimate = false,
}: SmsStep4ReviewLaunchProps) {
  const [isPreFlightOpen, setIsPreFlightOpen] = useState(false);

  // Compute total audience number
  const totalAudience = useMemo(() => {
    if (audienceSource === "CSV_UPLOAD") {
      return csvRecipients.length;
    }
    return typeof totalAudienceCount === "number" ? totalAudienceCount : 0;
  }, [audienceSource, csvRecipients.length, totalAudienceCount]);

  const { segments, isUnicode, charCount } = useMemo(() => {
    return calculateSmsSegments(messageContent || "");
  }, [messageContent]);

  // Extract available numbers across active integrations
  const availableNumbers = useMemo(() => {
    const list: Array<{
      candidateId: string;
      integrationId: string;
      integrationName: string;
      numberId?: string;
      phoneNumber: string;
      senderId?: string;
      provider: SmsProviderType;
      isVerified: boolean;
    }> = [];

    integrations
      .filter((int) => int.isActive)
      .forEach((int) => {
        const intName = int.name || `${int.provider} Gateway`;
        if (int.senderNumbers && int.senderNumbers.length > 0) {
          int.senderNumbers.forEach((num: any) => {
            list.push({
              candidateId: `${int.id}::${num.id}::${num.phoneNumber}`,
              integrationId: int.id,
              integrationName: intName,
              numberId: num.id,
              phoneNumber: num.phoneNumber,
              senderId: num.senderId || int.fromSender,
              provider: int.provider,
              isVerified: num.isVerified,
            });
          });
        } else if (int.fromSender) {
          list.push({
            candidateId: `${int.id}::primary::${int.fromSender}`,
            integrationId: int.id,
            integrationName: intName,
            numberId: `primary-${int.id}`,
            phoneNumber: int.fromSender,
            senderId: int.fromSender,
            provider: int.provider,
            isVerified: true,
          });
        }
      });

    return list;
  }, [integrations]);

  // Helper: check if a specific candidate is in the current SMS pools
  const isCandidateInSmsPool = (
    cand: (typeof availableNumbers)[0],
    pools: CampaignSmsSenderPoolConfig[]
  ) => {
    return pools.some((p) => {
      if (p.integrationId && cand.integrationId) {
        return (
          p.integrationId === cand.integrationId &&
          p.phoneNumber === cand.phoneNumber
        );
      }
      if (p.senderNumberId && cand.numberId && !cand.numberId.startsWith("primary-")) {
        return p.senderNumberId === cand.numberId;
      }
      return p.phoneNumber === cand.phoneNumber && p.provider === cand.provider;
    });
  };

  // Initialize pools if empty and candidates exist
  React.useEffect(() => {
    if (senderPools.length === 0 && availableNumbers.length > 0 && onSenderPoolsChange) {
      // If user selected a specific gateway (e.g. TWILIO), strictly filter candidate numbers to that provider!
      const filtered =
        providerType
          ? availableNumbers.filter((item) => item.provider === providerType)
          : availableNumbers;

      const candidates = filtered.length > 0 ? filtered : availableNumbers;

      const initialPools: CampaignSmsSenderPoolConfig[] = candidates.slice(0, 3).map((item, idx, arr) => {
        const pct = Math.round(100 / arr.length);
        return {
          senderNumberId: item.numberId?.startsWith("primary-") ? undefined : item.numberId,
          integrationId: item.integrationId,
          accountName: item.integrationName,
          phoneNumber: item.phoneNumber,
          senderId: item.senderId,
          provider: item.provider,
          allocationPercentage: pct,
          allocatedLeads: Math.round((totalAudience * pct) / 100),
        };
      });
      onSenderPoolsChange(initialPools);
    }
  }, [availableNumbers, senderPools.length, onSenderPoolsChange, totalAudience, providerType]);

  // Toggle phone number in sender pool
  const handleToggleNumberInPool = (cand: (typeof availableNumbers)[0]) => {
    if (!onSenderPoolsChange) return;

    const exists = isCandidateInSmsPool(cand, senderPools);

    let updated: CampaignSmsSenderPoolConfig[];
    if (exists) {
      if (senderPools.length <= 1) return; // Keep at least one
      updated = senderPools.filter((p) => {
        if (p.integrationId && cand.integrationId) {
          return !(
            p.integrationId === cand.integrationId &&
            p.phoneNumber === cand.phoneNumber
          );
        }
        if (p.senderNumberId && cand.numberId && !cand.numberId.startsWith("primary-")) {
          return p.senderNumberId !== cand.numberId;
        }
        return !(p.phoneNumber === cand.phoneNumber && p.provider === cand.provider);
      });
    } else {
      updated = [
        ...senderPools,
        {
          senderNumberId: cand.numberId?.startsWith("primary-") ? undefined : cand.numberId,
          integrationId: cand.integrationId,
          accountName: cand.integrationName,
          phoneNumber: cand.phoneNumber,
          senderId: cand.senderId,
          provider: cand.provider,
          allocationPercentage: 0,
          allocatedLeads: 0,
        },
      ];
    }

    // Rebalance percentages
    const count = updated.length;
    if (count > 0) {
      const evenPct = Math.floor(100 / count);
      const remainder = 100 - evenPct * count;
      updated = updated.map((p, idx) => {
        const pct = idx === 0 ? evenPct + remainder : evenPct;
        return {
          ...p,
          allocationPercentage: pct,
          allocatedLeads: Math.round((totalAudience * pct) / 100),
        };
      });
    }

    onSenderPoolsChange(updated);
  };

  // Slider change handler
  const handleSliderChange = (idx: number, newPct: number) => {
    if (!onSenderPoolsChange || senderPools.length <= 1) return;

    const updated = [...senderPools];
    const oldPct = updated[idx].allocationPercentage || 0;
    const delta = newPct - oldPct;
    updated[idx] = {
      ...updated[idx],
      allocationPercentage: newPct,
      allocatedLeads: Math.round((totalAudience * newPct) / 100),
    };

    // Rebalance other sliders proportionally
    const otherIndices = updated.map((_, i) => i).filter((i) => i !== idx);
    const otherTotal = otherIndices.reduce((sum, i) => sum + (updated[i].allocationPercentage || 0), 0);

    if (otherTotal > 0) {
      otherIndices.forEach((i) => {
        const currentOther = updated[i].allocationPercentage || 0;
        const proportion = currentOther / otherTotal;
        const adjusted = Math.max(0, Math.round(currentOther - delta * proportion));
        updated[i] = {
          ...updated[i],
          allocationPercentage: adjusted,
          allocatedLeads: Math.round((totalAudience * adjusted) / 100),
        };
      });
    }

    onSenderPoolsChange(updated);
  };

  const currentPools = senderPools.length > 0 ? senderPools : [
    {
      phoneNumber: fromSender || availableNumbers[0]?.phoneNumber || "",
      senderId: fromSender || availableNumbers[0]?.senderId || "BrokerOS",
      provider: providerType || availableNumbers[0]?.provider || "TWILIO",
      allocationPercentage: 100,
      allocatedLeads: totalAudience,
    },
  ];

  // Calculate exact integer distribution across pools using Hamilton-Hare Largest Remainder
  const poolAllocations = useMemo(() => {
    const pools = currentPools;
    const n = pools.length;
    if (n === 0 || totalAudience <= 0) {
      return pools.map((p) => ({
        ...p,
        calculatedLeads: 0,
        calculatedSegs: 0,
      }));
    }

    let weights: number[];
    if (allocationMode === "AUTO_EVEN") {
      weights = pools.map(() => 1 / n);
    } else {
      const rawSum = pools.reduce((sum, p) => sum + (p.allocationPercentage || 0), 0);
      weights = rawSum > 0 ? pools.map((p) => (p.allocationPercentage || 0) / rawSum) : pools.map(() => 1 / n);
    }

    const targetCounts = weights.map((w) => Math.floor(totalAudience * w));
    const allocatedSum = targetCounts.reduce((acc, c) => acc + c, 0);
    const remainder = totalAudience - allocatedSum;

    const remainders = weights.map((w, idx) => ({
      idx,
      fractional: totalAudience * w - targetCounts[idx],
    }));
    remainders.sort((a, b) => b.fractional - a.fractional);

    for (let i = 0; i < remainder; i++) {
      targetCounts[remainders[i].idx]++;
    }

    return pools.map((p, idx) => {
      const count = targetCounts[idx] ?? 0;
      return {
        ...p,
        calculatedLeads: count,
        calculatedSegs: count * segments,
      };
    });
  }, [currentPools, totalAudience, allocationMode, segments]);

  // Keep senderPools allocatedLeads in sync with totalAudience and Hamilton-Hare calculations
  React.useEffect(() => {
    if (senderPools.length > 0 && onSenderPoolsChange) {
      const needsSync = senderPools.some(
        (sp, idx) => sp.allocatedLeads !== poolAllocations[idx]?.calculatedLeads
      );
      if (needsSync) {
        const updated = senderPools.map((sp, idx) => ({
          ...sp,
          allocatedLeads: poolAllocations[idx]?.calculatedLeads ?? 0,
        }));
        onSenderPoolsChange(updated);
      }
    }
  }, [poolAllocations, senderPools, onSenderPoolsChange]);

  return (
    <div className="space-y-6 animate-enter">
      {/* 1. Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
            Audience Target
          </span>
          <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)]">
            {totalAudience.toLocaleString()} Leads
          </div>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
            {audienceSource === "CSV_UPLOAD" ? "Uploaded CSV audience" : "CRM filter matches"}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
            Message Segments
          </span>
          <div className="mt-1.5 text-xl font-extrabold text-amber-700">
            {segments} <span className="text-xs font-normal text-slate-500">seg / message</span>
          </div>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
            {charCount} chars • {isUnicode ? "Unicode (UCS-2)" : "GSM-7 Plain"}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
            Total Billing Units
          </span>
          <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)]">
            {(totalAudience * segments).toLocaleString()} Segs
          </div>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
            Dispatched in parallel streams
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
            Linked Project Asset
          </span>
          <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)] truncate">
            {projectName || "General Broadcast"}
          </div>
          <p className="text-xs font-bold text-amber-600 mt-0.5">
            Dynamic Shortlink & CTR Active
          </p>
        </div>
      </div>

      {/* 2. Multi-Sender Phone Number Pool Configurator */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Parallel Sender Phone Pool & Quota Allocation
                </h3>
                <Badge variant="default" className="text-[10px] font-extrabold bg-amber-50 text-amber-900 border-amber-200">
                  Carrier Bridging
                </Badge>
              </div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
                Distribute {totalAudience.toLocaleString()} SMS messages across multiple verified phone numbers to avoid carrier carrier filtering and 429 throttling.
              </p>
            </div>
          </div>

          {/* Allocation Mode Switcher */}
          {onAllocationModeChange && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onAllocationModeChange("AUTO_EVEN")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${allocationMode === "AUTO_EVEN"
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
              >
                Auto-Even Split
              </button>
              <button
                type="button"
                onClick={() => onAllocationModeChange("CUSTOM_PERCENTAGE")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${allocationMode === "CUSTOM_PERCENTAGE"
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
              >
                Custom Weighted
              </button>
            </div>
          )}
        </div>

        {/* Candidate Phone Numbers Selector */}
        {availableNumbers.length === 0 ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>No verified sender phone numbers found. Please configure an SMS gateway in Settings before launching.</span>
            </div>
            <a
              href="/dashboard/marketing/sms/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shrink-0 transition-colors"
            >
              <span>Configure Gateway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[var(--text-secondary)] block">
              Active Carrier Numbers & Routes:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {availableNumbers.map((num) => {
                const isSelected = isCandidateInSmsPool(num, currentPools);
                const prov =
                  (SMS_PROVIDERS as Record<string, any>)[num.provider] ||
                  SMS_PROVIDERS.TWILIO;

                return (
                  <button
                    key={num.candidateId}
                    type="button"
                    onClick={() => handleToggleNumberInPool(num)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${isSelected
                      ? "bg-amber-50/70 border-amber-300 shadow-2xs"
                      : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-extrabold text-xs text-[var(--text-primary)] truncate">
                        {num.integrationName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)] font-semibold mt-0.5">
                        {num.phoneNumber}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] font-bold mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: prov.color }}
                        />
                        <span>{prov.name}</span>
                        {num.senderId && num.senderId !== num.phoneNumber && (
                          <span>• {num.senderId}</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${isSelected
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "border border-slate-300 bg-white"
                        }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pool Allocation Sliders */}
        <div className="space-y-3 pt-2">
          {poolAllocations.map((pool, idx) => {
            const color = POOL_COLORS[idx % POOL_COLORS.length];
            const pct = pool.allocationPercentage || 0;
            const leads = pool.calculatedLeads;
            const poolSegs = pool.calculatedSegs;
            const provPricing =
              (SMS_PROVIDER_PRICING_ESTIMATES as Record<string, any>)[pool.provider || "TWILIO"] ||
              SMS_PROVIDER_PRICING_ESTIMATES.TWILIO;

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                    <span className="font-extrabold text-xs text-[var(--text-primary)]">
                      {pool.accountName || pool.phoneNumber || pool.senderId || "Sender Route"}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">
                      ({pool.provider || "TWILIO"})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-extrabold text-amber-700 tabular-nums">
                      {leads.toLocaleString()} leads ({pct}%)
                    </span>
                    <span className="font-mono font-bold text-slate-500 text-[11px]">
                      {poolSegs.toLocaleString()} segs (~${(poolSegs * provPricing.costPerSegmentUSD).toFixed(2)})
                    </span>
                  </div>
                </div>

                {allocationMode === "CUSTOM_PERCENTAGE" && currentPools.length > 1 && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pct}
                    onChange={(e) => handleSliderChange(idx, Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Live Test SMS Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Dispatch Live Test SMS
              </h3>
            </div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
              Verify handset rendering, merge tags replacement, and shortlink redirection on your mobile device.
            </p>
          </div>
          <Badge variant="default" className="text-[10px] bg-amber-50 text-amber-900 border-amber-200">
            Pre-Flight Test
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="tel"
            placeholder="Enter mobile phone (e.g. +91 98765 43210 or +1 202 555 0123)"
            value={testPhone}
            onChange={(e) => onTestPhoneChange(e.target.value)}
            className="w-full sm:flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSendTest}
            disabled={isSendingTest || !testPhone}
            className="w-full sm:w-auto h-9 px-4 text-xs font-bold gap-2"
          >
            <Send className={`w-3.5 h-3.5 ${isSendingTest ? "animate-spin" : ""}`} />
            <span>{isSendingTest ? "Sending Test..." : "Send Test SMS"}</span>
          </Button>
        </div>

        {testSendStatus && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xs ${testSendStatus.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
          >
            {testSendStatus.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testSendStatus.msg}</span>
          </div>
        )}
      </div>

      {/* 4. Optional Schedule Time Picker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <label
            htmlFor="smsScheduledAt"
            className="text-xs font-extrabold text-[var(--text-primary)]"
          >
            Schedule for Future Dispatch (Optional — Leave blank to launch immediately)
          </label>
        </div>
        <input
          id="smsScheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => onScheduledAtChange(e.target.value)}
          className="w-full sm:max-w-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
        />
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Message Editor</span>
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => setIsPreFlightOpen(true)}
          disabled={isSubmitting}
          className="gap-2 text-xs font-bold shadow-md bg-amber-500 hover:bg-amber-600 text-slate-950 px-5"
        >
          <Zap className="w-4 h-4" />
          <span>Launch SMS Campaign Now</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Pre-Flight Cost & Quota Verification Modal */}
      <SmsPreFlightModal
        isOpen={isPreFlightOpen}
        onClose={() => setIsPreFlightOpen(false)}
        onConfirm={() => {
          setIsPreFlightOpen(false);
          onLaunch();
        }}
        isLaunching={isSubmitting}
        campaignTitle={fromSender ? `SMS: ${fromSender}` : "SMS Broadcast"}
        messageContent={messageContent}
        totalAudience={totalAudience}
        senderPools={currentPools}
        allocationMode={allocationMode}
        costEstimate={costEstimate}
        isLoadingEstimate={isLoadingEstimate}
      />
    </div>
  );
}
