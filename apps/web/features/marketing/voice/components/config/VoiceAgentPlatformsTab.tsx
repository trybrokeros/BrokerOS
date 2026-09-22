'use client';

import React, { useState } from 'react';
import {
  Radio,
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
import { VOICE_AGENT_PLATFORMS } from '@brokeros/constants';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import type {
  VoiceAgentIntegrationRecord,
  VoiceAgentPlatform,
} from '@/features/marketing/types';

interface VoiceAgentPlatformsTabProps {
  agentIntegrations: VoiceAgentIntegrationRecord[];
  onAddAgent: (data: any) => Promise<void>;
  onDeleteAgent: (id: string) => Promise<void>;
}

export const VoiceAgentPlatformsTab: React.FC<VoiceAgentPlatformsTabProps> = ({
  agentIntegrations,
  onAddAgent,
  onDeleteAgent,
}) => {
  const [selectedAgentPlatform, setSelectedAgentPlatform] =
    useState<VoiceAgentPlatform | null>(null);

  const [agentName, setAgentName] = useState('');
  const [agentApiKey, setAgentApiKey] = useState('');
  const [agentOrgId, setAgentOrgId] = useState('');
  const [agentServerUrl, setAgentServerUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyResults, setVerifyResults] = useState<
    Record<string, { isValid: boolean; latencyMs: number; assistantsCount: number }>
  >({});

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

  const handleVerifyAgent = async (id: string) => {
    try {
      setVerifyingId(id);
      const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/agents/${id}/verify`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.isValid) {
        setVerifyResults((prev) => ({
          ...prev,
          [id]: {
            isValid: true,
            latencyMs: data.latencyMs,
            assistantsCount: data.assistantsCount || 0,
          },
        }));
        toast.success(
          `AI Engine verified in ${data.latencyMs}ms (${data.assistantsCount || 0} assistants found)!`
        );
      } else {
        setVerifyResults((prev) => ({
          ...prev,
          [id]: { isValid: false, latencyMs: data.latencyMs || 0, assistantsCount: 0 },
        }));
        toast.error('AI Voice platform authentication failed. Please update your API key.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to ping AI platform API');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleOpenAgentModal = (platform: VoiceAgentPlatform) => {
    setSelectedAgentPlatform(platform);
    setAgentName(`${(VOICE_AGENT_PLATFORMS as any)[platform]?.name || platform} Engine`);
    setAgentApiKey('');
    setAgentOrgId('');
    setAgentServerUrl('');
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentPlatform || !agentName.trim() || !agentApiKey.trim()) return;

    try {
      setSubmitting(true);
      await onAddAgent({
        platform: selectedAgentPlatform,
        name: agentName.trim(),
        apiKey: agentApiKey.trim(),
        orgId: agentOrgId || undefined,
        serverUrl: agentServerUrl || undefined,
        isDefault: agentIntegrations.length === 0,
      });

      toast.success('AI voice platform verified and connected successfully');
      setSelectedAgentPlatform(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to verify and authenticate AI voice platform');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Connected AI Voice Platforms */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Connected AI Voice Platforms
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Configured conversational engines (Vapi, Retell, ElevenLabs, Sarvam, Bolna, OpenAI, LiveKit, Pipecat).
          </p>
        </div>

        {agentIntegrations.length === 0 ? (
          <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
            <Radio className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">
              No custom AI voice platforms connected yet
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Connect your Vapi, Retell, ElevenLabs, Sarvam, or Bolna accounts below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentIntegrations.map((item) => (
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
                          {item.platform}
                        </Badge>
                        {item.isDefault && (
                          <Badge variant="success" className="text-[9px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
                        Engine:{' '}
                        <span className="text-[var(--text-primary)] font-bold">
                          {item.platform} AI Voice
                        </span>
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteAgent(item.id)}
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
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active ({verifyResults[item.id].latencyMs}ms · {verifyResults[item.id].assistantsCount} agents)
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Auth Error
                        </span>
                      )
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Turn-Taking Active
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyAgent(item.id)}
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

      {/* Available AI Voice Platform Adapters Directory */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Available AI Voice Platform Adapters
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Connect autonomous speech-to-speech engines and synthetic voice catalogs for natural sales conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            [
              'VAPI',
              'RETELL',
              'ELEVENLABS',
              'SARVAM',
              'BOLNA',
              'OPENAI_REALTIME',
              'LIVEKIT',
              'PIPECAT',
            ] as const
          ).map((platform) => {
            const config = (VOICE_AGENT_PLATFORMS as any)[platform] || {
              name: platform,
              badge: 'AI Voice Engine',
              description: 'Conversational voice agent engine',
              docsUrl: 'https://docs.brokeros.com',
            };

            return (
              <div
                key={platform}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-xs">
                      <Radio className="w-4 h-4" />
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
                    onClick={() => handleOpenAgentModal(platform)}
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

      {/* CONNECT AGENT PLATFORM MODAL DIALOG */}
      {selectedAgentPlatform && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Connect {selectedAgentPlatform} AI Voice Engine
                </h3>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Configure API key for live speech synthesis and model turn-taking.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAgentPlatform(null)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 bg-indigo-50/80 border border-indigo-100/90 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Live Credential Validation:</strong> Your API key will be authenticated directly with the <strong>{selectedAgentPlatform}</strong> API server before saving to verify active workspace status.
              </p>
            </div>

            <form onSubmit={handleSaveAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Engine Nickname
                </label>
                <input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder={`e.g. Production ${selectedAgentPlatform}`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Platform API Key / Secret Token <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={agentApiKey}
                  onChange={(e) => setAgentApiKey(e.target.value)}
                  placeholder="API Key / Secret Token"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {selectedAgentPlatform === 'VAPI' && (
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Organization ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={agentOrgId}
                    onChange={(e) => setAgentOrgId(e.target.value)}
                    placeholder="org_xxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              )}

              {(selectedAgentPlatform === 'PIPECAT' ||
                selectedAgentPlatform === 'LIVEKIT') && (
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Server Endpoint / Runner URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={agentServerUrl}
                    onChange={(e) => setAgentServerUrl(e.target.value)}
                    placeholder="https://livekit.yourcloud.com or http://localhost:8765"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAgentPlatform(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : null}
                  <span>Save & Authenticate Platform</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
