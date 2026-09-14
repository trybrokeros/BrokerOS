"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar, Filter } from "lucide-react";

export interface AttributionDataPoint {
  period: string;
  spend: number;
  leads: number;
  cpl: number;
  outreaches: number;
}

const DEFAULT_ATTRIBUTION_DATA: AttributionDataPoint[] = [
  { period: "Week 1", spend: 28000, leads: 12, cpl: 2333, outreaches: 4200 },
  { period: "Week 2", spend: 35000, leads: 16, cpl: 2187, outreaches: 5100 },
  { period: "Week 3", spend: 42000, leads: 21, cpl: 2000, outreaches: 6800 },
  { period: "Week 4", spend: 39000, leads: 19, cpl: 2052, outreaches: 5900 },
  { period: "Week 5", spend: 48000, leads: 26, cpl: 1846, outreaches: 7400 },
  { period: "Week 6", spend: 52000, leads: 29, cpl: 1793, outreaches: 8100 },
  { period: "Week 7", spend: 45000, leads: 24, cpl: 1875, outreaches: 6900 },
  { period: "Week 8", spend: 58000, leads: 33, cpl: 1757, outreaches: 9200 },
];

export function OmnichannelAttributionChart({
  data = DEFAULT_ATTRIBUTION_DATA,
}: {
  data?: AttributionDataPoint[];
}) {
  const [activeMetric, setActiveMetric] = useState<"ALL" | "LEADS" | "SPEND">("ALL");

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Spend, Inbound Leads & CPL Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Omnichannel attribution correlating paid ad media
            <br />
            spend with CRM lead acquisition efficiency.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => setActiveMetric("ALL")}
            className={`px-2.5 py-1 rounded-lg transition-all ${activeMetric === "ALL"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Blended View
          </button>
          <button
            onClick={() => setActiveMetric("LEADS")}
            className={`px-2.5 py-1 rounded-lg transition-all ${activeMetric === "LEADS"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Leads Only
          </button>
          <button
            onClick={() => setActiveMetric("SPEND")}
            className={`px-2.5 py-1 rounded-lg transition-all ${activeMetric === "SPEND"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Spend Only
          </button>
        </div>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#10b981", fontSize: 11, fontWeight: 700 }}
              tickFormatter={(v) => `${v} leads`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const spendVal = payload.find((p) => p.dataKey === "spend")?.value;
                const leadsVal = payload.find((p) => p.dataKey === "leads")?.value;
                const cplVal = payload.find((p) => p.dataKey === "cpl")?.value;

                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
                    <div className="font-extrabold text-slate-300 border-b border-slate-800 pb-1">
                      {label}
                    </div>
                    {spendVal !== undefined && (
                      <div className="flex justify-between items-center text-blue-400">
                        <span>Spend:</span>
                        <span className="font-bold font-mono">
                          ₹{Number(spendVal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {leadsVal !== undefined && (
                      <div className="flex justify-between items-center text-emerald-400">
                        <span>Leads Acquired:</span>
                        <span className="font-bold font-mono">{leadsVal}</span>
                      </div>
                    )}
                    {cplVal !== undefined && (
                      <div className="flex justify-between items-center text-amber-400">
                        <span>CPL:</span>
                        <span className="font-bold font-mono">
                          ₹{Number(cplVal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: "10px", fontSize: "12px", fontWeight: 700 }}
            />

            {(activeMetric === "ALL" || activeMetric === "SPEND") && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="spend"
                name="Ad & Comm Spend (₹)"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spendGradient)"
              />
            )}

            {(activeMetric === "ALL" || activeMetric === "LEADS") && (
              <Bar
                yAxisId="right"
                dataKey="leads"
                name="Acquired CRM Leads"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            )}

            {activeMetric === "ALL" && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cpl"
                name="Cost Per Lead (₹)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div >
  );
}
