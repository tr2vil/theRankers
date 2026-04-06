"use client";

import { useState } from "react";
import Link from "next/link";

const firms = ["전체", "미래에셋증권", "삼성증권", "KB증권", "한국투자증권", "NH투자증권", "대신증권", "메리츠증권"];

const demoAnalysts = [
  { id: 1, name: "김서연", firm: "미래에셋증권", sector: "IT", score: 87.3, reports: 48, accuracy: 72.9, avgReturn: 12.4 },
  { id: 2, name: "박준혁", firm: "삼성증권", sector: "헬스케어", score: 82.1, reports: 35, accuracy: 68.6, avgReturn: 9.8 },
  { id: 3, name: "이수진", firm: "KB증권", sector: "금융", score: 79.8, reports: 42, accuracy: 66.7, avgReturn: 8.2 },
  { id: 4, name: "정민우", firm: "한국투자증권", sector: "IT", score: 76.5, reports: 31, accuracy: 64.5, avgReturn: 7.6 },
  { id: 5, name: "최하영", firm: "대신증권", sector: "경기소비재", score: 74.2, reports: 27, accuracy: 63.0, avgReturn: 6.9 },
  { id: 6, name: "한지민", firm: "NH투자증권", sector: "소재", score: 71.8, reports: 39, accuracy: 61.5, avgReturn: 5.4 },
  { id: 7, name: "오태현", firm: "메리츠증권", sector: "산업재", score: 69.4, reports: 33, accuracy: 60.6, avgReturn: 4.8 },
  { id: 8, name: "윤서아", firm: "키움증권", sector: "커뮤니케이션", score: 67.2, reports: 29, accuracy: 58.6, avgReturn: 3.2 },
];

function getTrustRing(score: number) {
  if (score >= 80) return "ring-trust-top";
  if (score >= 60) return "ring-trust-high";
  if (score >= 40) return "ring-trust-mid";
  return "ring-trust-low";
}

export default function AnalystsPage() {
  const [selectedFirm, setSelectedFirm] = useState("전체");
  const [search, setSearch] = useState("");

  const filtered = demoAnalysts.filter((a) => {
    if (selectedFirm !== "전체" && a.firm !== selectedFirm) return false;
    if (search && !a.name.includes(search) && !a.firm.includes(search)) return false;
    return true;
  });

  return (
    <div className="py-16">
      <div className="container-wide">
        <div className="mb-12">
          <h1 className="text-display-sm text-text-primary mb-3">애널리스트</h1>
          <p className="text-body-lg text-text-secondary">증권사별 애널리스트 목록과 성과를 확인하세요.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="이름 또는 증권사 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-apple bg-surface-secondary px-4 py-2.5 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30 w-full md:w-72"
          />
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {firms.map((firm) => (
              <button
                key={firm}
                onClick={() => setSelectedFirm(firm)}
                className={`shrink-0 px-4 py-2 rounded-full text-body transition-colors ${
                  selectedFirm === firm
                    ? "bg-text-primary text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-border-secondary"
                }`}
              >
                {firm}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((analyst) => (
            <Link
              key={analyst.id}
              href={`/analysts/${analyst.id}`}
              className="bg-white rounded-apple-lg p-6 shadow-apple hover:shadow-apple-md transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white ${getTrustRing(analyst.score)}`}
                >
                  <span className="text-body-lg font-semibold text-text-secondary">{analyst.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-title text-text-primary group-hover:text-accent-blue transition-colors">
                    {analyst.name}
                  </div>
                  <div className="text-body text-text-tertiary">{analyst.firm}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-secondary rounded-apple p-3">
                  <div className="text-caption text-text-tertiary">종합 점수</div>
                  <div className="text-title text-text-primary">{analyst.score.toFixed(1)}</div>
                </div>
                <div className="bg-surface-secondary rounded-apple p-3">
                  <div className="text-caption text-text-tertiary">적중률</div>
                  <div className="text-title text-text-primary">{analyst.accuracy.toFixed(1)}%</div>
                </div>
                <div className="bg-surface-secondary rounded-apple p-3">
                  <div className="text-caption text-text-tertiary">평균 수익률</div>
                  <div className={`text-title ${analyst.avgReturn >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    {analyst.avgReturn >= 0 ? "+" : ""}{analyst.avgReturn.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-surface-secondary rounded-apple p-3">
                  <div className="text-caption text-text-tertiary">리포트</div>
                  <div className="text-title text-text-primary">{analyst.reports}건</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-caption text-text-tertiary">{analyst.sector}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
