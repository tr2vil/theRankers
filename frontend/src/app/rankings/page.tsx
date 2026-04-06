"use client";

import { useState } from "react";
import Link from "next/link";
import PeriodSelector from "@/components/ui/PeriodSelector";

const demoRankings = [
  { rank: 1, name: "김서연", firm: "미래에셋증권", sector: "IT", score: 87.3, targetHit: 32.5, excessReturn: 28.2, direction: 17.8, consistency: 8.8, reports: 48, accuracy: 72.9 },
  { rank: 2, name: "박준혁", firm: "삼성증권", sector: "헬스케어", score: 82.1, targetHit: 29.4, excessReturn: 25.1, direction: 18.2, consistency: 9.4, reports: 35, accuracy: 68.6 },
  { rank: 3, name: "이수진", firm: "KB증권", sector: "금융", score: 79.8, targetHit: 28.0, excessReturn: 24.3, direction: 17.5, consistency: 10.0, reports: 42, accuracy: 66.7 },
  { rank: 4, name: "정민우", firm: "한국투자증권", sector: "IT", score: 76.5, targetHit: 27.1, excessReturn: 22.9, direction: 16.5, consistency: 10.0, reports: 31, accuracy: 64.5 },
  { rank: 5, name: "최하영", firm: "대신증권", sector: "경기소비재", score: 74.2, targetHit: 26.3, excessReturn: 21.7, direction: 16.2, consistency: 10.0, reports: 27, accuracy: 63.0 },
  { rank: 6, name: "한지민", firm: "NH투자증권", sector: "소재", score: 71.8, targetHit: 25.0, excessReturn: 21.0, direction: 15.8, consistency: 10.0, reports: 39, accuracy: 61.5 },
  { rank: 7, name: "오태현", firm: "메리츠증권", sector: "산업재", score: 69.4, targetHit: 24.1, excessReturn: 20.3, direction: 15.0, consistency: 10.0, reports: 33, accuracy: 60.6 },
  { rank: 8, name: "윤서아", firm: "키움증권", sector: "커뮤니케이션", score: 67.2, targetHit: 23.5, excessReturn: 19.7, direction: 14.5, consistency: 9.5, reports: 29, accuracy: 58.6 },
];

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
          <span className="text-caption text-text-tertiary">2026.04.06 기준</span>
        </div>

        {/* Score legend */}
        <div className="flex items-center gap-6 mb-6 text-caption text-text-tertiary">
          <span>가중치:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-blue" /> 목표가 달성률 35%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-green" /> 초과수익률 30%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-orange" /> 방향 정확도 20%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-text-tertiary" /> 일관성 15%
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[60px_1fr_120px_280px_80px_80px] gap-4 px-6 py-3 border-b border-border-secondary text-caption text-text-tertiary font-medium">
            <span>순위</span>
            <span>애널리스트</span>
            <span className="text-right">종합 점수</span>
            <span>점수 구성</span>
            <span className="text-right">리포트</span>
            <span className="text-right">적중률</span>
          </div>

          {/* Rows */}
          {demoRankings.map((entry) => (
            <Link
              key={entry.rank}
              href={`/analysts/${entry.rank}`}
              className="grid grid-cols-[60px_1fr_120px_280px_80px_80px] gap-4 px-6 py-4 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors group"
            >
              <span className="text-title text-text-tertiary text-center">{entry.rank}</span>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white shrink-0 ${getTrustRing(entry.score)}`}
                >
                  <span className="text-body font-semibold text-text-secondary">{entry.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-body font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                    {entry.name}
                  </div>
                  <div className="text-caption text-text-tertiary">{entry.firm} &middot; {entry.sector}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-title text-text-primary">{entry.score.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-0.5 h-5">
                <div className="bg-accent-blue/80 h-full rounded-l" style={scoreBg(entry.targetHit, 100)} />
                <div className="bg-accent-green/80 h-full" style={scoreBg(entry.excessReturn, 100)} />
                <div className="bg-accent-orange/80 h-full" style={scoreBg(entry.direction, 100)} />
                <div className="bg-text-tertiary/40 h-full rounded-r" style={scoreBg(entry.consistency, 100)} />
              </div>
              <span className="text-body text-text-secondary text-right">{entry.reports}건</span>
              <span className="text-body font-medium text-text-primary text-right">{entry.accuracy.toFixed(1)}%</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
