// ============================================================================
// BrokerOS — Email Interactive Flows Table & Templates Gallery
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  Search,
  Play,
  Pause,
  Layers,
  Edit2,
  Trash2,
  Copy,
  History,
  Globe,
  Radio,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import type { EmailFlow } from '@/features/marketing/types';
import {
  EMAIL_FLOW_TEMPLATES,
  EmailFlowTemplate,
} from './templates/email-flow-templates';

export function EmailFlowsTable() {
  const router = useRouter();
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadFlows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/flows`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFlows(data.items || []);
      } else {
        toast.error('Failed to load email flows');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading flows');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const handleCreateBlankFlow = async () => {
    try {
      setCreating(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Untitled Email Flow',
          description: 'Custom trigger and reply sequence',
          triggerType: 'keyword_match',
          triggerConfig: { keywords: ['info', 'details'], matchType: 'contains' },
          isGlobal: true,
          nodes: [
            {
              nodeKey: 'reply_1',
              nodeType: 'send_email',
              config: {
                subject: 'Thank you for your interest',
                bodyHtml: '<p>Hello {{lead_name}}, thank you for getting in touch!</p>',
              },
              positionX: 100,
              positionY: 100,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message)
          ? errData.message.join(', ')
          : (errData.message || 'Failed to create flow');
        throw new Error(msg);
      }
      const data = await res.json();
      toast.success('Flow created');
      router.push(`/dashboard/marketing/email/flows/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error creating blank flow');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFromTemplate = async (tpl: EmailFlowTemplate) => {
    try {
      setCreating(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: tpl.name,
          description: tpl.description,
          triggerType: tpl.triggerType,
          triggerConfig: tpl.triggerConfig,
          isGlobal: true,
          nodes: tpl.nodes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message)
          ? errData.message.join(', ')
          : (errData.message || 'Failed to create flow from template');
        throw new Error(msg);
      }
      const data = await res.json();
      toast.success(`Created "${tpl.name}" from template`);
      router.push(`/dashboard/marketing/email/flows/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error creating from template');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (flow: any) => {
    const nextStatus = flow.status === 'active' ? 'draft' : 'active';
    try {
      const res = await fetch(`${baseUrl}/api/marketing/email/flows/${flow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update status');
      }
      setFlows((prev) =>
        prev.map((f) => (f.id === flow.id ? { ...f, status: nextStatus } : f))
      );
      toast.success(nextStatus === 'active' ? 'Automation activated' : 'Automation paused');
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleDuplicate = async (flowId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/email/flows/${flowId}/clone`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to clone flow');
      }
      toast.success('Automation duplicated');
      loadFlows();
    } catch (err: any) {
      toast.error(err.message || 'Error duplicating flow');
    }
  };

  const handleDelete = async (flowId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/email/flows/${flowId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete flow');
      setFlows((prev) => prev.filter((f) => f.id !== flowId));
      toast.success('Automation deleted');
      setDeleteConfirmId(null);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting flow');
    }
  };

  const filteredFlows = flows.filter((f) => {
    const q = search.toLowerCase();
    const nameMatch = f.name?.toLowerCase().includes(q);
    const descMatch = f.description?.toLowerCase().includes(q);
    const triggerMatch = f.triggerType?.toLowerCase().includes(q);
    const keywords = f.triggerConfig?.keywords || [];
    const keywordsMatch = keywords.some((k: string) => k.toLowerCase().includes(q));
    return nameMatch || descMatch || triggerMatch || keywordsMatch;
  });

  return (
    <div className="space-y-6">
      {/* Pre-Built Workflow Templates Quick-Start Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Pre-Built Workflow Templates
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMAIL_FLOW_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between rounded-xl border border-border-default bg-bg-surface p-4 shadow-xs hover:border-brand-500/50 hover:shadow-sm transition-all"
            >
              <div>
                <span className="inline-block rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600 mb-2">
                  {tpl.badge || 'Template'}
                </span>
                <h4 className="text-xs font-bold text-text-primary">{tpl.name}</h4>
                <p className="text-[11px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCreateFromTemplate(tpl)}
                disabled={creating}
                className="mt-3 flex items-center justify-between text-xs font-semibold text-brand-600 hover:text-brand-700 pt-2 border-t border-border-default cursor-pointer disabled:opacity-50"
              >
                <span>{creating ? 'Creating...' : 'Use Template'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface p-4 rounded-2xl border border-border-default shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search automations by name, trigger, or scope..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-subtle border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleCreateBlankFlow}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-xs w-full sm:w-auto justify-center cursor-pointer disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>New Automation</span>
        </button>
      </div>

      {/* Automations Table Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle text-text-secondary font-semibold uppercase tracking-wider text-[11px] border-b border-border-default">
              <tr>
                <th className="px-6 py-3.5">Automation Name</th>
                <th className="px-6 py-3.5">Trigger Event</th>
                <th className="px-6 py-3.5">Scope</th>
                <th className="px-6 py-3.5">Steps</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Executions</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                      <span>Loading automations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted">
                    No automations configured yet. Pick a template above or click &quot;New Automation&quot; to start.
                  </td>
                </tr>
              ) : (
                filteredFlows.map((flow) => {
                  const isActive = flow.status === 'active';
                  const keywords = flow.triggerConfig?.keywords || [];
                  const stepsCount = flow.nodesCount ?? flow.nodes?.length ?? 0;
                  const runsCount = flow.runsCount ?? flow._count?.runs ?? 0;

                  return (
                    <tr
                      key={flow.id}
                      className="hover:bg-bg-subtle/50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/marketing/email/flows/${flow.id}`)
                      }
                    >
                      {/* Automation Name */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text-primary text-xs">{flow.name}</p>
                        {flow.description && (
                          <p className="text-[11px] text-text-muted mt-0.5 truncate max-w-xs">
                            {flow.description}
                          </p>
                        )}
                      </td>

                      {/* Trigger Event */}
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-bg-subtle text-text-secondary border border-border-default inline-block max-w-[200px] truncate"
                          title={
                            flow.triggerType === 'keyword_match'
                              ? `Keywords: ${keywords.join(', ')}`
                              : flow.triggerType
                          }
                        >
                          {flow.triggerType === 'keyword_match'
                            ? keywords.length > 0
                              ? `Keywords: ${keywords.slice(0, 2).join(', ')}${keywords.length > 2 ? '...' : ''}`
                              : 'Keyword Match'
                            : flow.triggerType === 'any_reply'
                            ? 'Any Inbound Reply'
                            : flow.triggerType || 'Trigger'}
                        </span>
                      </td>

                      {/* Scope */}
                      <td className="px-6 py-4">
                        {flow.isGlobal ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[11px] font-medium">
                            <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Global (All)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[11px] font-medium">
                            <Radio className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>{flow.campaignIds?.length || 0} Campaign(s)</span>
                          </span>
                        )}
                      </td>

                      {/* Steps */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Layers className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span>{stepsCount} steps</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(flow)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 hover:bg-zinc-500/20'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Play className="w-3 h-3 fill-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3" />
                              <span>Paused</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Executions */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/marketing/email/flows/${flow.id}/runs`)
                          }
                          className="inline-flex items-center gap-1.5 text-brand-600 font-semibold hover:underline cursor-pointer"
                          title="View Execution Run Logs"
                        >
                          <History className="h-3.5 w-3.5 shrink-0" />
                          <span>{runsCount.toLocaleString()} runs</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(flow.id)}
                            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-subtle transition-colors cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/dashboard/marketing/email/flows/${flow.id}`)
                            }
                            className="p-1.5 text-text-muted hover:text-brand-600 rounded-lg hover:bg-bg-subtle transition-colors cursor-pointer"
                            title="Edit Workflow"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(flow.id)}
                            className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Automation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl">
            <h3 className="text-base font-bold text-text-primary">Delete Automation?</h3>
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete this automation? Its triggers, steps, and past run logs will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
