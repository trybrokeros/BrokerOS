"use client";

import React, { useState } from "react";
import {
  Phone,
  Play,
  Pause,
  FileText,
  Flame,
  AlertCircle,
  Clock,
  Volume2,
  Search,
  Download,
  UserPlus,
  User,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Loader2,
  CloudSun,
  Snowflake,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { mapVoiceSentimentToTemperature } from "@brokeros/constants";
import type { VoiceRecipientItem } from "@/features/marketing/types";

export interface VoiceCallLogsTableProps {
  recipients: VoiceRecipientItem[];
  campaignId?: string;
  campaignTitle?: string;
  onPromote?: (recipientId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function VoiceCallLogsTable({
  recipients = [],
  campaignId,
  campaignTitle = "Voice Campaign",
  onPromote,
  onRefresh,
}: VoiceCallLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTranscriptRecipient, setActiveTranscriptRecipient] = useState<VoiceRecipientItem | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.summary && r.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSentiment =
      selectedSentiment === "ALL" || r.sentiment === selectedSentiment;

    return matchesSearch && matchesSentiment;
  });

  const allVisibleSelected =
    filteredRecipients.length > 0 &&
    filteredRecipients.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      filteredRecipients.forEach((r) => next.add(r.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const renderSentimentDualBadge = (sentiment?: string) => {
    const temp = mapVoiceSentimentToTemperature(sentiment);

    switch (sentiment) {
      case "POSITIVE":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>Positive · HOT 🔥</span>
          </span>
        );
      case "NEGATIVE":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs">
            <Snowflake className="w-3.5 h-3.5 text-blue-500" />
            <span>Negative · COLD ❄️</span>
          </span>
        );
      case "NEUTRAL":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
            <CloudSun className="w-3.5 h-3.5 text-amber-500" />
            <span>Neutral · WARM 🌤️</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Pending / {temp || "WARM"}
          </span>
        );
    }
  };

  const getDispositionBadge = (disposition?: string, status?: string) => {
    if (disposition === "COMPLETED") {
      return <Badge variant="success" className="text-[10px]">Completed</Badge>;
    }
    if (disposition === "BUSY") {
      return <Badge variant="warning" className="text-[10px]">Line Busy</Badge>;
    }
    if (disposition === "NO_ANSWER") {
      return <Badge variant="warning" className="text-[10px]">No Answer</Badge>;
    }
    if (status === "QUEUED") {
      return <Badge variant="default" className="text-[10px]">Queued</Badge>;
    }
    return <Badge variant="default" className="text-[10px]">{disposition || status || "Pending"}</Badge>;
  };

  const handleBulkAssignToPreSales = async (targetRecipientIds?: string[]) => {
    const ids = targetRecipientIds || Array.from(selectedIds);
    if (!campaignId) {
      toast.error("Campaign ID is required for bulk routing");
      return;
    }

    try {
      setIsBulkAssigning(true);
      const res = await fetch(`${baseUrl}/api/marketing/voice/campaigns/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          recipientIds: ids.length > 0 ? ids : undefined,
          sentimentFilter: ids.length === 0 && selectedSentiment !== "ALL" ? selectedSentiment : undefined,
          assignToUserId: null, // Routes to Pre-Sales unassigned intake queue (/new-leads)
          status: "NEW",
          subStatus: "PENDING",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to assign leads to Pre-Sales queue");
      }

      const result = await res.json();
      toast.success(
        `Successfully routed ${result.count || ids.length} leads to Pre-Sales (/new-leads) with call recordings, transcript & AI summary!`
      );
      setSelectedIds(new Set());
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to route leads to Pre-Sales");
    } finally {
      setIsBulkAssigning(false);
    }
  };

  const handleExportCsv = async (targetRecipientIds?: string[]) => {
    const ids = targetRecipientIds || Array.from(selectedIds);
    if (!campaignId) {
      toast.error("Campaign ID is required for export");
      return;
    }

    try {
      setIsExporting(true);
      const res = await fetch(`${baseUrl}/api/marketing/voice/campaigns/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          recipientIds: ids.length > 0 ? ids : undefined,
          sentimentFilter: ids.length === 0 && selectedSentiment !== "ALL" ? selectedSentiment : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate CSV export");
      }

      const data = await res.json();
      const rows = data.rows || [];

      if (rows.length === 0) {
        toast.info("No records found to export");
        return;
      }

      // Build CSV content
      const headers = [
        "Phone",
        "Name",
        "Status",
        "Disposition",
        "Duration (sec)",
        "AI Sentiment",
        "CRM Temperature",
        "AI Summary",
        "Recording URL",
        "Transcript",
        "Lead ID",
        "Completed At",
      ];

      const csvRows = [headers.join(",")];

      rows.forEach((r: any) => {
        const rowData = [
          `"${r.phone || ""}"`,
          `"${(r.name || "").replace(/"/g, '""')}"`,
          `"${r.status || ""}"`,
          `"${r.disposition || ""}"`,
          r.durationSeconds || 0,
          `"${r.sentiment || ""}"`,
          `"${r.mappedTemperature || ""}"`,
          `"${(r.summary || "").replace(/"/g, '""')}"`,
          `"${r.recordingUrl || ""}"`,
          `"${(r.transcript || "").replace(/"/g, '""')}"`,
          `"${r.leadId || ""}"`,
          `"${r.completedAt || ""}"`,
        ];
        csvRows.push(rowData.join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `voice_campaign_${campaignId}_leads_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${rows.length} call records with audio links & transcripts!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to download CSV export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
            <Phone className="w-4 h-4 text-indigo-600" />
            <span>Call Recordings, Transcripts & AI Disposition Logs</span>
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
            Turn-by-turn conversational transcripts, audio recordings, and sentiment mapped directly to CRM temperatures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone, name, or summary..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "ALL", label: "ALL" },
              { id: "POSITIVE", label: "POSITIVE (HOT 🔥)" },
              { id: "NEUTRAL", label: "NEUTRAL (WARM 🌤️)" },
              { id: "NEGATIVE", label: "NEGATIVE (COLD ❄️)" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSentiment(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                  selectedSentiment === s.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Quick Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCsv()}
            disabled={isExporting}
            className="gap-1.5 text-xs font-bold text-slate-700"
            title="Export filtered records to CSV"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Floating Bulk Action Bar (when rows are selected) */}
      {selectedIds.size > 0 && (
        <div className="px-5 py-3 bg-indigo-50/90 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-extrabold text-indigo-950">
              {selectedIds.size} recipient(s) selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleBulkAssignToPreSales()}
              disabled={isBulkAssigning}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs"
            >
              {isBulkAssigning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Assign to Pre-Sales (/new-leads)</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCsv()}
              disabled={isExporting}
              className="gap-1.5 text-xs font-bold bg-white"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Selected CSV</span>
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold text-indigo-700 hover:underline px-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                  title="Select / Deselect all"
                />
              </th>
              <th className="py-3 px-5">Recipient / Lead</th>
              <th className="py-3 px-4">Disposition</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">AI Sentiment & CRM Temp</th>
              <th className="py-3 px-5">Call Summary</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredRecipients.map((recipient) => {
              const isSelected = selectedIds.has(recipient.id);
              const isPlaying = playingAudioId === recipient.id;

              return (
                <tr
                  key={recipient.id}
                  className={`transition-colors ${
                    isSelected ? "bg-indigo-50/40" : "hover:bg-slate-50/60"
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(recipient.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </td>

                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-[var(--text-primary)]">
                            {recipient.name || "Prospect"}
                          </p>
                          {recipient.leadId && (
                            <Badge className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                              CRM Lead
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-tertiary)] font-mono">
                          {recipient.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getDispositionBadge(recipient.disposition, recipient.status)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {formatDuration(recipient.callDurationSec)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {renderSentimentDualBadge(recipient.sentiment)}
                  </td>

                  <td className="py-3.5 px-5 max-w-xs">
                    <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                      {recipient.summary || "Conversation audio recorded and archived."}
                    </p>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Audio Recording Button */}
                      {recipient.recordingUrl ? (
                        <button
                          type="button"
                          onClick={() => setPlayingAudioId(isPlaying ? null : recipient.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isPlaying
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                          title={isPlaying ? "Pause Recording" : "Listen to Dual-Channel Call"}
                        >
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center" title="Recording not available">
                          <Volume2 className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Transcript Drawer Button */}
                      {recipient.transcript && (
                        <button
                          type="button"
                          onClick={() => setActiveTranscriptRecipient(recipient)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Transcript</span>
                        </button>
                      )}

                      {/* Promote to CRM or Direct Pre-Sales Assign */}
                      {recipient.leadId ? (
                        <button
                          type="button"
                          onClick={() => handleBulkAssignToPreSales([recipient.id])}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-bold text-[10px] transition-colors"
                          title="Re-route to Pre-Sales Queue (/new-leads)"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Pre-Sales</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBulkAssignToPreSales([recipient.id])}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors border border-emerald-200/60"
                          title="Directly assign as Lead to Pre-Sales Intake Queue"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>+ Pre-Sales</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Audio Player Dropdown when Playing */}
                    {isPlaying && recipient.recordingUrl && (
                      <div className="mt-2 text-left">
                        <audio
                          src={recipient.recordingUrl}
                          controls
                          autoPlay
                          className="w-full h-8 max-w-[220px] rounded-lg"
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredRecipients.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Phone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">No call logs found for this filter</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transcript & Recording Drawer Modal */}
      {activeTranscriptRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Call Recording & Dialogue Transcript</span>
                  </h4>
                  {renderSentimentDualBadge(activeTranscriptRecipient.sentiment)}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {activeTranscriptRecipient.name || "Prospect"} · {activeTranscriptRecipient.phone} · Duration: {formatDuration(activeTranscriptRecipient.callDurationSec)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    handleBulkAssignToPreSales([activeTranscriptRecipient.id]);
                  }}
                  className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign to Pre-Sales (/new-leads)</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTranscriptRecipient(null)}
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Audio Player Box if available */}
              {activeTranscriptRecipient.recordingUrl && (
                <div className="p-4 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Dual-Channel Audio Recording</p>
                      <p className="text-[11px] text-slate-400 font-mono">High-fidelity Stereo MP3</p>
                    </div>
                  </div>

                  <audio
                    src={activeTranscriptRecipient.recordingUrl}
                    controls
                    className="w-full sm:w-auto h-8 rounded-lg"
                  />
                </div>
              )}

              {/* AI Key Summary Box */}
              {activeTranscriptRecipient.summary && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-900 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Executive Summary & Outcome</span>
                  </div>
                  <p className="text-xs text-indigo-950 font-semibold leading-relaxed">
                    {activeTranscriptRecipient.summary}
                  </p>
                </div>
              )}

              {/* Turn-by-turn Transcript */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                    Full Dialogue Transcript
                  </h5>
                  {activeTranscriptRecipient.transcript && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeTranscriptRecipient.transcript || "");
                        toast.success("Transcript copied to clipboard");
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Dialogue</span>
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-slate-800">
                  {activeTranscriptRecipient.transcript || "No STT transcript was generated for this call."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
