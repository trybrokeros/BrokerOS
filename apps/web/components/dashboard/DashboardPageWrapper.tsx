"use client";

import React from "react";
import { AlertCircle, RefreshCw, Radio, Sparkles } from "lucide-react";

export function DashboardPageWrapper({
  loading,
  error,
  userName,
  title,
  subtitle,
  children,
  headerRight,
}: {
  loading: boolean;
  error?: string | null;
  userName?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-purple-100/60 animate-ping opacity-50" />
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-[var(--brand-600)] relative z-10">
            <RefreshCw className="w-5 h-5 animate-spin text-[var(--brand-600)]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-slate-800 tracking-tight">
            Syncing Department Workspace
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            Fetching real-time pipeline, team quotas & ledger data…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-6 flex items-start gap-4 max-w-lg mx-auto my-10 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-700 mt-0.5">
          <AlertCircle size={20} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-extrabold text-rose-900 mb-1">
            Unable to Load Workspace Data
          </div>
          <div className="text-xs text-rose-700 leading-relaxed mb-3">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto relative">
      {/* ── Ambient Radial Glow (Rapport / Wharf Inspiration) ──────── */}
      <div className="absolute -top-16 right-0 w-96 h-96 rounded-full bg-gradient-to-bl from-purple-200/20 via-indigo-100/15 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ── Top Header Section ────────────────────────────────────── */}
      {(userName || title) && (
        <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            {/* Live Operational Status Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs text-[10px] font-bold text-slate-600 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="tracking-wider uppercase">Live Department Sync</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight m-0 text-balance">
              {title ? (
                title
              ) : (
                <>
                  Welcome back, {userName?.split(" ")[0] || "Agent"}{" "}
                  <span className="inline-block transition-transform duration-200 hover:rotate-12">
                    👋
                  </span>
                </>
              )}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm font-medium text-[var(--text-tertiary)] mt-1.5 mb-0 text-pretty">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Header Utilities (Period selector, Actions) */}
          {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
