"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { SMS_PROVIDERS } from "@brokeros/constants";
import type { SmsProviderType } from "@/features/marketing/types";
import { Button } from "@/components/ui/Button";

export interface SmsConnectModalProps {
  selectedProvider: SmsProviderType | null;
  onClose: () => void;
  onConnect: (payload: Record<string, unknown>) => Promise<void>;
}

export function SmsConnectModal({
  selectedProvider,
  onClose,
  onConnect,
}: SmsConnectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    fromSender: "",
    accountSid: "",
    authToken: "",
    messagingServiceSid: "",
    apiKey: "",
    apiSecret: "",
    baseUrl: "",
    authId: "",
    servicePlanId: "",
    awsAccessKeyId: "",
    awsSecretKey: "",
    awsRegion: "ap-south-1",
    dltEntityId: "",
    isDefault: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedProvider) {
      setFormData({
        name: `${SMS_PROVIDERS[selectedProvider]?.name || selectedProvider} Gateway`,
        fromSender: "",
        accountSid: "",
        authToken: "",
        messagingServiceSid: "",
        apiKey: "",
        apiSecret: "",
        baseUrl: selectedProvider === "INFOBIP" ? "https://api.infobip.com" : "",
        authId: "",
        servicePlanId: "",
        awsAccessKeyId: "",
        awsSecretKey: "",
        awsRegion: "ap-south-1",
        dltEntityId: "",
        isDefault: true,
      });
    }
  }, [selectedProvider]);

  if (!selectedProvider) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConnect({
        provider: selectedProvider,
        name: formData.name.trim() || `${SMS_PROVIDERS[selectedProvider].name} Gateway`,
        fromSender: formData.fromSender.trim(),
        accountSid: formData.accountSid || undefined,
        authToken: formData.authToken || undefined,
        messagingServiceSid: formData.messagingServiceSid || undefined,
        apiKey: formData.apiKey || undefined,
        apiSecret: formData.apiSecret || undefined,
        baseUrl: formData.baseUrl || undefined,
        authId: formData.authId || undefined,
        servicePlanId: formData.servicePlanId || undefined,
        awsAccessKeyId: formData.awsAccessKeyId || undefined,
        awsSecretKey: formData.awsSecretKey || undefined,
        awsRegion: formData.awsRegion || undefined,
        dltEntityId: formData.dltEntityId || undefined,
        isDefault: formData.isDefault,
      });
      toast.success("SMS provider connected successfully");
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to verify and connect SMS provider");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Connect {SMS_PROVIDERS[selectedProvider]?.name || selectedProvider}
            </h3>
            <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
              Configure verified API credentials and default sender header.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
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
              placeholder={`e.g. Production ${SMS_PROVIDERS[selectedProvider]?.name}`}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
              Default From Sender / Header <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fromSender}
              onChange={(e) => setFormData({ ...formData, fromSender: e.target.value })}
              placeholder="e.g. +12025550123 (Verified Carrier Number) or 6-char Header"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Enter your verified E.164 phone number from your carrier console, or approved header. Verified automatically with the carrier.
            </p>
          </div>

          {selectedProvider === "TWILIO" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Twilio Account SID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={formData.accountSid}
                  onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Twilio Auth Token <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Auth token from Twilio console"
                  value={formData.authToken}
                  onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Messaging Service SID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={formData.messagingServiceSid}
                  onChange={(e) => setFormData({ ...formData, messagingServiceSid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          {selectedProvider === "AWS_SNS" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  AWS Access Key ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={formData.awsAccessKeyId}
                  onChange={(e) => setFormData({ ...formData, awsAccessKeyId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  AWS Secret Access Key <span className="text-rose-500">*</span>
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
                  placeholder="ap-south-1"
                  value={formData.awsRegion}
                  onChange={(e) => setFormData({ ...formData, awsRegion: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          {selectedProvider === "SINCH" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Service Plan ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sinch Service Plan ID"
                  value={formData.servicePlanId}
                  onChange={(e) => setFormData({ ...formData, servicePlanId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  API Token <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Sinch API Token"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          {selectedProvider === "GUPSHUP" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Gupshup API Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Gupshup Enterprise API Key"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  DLT Principal Entity ID (PE ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1701159123456789"
                  value={formData.dltEntityId}
                  onChange={(e) => setFormData({ ...formData, dltEntityId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          {selectedProvider === "INFOBIP" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Infobip Base URL / API Domain <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://xxxxxx.api.infobip.com"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Infobip API Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="App xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  DLT Principal Entity ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1701159123456789"
                  value={formData.dltEntityId}
                  onChange={(e) => setFormData({ ...formData, dltEntityId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          {selectedProvider === "VONAGE" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Vonage API Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1a2b3c4d"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Vonage API Secret <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Vonage API secret"
                  value={formData.apiSecret}
                  onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          {selectedProvider === "TELNYX" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Telnyx API Key (v2) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="KEY01xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Messaging Profile ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 40017xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={formData.messagingServiceSid}
                  onChange={(e) => setFormData({ ...formData, messagingServiceSid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          {selectedProvider === "PLIVO" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Plivo Auth ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAMZXXXXXXXXXXXXXX"
                  value={formData.authId}
                  onChange={(e) => setFormData({ ...formData, authId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Plivo Auth Token <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Plivo Auth Token"
                  value={formData.authToken}
                  onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          {selectedProvider === "BIRD" && (
            <>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Bird / MessageBird Live Access Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Live access key from Bird Developer console"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  API Endpoint URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://rest.messagebird.com"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultSms"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 accent-[var(--brand-600)] rounded-sm"
            />
            <label htmlFor="isDefaultSms" className="text-xs font-bold text-[var(--text-secondary)]">
              Set as default gateway for SMS broadcasts
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying Credentials..." : "Test & Save Gateway"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
