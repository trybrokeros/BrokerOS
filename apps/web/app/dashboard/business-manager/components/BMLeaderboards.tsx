"use client";

import {
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Target,
} from "lucide-react";

function LeaderboardCard({
  title,
  subtitle,
  icon: Icon,
  badgeBg,
  badgeText,
  badgeBorder,
  items,
  metricLabel,
  metricKey,
}: {
  title: string;
  subtitle: string;
  icon: any;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  items: any[];
  metricLabel: string;
  metricKey: string;
}) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${badgeBg} ${badgeText} ${badgeBorder} shadow-2xs`}
          >
            <Icon size={16} />
          </div>
          <div>
            <h3 className="m-0 text-xs font-black text-slate-900 uppercase tracking-wider">
              {title}
            </h3>
            <p className="m-0 text-[10px] font-semibold text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
          Top 5
        </span>
      </div>

      {/* Rows */}
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 font-semibold m-0 text-center py-8">
          No leaderboard data recorded yet
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item: any, idx: number) => {
            const name: string = item.name || "Unknown";
            const initial = name[0]?.toUpperCase() || "?";
            const metricValue = item[metricKey] ?? 0;

            return (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 border border-slate-200/70 transition-all duration-200 shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank medal/badge */}
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                    {idx < 3 ? medals[idx] : `#${idx + 1}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-xs shrink-0">
                    {initial}
                  </div>

                  {/* Name */}
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                    {name}
                  </span>
                </div>

                {/* Metric */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-slate-900 tabular-nums">
                    {metricValue}
                  </div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    {metricLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BMLeaderboards({ leaderboards }: { leaderboards: any }) {
  if (!leaderboards) return null;

  const {
    topSalesExecs = [],
    topSourcingManagers = [],
    topClosingManagers = [],
    topBrokers = [],
  } = leaderboards;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <LeaderboardCard
        title="Top Sales Executives"
        subtitle="Internal sales team closures"
        icon={TrendingUp}
        badgeBg="bg-indigo-50/90"
        badgeText="text-indigo-700"
        badgeBorder="border-indigo-200/70"
        items={topSalesExecs}
        metricLabel="Bookings"
        metricKey="bookings"
      />
      <LeaderboardCard
        title="Top Sourcing Managers"
        subtitle="Active broker partner network"
        icon={Users}
        badgeBg="bg-sky-50/90"
        badgeText="text-sky-700"
        badgeBorder="border-sky-200/70"
        items={topSourcingManagers}
        metricLabel="Brokers"
        metricKey="activeBrokers"
      />
      <LeaderboardCard
        title="Top Closing Managers"
        subtitle="Channel partner deal closures"
        icon={Award}
        badgeBg="bg-emerald-50/90"
        badgeText="text-emerald-700"
        badgeBorder="border-emerald-200/70"
        items={topClosingManagers}
        metricLabel="Deals Closed"
        metricKey="bookings"
      />
      <LeaderboardCard
        title="Top External Brokers"
        subtitle="Highest volume partner firms"
        icon={Briefcase}
        badgeBg="bg-amber-50/90"
        badgeText="text-amber-700"
        badgeBorder="border-amber-200/70"
        items={topBrokers}
        metricLabel="Bookings"
        metricKey="bookings"
      />
    </div>
  );
}
