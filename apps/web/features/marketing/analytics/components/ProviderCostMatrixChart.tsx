"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Server, Sliders, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export type ProviderCategory = "ALL" | "VOICE_AI" | "TELEPHONY" | "SMS" | "EMAIL" | "ADS";

export interface ProviderCostItem {
  id: string;
  name: string;
  category: ProviderCategory;
  monthlySpend: number;
  unitCostFormatted: string;
  volumeMetric: string;
  quotaUsedPercent: number;
  status: "ACTIVE" | "VERIFIED" | "IDLE";
  color: string;
}

const PROVIDER_COST_DATA: ProviderCostItem[] = [
  // Voice AI Engines
  { id: "vapi", name: "Vapi AI Speech", category: "VOICE_AI", monthlySpend: 11200, unitCostFormatted: "₹4.75 / min", volumeMetric: "2,350 mins", quotaUsedPercent: 68, status: "ACTIVE", color: "#6366f1" },
  { id: "retell", name: "Retell AI Real-Time", category: "VOICE_AI", monthlySpend: 7300, unitCostFormatted: "₹7.60 / min", volumeMetric: "960 mins", quotaUsedPercent: 42, status: "ACTIVE", color: "#8b5cf6" },
  { id: "sarvam", name: "Sarvam Indic Voice", category: "VOICE_AI", monthlySpend: 4200, unitCostFormatted: "₹2.20 / min", volumeMetric: "1,910 mins", quotaUsedPercent: 35, status: "ACTIVE", color: "#06b6d4" },
  { id: "elevenlabs", name: "ElevenLabs Conversational", category: "VOICE_AI", monthlySpend: 6800, unitCostFormatted: "₹9.50 / min", volumeMetric: "715 mins", quotaUsedPercent: 55, status: "ACTIVE", color: "#ec4899" },
  { id: "bolna", name: "Bolna Indic Agent", category: "VOICE_AI", monthlySpend: 2900, unitCostFormatted: "₹2.85 / min", volumeMetric: "1,020 mins", quotaUsedPercent: 28, status: "ACTIVE", color: "#14b8a6" },

  // PSTN Carrier Telephony
  { id: "twilio-voice", name: "Twilio Voice SIP", category: "TELEPHONY", monthlySpend: 8400, unitCostFormatted: "₹1.40 / min", volumeMetric: "6,000 mins", quotaUsedPercent: 60, status: "ACTIVE", color: "#ef4444" },
  { id: "vobiz", name: "Vobiz Telecom Bridge", category: "TELEPHONY", monthlySpend: 5100, unitCostFormatted: "₹0.95 / min", volumeMetric: "5,360 mins", quotaUsedPercent: 48, status: "ACTIVE", color: "#3b82f6" },
  { id: "exotel", name: "Exotel Cloud PSTN", category: "TELEPHONY", monthlySpend: 4800, unitCostFormatted: "₹1.10 / min", volumeMetric: "4,360 mins", quotaUsedPercent: 44, status: "ACTIVE", color: "#f97316" },

  // SMS Gateways
  { id: "twilio-sms", name: "Twilio SMS", category: "SMS", monthlySpend: 4500, unitCostFormatted: "₹0.45 / msg", volumeMetric: "10,000 SMS", quotaUsedPercent: 52, status: "ACTIVE", color: "#f59e0b" },
  { id: "gupshup", name: "Gupshup DLT Gateway", category: "SMS", monthlySpend: 3800, unitCostFormatted: "₹0.18 / msg", volumeMetric: "21,100 SMS", quotaUsedPercent: 71, status: "ACTIVE", color: "#10b981" },
  { id: "sinch", name: "Sinch Messaging", category: "SMS", monthlySpend: 2400, unitCostFormatted: "₹0.38 / msg", volumeMetric: "6,300 SMS", quotaUsedPercent: 30, status: "IDLE", color: "#64748b" },

  // Email Gateways
  { id: "aws-ses", name: "AWS SES Outbound", category: "EMAIL", monthlySpend: 1800, unitCostFormatted: "₹0.0095 / email", volumeMetric: "189,400 emails", quotaUsedPercent: 38, status: "ACTIVE", color: "#ff9900" },
  { id: "sendgrid", name: "SendGrid Pro", category: "EMAIL", monthlySpend: 3200, unitCostFormatted: "₹0.045 / email", volumeMetric: "71,000 emails", quotaUsedPercent: 62, status: "ACTIVE", color: "#0284c7" },
  { id: "brevo", name: "Brevo Transactional", category: "EMAIL", monthlySpend: 1200, unitCostFormatted: "₹0.038 / email", volumeMetric: "31,500 emails", quotaUsedPercent: 25, status: "IDLE", color: "#059669" },

  // Ad Networks
  { id: "meta-ads", name: "Meta Graph Ads", category: "ADS", monthlySpend: 109000, unitCostFormatted: "₹1,758 / lead", volumeMetric: "62 Leads", quotaUsedPercent: 88, status: "ACTIVE", color: "#1877f2" },
  { id: "google-ads", name: "Google Search & Video", category: "ADS", monthlySpend: 117000, unitCostFormatted: "₹2,089 / lead", volumeMetric: "56 Leads", quotaUsedPercent: 92, status: "ACTIVE", color: "#ea4335" },
];

