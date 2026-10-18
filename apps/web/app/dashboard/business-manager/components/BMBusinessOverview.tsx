"use client";

import { Building2, Handshake, ArrowUpRight } from "lucide-react";

interface BusinessKpis {
  brokerageRevenue: number;
  cpRevenue: number;
  brokerageBookings: number;
  cpBookings: number;
  brokerageLeads: number;
  cpLeads: number;
  cpCommission: number;
  totalBrokers: number;
}

function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function BizCard({
  label,
  subtitle,
  icon: Icon,
  badgeBg,
  badgeText,
  badgeBorder,
  rows,
}: {
  label: string;
  subtitle: string;
  icon: any;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  rows: { label: string; value: string | number }[];
}) {
  return (
    <div
      className="flex-1 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 transition-all duration-200 hover:border-slate-300 shadow-2xs hover:shadow-xs flex flex-col justify-between"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 10px 24px -18px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badgeBg} ${badgeText} ${badgeBorder} shadow-2xs`}
            >
              <Icon size={17} />
            </div>
            <div>
              <h3 className="m-0 text-xs font-black text-slate-900 tracking-tight">
                {label}
              </h3>
              <p className="m-0 text-[10px] font-semibold text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>
          <ArrowUpRight size={14} className="text-slate-400" />
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100"
            >
              <span className="text-xs font-bold text-slate-500">
                {row.label}
              </span>
              <span className="text-xs font-black text-slate-900 tabular-nums">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BMBusinessOverview({ kpis }: { kpis: BusinessKpis }) {
  if (!kpis) return null;

  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between h-full"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
            Business Line Breakdown
          </h2>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
            Comparative performance of internal brokerage vs external CP
          </p>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
          Dual Engines
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BizCard
          label="Brokerage"
          subtitle="Direct sales operations"
          icon={Building2}
          badgeBg="bg-indigo-50/90"
          badgeText="text-indigo-700"
          badgeBorder="border-indigo-200/70"
          rows={[
            { label: "Revenue", value: fmt(kpis.brokerageRevenue) },
            { label: "Bookings", value: kpis.brokerageBookings },
            { label: "Active Leads", value: kpis.brokerageLeads },
          ]}
        />
        <BizCard
          label="Channel Partner"
          subtitle="External broker network"
          icon={Handshake}
          badgeBg="bg-sky-50/90"
          badgeText="text-sky-700"
          badgeBorder="border-sky-200/70"
          rows={[
            { label: "Revenue", value: fmt(kpis.cpRevenue) },
            { label: "Bookings", value: kpis.cpBookings },
            { label: "Active Brokers", value: kpis.totalBrokers },
            { label: "Commission Due", value: fmt(kpis.cpCommission) },
          ]}
        />
      </div>
    </div>
  );
}
