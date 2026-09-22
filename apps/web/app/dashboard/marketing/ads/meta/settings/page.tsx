"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Key,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Layers,
  AlertCircle,
  HelpCircle,
  Globe,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetaConnectModal } from "@/features/marketing/ads/meta/components/MetaConnectModal";
import type { MetaIntegrationItem } from "@/features/marketing/ads/meta/types";

export default function MetaAdsSettingsPage() {
  const [integrations, setIntegrations] = useState<MetaIntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/marketing/ads/meta/webhooks`;
  const verifyToken = "brokeros_meta_verify_token";

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/integrations`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load Meta integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [baseUrl]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this Meta Ad integration? Cached campaign data will be removed.")) {
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/integrations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Meta Ads integration disconnected successfully");
        loadIntegrations();
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
      title="Meta (Facebook) Ads Settings"
      subtitle="Manage connected Meta Ad accounts, permanent System User tokens, and configure Instant Lead Form webhooks."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/ads/meta">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Meta Ads</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Connected Integrations */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Connected Ads Accounts
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              All active advertising accounts syncing campaigns and leads with BrokerOS CRM.
            </p>
          </div>

          {integrations.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200/80 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Key className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                No Ad Accounts Connected
              </h4>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
                Connect your Meta Business Ad Account using a permanent System User Token to start syncing campaigns and capturing leads.
              </p>
              <Button
                size="sm"
                onClick={() => setIsConnectModalOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect First Ad Account</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {integrations.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-base shrink-0 shadow-xs">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                          {item.name}
                        </h4>
                        {item.isDefault && (
                          <Badge variant="info" className="text-[10px] font-bold">
                            Primary Default
                          </Badge>
                        )}
                        <Badge variant="success" className="text-[10px] font-bold">
                          Active
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-tertiary)] font-mono mt-1">
                        <span>{item.adAccountId}</span>
                        <span>·</span>
                        <span>Currency: {item.currency}</span>
                        {item.lastSyncedAt && (
                          <>
                            <span>·</span>
                            <span>
                              Synced: {new Date(item.lastSyncedAt).toLocaleTimeString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1 text-xs font-bold"
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

        {/* Right Column: Webhook Setup Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Lead Form Webhook Ingestion
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Receive Facebook Instant Lead Form submissions in real-time.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-primary)]">
                Callback URL
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full px-3 py-2 font-mono text-[11px] rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrl, "url")}
                  className="shrink-0 text-xs px-2.5 py-2 font-bold"
                >
                  {copiedField === "url" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-primary)]">
                Verify Token
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={verifyToken}
                  className="w-full px-3 py-2 font-mono text-[11px] rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(verifyToken, "token")}
                  className="shrink-0 text-xs px-2.5 py-2 font-bold"
                >
                  {copiedField === "token" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h5 className="font-extrabold text-[var(--text-primary)] text-[11px] uppercase tracking-wider">
                Setup Steps in Meta Developer Portal:
              </h5>
              <ol className="list-decimal list-inside space-y-1.5 text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                <li>Go to developers.facebook.com → Your App.</li>
                <li>Add <strong>Webhooks</strong> product → Select <strong>Page</strong> object.</li>
                <li>Click <strong>Subscribe to this object</strong> and enter Callback URL & Verify Token.</li>
                <li>Subscribe to the <strong>leadgen</strong> field.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <MetaConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={loadIntegrations}
      />
    </DashboardPageWrapper>
  );
}
