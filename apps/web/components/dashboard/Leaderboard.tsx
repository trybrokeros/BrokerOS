"use client";

import React from "react";
import { Avatar } from "./Avatar";
import { Trophy, Medal, Star } from "lucide-react";

export interface LeaderboardColumn {
  key: string;
  label: string;
  format?: (val: any) => string | number;
}

export interface LeaderboardEntry {
  id?: string;
  userId?: string;
  name: string;
  rank?: number;
  score?: number | string;
  image?: string;
  target?: number;
  [key: string]: any;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({
  title = "Monthly Leaderboard",
  entries,
  columns,
  currentUserId,
  accentColor = "var(--brand-600)",
  maxHeight = 420,
}: {
  title?: string;
  entries: LeaderboardEntry[];
  columns: LeaderboardColumn[];
  currentUserId?: string;
  accentColor?: string;
  maxHeight?: number;
}) {
  const maxScore = entries?.length > 0
    ? Math.max(1, ...entries.map((e) => Number(e.score || e[columns[0]?.key] || 1)))
    : 1;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
              <Trophy size={16} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
                {title}
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                Department Performance Standings
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
            <Star size={11} className="fill-amber-400 text-amber-500" />
            Top Performers
          </span>
        </div>

        {/* Column Headers */}
        <div className="flex items-center px-3 pb-2.5 border-b border-slate-100 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
          <div className="w-9">Rank</div>
          <div className="flex-1">Executive</div>
          {columns.map((col) => (
            <div key={col.key} className="w-16 text-right">
              {col.label}
            </div>
          ))}
        </div>

        {/* Row List (Rapport ov-rank Style) */}
        <div
          className="space-y-1.5 overflow-y-auto pr-1"
          style={{ maxHeight }}
        >
          {!entries || entries.length === 0 ? (
            <div className="text-center text-xs font-medium text-[var(--text-muted)] py-8">
              No leaderboard entries recorded yet.
            </div>
          ) : (
            entries.map((entry, idx) => {
              const rank = entry.rank ?? idx + 1;
              const isMe =
                !!currentUserId &&
                (entry.userId === currentUserId || entry.id === currentUserId);
              const rankLabel = rank <= 3 ? RANK_MEDALS[rank - 1] : `#${rank}`;
              const primaryVal = Number(entry.score || entry[columns[0]?.key] || 0);
              const progressPct = Math.min(100, Math.round((primaryVal / maxScore) * 100));

              return (
                <div
                  key={entry.userId ?? entry.id ?? idx}
                  className={`flex items-center px-3 py-2 rounded-xl text-xs transition-all ${
                    isMe
                      ? "bg-purple-50/90 border border-purple-200 shadow-2xs"
                      : rank === 1
                      ? "bg-amber-50/50 border border-amber-100/80"
                      : "bg-slate-50/60 border border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  {/* Rank Medal */}
                  <div className="w-9 font-extrabold text-sm tabular-nums flex items-center">
                    {rankLabel}
                  </div>

                  {/* Avatar + Name + Mini Progress Bar */}
                  <div className="flex-1 flex flex-col justify-center min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={entry.name} image={entry.image} size={24} />
                      <span className="truncate font-bold text-slate-800">
                        {entry.name || "Executive"}
                        {isMe && (
                          <span className="ml-1.5 text-[9px] uppercase font-extrabold text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.2 rounded-full">
                            You
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Rapport style mini meter */}
                    <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor:
                            rank === 1
                              ? "#c8431f"
                              : rank === 2
                              ? "#2f5c50"
                              : "var(--brand-600)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Columns */}
                  {columns.map((col) => {
                    const rawVal = entry[col.key];
                    const formatted = col.format ? col.format(rawVal) : rawVal ?? 0;
                    return (
                      <div
                        key={col.key}
                        className="w-16 text-right font-extrabold text-slate-900 tabular-nums text-xs"
                      >
                        {formatted}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
