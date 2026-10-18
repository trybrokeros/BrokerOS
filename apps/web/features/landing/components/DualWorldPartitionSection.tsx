"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Database,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  Users,
  Shield,
  Radio,
  FileCheck2,
  TrendingUp,
} from "lucide-react";
import { EASE_OUT_EXPO } from "../constants/scenarios";

type BoundaryLens = "split" | "internal" | "cp";

export function DualWorldPartitionSection() {
  const [activeLens, setActiveLens] = useState<BoundaryLens>("split");

  const boundaryRecords = [
    {
      entity: "Direct Client Leads",
      table: "Lead (assignedUserId != null)",
      internalStatus: "Full Access (Pre-Sales & Sales Execs)",
      cpStatus: "403 Forbidden · Strict Redaction",
      internalAccess: true,
      cpAccess: false,
    },
    {
      entity: "Developer Inbound Commission",
      table: "InboundCommission (from Builder)",
      internalStatus: "Audited & Synced to Post-Sales",
      cpStatus: "403 Forbidden · Strict Redaction",
      internalAccess: true,
      cpAccess: false,
    },
    {
      entity: "CP Broker Network Ledger",
      table: "BrokerageRecord & Settlement",
      internalStatus: "Director Oversight Only",
      cpStatus: "Authorized (2.0% - 3.5% Slabs + TDS)",
      internalAccess: false,
      cpAccess: true,
    },
    {
      entity: "Unit Inventory & Holds",
      table: "Unit (PostgreSQL Advisory Locks)",
      internalStatus: "Filtered (isCpProject = false)",
      cpStatus: "Filtered (isCpProject = true)",
      internalAccess: true,
      cpAccess: true,
    },
  ];

  return (
    <>
      {/* ── The Two-World Partition Spotlight ───────────────────────── */}
      <section
        id="security"
        className="mt-28 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_24px_50px_-24px_rgba(20,24,36,0.10)] relative overflow-hidden"
      >
        {/* Soft decorative glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-purple-100/50 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sky-100/50 blur-[90px] pointer-events-none" />

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 text-[var(--brand-700)] border border-purple-200/80 text-[11px] uppercase font-bold tracking-widest mb-3">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Core Architectural Invariant</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
            Two Complete Business Lines. One Clean Flag.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed max-w-2xl mx-auto">
            BrokerOS unifies both internal direct sales and external channel partner broker networks in a single
            PostgreSQL database, strictly segregated by{" "}
            <code className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-xs font-bold border border-purple-200">
              Project.isCpProject
            </code>
            .
          </p>

          {/* Interactive Boundary Lens Filter (Rapport-Style Segmented Control) */}
          <div className="mt-7 inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveLens("split")}
              className={`relative px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeLens === "split" ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {activeLens === "split" && (
                <motion.div
                  layoutId="lensPill"
                  className="absolute inset-0 bg-slate-900 rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Split Architecture View</span>
              </span>
            </button>

            <button
              onClick={() => setActiveLens("internal")}
              className={`relative px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeLens === "internal" ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {activeLens === "internal" && (
                <motion.div
                  layoutId="lensPill"
                  className="absolute inset-0 bg-sky-600 rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Internal Sales Lens</span>
              </span>
            </button>

            <button
              onClick={() => setActiveLens("cp")}
              className={`relative px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeLens === "cp" ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {activeLens === "cp" && (
                <motion.div
                  layoutId="lensPill"
                  className="absolute inset-0 bg-amber-600 rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>External CP Broker Lens</span>
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Dual World Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* World 1: Internal Brokerage */}
          <div
            className={`p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${activeLens === "cp"
              ? "opacity-40 grayscale-[40%] bg-slate-50 border-slate-200"
              : "bg-gradient-to-b from-sky-50/60 to-white border-sky-200/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_12px_28px_-16px_rgba(14,165,233,0.12)]"
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-sky-800 bg-sky-100/90 px-2.5 py-1 rounded-lg border border-sky-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                  Internal Sales Operation
                </span>
                <code className="text-xs font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                  isCpProject = false
                </code>
              </div>
              <h4 className="text-lg font-extrabold text-[var(--text-primary)] mb-2">
                Direct In-House Sales Division
              </h4>
              <p className="text-xs text-[var(--text-tertiary)] mb-5 leading-relaxed">
                Empower your pre-sales tele-callers and field sales executives with high-velocity lead triage,
                GPS-verified property walk-throughs, and automated builder inbound receivables.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>Pre-Sales cold-call triage & daily manager call target tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>Sales Executive on-site GPS coordinates & geotagged selfie check-ins</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>Strict price negotiation approvals before discounted bookings lock</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>Inbound commission accounting from developers to the brokerage firm</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-sky-100 flex items-center justify-between text-[11px] text-sky-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                Supervised by: Sales Manager & Director
              </span>
              <span className="font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-sky-800">
                100% RBAC Guarded
              </span>
            </div>
          </div>

          {/* World 2: Channel Partner */}
          <div
            className={`p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${activeLens === "internal"
              ? "opacity-40 grayscale-[40%] bg-slate-50 border-slate-200"
              : "bg-gradient-to-b from-amber-50/60 to-white border-amber-200/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_12px_28px_-16px_rgba(217,119,6,0.12)]"
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  External Broker Network
                </span>
                <code className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                  isCpProject = true
                </code>
              </div>
              <h4 className="text-lg font-extrabold text-[var(--text-primary)] mb-2">
                Channel Partner Network Operation
              </h4>
              <p className="text-xs text-[var(--text-tertiary)] mb-5 leading-relaxed">
                Scale thousands of external real estate agents without risking lead theft or inventory cannibalization.
                Dedicated project assignments and automated tiered commission releases.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Sourcing & Closing Manager broker allocations and project bindings</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Multi-tier brokerage payout calculations (2.0% - 3.5% slabs)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Automated TDS (5%) and GST deductions with settlement ledger sync</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Zero data leakage into internal sales leads or direct inventory</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Supervised by: Sourcing / Closing Mgr & Director
              </span>
              <span className="font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-800">
                Zero Cross-Leakage
              </span>
            </div>
          </div>
        </div>

        {/* ── Interactive Database Boundary Inspector Preview ────────── */}
        <div className="mt-8 pt-6 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-600" />
              <span>Live Prisma 7 & PostgreSQL Row-Level Filter Audit</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Query Constraint: WHERE isCpProject = {activeLens === "cp" ? "true" : activeLens === "internal" ? "false" : "DYNAMIC"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/60 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">CRM Record Entity</th>
                  <th className="py-2.5 px-3.5">Internal Sales Status</th>
                  <th className="py-2.5 px-3.5">CP Broker Network Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {boundaryRecords.map((row) => (
                  <tr key={row.entity} className="hover:bg-white/80 transition-colors">
                    <td className="py-2 px-3.5 font-medium text-slate-900">
                      <span>{row.entity}</span>
                      <span className="block text-[10px] font-mono text-slate-400">{row.table}</span>
                    </td>
                    <td className="py-2 px-3.5">
                      {row.internalAccess ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          {row.internalStatus}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          <Lock className="w-3 h-3 text-slate-400" />
                          {row.internalStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3.5">
                      {row.cpAccess ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <Unlock className="w-3 h-3 text-amber-600" />
                          {row.cpStatus}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <Lock className="w-3 h-3 text-rose-600" />
                          {row.cpStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
