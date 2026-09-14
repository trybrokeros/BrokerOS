"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Send,
  Phone,
  Globe,
  Sparkles,
  MousePointer,
  ExternalLink,
  Users,
} from "lucide-react";
import { InstagramIcon as Instagram } from "@/features/marketing/ads/instagram/components/InstagramIcon";
import { Button } from "@/components/ui/Button";
import { CAMPAIGN_STATUS_CONFIG } from "@brokeros/constants";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { YouTubeIcon } from "@/features/marketing/ads/youtube/components/YouTubeIcon";

export type UnifiedMarketingChannelType =
  | "EMAIL"
  | "SMS"
  | "VOICE"
  | "WHATSAPP"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "GOOGLE"
  | "YOUTUBE";

export interface UnifiedBroadcastItem {
  id: string;
  type: UnifiedMarketingChannelType;
  title: string;
  previewText?: string;
  status: string;
  totalRecipients?: number;
  sentCount?: number;
  deliveredCount: number;
  openedCount?: number;
  clickedCount?: number;
  leadsCount?: number;
  spend?: number;
  createdAt: string;
  projectName?: string;
  providerName?: string;
  detailUrl: string;
}

export interface UnifiedBroadcastsTableProps {
  broadcasts: UnifiedBroadcastItem[];
  isLoading?: boolean;
}

