"use client";

import { Award, Building2, Users, Trophy } from "lucide-react";

export function CPLeaderboards({ leaderboards }: { leaderboards: any }) {
  if (!leaderboards) return null;

  const {
    topProjects = [],
    topClosingManagers = [],
    topSourcingManagers = [],
    topBrokers = [],
  } = leaderboards;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Column 1: Top Projects & Top Brokers */}
      <div className="space-y-6">
        {/* Top Projects */}
        <div
          className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 transition-all duration-300"
          style={{
            boxShadow:
              "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
                <Building2 size={16} />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                  Top CP Developments
                </h2>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
                  Highest booking velocity across partner projects
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              Top Projects
            </span>
          </div>

          {topProjects.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold m-0 py-8 text-center">
              No project booking data available yet.
            </p>
          ) : (
            <div className="space-y-2">
              {topProjects.map((proj: any, idx: number) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 border border-slate-200/70 transition-all duration-200 shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 bg-white border border-slate-200 shadow-2xs">
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 truncate m-0">
                          {proj.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-slate-900 tabular-nums m-0">
                        {proj.bookings}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider m-0">
                        Bookings
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Brokers */}
        <div
          className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 transition-all duration-300"
          style={{
            boxShadow:
              "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
                <Users size={16} />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                  Top External Brokers
                </h2>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
                  Channel partners with highest closed transactions
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              Network
            </span>
          </div>

          {topBrokers.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold m-0 py-8 text-center">
              No broker transaction records available.
            </p>
          ) : (
            <div className="space-y-2">
              {topBrokers.map((broker: any, idx: number) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={broker.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 border border-slate-200/70 transition-all duration-200 shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 bg-white border border-slate-200 shadow-2xs">
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 truncate m-0">
                          {broker.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-900 tabular-nums m-0">
                        {broker.bookings}{" "}
                        <span className="text-[10px] font-bold text-slate-400">
                          deals
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Internal Teams */}
      <div
        className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 space-y-6 transition-all duration-300"
        style={{
          boxShadow:
            "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
              <Award size={16} />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                Top Internal CP Leaders
              </h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
                Sourcing and closing manager operational throughput
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            Internal Teams
          </span>
        </div>

        {/* Top Sourcing Managers */}
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 m-0 flex items-center gap-1.5">
            <span>Sourcing Managers (SMs)</span>
          </h3>
          {topSourcingManagers.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold m-0 py-4 text-center">
              No sourcing manager data recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {topSourcingManagers.map((sm: any, idx: number) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={sm.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 border border-slate-200/70 transition-all duration-200 shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 bg-white border border-slate-200 shadow-2xs">
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate m-0">
                          {sm.name}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-emerald-700 tabular-nums m-0">
                        {sm.bookings}{" "}
                        <span className="text-[10px] font-bold text-slate-400">
                          broker deals
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Closing Managers */}
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 m-0 flex items-center gap-1.5">
            <span>Closing Managers (CMs)</span>
          </h3>
          {topClosingManagers.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold m-0 py-4 text-center">
              No closing manager data recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {topClosingManagers.map((cm: any, idx: number) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={cm.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 border border-slate-200/70 transition-all duration-200 shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 bg-white border border-slate-200 shadow-2xs">
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate m-0">
                          {cm.name}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-blue-700 tabular-nums m-0">
                        {cm.bookings}{" "}
                        <span className="text-[10px] font-bold text-slate-400">
                          units closed
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
