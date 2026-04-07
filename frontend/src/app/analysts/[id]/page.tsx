"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { analystAPI, reportAPI, rankingAPI } from "@/lib/api";
import type { Analyst, Report, RankingEntry, PaginatedResponse, RankingResponse } from "@/types";

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

export default function AnalystDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [analyst, setAnalyst] = useState<Analyst | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [ranking, setRanking] = useState<RankingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [analystData, reportData, rankingData] = await Promise.all([
          analystAPI.get(id) as Promise<Analyst>,
          reportAPI.list({ analyst_id: String(id), page: "1", size: "10" }) as Promise<PaginatedResponse<Report>>,
          rankingAPI.get({ period: "12m" }) as Promise<RankingResponse>,
        ]);
        setAnalyst(analystData);
        setReports(reportData.items);
        const entry = rankingData.items.find((r) => r.analyst_id === id);
        if (entry) setRanking(entry);
      } catch {
        setError("애널리스트 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <div className="py-32 text-center text-text-tertiary">로딩 중...</div>;
  if (error || !analyst) return <div className="py-32 text-center text-text-tertiary">{error || "애널리스트를 찾을 수 없습니다."}</div>;

  const score = ranking?.score ?? analyst.ranking_score;
  const targetHit = ranking?.target_hit_score ?? 0;
  const excessReturn = ranking?.excess_return_score ?? 0;
  const direction = ranking?.direction_accuracy_score ?? 0;
  const consistency = ranking?.consistency_score ?? 0;

  return (
    <div className="py-16">
      <div className="container-wide">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-body text-text-tertiary mb-8">
          <Link href="/analysts" className="hover:text-text-primary transition-colors">애널리스트</Link>
          <span>/</span>
          <span className="text-text-primary">{analyst.name}</span>
        </div>

        {/* Profile header */}
        <div className="flex items-start gap-6 mb-12">
          <div className="w-20 h-20 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-3 ring-offset-white ring-trust-top shrink-0">
            <span className="text-headline text-text-secondary">{analyst.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-display-sm text-text-primary">{analyst.name}</h1>
            <p className="text-body-lg text-text-secondary mt-1">{analyst.firm} {analyst.sector ? `· ${analyst.sector}` : ""}</p>
          </div>
          <div className="text-right">
            <div className="text-display text-text-primary">{score.toFixed(1)}</div>
            <div className="text-body text-text-tertiary">종합 점수</div>
          </div>
        </div>

        {/* Score breakdown cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "목표가 달성률", score: targetHit, max: 35, color: "bg-accent-blue" },
            { label: "초과수익률", score: excessReturn, max: 30, color: "bg-accent-green" },
            { label: "방향 정확도", score: direction, max: 20, color: "bg-accent-orange" },
            { label: "일관성", score: consistency, max: 15, color: "bg-text-tertiary" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-apple-lg p-5 shadow-apple">
              <div className="text-caption text-text-tertiary mb-1">{item.label}</div>
              <div className="text-headline text-text-primary mb-3">
                {item.score.toFixed(1)}
                <span className="text-body text-text-tertiary font-normal"> / {item.max}</span>
              </div>
              <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-surface-secondary rounded-apple-lg p-5 text-center">
            <div className="text-headline text-text-primary">{analyst.total_reports}</div>
            <div className="text-body text-text-tertiary">총 리포트</div>
          </div>
          <div className="bg-surface-secondary rounded-apple-lg p-5 text-center">
            <div className="text-headline text-text-primary">{analyst.accuracy_rate.toFixed(1)}%</div>
            <div className="text-body text-text-tertiary">적중률</div>
          </div>
          <div className="bg-surface-secondary rounded-apple-lg p-5 text-center">
            <div className={`text-headline ${analyst.avg_return >= 0 ? "text-accent-green" : "text-accent-red"}`}>
              {analyst.avg_return >= 0 ? "+" : ""}{analyst.avg_return.toFixed(1)}%
            </div>
            <div className="text-body text-text-tertiary">평균 수익률</div>
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="text-title text-text-primary mb-4">최근 리포트</h2>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">리포트가 없습니다.</div>
          ) : (
            <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_120px_100px] gap-4 px-6 py-3 border-b border-border-secondary text-caption text-text-tertiary font-medium">
                <span>종목</span>
                <span>투자의견</span>
                <span className="text-right">목표가</span>
                <span className="text-right">날짜</span>
              </div>
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/stocks/${report.stock_code}`}
                  className="grid grid-cols-[1fr_80px_120px_100px] gap-4 px-6 py-4 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors"
                >
                  <div>
                    <span className="text-body font-semibold text-text-primary">{report.stock_name}</span>
                    <span className="text-caption text-text-tertiary ml-2">{report.stock_code}</span>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold w-fit ${opinionStyle(report.opinion)}`}>
                    {report.opinion}
                  </span>
                  <span className="text-body text-text-primary text-right">{report.target_price.toLocaleString()}원</span>
                  <span className="text-body text-text-tertiary text-right">{report.report_date}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
