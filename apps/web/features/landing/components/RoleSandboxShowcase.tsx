"use client";

import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
  TrendingUp,
  Sparkles,
  Bot,
  DollarSign,
  Lock,
  ChevronRight,
  Clock,
  Radio,
  Inbox,
  Layers,
  PhoneOff,
  Mic,
  Sliders,
  Check,
  ArrowUpRight,
  AlertCircle,
  Smartphone,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  COCKPIT_TABS,
  CockpitTabId,
  EASE_OUT_EXPO,
} from "../constants/scenarios";

export function RoleSandboxShowcase() {
  const [activeTabId, setActiveTabId] = useState<CockpitTabId>("executive");
  const [timeframe, setTimeframe] = useState<"6M" | "12M">("12M");
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [inboxChannel, setInboxChannel] = useState<"all" | "whatsapp" | "email" | "sms">("all");
  const [inboxReplied, setInboxReplied] = useState<boolean>(false);
  const [gpsSimulated, setGpsSimulated] = useState<boolean>(false);
  const [discountApproved, setDiscountApproved] = useState<boolean>(false);
  const [settlementApproved, setSettlementApproved] = useState<boolean>(false);
  const [inventoryCategory, setInventoryCategory] = useState<"all" | "3bhk" | "2bhk" | "penthouse">("all");
  const [heldUnit, setHeldUnit] = useState<string | null>("Tower C · 1402");
  const [callActive, setCallActive] = useState<boolean>(true);
  const [callSentiment, setCallSentiment] = useState<number>(94);
  const [cpBookingVal, setCpBookingVal] = useState<number>(1.9); // Cr
  const [cpTier, setCpTier] = useState<number>(2.5); // %

  const activeTab = COCKPIT_TABS.find((t) => t.id === activeTabId) || COCKPIT_TABS[0];

  // Calculated CP figures
  const grossCommission = (cpBookingVal * 10000000 * (cpTier / 100));
  const tdsDeduction = grossCommission * 0.05;
  const netCommission = grossCommission - tdsDeduction;

  const stageData = [
    { name: "Qualification", count: 28, value: "₹38.4 Cr", share: "24%", color: "bg-slate-400", tone: "#94a3b8" },
    { name: "Site Visit Done", count: 33, value: "₹46.2 Cr", share: "28%", color: "bg-sky-500", tone: "#0ea5e9" },
    { name: "Negotiation", count: 26, value: "₹34.8 Cr", share: "22%", color: "bg-amber-500", tone: "#f59e0b" },
    { name: "Closing", count: 19, value: "₹25.6 Cr", share: "16%", color: "bg-purple-600", tone: "#9333ea" },
    { name: "Booked (Won)", count: 12, value: "₹18.5 Cr", share: "10%", color: "bg-[#2f5c50]", tone: "#2f5c50" },
  ];

  return (
    <section id="sandbox" className="mt-28 relative">
      {/* ── Ambient Glow (Rapport Mesh Inspiration) ────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-purple-200/20 via-indigo-100/15 to-emerald-100/20 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-[11px] font-bold text-[var(--brand-700)] uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Interactive Live Cockpit</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
          Experience the operating system from every seat
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed">
          Switch between departments below to inspect how BrokerOS dynamically adapts its UI, data boundaries,
          and automated workflows for each real estate stakeholder.
        </p>
      </div>

      {/* ── Department Switcher Tabs (Rapport Fluid Sliding Pill) ──────── */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="inline-flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs max-w-full">
          {COCKPIT_TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setGpsSimulated(false);
                  setDiscountApproved(false);
                  setSettlementApproved(false);
                  setInboxReplied(false);
                }}
                className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 select-none ${isActive ? "text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                {/* Active Sliding Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeCockpitTab"
                    className="absolute inset-0 rounded-xl bg-slate-900 shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.id === "executive" && <TrendingUp className="w-3.5 h-3.5" />}
                  {tab.id === "omnichannel" && <Bot className="w-3.5 h-3.5" />}
                  {tab.id === "inbox" && <Inbox className="w-3.5 h-3.5" />}
                  {tab.id === "field-sales" && <MapPin className="w-3.5 h-3.5" />}
                  {tab.id === "cp-network" && <Building2 className="w-3.5 h-3.5" />}
                  {tab.id === "inventory" && <Layers className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Interactive Cockpit Card (Wharf/Rapport Double-Rim Frame) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab.id}
          initial={{ opacity: 0, y: 12, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.995 }}
          transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
          className="relative max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_24px_50px_-24px_rgba(20,24,36,0.12)] overflow-hidden z-10"
        >
          {/* Card Top Utility Bar */}
          <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${activeTab.badgeColor}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {activeTab.badge}
              </span>
              <span className="text-xs font-extrabold text-[var(--text-primary)]">
                {activeTab.label}
              </span>
            </div>

            {/* Quick KPI Trio */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[var(--text-muted)]">{activeTab.stat1.label}: </span>
                <strong className="text-[var(--text-primary)] tnum font-bold">{activeTab.stat1.value}</strong>
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {activeTab.stat1.change}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-muted)]">{activeTab.stat2.label}: </span>
                <strong className="text-[var(--text-primary)] tnum font-bold">{activeTab.stat2.value}</strong>
              </div>
            </div>
          </div>

          {/* Card Body Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Context & Insights */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] mb-3 leading-snug">
                  {activeTab.headline}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed mb-6">
                  {activeTab.subheadline}
                </p>

                {/* Key Architectural Highlights per Tab */}
                <div className="space-y-2.5 mb-6">
                  {activeTab.id === "executive" && (
                    <>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Universal supervisory bypass over all 14 role workspaces without switching logins</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Real-time quota pace calculations, target absorption & pipeline stage distribution</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Direct internal sales vs external CP broker GMV partition ledger</span>
                      </div>
                    </>
                  )}

                  {activeTab.id === "omnichannel" && (
                    <>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>AI carrier bridge via Twilio, Exotel, Vobiz, and Telnyx with sub-400ms latency</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Official Meta WhatsApp Cloud API with pre-approved interactive templates</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Instant lead sync from Google & Meta Ad lead webhooks in under 240ms</span>
                      </div>
                    </>
                  )}

                  {activeTab.id === "inbox" && (
                    <>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Unified cross-channel thread combining WhatsApp, SMS, and Email in one view</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Dynamically filtered by department: Pre-Sales, Sales, Post-Sales, CP Sourcing</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Zero conversational cross-leakage between direct client leads and CP brokers</span>
                      </div>
                    </>
                  )}

                  {activeTab.id === "field-sales" && (
                    <>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                        <span>Tamper-proof GPS geo-coordinates & selfie check-in preventing phantom site visits</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                        <span>Real-time unit hold lock preventing duplicate bookings across executives</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                        <span>Manager sign-off required on any negotiated discount before booking agreement</span>
                      </div>
                    </>
                  )}

                  {activeTab.id === "cp-network" && (
                    <>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Isolated CP project allocation strictly enforced by isCpProject = true</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Tiered commission slabs (2.0% - 3.5%) with automated TDS (5%) and GST deductions</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Direct finance settlement approval and audit-ready payout ledger</span>
                      </div>
                    </>
                  )}

                  {activeTab.id === "inventory" && (
                    <>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>Live unit inventory: Available, On Hold, Sold, and In Negotiation</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>Atomic PostgreSQL advisory transaction locks guarantee zero double booking</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>Wharf-style par safety alerts triggered when high-demand unit types deplete</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Metric Pill (Rapport Contrast Tile) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {activeTab.stat3.label}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 tnum">
                    {activeTab.stat3.value}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                  {activeTab.stat3.change}
                </span>
              </div>
            </div>

            {/* Right Live Visual Simulation Component */}
            <div className="lg:col-span-7 bg-slate-50/90 rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              {/* ── MODE 1: EXECUTIVE COCKPIT (Rapport-Style Ring Gauge + Stage Mix) ── */}
              {activeTab.id === "executive" && (
                <div className="space-y-4">
                  {/* Top Bar with Timeframe Toggle */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        Company Target Absorption & Quota Pace
                      </span>
                    </div>

                    {/* Rapport Segmented Timeframe Toggle */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        onClick={() => setTimeframe("6M")}
                        className={`relative px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${timeframe === "6M" ? "text-white" : "text-slate-600 hover:text-slate-900"
                          }`}
                      >
                        {timeframe === "6M" && (
                          <motion.div
                            layoutId="timeframePill"
                            className="absolute inset-0 rounded-lg bg-[var(--brand-600)] shadow-xs"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">6M</span>
                      </button>
                      <button
                        onClick={() => setTimeframe("12M")}
                        className={`relative px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${timeframe === "12M" ? "text-white" : "text-slate-600 hover:text-slate-900"
                          }`}
                      >
                        {timeframe === "12M" && (
                          <motion.div
                            layoutId="timeframePill"
                            className="absolute inset-0 rounded-lg bg-[var(--brand-600)] shadow-xs"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">12M</span>
                      </button>
                    </div>
                  </div>

                  {/* Quota Ring + Facts (Rapport-Style Pine Quota Card) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#2f5c50] text-[#fbf8f2] p-4.5 rounded-2xl shadow-sm">
                    <div className="sm:col-span-5 flex items-center justify-center">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="9"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#f2c94c"
                            strokeWidth="9"
                            strokeDasharray="251.2"
                            strokeDashoffset={timeframe === "12M" ? "39.6" : "62.8"}
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-xl font-extrabold text-white tnum">
                            {timeframe === "12M" ? "84.2%" : "75.0%"}
                          </span>
                          <span className="text-[10px] text-emerald-200/90 font-medium">Of Quota</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-7 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                        <span className="text-[10px] text-emerald-100/70 block">Won Revenue</span>
                        <strong className="text-sm font-bold text-white tnum">
                          {timeframe === "12M" ? "₹148.5 Cr" : "₹78.2 Cr"}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                        <span className="text-[10px] text-emerald-100/70 block">Target Quota</span>
                        <strong className="text-sm font-bold text-white tnum">
                          {timeframe === "12M" ? "₹176.0 Cr" : "₹104.0 Cr"}
                        </strong>
                      </div>
                      <div className="col-span-2 p-2 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-100/80">
                          Pace: Needs <b>₹{timeframe === "12M" ? "4.58" : "4.30"} Cr/mo</b> to land annual target
                        </span>
                        <span className="text-[#f2c94c] font-bold text-[10px] uppercase tracking-wider">
                          On Track
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Mix Multi-Segment Distribution Bar (Rapport Style) */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-[var(--text-primary)]">Pipeline Stage Distribution</span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">118 Active Deals · ₹163.5 Cr</span>
                    </div>

                    {/* Segmented Bar with Hover Interaction */}
                    <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex gap-0.5 p-0.5">
                      {stageData.map((stage) => (
                        <div
                          key={stage.name}
                          onMouseEnter={() => setActiveStage(stage.name)}
                          onMouseLeave={() => setActiveStage(null)}
                          className={`h-full ${stage.color} rounded-sm cursor-pointer transition-all duration-150 hover:brightness-110 ${activeStage && activeStage !== stage.name ? "opacity-40" : "opacity-100"
                            }`}
                          style={{ width: stage.share }}
                          title={`${stage.name}: ${stage.count} deals (${stage.value})`}
                        />
                      ))}
                    </div>

                    {/* Stage Legend Table */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[var(--text-muted)] mt-3">
                      {stageData.map((stage) => (
                        <div
                          key={stage.name}
                          onMouseEnter={() => setActiveStage(stage.name)}
                          onMouseLeave={() => setActiveStage(null)}
                          className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer ${activeStage === stage.name
                            ? "bg-purple-50 border-purple-200 text-purple-900"
                            : "bg-slate-50/60 border-slate-100 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stage.tone }} />
                            <span className="truncate">{stage.name}</span>
                          </span>
                          <span className="font-bold text-slate-900 ml-1 tnum">{stage.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── MODE 2: OMNICHANNEL MARKETING & AI VOICE ── */}
              {activeTab.id === "omnichannel" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        Autonomous AI Voice Agent & WhatsApp Suite
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                      CARRIER BRIDGE ACTIVE
                    </span>
                  </div>

                  {/* AI Voice Call Card with Animated Waveforms */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs relative">
                          <PhoneCall className={`w-4 h-4 ${callActive ? "animate-bounce" : ""}`} />
                          {callActive && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-primary)] block">
                            Outbound Call: Aditya Singhal
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            Interest: Skyline Penthouse 3 BHK · +91 98201 XXXXX
                          </span>
                        </div>
                      </div>

                      {/* Equalizer Waveform & Live Timer */}
                      <div className="flex items-center gap-2.5">
                        {callActive && (
                          <div className="flex items-end gap-0.5 h-4">
                            <span className="w-1 bg-purple-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-3" />
                            <span className="w-1 bg-purple-600 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-4" />
                            <span className="w-1 bg-purple-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-2" />
                            <span className="w-1 bg-purple-700 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-3.5" />
                          </div>
                        )}
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {callActive ? "01:42 · Live" : "Call Completed"}
                        </span>
                      </div>
                    </div>

                    {/* Live Transcript Snippet */}
                    <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 border border-slate-100 font-mono">
                      <p className="text-purple-700 font-semibold">
                        AI Agent: "Hello Aditya, noticed you requested the floorplan for Skyline 3 BHK. Would Saturday 11 AM work for a private walkthrough?"
                      </p>
                      <p className="text-slate-700">
                        Lead: "Yes, Saturday morning works. Is the corner unit on the 18th floor available?"
                      </p>
                      <p className="text-purple-700 font-semibold">
                        AI Agent: "Yes, Unit 1804 is currently available. I have reserved your private viewing slot and dispatched the brochure via WhatsApp."
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                        AI Sentiment: {callSentiment}% Positive (Hot Lead)
                      </span>
                      <span className="text-[var(--text-muted)]">
                        Latency: 380ms via Twilio/Exotel PSTN
                      </span>
                    </div>

                    {/* Interactive Call Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setCallActive(!callActive);
                          if (!callActive) setCallSentiment(98);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${callActive
                          ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          : "bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
                          }`}
                      >
                        {callActive ? (
                          <>
                            <PhoneOff className="w-3.5 h-3.5" />
                            <span>Simulate Call Conclusion</span>
                          </>
                        ) : (
                          <>
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Dial Lead Again via Bridge</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Meta Broadcast Dispatch Card */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          Meta Cloud API Template Broadcast
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          Campaign #CP-884 · 2,400 Verified Real Estate Investors
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-600 tnum">98.4% Delivered</span>
                      <span className="text-[10px] text-[var(--text-muted)] block">72% Button Clicks</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MODE 3: UNIFIED INBOX ── */}
              {activeTab.id === "inbox" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        Unified Departmental Inbox (Pre-Sales View)
                      </span>
                    </div>
                    {/* Rapport Style Channel Toggle */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[10px] font-bold">
                      <button
                        onClick={() => setInboxChannel("all")}
                        className={`relative px-2 py-0.5 rounded cursor-pointer ${inboxChannel === "all" ? "text-white" : "text-slate-600"}`}
                      >
                        {inboxChannel === "all" && (
                          <motion.div
                            layoutId="inboxPill"
                            className="absolute inset-0 bg-slate-900 rounded"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">All</span>
                      </button>
                      <button
                        onClick={() => setInboxChannel("whatsapp")}
                        className={`relative px-2 py-0.5 rounded cursor-pointer ${inboxChannel === "whatsapp" ? "text-white" : "text-slate-600"}`}
                      >
                        {inboxChannel === "whatsapp" && (
                          <motion.div
                            layoutId="inboxPill"
                            className="absolute inset-0 bg-emerald-600 rounded"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => setInboxChannel("email")}
                        className={`relative px-2 py-0.5 rounded cursor-pointer ${inboxChannel === "email" ? "text-white" : "text-slate-600"}`}
                      >
                        {inboxChannel === "email" && (
                          <motion.div
                            layoutId="inboxPill"
                            className="absolute inset-0 bg-sky-600 rounded"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Thread */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          Rahul Sharma (Buyer)
                        </span>
                        <span className="text-[11px] text-purple-700 font-semibold">
                          HOT LEAD · Score 96 · Skyline Imperial 3 BHK
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Pre-Sales Scoped
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="space-y-2 text-xs">
                      {(inboxChannel === "all" || inboxChannel === "whatsapp") && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-900 block text-[11px]">WhatsApp · Today 11:24 AM</span>
                            <span className="text-slate-800">"Received the quote of ₹2.45 Cr. Can we schedule a site visit with my family tomorrow?"</span>
                          </div>
                        </div>
                      )}

                      {(inboxChannel === "all" || inboxChannel === "email") && (
                        <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100 flex items-start gap-2">
                          <Mail className="w-3.5 h-3.5 text-sky-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-sky-900 block text-[11px]">Email Follow-up · Today 11:28 AM</span>
                            <span className="text-slate-800">"Booking confirmation kit and payment schedule dispatched to rahul.sharma@example.com."</span>
                          </div>
                        </div>
                      )}

                      {inboxReplied && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2.5 rounded-lg bg-purple-50/80 border border-purple-200 flex items-start gap-2"
                        >
                          <Check className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-purple-900 block text-[11px]">Direct Pre-Sales Rep Reply · Just Now</span>
                            <span className="text-slate-800">"Walkthrough confirmed for tomorrow 11:30 AM. Sales Rep Priya V. has been bound with GPS verification."</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInboxReplied(true)}
                      className="flex-1 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.96] cursor-pointer"
                    >
                      {inboxReplied ? "✓ GPS Site Visit Link Dispatched" : "Schedule GPS-Verified Site Visit"}
                    </button>
                    <button className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[var(--text-secondary)] hover:bg-slate-50 transition-all active:scale-[0.96] cursor-pointer">
                      Assign to Field Exec
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODE 4: DIRECT FIELD SALES & GPS VISIT ── */}
              {activeTab.id === "field-sales" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        GPS Geofence Verification & Negotiation Lock
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                      isCpProject = false
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          Tower C, Luxury Unit #1402 (3 BHK)
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Customer: Rajesh Verma · Executive: Priya V.
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${gpsSimulated
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "text-sky-700 bg-sky-50 border-sky-200"
                        }`}>
                        {gpsSimulated ? "✓ Geofence Verified (15m radius)" : "Ready for GPS Check-in"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-[var(--text-muted)] block">Check-in Coordinates</span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {gpsSimulated ? "19.0760° N, 72.8777° E" : "19.0758° N, 72.8774° E"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-[var(--text-muted)] block">Verification Method</span>
                        <span className="font-bold text-emerald-700">Selfie + Geo-Fence OK</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-amber-900 block">Negotiation Discount Request</span>
                        <span className="text-amber-700 text-[11px]">Base: ₹2.65 Cr → Requested: ₹2.59 Cr (-₹6.0 L)</span>
                      </div>
                      <span className={`font-bold px-2 py-1 rounded text-[11px] transition-all ${discountApproved
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-amber-800 shadow-2xs"
                        }`}>
                        {discountApproved ? "✓ Approved by SM" : "Needs Sign-Off"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setGpsSimulated(true);
                        setDiscountApproved(true);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.96] cursor-pointer"
                    >
                      {gpsSimulated && discountApproved ? "✓ Unit #1402 Locked & Agreement Generated" : "Approve Negotiation & Lock Unit"}
                    </button>
                    <button className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[var(--text-secondary)] hover:bg-slate-50 transition-all active:scale-[0.96] cursor-pointer">
                      View Floorplan
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODE 5: CHANNEL PARTNER NETWORK & COMMISSION CALCULATOR ── */}
              {activeTab.id === "cp-network" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        CP Broker Ledger & Commission Slabs
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      isCpProject = true
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          Apex Realty Partners (RERA #A519000284)
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Sourcing Manager: Vikram M. · CP Tier Partner
                        </span>
                      </div>
                      {/* Interactive Tier Buttons */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        {[2.0, 2.5, 3.5].map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setCpTier(tier)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${cpTier === tier
                              ? "bg-amber-600 text-white shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                              }`}
                          >
                            {tier.toFixed(1)}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Booking Value Slider */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-600">Simulate Booking Value:</span>
                        <span className="font-bold text-slate-900 tnum">₹{cpBookingVal.toFixed(2)} Cr</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="4.0"
                        step="0.1"
                        value={cpBookingVal}
                        onChange={(e) => setCpBookingVal(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                      />
                    </div>

                    {/* Auto-Calculated Ledger Grid */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-[var(--text-muted)] block">Gross Commission</span>
                        <span className="font-bold text-emerald-700 tnum">
                          ₹{grossCommission.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-[var(--text-muted)] block">TDS (5%)</span>
                        <span className="font-bold text-slate-600 tnum">
                          -₹{tdsDeduction.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
                        <span className="text-[10px] text-amber-800 block font-semibold">Net Payout</span>
                        <span className="font-bold text-amber-900 tnum">
                          ₹{netCommission.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-[var(--text-primary)]">Data Boundary Guarantee:</span> Broker has zero visibility into direct sales internal leads or internal sales incentive pools.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSettlementApproved(true)}
                      className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.96] cursor-pointer"
                    >
                      {settlementApproved ? "✓ Settlement Batch Approved & Queued to BullMQ" : "Release CP Brokerage Settlement"}
                    </button>
                    <button className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[var(--text-secondary)] hover:bg-slate-50 transition-all active:scale-[0.96] cursor-pointer">
                      View Broker Statement
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODE 6: INVENTORY & WHARF-STYLE STOCK ── */}
              {activeTab.id === "inventory" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        Unit Inventory Par Stock Visualizer
                      </span>
                    </div>
                    {/* Category Filter Pills (Wharf Style) */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[10px] font-bold">
                      <button
                        onClick={() => setInventoryCategory("all")}
                        className={`relative px-2 py-0.5 rounded cursor-pointer ${inventoryCategory === "all" ? "text-white" : "text-slate-600"}`}
                      >
                        {inventoryCategory === "all" && (
                          <motion.div
                            layoutId="invPill"
                            className="absolute inset-0 bg-slate-900 rounded"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">All</span>
                      </button>
                      <button
                        onClick={() => setInventoryCategory("3bhk")}
                        className={`relative px-2 py-0.5 rounded cursor-pointer ${inventoryCategory === "3bhk" ? "text-white" : "text-slate-600"}`}
                      >
                        {inventoryCategory === "3bhk" && (
                          <motion.div
                            layoutId="invPill"
                            className="absolute inset-0 bg-emerald-600 rounded"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">3 BHK</span>
                      </button>
                      <button
                        onClick={() => setInventoryCategory("2bhk")}
                        className={`relative px-2 py-0.5 rounded cursor-pointer ${inventoryCategory === "2bhk" ? "text-white" : "text-slate-600"}`}
                      >
                        {inventoryCategory === "2bhk" && (
                          <motion.div
                            layoutId="invPill"
                            className="absolute inset-0 bg-amber-600 rounded"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">2 BHK</span>
                      </button>
                      <button
                        onClick={() => setInventoryCategory("penthouse")}
                        className={`relative px-2 py-0.5 rounded cursor-pointer ${inventoryCategory === "penthouse" ? "text-white" : "text-slate-600"}`}
                      >
                        {inventoryCategory === "penthouse" && (
                          <motion.div
                            layoutId="invPill"
                            className="absolute inset-0 bg-rose-600 rounded"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">Penthouse</span>
                      </button>
                    </div>
                  </div>

                  {/* Par Level Bars */}
                  <div className="space-y-2.5">
                    {/* Tower A */}
                    {(inventoryCategory === "all" || inventoryCategory === "3bhk") && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-[var(--text-primary)]">Tower A · 3 BHK Luxury Residences</span>
                          <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            14 / 24 Available (Par Met)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "58%" }} title="Available: 58%" />
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: "18%" }} title="On Hold: 18%" />
                          <div className="h-full bg-slate-300 rounded-full" style={{ width: "24%" }} title="Sold: 24%" />
                        </div>
                      </div>
                    )}

                    {/* Tower B */}
                    {(inventoryCategory === "all" || inventoryCategory === "2bhk") && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-[var(--text-primary)]">Tower B · 2 BHK Premium Suites</span>
                          <span className="text-amber-800 bg-amber-50 border border-amber-200 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            4 / 32 Available (Low Stock Alert)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "12%" }} title="Available: 12%" />
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: "25%" }} title="On Hold: 25%" />
                          <div className="h-full bg-slate-300 rounded-full" style={{ width: "63%" }} title="Sold: 63%" />
                        </div>
                      </div>
                    )}

                    {/* Tower C */}
                    {(inventoryCategory === "all" || inventoryCategory === "penthouse") && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-[var(--text-primary)]">Tower C · Sky Penthouses</span>
                          <span className="text-rose-800 bg-rose-50 border border-rose-200 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            1 / 8 Available (Critical Par)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: "12.5%" }} title="Available: 12.5%" />
                          <div className="h-full bg-slate-300 rounded-full" style={{ width: "87.5%" }} title="Sold: 87.5%" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Unit Hold Simulation */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="font-bold text-slate-900 block">Unit #1402 Advisory Lock:</span>
                        <span className="text-slate-600 text-[11px]">Held by Sales Exec Priya V. · 14:22 min remaining</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                      PG LOCK ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHeldUnit("Tower C · Unit #1804")}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.96] cursor-pointer"
                    >
                      {heldUnit === "Tower C · Unit #1804" ? "✓ Unit #1804 Locked for Buyer" : "Lock Available Unit for Buyer"}
                    </button>
                    <button className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[var(--text-secondary)] hover:bg-slate-50 transition-all active:scale-[0.96] cursor-pointer">
                      Export Matrix
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
