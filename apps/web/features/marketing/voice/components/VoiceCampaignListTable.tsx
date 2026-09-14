"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  PhoneCall,
  Clock,
  Trash2,
  ChevronRight,
  Radio,
  Search,
  Sparkles,
  Building,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { VoiceCampaignItem } from "@/features/marketing/types";

export interface VoiceCampaignListTableProps {
  campaigns: VoiceCampaignItem[];
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
}

export function VoiceCampaignListTable({
  campaigns = [],
  onDelete,
  loading = false,
}: VoiceCampaignListTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.project?.name && c.project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.scriptPrompt && c.scriptPrompt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50/80 text-blue-700 border border-blue-200/80 animate-pulse">
            <Radio className="w-3 h-3 text-blue-600" />
            Calling Active
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50/80 text-emerald-700 border border-emerald-200/80">
            Completed
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50/80 text-amber-700 border border-amber-200/80">
            Scheduled
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-50 text-slate-700 border border-slate-200/80">
            Draft
          </span>
        );
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search voice campaigns by title, project, or prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto">
          {["ALL", "PROCESSING", "COMPLETED", "SCHEDULED", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${statusFilter === st
                ? "bg-white text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              {st === "ALL" ? "All Broadcasts" : st === "PROCESSING" ? "Active Calls" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-secondary)]">
            <thead className="bg-slate-50/90 text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Campaign & Project</th>
                <th className="py-3.5 px-4">Engine Stack</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Progress / Dials</th>
                <th className="py-3.5 px-4">Talk Time</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold">
                      <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Loading voice broadcast campaigns...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-2.5">
                      <Phone className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No voice campaigns match criteria</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Launch an AI voice calling campaign or adjust your search filter.
                    </p>
                    <Link href="/dashboard/marketing/voice/campaigns/new" className="mt-3 inline-block">
                      <Button size="sm" variant="default" className="text-xs font-bold">
                        Create Voice Campaign
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const total = c.totalRecipients || 0;
                  const completed = c.completedCalls || 0;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/dashboard/marketing/voice/campaigns/${c.id}`}
                          className="group flex flex-col"
                        >
                          <span className="font-extrabold text-xs text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">
                            {c.title}
                          </span>
                          <span className="text-[11px] text-[var(--text-tertiary)] font-semibold flex items-center gap-1 mt-0.5">
                            {c.project?.name || "All Inventory"}
                            {c.isCpCampaign && (
                              <Badge variant="default" className="text-[9px] px-1 py-0 bg-amber-50 text-amber-700">
                                CP World
                              </Badge>
                            )}
                          </span>
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded w-fit uppercase">
                            {c.agentIntegration?.platform || "VAPI"} AI
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Line: {c.telephony?.provider || "TWILIO"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-28">
                          <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-600">
                            <span>{completed}/{total}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {formatDuration(c.totalDurationSec || 0)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-500 font-medium">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/marketing/voice/campaigns/${c.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs font-bold px-2.5">
                              <span>Analytics</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>

                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(c.id)}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                              title="Delete Campaign"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
    </div>
  );
}
