"use client";

import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ShieldCheck, Sparkles } from "lucide-react";

const RADAR_DATA = [
  { dimension: "Budget Verification", Google: 94, WhatsApp: 86, VoiceAI: 88, Meta: 72, Email: 65 },
  { dimension: "Response Speed", Google: 82, WhatsApp: 96, VoiceAI: 92, Meta: 78, Email: 54 },
  { dimension: "Site Visit Readiness", Google: 91, WhatsApp: 84, VoiceAI: 86, Meta: 68, Email: 58 },
  { dimension: "Phone Connect Rate", Google: 79, WhatsApp: 98, VoiceAI: 89, Meta: 74, Email: 42 },
  { dimension: "Closing Likelihood", Google: 88, WhatsApp: 82, VoiceAI: 85, Meta: 70, Email: 60 },
  { dimension: "Lead Temperature", Google: 92, WhatsApp: 89, VoiceAI: 90, Meta: 76, Email: 55 },
];

export function LeadSentimentRadarChart() {
  const [selectedChannels, setSelectedChannels] = useState<{ [key: string]: boolean }>({
    Google: true,
    WhatsApp: true,
    VoiceAI: true,
    Meta: false,
    Email: false,
  });

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Lead Quality & Sentiment Matrix by Channel
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multidimensional radar comparing buyer intent, site visit readiness, and phone connect rates.
          </p>
        </div>

        {/* Channel Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: "Google", color: "#ea4335", label: "Google" },
            { key: "WhatsApp", color: "#10b981", label: "WhatsApp" },
            { key: "VoiceAI", color: "#6366f1", label: "Voice AI" },
            { key: "Meta", color: "#1877f2", label: "Meta" },
            { key: "Email", color: "#a855f7", label: "Email" },
          ].map((ch) => (
            <button
              key={ch.key}
              onClick={() => toggleChannel(ch.key)}
              className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                selectedChannels[ch.key]
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ch.color }}
              />
              <span>{ch.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RADAR_DATA}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1 min-w-[150px]">
                    <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1">
                      {payload[0]?.payload?.dimension}
                    </div>
                    {payload.map((entry: any) => (
                      <div
                        key={entry.dataKey}
                        className="flex justify-between items-center"
                        style={{ color: entry.stroke }}
                      >
                        <span>{entry.name}:</span>
                        <span className="font-bold font-mono">{entry.value}/100</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />

            {selectedChannels.Google && (
              <Radar
                name="Google Search"
                dataKey="Google"
                stroke="#ea4335"
                fill="#ea4335"
                fillOpacity={0.2}
              />
            )}
            {selectedChannels.WhatsApp && (
              <Radar
                name="WhatsApp CRM"
                dataKey="WhatsApp"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
              />
            )}
            {selectedChannels.VoiceAI && (
              <Radar
                name="AI Voice Call"
                dataKey="VoiceAI"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
              />
            )}
            {selectedChannels.Meta && (
              <Radar
                name="Meta Facebook"
                dataKey="Meta"
                stroke="#1877f2"
                fill="#1877f2"
                fillOpacity={0.2}
              />
            )}
            {selectedChannels.Email && (
              <Radar
                name="Email"
                dataKey="Email"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.2}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/60 flex items-center justify-between text-xs">
        <span className="font-extrabold text-purple-900">
          🏆 Top Conversion Channel: Google Search & AI Voice Outbound
        </span>
        <span className="text-[11px] text-purple-700 font-bold">
          Avg 91.5 Quality Score
        </span>
      </div>
    </div>
  );
}
