"use client";

import React, { useState } from "react";
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Zap,
  ExternalLink,
  X,
  RefreshCw,
  Globe,
  Mail,
  Layers,
} from "lucide-react";
import { EMAIL_PROVIDERS } from "@brokeros/constants";
import type { EmailProviderType, IntegrationRecord, SenderDomainRecord } from "@/features/marketing/types";
export type { IntegrationRecord };
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface EmailProviderConfigCardProps {
  integrations: IntegrationRecord[];
  onConnect: (payload: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSyncDomains?: (id: string) => Promise<void>;
  onAddDomain?: (integrationId: string, payload: any) => Promise<void>;
  onDeleteDomain?: (domainId: string) => Promise<void>;
}

export function EmailProviderConfigCard({
  integrations,
  onConnect,
  onDelete,
  onSyncDomains,
  onAddDomain,
  onDeleteDomain,
}: EmailProviderConfigCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<EmailProviderType | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [addingDomainIntegrationId, setAddingDomainIntegrationId] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [domainFormData, setDomainFormData] = useState({
    fromEmail: "",
    fromName: "Sales Team",
    dailyQuota: 500,
  });
  const [formData, setFormData] = useState({
    name: "",
    fromName: "Skyline Realty Marketing",
    fromEmail: "marketing@skylinerealty.com",
    apiKey: "",
    awsAccessKeyId: "",
    awsSecretKey: "",
    awsRegion: "ap-south-1",
    mailchimpServer: "us20",
    mailgunDomain: "",
    mailgunRegion: "US",
    oauthClientId: "",
    oauthClientSecret: "",
    oauthRefreshToken: "",
    oauthTenantId: "common",
    googleAppPassword: "",
    authType: "app_password" as "app_password" | "oauth",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (provider: EmailProviderType) => {
    setSelectedProvider(provider);
    const provName = (EMAIL_PROVIDERS as Record<string, any>)[provider]?.name || provider;
    setFormData({
      name: `${provName} Account`,
      fromName: "Skyline Realty Marketing",
      fromEmail: provider === "GMAIL" ? "agent@gmail.com" : provider === "OUTLOOK" ? "sales@outlook.com" : "marketing@skylinerealty.com",
      apiKey: "",
      awsAccessKeyId: "",
      awsSecretKey: "",
      awsRegion: "ap-south-1",
      mailchimpServer: "us20",
      mailgunDomain: "",
      mailgunRegion: "US",
      oauthClientId: "",
      oauthClientSecret: "",
      oauthRefreshToken: "",
      oauthTenantId: "common",
      googleAppPassword: "",
      authType: "app_password",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setIsSubmitting(true);
    try {
      await onConnect({
        provider: selectedProvider,
        ...formData,
      });
      setSelectedProvider(null);
    } catch (err: any) {
      alert(err?.message || "Failed to verify and connect provider");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. BROKEROS SYSTEM DEFAULT ENGINE ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-[var(--brand-600)] shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  BrokerOS Master Engine (Amazon SES Dedicated)
                </h3>
                <Badge variant="success" className="text-[10px]">
                  Master Default
                </Badge>
              </div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
                Pre-configured high-throughput sending engine with automated SPF, DKIM, and DMARC alignment.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Inbox Reputation
                </span>
                <span className="flex items-center gap-1 text-purple-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> Dedicated IP Warmup
                </span>
                <span className="text-[var(--text-muted)] font-mono text-[11px]">
                  Region: ap-south-1 (Mumbai)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-between self-stretch shrink-0">
            <Badge variant="brand" className="text-[11px] font-extrabold">
              0 Setup Required
            </Badge>
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
              Flat rate: $0.10 / 1,000 emails
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. ACTIVE USER INTEGRATIONS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Connected BYO Adapters</h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Custom marketing provider accounts connected to your BrokerOS workspace.
            </p>
          </div>
        </div>

        {integrations.length === 0 ? (
          <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
            <Key className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">No custom providers connected yet</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Connect your own SendGrid, Brevo, Mailchimp, AWS SES, Mailgun, Gmail, Outlook, or Constant Contact accounts below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {integrations.map((int) => {
              const domains = int.senderDomains || [];
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
                          Account Default: <span className="text-[var(--text-primary)] font-bold">{int.fromEmail}</span> ({int.fromName})
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(int.id)}
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                        title="Disconnect Provider"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Sender Domains Section */}
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-[11px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                            Sender Domains & Mailboxes ({domains.length})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onSyncDomains && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSyncing}
                              onClick={async () => {
                                setSyncingId(int.id);
                                try {
                                  await onSyncDomains(int.id);
                                } finally {
                                  setSyncingId(null);
                                }
                              }}
                              className="h-6 px-2 text-[10px] font-bold gap-1 rounded-lg"
                              title="Fetch verified sender identities directly from provider API"
                            >
                              <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-purple-600" : ""}`} />
                              <span>{isSyncing ? "Syncing..." : "Sync Senders"}</span>
                            </Button>
                          )}

                          {onAddDomain && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAddingDomainIntegrationId(int.id);
                                setDomainError(null);
                                setDomainFormData({
                                  fromEmail: "",
                                  fromName: int.fromName || "Sales Team",
                                  dailyQuota: 500,
                                });
                              }}
                              className="h-6 px-2 text-[10px] font-bold gap-1 rounded-lg text-purple-700 bg-purple-50/60 hover:bg-purple-100/80 border-purple-200"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Identity</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {domains.length === 0 ? (
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                          <p className="text-[11px] font-medium text-[var(--text-muted)]">
                            No sender domains registered yet. Click &quot;Sync Senders&quot; to auto-discover or add manually.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {domains.map((d) => (
                            <div
                              key={d.id}
                              className="p-2.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {d.isVerified ? (
                                  <span title="Verified identity" className="inline-flex shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  </span>
                                ) : (
                                  <span title="Unverified" className="inline-flex shrink-0">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                  </span>
                                )}
                                <div className="truncate">
                                  <span className="font-bold text-[var(--text-primary)]">{d.fromEmail}</span>
                                  <span className="text-[10px] text-[var(--text-muted)] ml-1.5">({d.fromName})</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-bold rounded-md">
                                  {d.domain}
                                </span>
                                <span className="text-[10px] font-semibold text-[var(--text-tertiary)]">
                                  {d.dailyQuota}/day
                                </span>
                                {d.isWarmupMode && (
                                  <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold rounded-md">
                                    Warmup
                                  </span>
                                )}
                                {onDeleteDomain && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDeleteDomain(d.id)}
                                    className="h-5 w-5 text-slate-400 hover:text-rose-500 rounded-md p-0"
                                    title="Remove sender domain"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
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
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Available Provider Adapters</h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Connect high-scale delivery APIs to route broadcasts through your own billing accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["AWS_SES", "SENDGRID", "BREVO", "MAILCHIMP", "MAILGUN", "GMAIL", "OUTLOOK", "CONSTANT_CONTACT"] as const).map((prov) => {
            const config = (EMAIL_PROVIDERS as Record<string, any>)[prov];
            if (!config) return null;
            return (
              <div
                key={prov}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-[var(--brand-600)] shadow-xs">
                      <Key className="w-4 h-4" />
                    </div>
                    <Badge variant="default" className="text-[10px]">BYO</Badge>
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
                    onClick={() => handleOpenModal(prov)}
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

      {/* ── 4. CONNECT MODAL DIALOG ── */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Connect {(EMAIL_PROVIDERS as Record<string, any>)[selectedProvider]?.name || selectedProvider}
                </h3>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Configure your provider credentials for live delivery.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedProvider(null)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Account Nickname
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Default From Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Default From Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.fromEmail}
                    onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* AWS SES Credentials */}
              {selectedProvider === "AWS_SES" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      AWS Access Key ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AKIA..."
                      value={formData.awsAccessKeyId}
                      onChange={(e) => setFormData({ ...formData, awsAccessKeyId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      AWS Secret Access Key
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      value={formData.awsSecretKey}
                      onChange={(e) => setFormData({ ...formData, awsSecretKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      AWS Region
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ap-south-1"
                      value={formData.awsRegion}
                      onChange={(e) => setFormData({ ...formData, awsRegion: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {/* SendGrid / Brevo Credentials */}
              {(selectedProvider === "SENDGRID" || selectedProvider === "BREVO") && (
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    API Secret Key
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={selectedProvider === "SENDGRID" ? "SG...." : "xkeysib-...."}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                  />
                </div>
              )}

              {/* Mailchimp Credentials */}
              {selectedProvider === "MAILCHIMP" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Mailchimp API Key
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. 7c8d9e0f...-us20"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Data Center Prefix (Server)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="us20"
                      value={formData.mailchimpServer}
                      onChange={(e) => setFormData({ ...formData, mailchimpServer: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {/* Mailgun Credentials */}
              {selectedProvider === "MAILGUN" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Mailgun Private API Key
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Sending Domain
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="mg.yourbrokerage.com"
                      value={formData.mailgunDomain}
                      onChange={(e) => setFormData({ ...formData, mailgunDomain: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Mailgun Region
                    </label>
                    <select
                      value={formData.mailgunRegion}
                      onChange={(e) => setFormData({ ...formData, mailgunRegion: e.target.value as 'US' | 'EU' })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    >
                      <option value="US">US Region (api.mailgun.net)</option>
                      <option value="EU">EU Frankfurt (api.eu.mailgun.net)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Gmail / Google Workspace Credentials */}
              {selectedProvider === "GMAIL" && (
                <>
                  <div className="flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, authType: "app_password" })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formData.authType === "app_password"
                          ? "bg-white text-[var(--brand-600)] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Google App Password (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, authType: "oauth" })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formData.authType === "oauth"
                          ? "bg-white text-[var(--brand-600)] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      OAuth 2.0 Client
                    </button>
                  </div>

                  {formData.authType === "app_password" ? (
                    <div>
                      <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                        Google App Password (16 characters)
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={formData.googleAppPassword}
                        onChange={(e) => setFormData({ ...formData, googleAppPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Generate via Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                          Google OAuth Client ID
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="xxxxxxxxxx.apps.googleusercontent.com"
                          value={formData.oauthClientId}
                          onChange={(e) => setFormData({ ...formData, oauthClientId: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                          OAuth Client Secret
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
                          value={formData.oauthClientSecret}
                          onChange={(e) => setFormData({ ...formData, oauthClientSecret: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                          OAuth Refresh Token
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="1//0xxxxxxxxxxxxxxxxxxxxxxxx"
                          value={formData.oauthRefreshToken}
                          onChange={(e) => setFormData({ ...formData, oauthRefreshToken: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Microsoft 365 / Outlook Credentials */}
              {selectedProvider === "OUTLOOK" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Azure Application (Client) ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={formData.oauthClientId}
                      onChange={(e) => setFormData({ ...formData, oauthClientId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Client Secret Value
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Azure app secret value"
                      value={formData.oauthClientSecret}
                      onChange={(e) => setFormData({ ...formData, oauthClientSecret: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Azure Tenant ID
                    </label>
                    <input
                      type="text"
                      placeholder="common (or your Azure Tenant GUID)"
                      value={formData.oauthTenantId}
                      onChange={(e) => setFormData({ ...formData, oauthTenantId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      OAuth Refresh Token
                    </label>
                    <input
                      type="password"
                      placeholder="Delegated user refresh token (optional if using Bearer token below)"
                      value={formData.oauthRefreshToken}
                      onChange={(e) => setFormData({ ...formData, oauthRefreshToken: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Direct Bearer Token (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Pre-generated Microsoft Graph Bearer access token"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {/* Constant Contact Credentials */}
              {selectedProvider === "CONSTANT_CONTACT" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Constant Contact Access Token / API Key
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter Constant Contact API Key or Bearer Token"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      OAuth Refresh Token (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Optional refresh token for auto renewal"
                      value={formData.oauthRefreshToken}
                      onChange={(e) => setFormData({ ...formData, oauthRefreshToken: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProvider(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying Credentials..." : "Test & Save Provider"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. ADD SENDER IDENTITY MODAL ── */}
      {addingDomainIntegrationId && (() => {
        const activeInt = integrations.find((i) => i.id === addingDomainIntegrationId);
        const providerName = activeInt ? (EMAIL_PROVIDERS as Record<string, any>)[activeInt.provider]?.name || activeInt.provider : "Email Provider";

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                      Add Sender Identity / Mailbox
                    </h3>
                    {activeInt && (
                      <Badge variant="default" className="text-[10px]">
                        {activeInt.provider}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
                    Will verify identity directly with {providerName} API before adding.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setAddingDomainIntegrationId(null);
                    setDomainError(null);
                  }}
                  className="h-7 w-7 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {domainError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <div className="flex-1 font-medium">{domainError}</div>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!addingDomainIntegrationId || !onAddDomain) return;
                  setDomainError(null);
                  setIsSubmitting(true);
                  try {
                    await onAddDomain(addingDomainIntegrationId, domainFormData);
                    setAddingDomainIntegrationId(null);
                    setDomainFormData({ fromEmail: "", fromName: "Sales Team", dailyQuota: 500 });
                  } catch (err: any) {
                    setDomainError(err?.message || `Failed to verify identity with ${providerName}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder="promotions@yourbrokerage.com"
                    value={domainFormData.fromEmail}
                    onChange={(e) =>
                      setDomainFormData({ ...domainFormData, fromEmail: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs disabled:opacity-50"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Must be a verified sender or belongs to an authenticated domain on your {providerName} account.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="Skyline Offers & Updates"
                    value={domainFormData.fromName}
                    onChange={(e) =>
                      setDomainFormData({ ...domainFormData, fromName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1">
                    Daily Quota Cap
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100000"
                    disabled={isSubmitting}
                    value={domainFormData.dailyQuota}
                    onChange={(e) =>
                      setDomainFormData({
                        ...domainFormData,
                        dailyQuota: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs disabled:opacity-50"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Limits dispatches per day to preserve domain deliverability reputation.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => {
                      setAddingDomainIntegrationId(null);
                      setDomainError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={isSubmitting}
                    className="gap-1.5"
                  >
                    {isSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <span>{isSubmitting ? "Verifying with Provider..." : "Verify & Save Identity"}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
