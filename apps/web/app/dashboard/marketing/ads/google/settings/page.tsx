"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Globe,
  Layers,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { GoogleConnectModal } from "@/features/marketing/ads/google/components/GoogleConnectModal";
import type { GoogleIntegrationItem } from "@/features/marketing/ads/google/types";

export default function GoogleAdsSettingsPage() {
  const [integrations, setIntegrations] = useState<GoogleIntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/marketing/ads/google/webhooks`;
  const webhookKey = "brokeros_google_ads_lead_secret_2026";

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/marketing/ads/google/integrations`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load Google Ads integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [baseUrl]);

  const handleDisconnect = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this Google Ads account?")) {
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/api/marketing/ads/google/integrations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Google Ads account disconnected successfully");
        fetchIntegrations();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to delete integration");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete integration");
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="Google Ads Settings & Webhooks"
      subtitle="Manage connected Google Ads accounts, OAuth credentials, and configure Google Lead Form Asset webhooks for automated CRM lead capture."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/ads/google">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Google Ads</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsConnectModalOpen(true)}
            className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Ad Account</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Connected Google Accounts List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold shadow-xs">
                <GoogleIcon size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-[var(--text-primary)] text-sm">
                  Connected Google Ads Accounts ({integrations.length})
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] font-medium mt-0.5">
                  OAuth-connected ad accounts with read-only campaign metrics sync.
                </p>
              </div>
            </div>
          </div>

          {integrations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200/80">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-[var(--text-primary)]">
                No Google Ads Accounts Connected
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Click "Connect Ad Account" above to authenticate your account with 1-Click Google OAuth.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {integrations.map((acc) => (
                <div
                  key={acc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-xs">
                      <GoogleIcon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)] text-sm">
                          {acc.descriptiveName || acc.name || "Google Ads Account"}
                        </span>
                        {acc.isDefault && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Default Primary
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                          {acc.accountStatus || "ACTIVE"}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                        Customer ID: {acc.customerId} · Currency: {acc.currency || "INR"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(acc.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Google Lead Form Webhook Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-sm">
                Google Lead Form Asset — Webhook Configuration
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] font-medium mt-0.5">
                Automatically route form submissions from Search & PMax ads straight into BrokerOS CRM.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Webhook URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)]">
                Webhook Delivery URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full px-3.5 py-2 text-xs font-mono font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrl, "url")}
                  className="shrink-0 gap-1 text-xs font-bold"
                >
                  {copiedField === "url" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Webhook Secret Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)]">
                Webhook Key (google_key)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookKey}
                  className="w-full px-3.5 py-2 text-xs font-mono font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhookKey, "key")}
                  className="shrink-0 gap-1 text-xs font-bold"
                >
                  {copiedField === "key" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Setup Guide Box */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-2">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>How to setup Google Lead Form Webhook in Google Ads Manager</span>
            </h4>
            <ol className="text-xs text-blue-800/90 space-y-1.5 pl-4 list-decimal leading-relaxed">
              <li>In your <strong>Google Ads account</strong>, navigate to <strong>Ads & Assets</strong> → <strong>Assets</strong> → <strong>Lead Form</strong>.</li>
              <li>Under <strong>Lead delivery options</strong>, select <strong>"Export leads from Google Ads into your CRM"</strong>.</li>
              <li>Paste the <strong>Webhook Delivery URL</strong> and <strong>Webhook Key</strong> from above into the corresponding fields.</li>
              <li>Click <strong>"Send test data"</strong> — verify the test lead pops up in BrokerOS under Inbound Leads!</li>
            </ol>
          </div>
        </div>
      </div>

      <GoogleConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={fetchIntegrations}
      />
    </DashboardPageWrapper>
  );
}
