// ============================================================================
// BrokerOS — SMS Provider & Sender Phone Numbers Configuration Card
// ============================================================================

"use client";

import React, { useState } from "react";
import {
  Key,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  MessageSquare,
  Zap,
  ShieldCheck,
  RefreshCw,
  Phone,
  Hash,
  X,
} from "lucide-react";
import { SMS_PROVIDERS } from "@brokeros/constants";
import type { SmsProviderType, SmsIntegrationRecord } from "@/features/marketing/types";
export type { SmsIntegrationRecord };
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { SmsConnectModal } from "./config/SmsConnectModal";

export interface SmsProviderConfigCardProps {
  integrations: SmsIntegrationRecord[];
  onConnect: (payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSyncNumbers?: (id: string) => Promise<void>;
  onAddNumber?: (
    integrationId: string,
    payload: { phoneNumber: string; dltHeader?: string; dailyQuota?: number }
  ) => Promise<void>;
  onDeleteNumber?: (numberId: string) => Promise<void>;
}

export function SmsProviderConfigCard({
  integrations,
  onConnect,
  onDelete,
  onSyncNumbers,
  onAddNumber,
  onDeleteNumber,
}: SmsProviderConfigCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<SmsProviderType | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [addingNumberIntegrationId, setAddingNumberIntegrationId] = useState<string | null>(null);
  const [numberFormData, setNumberFormData] = useState({
    phoneNumber: "",
    dltHeader: "",
    dailyQuota: 5000,
  });
  const [isSubmittingNumber, setIsSubmittingNumber] = useState(false);

  const handleAddNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingNumberIntegrationId || !onAddNumber) return;
    if (!numberFormData.phoneNumber.trim()) return;