export function ProviderCostMatrixChart() {
  const [selectedCategory, setSelectedCategory] = useState<ProviderCategory>("ALL");

  const filteredData = useMemo(() => {
    if (selectedCategory === "ALL") return PROVIDER_COST_DATA;
    return PROVIDER_COST_DATA.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const totalFilteredSpend = filteredData.reduce((acc, item) => acc + item.monthlySpend, 0);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
              <Server className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Multi-Provider Consumption & Unit Economics
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time API quota consumption, unit rates, and monthly spend across all connected providers.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
              selectedCategory === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Providers ({PROVIDER_COST_DATA.length})
          </button>
          <button
            onClick={() => setSelectedCategory("VOICE_AI")}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
              selectedCategory === "VOICE_AI"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Voice AI
          </button>
          <button
            onClick={() => setSelectedCategory("TELEPHONY")}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
              selectedCategory === "TELEPHONY"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Telephony SIP
          </button>
          <button
            onClick={() => setSelectedCategory("SMS")}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
              selectedCategory === "SMS"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            SMS
          </button>
          <button
            onClick={() => setSelectedCategory("EMAIL")}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
              selectedCategory === "EMAIL"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setSelectedCategory("ADS")}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
              selectedCategory === "ADS"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Ads
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
              width={160}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload as ProviderCostItem;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[190px]">
                    <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1">
                      {item.name}
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Monthly Spend:</span>
                      <span className="font-bold font-mono text-emerald-400">
                        ₹{item.monthlySpend.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Unit Rate:</span>
                      <span className="font-bold font-mono">{item.unitCostFormatted}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Delivered Vol:</span>
                      <span className="font-bold font-mono">{item.volumeMetric}</span>
                    </div>
                    <div className="flex justify-between text-amber-400">
                      <span>Quota Used:</span>
                      <span className="font-bold font-mono">{item.quotaUsedPercent}%</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="monthlySpend" name="Spend (₹)" radius={[0, 6, 6, 0]} barSize={14}>
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Provider Details Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
        {filteredData.slice(0, 8).map((p) => (
          <div
            key={p.id}
            className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col justify-between space-y-2 hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 truncate">{p.name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200/80">
                {p.status}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Unit Rate:</span>
                <span className="font-bold text-slate-900">{p.unitCostFormatted}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total MTD:</span>
                <span className="font-black text-emerald-700">₹{p.monthlySpend.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Quota Usage</span>
                <span>{p.quotaUsedPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${p.quotaUsedPercent}%`,
                    backgroundColor: p.quotaUsedPercent > 80 ? "#ef4444" : p.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
