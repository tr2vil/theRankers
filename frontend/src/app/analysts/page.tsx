"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { analystAPI } from "@/lib/api";
import type { Analyst, PaginatedResponse } from "@/types";

function getTrustRing(score: number) {
  if (score >= 80) return "ring-trust-top";
  if (score >= 60) return "ring-trust-high";
  if (score >= 40) return "ring-trust-mid";
  return "ring-trust-low";
}

export default function AnalystsPage() {
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirm, setSelectedFirm] = useState("전체");
  const [search, setSearch] = useState("");
  const [firms, setFirms] = useState<string[]>(["전체"]);

  useEffect(() => {
    async function load() {
      try {
        const data = await analystAPI.list({ page: "1", size: "100" }) as PaginatedResponse<Analyst>;
        setAnalysts(data.items);
        const uniqueFirms = [...new Set(data.items.map((a) => a.firm))].sort();
        setFirms(["전체", ...uniqueFirms]);
      } catch {
        setAnalysts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = analysts.filter((a) => {
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
            aria-label="애널리스트 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-apple bg-surface-secondary px-4 py-2.5 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30 w-full md:w-72"
          />
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {firms.slice(0, 8).map((firm) => (
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
        {loading ? (
          <div className="text-center py-16 text-text-tertiary">로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-tertiary">해당하는 애널리스트가 없습니다.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((analyst) => (
              <Link
                key={analyst.id}
                href={`/analysts/${analyst.id}`}
                className="bg-white rounded-apple-lg p-6 shadow-apple hover:shadow-apple-md transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white ${getTrustRing(analyst.ranking_score)}`}
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
                    <div className="text-title text-text-primary">{analyst.ranking_score.toFixed(1)}</div>
                  </div>
                  <div className="bg-surface-secondary rounded-apple p-3">
                    <div className="text-caption text-text-tertiary">적중률</div>
                    <div className="text-title text-text-primary">{analyst.accuracy_rate.toFixed(1)}%</div>
                  </div>
                  <div className="bg-surface-secondary rounded-apple p-3">
                    <div className="text-caption text-text-tertiary">평균 수익률</div>
                    <div className={`text-title ${analyst.avg_return >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                      {analyst.avg_return >= 0 ? "+" : ""}{analyst.avg_return.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-surface-secondary rounded-apple p-3">
                    <div className="text-caption text-text-tertiary">리포트</div>
                    <div className="text-title text-text-primary">{analyst.total_reports}건</div>
                  </div>
                </div>

                {analyst.sector && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-caption text-text-tertiary">{analyst.sector}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