    try {
      setIsSubmittingNumber(true);
      await onAddNumber(addingNumberIntegrationId, {
        phoneNumber: numberFormData.phoneNumber.trim(),
        dltHeader: numberFormData.dltHeader.trim() || undefined,
        dailyQuota: Number(numberFormData.dailyQuota) || 5000,
      });
      setAddingNumberIntegrationId(null);
      setNumberFormData({ phoneNumber: "", dltHeader: "", dailyQuota: 5000 });
    } catch (err: any) {
      alert(err?.message || "Failed to add sender phone number");
    } finally {
      setIsSubmittingNumber(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. SYSTEM DEFAULT MASTER ENGINE ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  BrokerOS Master Engine (Amazon SNS & DLT High-Throughput)
                </h3>
                <Badge variant="default" className="text-[10px] bg-emerald-100 text-emerald-800">
                  Master Default
                </Badge>
              </div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
                Pre-configured high-scale SMS delivery pipeline with automated DLT header matching and carrier failover.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 99.4% Delivery Rate
                </span>
                <span className="flex items-center gap-1 text-purple-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> DLT Entity Verification
                </span>
                <span className="text-[var(--text-muted)] font-mono text-[11px]">
                  Carrier: Amazon SNS (ap-south-1)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-between self-stretch shrink-0">
            <Badge variant="brand" className="text-[11px] font-extrabold">
              0 Setup Required
            </Badge>
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
              Starting at $0.0079 / SMS
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. ACTIVE USER GATEWAYS & SENDER NUMBERS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Connected SMS Gateways</h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Your connected carrier accounts (Twilio, AWS SNS, Sinch, Gupshup) for programmable SMS and multi-phone pooling.
            </p>
          </div>
        </div>

        {integrations.length === 0 ? (
          <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
            <Key className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">No custom SMS gateways connected yet</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Connect your own Twilio, AWS SNS, Sinch, or Gupshup carrier accounts below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {integrations.map((int) => {
              const numbers = int.senderNumbers || [];
              const isSyncing = syncingId === int.id;

              return (
                <div
                  key={int.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{int.name}</h4>
                          <Badge variant="default" className="text-[10px]">
                            {int.provider}
                          </Badge>
                          {int.isDefault && (
                            <Badge variant="brand" className="text-[10px]">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
                          Default Sender: <span className="text-[var(--text-primary)] font-bold">{int.fromSender}</span>
                        </p>
                        {int.dltEntityId && (
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                            DLT PE ID: {int.dltEntityId}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(int.id)}
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                        title="Disconnect Gateway"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Sender Phone Numbers Section */}
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-[11px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                            Sender Phone Numbers & Pools ({numbers.length})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onSyncNumbers && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSyncing}
                              onClick={async () => {
                                setSyncingId(int.id);
                                try {
                                  await onSyncNumbers(int.id);
                                } finally {
                                  setSyncingId(null);
                                }
                              }}
                              className="h-6 px-2 text-[10px] font-bold gap-1 rounded-lg"
                              title="Fetch verified phone numbers directly from carrier API"
                            >
                              <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-purple-600" : ""}`} />
                              <span>{isSyncing ? "Syncing..." : "Sync Numbers"}</span>
                            </Button>
                          )}

                          {onAddNumber && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAddingNumberIntegrationId(int.id);
                                setNumberFormData({
                                  phoneNumber: "",
                                  dltHeader: int.fromSender || "",
                                  dailyQuota: 5000,
                                });
                              }}
                              className="h-6 px-2 text-[10px] font-bold gap-1 rounded-lg text-purple-700 bg-purple-50/60 hover:bg-purple-100/80 border-purple-200"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Number</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Number Cards */}
                      {numbers.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-2">
                          No dedicated sender numbers registered. Click "Sync Numbers" or "Add Number".
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {numbers.map((num) => (
                            <div
                              key={num.id}
                              className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 truncate">
                                    {num.phoneNumber}
                                  </span>
                                  {num.isVerified && (
                                    <Badge variant="default" className="text-[9px] text-emerald-600 bg-emerald-50 border-emerald-200 py-0">
                                      Verified
                                    </Badge>
                                  )}
                                  {num.dltHeader && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      [{num.dltHeader}]
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-medium">
                                  <span>Daily Quota: {num.dailyQuota.toLocaleString()}</span>
                                  <span>•</span>
                                  <span>Sent Today: {num.sentToday}</span>
                                </div>
                              </div>

                              {onDeleteNumber && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteNumber(num.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                  title="Remove Number"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px]">
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for dispatch
                    </span>
                    <span className="text-[var(--text-muted)]">
                      Connected {new Date(int.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. AVAILABLE ADAPTERS DIRECTORY ── */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Available SMS Provider Adapters</h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Connect high-scale messaging APIs to route broadcasts through your own billing accounts and headers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(
            [
              "TWILIO",
              "AWS_SNS",
              "SINCH",
              "GUPSHUP",
              "INFOBIP",
              "VONAGE",
              "TELNYX",
              "PLIVO",
              "BIRD",
            ] as const
          ).map((prov) => {
            const config = SMS_PROVIDERS[prov];
            return (
              <div
                key={prov}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      {config.badge}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{config.name}</h4>
                  <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-1 line-clamp-2">
                    {config.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={config.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[var(--brand-600)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>API Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProvider(prov)}
                    className="h-7 px-2.5 text-[11px] font-bold gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Connect</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. ADD SENDER NUMBER MODAL DIALOG ── */}
      {addingNumberIntegrationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Add Sender Phone Number</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddingNumberIntegrationId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNumberSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number (E.164)</label>
                <Input
                  required
                  placeholder="+18005550199 or +919876543210"
                  value={numberFormData.phoneNumber}
                  onChange={(e) =>
                    setNumberFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  DLT Header / Sender ID (Optional)
                </label>
                <Input
                  placeholder="e.g. SKYLIN or 6-character header"
                  value={numberFormData.dltHeader}
                  onChange={(e) =>
                    setNumberFormData((prev) => ({ ...prev, dltHeader: e.target.value }))
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Daily Message Quota</label>
                <Input
                  type="number"
                  min={100}
                  max={500000}
                  value={numberFormData.dailyQuota}
                  onChange={(e) =>
                    setNumberFormData((prev) => ({
                      ...prev,
                      dailyQuota: Number(e.target.value),
                    }))
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingNumberIntegrationId(null)}
                  className="h-8 px-3 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingNumber || !numberFormData.phoneNumber.trim()}
                  className="h-8 px-4 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white gap-1.5 rounded-xl"
                >
                  {isSubmittingNumber ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Save Number</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. CONNECT MODAL DIALOG ── */}
      <SmsConnectModal
        selectedProvider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onConnect={onConnect}
      />
    </div>
  );
}
