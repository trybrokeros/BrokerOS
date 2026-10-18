"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { UserCircle, Shield, Building2, MapPin, Radio, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import LiveTrackingMap from "@/components/dashboard/LiveTrackingMap";
import Link from "next/link";

export default function DashboardOverview() {
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs text-[10px] font-bold text-slate-600 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AUTHENTICATED CRM SESSION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight m-0">
            Welcome to BrokerOS Command Center
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-tertiary)] mt-1 mb-0">
            Enterprise real estate operating system with dual-world boundary governance.
          </p>
        </div>
      </div>

      {/* Profile & Security Credentials Trio (Wharf / Rapport Inset Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700 flex-shrink-0">
            <UserCircle className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Account User</p>
            <p className="text-sm font-extrabold truncate text-slate-900">{session?.user?.email || "Authenticated User"}</p>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1.5 inline-block">
              Verified Session Token
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 flex-shrink-0">
            <Shield className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Governed Role Scope</p>
            <p className="text-xs font-mono font-bold bg-slate-100/80 px-2 py-1 rounded-lg truncate text-slate-800 border border-slate-200/60 mt-1">
              {user?.roleId || "SUPERVISORY_ACCESS"}
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block font-medium">
              100% Least-Privilege Enforced
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <Building2 className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Database Partition</p>
            <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>isCpProject Isolated</span>
            </p>
            <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded mt-1.5 inline-block">
              Zero Conversational Leakage
            </span>
          </div>
        </div>
      </div>

      {/* Live Field GPS Tracking Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700">
              <MapPin size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 m-0">Live Field Executive GPS Telemetry</h2>
              <span className="text-[10px] text-slate-400">Tamper-proof real-time coordinates matched against project geofences</span>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Radio size={11} className="text-emerald-600 animate-pulse" />
            TELEMETRY ACTIVE
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
          {/* @ts-ignore */}
          <LiveTrackingMap userId={session?.user?.id || "default"} />
        </div>
      </div>

      {/* Two-World Architecture Explanatory Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-purple-200 mb-2">
              <Lock size={12} className="text-emerald-400" />
              <span>Security Law: Single-Flag Partition</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">
              Strict RBAC & Two-World Database Segregation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed m-0">
              Your navigation and endpoints are dynamically authorized based on your assigned role. Direct internal sales leads, builder inbound commissions, and external CP broker slabs never cross the <code className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-200 text-[11px]">isCpProject</code> boundary.
            </p>
          </div>

          <Link
            href="/dashboard/inbox"
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm cursor-pointer"
          >
            <span>Open Department Inbox</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
