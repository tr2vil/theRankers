"use client";

import Link from "next/link";

const analyst = {
  id: 1, name: "김서연", firm: "미래에셋증권", sector: "IT",
  score: 87.3, reports: 48, accuracy: 72.9, avgReturn: 12.4,
  targetHit: 32.5, excessReturn: 28.2, direction: 17.8, consistency: 8.8,
};

const recentReports = [
  { id: 1, stock: "삼성전자", code: "005930", opinion: "매수" as const, targetPrice: 95000, date: "2026-04-05", priceAtReport: 78000, currentReturn: 8.3 },
  { id: 2, stock: "SK하이닉스", code: "000660", opinion: "매수" as const, targetPrice: 250000, date: "2026-03-28", priceAtReport: 195000, currentReturn: 12.1 },
  { id: 3, stock: "네이버", code: "035420", opinion: "중립" as const, targetPrice: 320000, date: "2026-03-20", priceAtReport: 310000, currentReturn: -2.1 },
  { id: 4, stock: "카카오", code: "035720", opinion: "매수" as const, targetPrice: 85000, date: "2026-03-15", priceAtReport: 62000, currentReturn: 15.4 },
  { id: 5, stock: "LG에너지솔루션", code: "373220", opinion: "매수" as const, targetPrice: 480000, date: "2026-03-10", priceAtReport: 410000, currentReturn: 5.6 },
];

const scoreHistory = [
  { month: "23.11", score: 68 }, { month: "23.12", score: 71 },
  { month: "24.01", score: 73 }, { month: "24.02", score: 69 },
  { month: "24.03", score: 75 }, { month: "24.04", score: 78 },
  { month: "24.05", score: 76 }, { month: "24.06", score: 80 },
  { month: "24.07", score: 82 }, { month: "24.08", score: 79 },
  { month: "24.09", score: 84 }, { month: "24.10", score: 87 },
];

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

export default function AnalystDetailPage() {
  const maxScore = Math.max(...scoreHistory.map((s) => s.score));

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
            <p className="text-body-lg text-text-secondary mt-1">{analyst.firm} &middot; {analyst.sector}</p>
          </div>
          <div className="text-right">
            <div className="text-display text-text-primary">{analyst.score.toFixed(1)}</div>
            <div className="text-body text-text-tertiary">종합 점수</div>
          </div>
        </div>

        {/* Score breakdown cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "목표가 달성률", score: analyst.targetHit, max: 35, color: "bg-accent-blue" },
            { label: "초과수익률", score: analyst.excessReturn, max: 30, color: "bg-accent-green" },
            { label: "방향 정확도", score: analyst.direction, max: 20, color: "bg-accent-orange" },
            { label: "일관성", score: analyst.consistency, max: 15, color: "bg-text-tertiary" },
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
            <div className="text-headline text-text-primary">{analyst.reports}</div>
            <div className="text-body text-text-tertiary">총 리포트</div>
          </div>
          <div className="bg-surface-secondary rounded-apple-lg p-5 text-center">
            <div className="text-headline text-text-primary">{analyst.accuracy}%</div>
            <div className="text-body text-text-tertiary">적중률</div>
          </div>
          <div className="bg-surface-secondary rounded-apple-lg p-5 text-center">
            <div className="text-headline text-accent-green">+{analyst.avgReturn}%</div>
            <div className="text-body text-text-tertiary">평균 수익률</div>
          </div>
        </div>

        {/* Score trend (simple bar chart) */}
        <div className="mb-12">
          <h2 className="text-title text-text-primary mb-4">점수 추이</h2>
          <div className="bg-white rounded-apple-lg p-6 shadow-apple">
            <div className="flex items-end gap-2 h-40">
              {scoreHistory.map((point) => (
                <div key={point.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-caption text-text-tertiary">{point.score}</span>
                  <div
                    className="w-full bg-accent-blue/20 rounded-t transition-all hover:bg-accent-blue/40"
                    style={{ height: `${(point.score / maxScore) * 100}%` }}
                  />
                  <span className="text-caption text-text-tertiary">{point.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="text-title text-text-primary mb-4">최근 리포트</h2>
          <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_120px_100px_100px] gap-4 px-6 py-3 border-b border-border-secondary text-caption text-text-tertiary font-medium">
              <span>종목</span>
              <span>투자의견</span>
              <span className="text-right">목표가</span>
              <span className="text-right">수익률</span>
              <span className="text-right">날짜</span>
            </div>
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="grid grid-cols-[1fr_80px_120px_100px_100px] gap-4 px-6 py-4 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors"
              >
                <div>
                  <span className="text-body font-semibold text-text-primary">{report.stock}</span>
                  <span className="text-caption text-text-tertiary ml-2">{report.code}</span>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold w-fit ${opinionStyle(report.opinion)}`}>
                  {report.opinion}
                </span>
                <span className="text-body text-text-primary text-right">{report.targetPrice.toLocaleString()}원</span>
                <span className={`text-body font-medium text-right ${report.currentReturn >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                  {report.currentReturn >= 0 ? "+" : ""}{report.currentReturn}%
                </span>
                <span className="text-body text-text-tertiary text-right">{report.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
