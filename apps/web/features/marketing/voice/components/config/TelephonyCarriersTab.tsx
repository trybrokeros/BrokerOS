'use client';

import React, { useState } from 'react';
import {
  Phone,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  X,
  Loader2,
  ShieldCheck,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { VOICE_TELEPHONY_PROVIDERS } from '@brokeros/constants';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import type {
  VoiceTelephonyIntegrationRecord,
  VoiceTelephonyType,
} from '@/features/marketing/types';

interface TelephonyCarriersTabProps {
  telephonyIntegrations: VoiceTelephonyIntegrationRecord[];
  onAddTelephony: (data: any) => Promise<void>;
  onDeleteTelephony: (id: string) => Promise<void>;
}

export const TelephonyCarriersTab: React.FC<TelephonyCarriersTabProps> = ({
  telephonyIntegrations,
  onAddTelephony,
  onDeleteTelephony,
}) => {
  const [selectedTelephonyProvider, setSelectedTelephonyProvider] =
    useState<VoiceTelephonyType | null>(null);

  const [telName, setTelName] = useState('');
  const [telAccountSid, setTelAccountSid] = useState('');
  const [telAuthToken, setTelAuthToken] = useState('');
  const [telApiKey, setTelApiKey] = useState('');
  const [telApiToken, setTelApiToken] = useState('');
  const [telFromNumbers, setTelFromNumbers] = useState('');
  const [telSubdomain, setTelSubdomain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyResults, setVerifyResults] = useState<Record<string, { isValid: boolean; latencyMs: number }>>({});

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

  const handleVerifyCarrier = async (id: string) => {
    try {
      setVerifyingId(id);
      const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/telephony/${id}/verify`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.isValid) {
        setVerifyResults((prev) => ({
          ...prev,
          [id]: { isValid: true, latencyMs: data.latencyMs },
        }));
        toast.success(`Carrier verified successfully in ${data.latencyMs}ms!`);
      } else {
        setVerifyResults((prev) => ({
          ...prev,
          [id]: { isValid: false, latencyMs: data.latencyMs || 0 },
        }));
        toast.error('Carrier authentication failed. Please update credentials.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to ping carrier API');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleOpenTelephonyModal = (prov: VoiceTelephonyType) => {
    setSelectedTelephonyProvider(prov);
    setTelName(`${(VOICE_TELEPHONY_PROVIDERS as any)[prov]?.name || prov} Line`);
    setTelAccountSid('');
    setTelAuthToken('');
    setTelApiKey('');
    setTelApiToken('');
    setTelFromNumbers('');
    setTelSubdomain('');
  };

  const handleSaveTelephony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTelephonyProvider || !telName.trim()) return;

    try {
      setSubmitting(true);
      const numbers = telFromNumbers
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      await onAddTelephony({
        provider: selectedTelephonyProvider,
        name: telName.trim(),
        accountSid: telAccountSid || undefined,
        authToken: telAuthToken || undefined,
        apiKey: telApiKey || undefined,
        apiToken: telApiToken || undefined,
        subdomain: telSubdomain || undefined,
        fromNumbers: numbers,
        isDefault: telephonyIntegrations.length === 0,
      });

      toast.success('Telephony carrier verified and connected successfully');
      setSelectedTelephonyProvider(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to verify and connect telephony carrier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Connected Telephony Gateways */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Connected Telephony Carrier Trunks
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Your connected carrier trunks (Twilio, Vobiz AI, Exotel, Telnyx) for outbound PSTN dialing and Caller IDs.
          </p>
        </div>

        {telephonyIntegrations.length === 0 ? (
          <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
            <Phone className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">
              No telephony carriers connected yet
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Connect your Twilio, Vobiz AI, Exotel, or Telnyx accounts below to enable live phone dialing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {telephonyIntegrations.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                          {item.name}
                        </h4>
                        <Badge variant="default" className="text-[10px]">
                          {item.provider}
                        </Badge>
                        {item.isDefault && (
                          <Badge variant="success" className="text-[9px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1 font-mono">
                        Caller IDs:{' '}
                        <span className="text-[var(--text-primary)] font-bold">
                          {item.fromNumbers?.length
                            ? item.fromNumbers.join(', ')
                            : 'None configured'}
                        </span>
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTelephony(item.id)}
                      className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-2">
                    {verifyResults[item.id] ? (
                      verifyResults[item.id].isValid ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified ({verifyResults[item.id].latencyMs}ms)
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Auth Error
                        </span>
                      )
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for dialing
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyCarrier(item.id)}
                      disabled={verifyingId === item.id}
                      className="h-6 px-2 text-[10px] font-bold gap-1 text-slate-700 bg-slate-50 hover:bg-slate-100"
                    >
                      {verifyingId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Activity className="w-3 h-3 text-indigo-600" />
                      )}
                      <span>Ping Check</span>
                    </Button>
                  </div>

                  <span className="text-[var(--text-muted)]">
                    Connected {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Telephony Adapters Directory */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Available Telephony Carrier Adapters
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Connect programmable carrier trunks to route broadcasts through your private billing accounts and DID lines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['TWILIO', 'VOBIZ', 'EXOTEL', 'TELNYX'] as const).map((prov) => {
            const config = (VOICE_TELEPHONY_PROVIDERS as any)[prov] || {
              name: prov,
              badge: 'PSTN Carrier',
              description: 'High concurrency voice carrier trunk',
              docsUrl: 'https://docs.brokeros.com',
            };

            return (
              <div
                key={prov}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      {config.badge}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                    {config.name}
                  </h4>
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
                    onClick={() => handleOpenTelephonyModal(prov)}
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

      {/* CONNECT TELEPHONY MODAL DIALOG */}
      {selectedTelephonyProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Connect {selectedTelephonyProvider} Carrier
                </h3>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Configure verified carrier credentials and outbound Caller ID numbers.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTelephonyProvider(null)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 bg-indigo-50/80 border border-indigo-100/90 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Live Credential Validation:</strong> Your SID, API Key, and Token will be authenticated directly with the <strong>{selectedTelephonyProvider}</strong> API server before saving to prevent invalid configurations.
              </p>
            </div>

            <form onSubmit={handleSaveTelephony} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Connection Nickname
                </label>
                <input
                  type="text"
                  required
                  value={telName}
                  onChange={(e) => setTelName(e.target.value)}
                  placeholder={`e.g. Production ${selectedTelephonyProvider} Line`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {selectedTelephonyProvider === 'TWILIO' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Twilio Account SID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={telAccountSid}
                      onChange={(e) => setTelAccountSid(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Twilio Auth Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••••••••••••••••••"
                      value={telAuthToken}
                      onChange={(e) => setTelAuthToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === 'VOBIZ' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Vobiz Auth ID (X-Auth-ID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Vobiz Auth Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiToken}
                      onChange={(e) => setTelApiToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === 'EXOTEL' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel Account SID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telAccountSid}
                      onChange={(e) => setTelAccountSid(e.target.value)}
                      placeholder="e.g. shiftconsultant1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel Subdomain / Cluster URL
                    </label>
                    <input
                      type="text"
                      value={telSubdomain}
                      onChange={(e) => setTelSubdomain(e.target.value)}
                      placeholder="api.exotel.com (Singapore) or api.in.exotel.com (India)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Defaults to api.exotel.com (Singapore) or api.in.exotel.com (India cluster).
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel API Key <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel API Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiToken}
                      onChange={(e) => setTelApiToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === 'TELNYX' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Telnyx API Key (v2) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      placeholder="KEYxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Call Control App ID / Connection ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={telSubdomain}
                      onChange={(e) => setTelSubdomain(e.target.value)}
                      placeholder="Auto-detected or enter specific Call Control App ID"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Leave blank to auto-detect your active Call Control Application from Telnyx.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Outbound Caller IDs (comma-separated)
                </label>
                <input
                  type="text"
                  value={telFromNumbers}
                  onChange={(e) => setTelFromNumbers(e.target.value)}
                  placeholder="+919876543210, +14155550199"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTelephonyProvider(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  <span>Save & Verify Gateway</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