export function UnifiedBroadcastsTable({
  broadcasts,
  isLoading,
}: UnifiedBroadcastsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[var(--text-secondary)]">
          <thead className="bg-slate-50/90 text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="py-3.5 px-4">Channel & Campaign</th>
              <th className="py-3.5 px-4">Project / Scope</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Performance & Conversions</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Analytics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold">
                    <Sparkles className="w-4 h-4 animate-spin text-[var(--brand-600)]" />
                    <span>Loading unified marketing campaigns...</span>
                  </div>
                </td>
              </tr>
            ) : broadcasts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-600)] mx-auto mb-2.5">
                    <Send className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">No marketing campaigns found</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Launch your first campaign across WhatsApp, Voice, Email, SMS, or Paid Ads to reach leads.
                  </p>
                </td>
              </tr>
            ) : (
              broadcasts.map((item) => {
                const statusKey = (item.status || "DRAFT").toUpperCase();
                const statusMeta =
                  CAMPAIGN_STATUS_CONFIG[statusKey as keyof typeof CAMPAIGN_STATUS_CONFIG] ||
                  CAMPAIGN_STATUS_CONFIG.DRAFT;

                const isAdChannel =
                  item.type === "FACEBOOK" ||
                  item.type === "INSTAGRAM" ||
                  item.type === "GOOGLE" ||
                  item.type === "YOUTUBE";

                // Channel Visual Icon & Pill
                const renderChannelIcon = () => {
                  switch (item.type) {
                    case "EMAIL":
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-purple-50 text-purple-600">
                          <Mail className="w-4 h-4" />
                        </div>
                      );
                    case "SMS":
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      );
                    case "VOICE":
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600">
                          <Phone className="w-4 h-4" />
                        </div>
                      );
                    case "WHATSAPP":
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                          <Send className="w-4 h-4" />
                        </div>
                      );
                    case "FACEBOOK":
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                          <Globe className="w-4 h-4" />
                        </div>
                      );
                    case "INSTAGRAM":
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-pink-50 text-pink-600">
                          <Instagram className="w-4 h-4" />
                        </div>
                      );
                    case "GOOGLE":
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-600">
                          <GoogleIcon size={16} />
                        </div>
                      );
                    case "YOUTUBE":
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600">
                          <YouTubeIcon size={16} />
                        </div>
                      );
                    default:
                      return (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-600">
                          <Send className="w-4 h-4" />
                        </div>
                      );
                  }
                };

                const getChannelBadge = () => {
                  switch (item.type) {
                    case "EMAIL":
                      return "bg-purple-50 text-purple-700 border-purple-200/80";
                    case "SMS":
                      return "bg-amber-50 text-amber-800 border-amber-200/80";
                    case "VOICE":
                      return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
                    case "WHATSAPP":
                      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
                    case "FACEBOOK":
                      return "bg-blue-50 text-blue-700 border-blue-200/80";
                    case "INSTAGRAM":
                      return "bg-pink-50 text-pink-700 border-pink-200/80";
                    case "GOOGLE":
                      return "bg-red-50 text-red-700 border-red-200/80";
                    case "YOUTUBE":
                      return "bg-rose-50 text-rose-700 border-rose-200/80";
                    default:
                      return "bg-slate-50 text-slate-700 border-slate-200/80";
                  }
                };

                return (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Channel & Broadcast Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        {renderChannelIcon()}
                        <div className="min-w-0 max-w-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={item.detailUrl}
                              className="font-extrabold text-[var(--text-primary)] hover:text-[var(--brand-600)] transition-colors truncate"
                            >
                              {item.title}
                            </Link>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${getChannelBadge()}`}
                            >
                              {item.type}
                            </span>
                          </div>
                          {item.previewText && (
                            <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[280px] mt-0.5">
                              {item.previewText}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Project / Scope */}
                    <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)]">
                      <div className="truncate max-w-[150px]">
                        {item.projectName || "General Audience"}
                      </div>
                      {item.providerName && (
                        <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                          {item.providerName}
                        </span>
                      )}
                    </td>

                    {/* Status Badge (Light Airy Whites/Soft Slates) */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-2xs ${statusMeta.bg}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Performance & Metrics */}
                    <td className="py-3.5 px-4">
                      {isAdChannel ? (
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {typeof item.spend === "number" && (
                            <div className="font-extrabold text-[var(--text-primary)]">
                              ₹{item.spend.toLocaleString("en-IN")}
                              <span className="text-[10px] text-[var(--text-tertiary)] font-normal ml-1">
                                spend
                              </span>
                            </div>
                          )}
                          <div className="text-[11px] text-slate-600">
                            {item.deliveredCount.toLocaleString()}
                            <span className="text-[10px] text-[var(--text-muted)] ml-0.5">
                              imp
                            </span>
                          </div>
                          {typeof item.clickedCount === "number" && (
                            <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              <span>{item.clickedCount} clicks</span>
                            </div>
                          )}
                          {typeof item.leadsCount === "number" && item.leadsCount > 0 && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                              <Users className="w-3 h-3" />
                              <span>{item.leadsCount} CRM Leads</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div>
                            <span className="font-extrabold text-[var(--text-primary)]">
                              {item.deliveredCount.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-[var(--text-tertiary)] ml-1">
                              {item.type === "VOICE" ? "calls" : "delivered"}
                            </span>
                          </div>
                          {item.type === "EMAIL" && typeof item.openedCount === "number" && (
                            <div className="text-purple-600 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{item.openedCount} opens</span>
                            </div>
                          )}
                          {item.type === "WHATSAPP" && typeof item.openedCount === "number" && (
                            <div className="text-emerald-600 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{item.openedCount} read</span>
                            </div>
                          )}
                          {typeof item.clickedCount === "number" && item.clickedCount > 0 && (
                            <div className="text-emerald-600 font-semibold flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              <span>{item.clickedCount} clicks</span>
                            </div>
                          )}
                          {typeof item.leadsCount === "number" && item.leadsCount > 0 && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                              <Users className="w-3 h-3" />
                              <span>{item.leadsCount} Leads</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-xs font-medium text-[var(--text-tertiary)]">
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action Link */}
                    <td className="py-3.5 px-4 text-right">
                      <Link href={item.detailUrl}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs font-bold gap-1 text-[var(--brand-600)] hover:text-[var(--brand-700)]"
                        >
                          <span>View Funnel</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
