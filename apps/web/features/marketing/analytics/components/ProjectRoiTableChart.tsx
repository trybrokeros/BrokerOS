"use client";

import React from "react";
import { Building, TrendingUp, DollarSign, Award, ArrowUpRight } from "lucide-react";

export interface ProjectRoiItem {
  id: string;
  projectName: string;
  location: string;
  spend: number;
  leads: number;
  siteVisits: number;
  unitsClosed: number;
  grossSalesValueCr: number;
  inboundCommission: number;
  roiMultiplier: number;
}

const PROJECT_ROI_DATA: ProjectRoiItem[] = [
  {
    id: "skyline",
    projectName: "Skyline Luxuria",
    location: "Bandra West, Mumbai",
    spend: 92000,
    leads: 48,
    siteVisits: 22,
    unitsClosed: 4,
    grossSalesValueCr: 14.5,
    inboundCommission: 2900000, // 2% of 14.5 Cr
    roiMultiplier: 31.5,
  },
  {
    id: "green-valley",
    projectName: "Green Valley Residences",
    location: "Kharadi, Pune",
    spend: 64000,
    leads: 38,
    siteVisits: 16,
    unitsClosed: 3,
    grossSalesValueCr: 4.8,
    inboundCommission: 1200000, // 2.5% of 4.8 Cr
    roiMultiplier: 18.7,
  },
  {
    id: "signature",
    projectName: "Signature Towers Penthouse",
    location: "Indiranagar, Bangalore",
    spend: 85000,
    leads: 32,
    siteVisits: 14,
    unitsClosed: 2,
    grossSalesValueCr: 12.0,
    inboundCommission: 2400000, // 2% of 12 Cr
    roiMultiplier: 28.2,
  },
  {
    id: "ocean-heights",
    projectName: "Ocean Heights Sea-Facing",
    location: "Worli, Mumbai",
    spend: 52000,
    leads: 24,
    siteVisits: 11,
    unitsClosed: 2,
    grossSalesValueCr: 9.6,
    inboundCommission: 1920000, // 2% of 9.6 Cr
    roiMultiplier: 36.9,
  },
];

export function ProjectRoiTableChart() {
  const totalSpend = PROJECT_ROI_DATA.reduce((acc, p) => acc + p.spend, 0);
  const totalCommission = PROJECT_ROI_DATA.reduce((acc, p) => acc + p.inboundCommission, 0);
  const blendedRoi = totalSpend > 0 ? (totalCommission / totalSpend).toFixed(1) : "0";

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">
            <Building className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Project Marketing ROI &amp; Closed Commission Audit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Capital expenditure mapped against actual builder inbound commission revenue and sales velocity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
            Blended Firm ROI: {blendedRoi}x Multiplier
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="py-3 px-4">Project &amp; Location</th>
              <th className="py-3 px-4">Media Spend</th>
              <th className="py-3 px-4">Leads</th>
              <th className="py-3 px-4">Site Visits</th>
              <th className="py-3 px-4">Deals Closed</th>
              <th className="py-3 px-4">Gross Deal Value</th>
              <th className="py-3 px-4">Commission Earned</th>
              <th className="py-3 px-4 text-right">Marketing ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {PROJECT_ROI_DATA.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-extrabold text-slate-900 text-xs">{p.projectName}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{p.location}</div>
                </td>
                <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                  ₹{p.spend.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">{p.leads}</td>
                <td className="py-3 px-4 font-semibold text-indigo-600">
                  {p.siteVisits} verified
                </td>
                <td className="py-3 px-4 font-extrabold text-emerald-700">
                  {p.unitsClosed} units
                </td>
                <td className="py-3 px-4 font-black text-slate-900 font-mono">
                  ₹{p.grossSalesValueCr} Cr
                </td>
                <td className="py-3 px-4 font-black text-emerald-600 font-mono">
                  ₹{(p.inboundCommission / 100000).toFixed(1)} Lakhs
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <ArrowUpRight className="w-3 h-3" />
                    {p.roiMultiplier}x
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
