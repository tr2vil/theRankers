"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PeriodSelector from "@/components/ui/PeriodSelector";
import { rankingAPI } from "@/lib/api";
import type { RankingEntry, RankingResponse } from "@/types";

function getTrustRing(score: number) {
  if (score >= 80) return "ring-trust-top";
  if (score >= 60) return "ring-trust-high";
  if (score >= 40) return "ring-trust-mid";
  return "ring-trust-low";
}

function scoreBg(score: number, max: number) {
  const pct = (score / max) * 100;
  return { width: `${pct}%` };
}

export default function RankingsPage() {
  const [period, setPeriod] = useState("12m");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [calculatedAt, setCalculatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await rankingAPI.get({ period }) as RankingResponse;
        setRankings(data.items);
        setCalculatedAt(data.calculated_at);
      } catch {
        setRankings([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  return (
    <div className="py-16">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-display-sm text-text-primary mb-3">애널리스트 랭킹</h1>
          <p className="text-body-lg text-text-secondary">
            목표가 달성률, 초과수익률, 방향 정확도, 일관성을 종합 평가합니다.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <PeriodSelector value={period} onChange={setPeriod} />
          <span className="text-caption text-text-tertiary">
            {calculatedAt ? `${calculatedAt} 기준` : ""}
          </span>
        </div>

        {/* Score legend */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 text-caption text-text-tertiary">
          <span>가중치:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-blue" /> 달성률 35%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-green" /> 초과수익률 30%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-orange" /> 방향 20%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-text-tertiary" /> 일관성 15%
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border-secondary last:border-0 animate-pulse">
                <div className="w-8 h-4 bg-surface-secondary rounded" />
                <div className="w-10 h-10 bg-surface-secondary rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-4 bg-surface-secondary rounded" />
                  <div className="w-16 h-3 bg-surface-secondary rounded" />
                </div>
                <div className="w-12 h-4 bg-surface-secondary rounded" />
              </div>
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-16 text-text-tertiary">해당 기간의 랭킹 데이터가 없습니다.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-apple-xl shadow-apple overflow-x-auto">
              <div className="grid grid-cols-[60px_1fr_120px_280px_80px_80px] gap-4 px-6 py-3 border-b border-border-secondary text-caption text-text-tertiary font-medium">
                <span>순위</span>
                <span>애널리스트</span>
                <span className="text-right">종합 점수</span>
                <span>점수 구성</span>
                <span className="text-right">리포트</span>
                <span className="text-right">적중률</span>
              </div>
              {rankings.map((entry) => (
                <Link
                  key={entry.analyst_id}
                  href={`/analysts/${entry.analyst_id}`}
                  className="grid grid-cols-[60px_1fr_120px_280px_80px_80px] gap-4 px-6 py-4 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors group"
                >
                  <span className="text-title text-text-tertiary text-center">{entry.rank}</span>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white shrink-0 ${getTrustRing(entry.score)}`}
                    >
                      <span className="text-body font-semibold text-text-secondary">{entry.analyst_name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-body font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                        {entry.analyst_name}
                      </div>
                      <div className="text-caption text-text-tertiary">{entry.analyst_firm}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-title text-text-primary">{entry.score.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 h-5">
                    <div className="bg-accent-blue/80 h-full rounded-l" style={scoreBg(entry.target_hit_score, 100)} />
                    <div className="bg-accent-green/80 h-full" style={scoreBg(entry.excess_return_score, 100)} />
                    <div className="bg-accent-orange/80 h-full" style={scoreBg(entry.direction_accuracy_score, 100)} />
                    <div className="bg-text-tertiary/40 h-full rounded-r" style={scoreBg(entry.consistency_score, 100)} />
                  </div>
                  <span className="text-body text-text-secondary text-right">{entry.total_reports}건</span>
                  <span className="text-body font-medium text-text-primary text-right">{entry.accuracy_rate.toFixed(1)}%</span>
                </Link>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden grid gap-3">
              {rankings.map((entry) => (
                <Link
                  key={entry.analyst_id}
                  href={`/analysts/${entry.analyst_id}`}
                  className="bg-white rounded-apple-lg p-4 shadow-apple hover:shadow-apple-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-title text-text-tertiary w-6">{entry.rank}</span>
                    <div
                      className={`w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white shrink-0 ${getTrustRing(entry.score)}`}
                    >
                      <span className="text-body font-semibold text-text-secondary">{entry.analyst_name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-body font-semibold text-text-primary">{entry.analyst_name}</div>
                      <div className="text-caption text-text-tertiary">{entry.analyst_firm}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-title text-text-primary">{entry.score.toFixed(1)}</div>
                      <div className="text-caption text-text-tertiary">점</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 h-3 mb-2">
                    <div className="bg-accent-blue/80 h-full rounded-l" style={scoreBg(entry.target_hit_score, 100)} />
                    <div className="bg-accent-green/80 h-full" style={scoreBg(entry.excess_return_score, 100)} />
                    <div className="bg-accent-orange/80 h-full" style={scoreBg(entry.direction_accuracy_score, 100)} />
                    <div className="bg-text-tertiary/40 h-full rounded-r" style={scoreBg(entry.consistency_score, 100)} />
                  </div>
                  <div className="flex justify-between text-caption text-text-tertiary">
                    <span>리포트 {entry.total_reports}건</span>
                    <span>적중률 {entry.accuracy_rate.toFixed(1)}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
