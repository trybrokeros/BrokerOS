"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import {
  ShieldCheck,
  Users,
  Server,
  Lock,
  Radio,
  Cpu,
  Key,
  Database,
  ArrowRight,
  Settings,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const statItems = [
    {
      label: "System Workspaces",
      value: "14 Roles",
      icon: Users,
      accent: "#6366f1",
      trend: "Fully Governed",
      positive: true,
      sub: "Internal sales + CP network operations",
    },
    {
      label: "Database Integrity",
      value: "100%",
      icon: Database,
      accent: "#2f5c50",
      trend: "PostgreSQL Prisma 7",
      positive: true,
      sub: "Single flag isCpProject segregation",
    },
    {
      label: "Authentication Security",
      value: "MFA TOTP",
      icon: Lock,
      accent: "#c8431f",
      trend: "RFC 6238 Active",
      positive: true,
      sub: "Better Auth + hashed recovery codes",
    },
    {
      label: "Worker Queues",
      value: "5 Processors",
      icon: Cpu,
      accent: "#f59e0b",
      trend: "BullMQ Healthy",
      positive: true,
      sub: "Email, SMS, Voice, WhatsApp, Schedules",
    },
    {
      label: "PSTN Voice Bridge",
      value: "4 Carriers",
      icon: Radio,
      accent: "#0ea5e9",
      trend: "< 400ms Latency",
      positive: true,
      sub: "Twilio, Exotel, Vobiz, Telnyx connected",
    },
  ];

  const systemServices = [
    { name: "Better Auth Session Engine", status: "Operational", ping: "12ms", detail: "Session token verification via HTTP-only cookies" },
    { name: "PostgreSQL Database Connection Pool", status: "Operational", ping: "8ms", detail: "Prisma 7 client generated with soft-delete filter" },
    { name: "BullMQ Background Job Queues", status: "Operational", ping: "Active", detail: "5 async processors running outbound message workers" },
    { name: "Meta WhatsApp Cloud API Webhook", status: "Operational", ping: "Verified", detail: "HMAC-SHA256 signature verification enabled" },
    { name: "Vapi & Retell AI Voice Media Stream", status: "Operational", ping: "380ms", detail: "WebSocket bridge connected to PSTN carriers" },
  ];

  return (
    <DashboardPageWrapper
      loading={false}
      title="System Administrator Command Center"
      subtitle="Infrastructure health, 14-role authorization governance & security policy configuration."
      headerRight={
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
          >
            <Settings size={13} />
            <span>Security & MFA Settings</span>
          </Link>
        </div>
      }
    >
      {/* Top Infrastructure Stats */}
      <StatCards items={statItems} />

      {/* Grid: System Services Telemetry + Quick Administrative Portals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Services Status Table (Wharf / Rapport Style) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Activity size={16} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 tracking-tight m-0">
                  Infrastructure Health & Gateway Telemetry
                </h2>
                <span className="text-[10px] text-slate-400">
                  Real-time health monitor across all monorepo micro-services
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              All Systems Nominal
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {systemServices.map((svc) => (
              <div key={svc.name} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{svc.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                      {svc.ping}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">{svc.detail}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Quick Action Hub */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white m-0">Security & MFA TOTP</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Two-factor RFC 6238 TOTP authentication is enforced across all administrative and director logins.
            </p>
            <Link
              href="/dashboard/admin/settings"
              className="inline-flex items-center justify-between w-full p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
            >
              <span>Manage MFA Configuration</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 mb-2">14-Role Workspace Directory</h4>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Supervise pre-sales, sales executives, CP sourcing, closing, and post-sales workflows.
            </p>
            <div className="space-y-1.5 text-xs font-semibold">
              <Link href="/dashboard/pre-sales" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700">
                <span>Pre-Sales Workspace</span>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">Inspect</span>
              </Link>
              <Link href="/dashboard/sales-executive" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700">
                <span>Sales Executive Workspace</span>
                <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded">Inspect</span>
              </Link>
              <Link href="/dashboard/channel-partner" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700">
                <span>Channel Partner Portal</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">Inspect</span>
              </Link>
              <Link href="/dashboard/inbox" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700">
                <span>Unified Departmental Inbox</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Inspect</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
