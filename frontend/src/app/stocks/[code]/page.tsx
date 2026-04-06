"use client";

import Link from "next/link";

const stock = { code: "005930", name: "삼성전자", market: "KOSPI", sector: "IT" };

const consensus = {
  buy: 18, hold: 3, sell: 0,
  avgTarget: 95000,
  highTarget: 110000,
  lowTarget: 80000,
  currentPrice: 78500,
};

const analystOpinions = [
  { id: 1, name: "김서연", firm: "미래에셋증권", opinion: "매수" as const, targetPrice: 95000, score: 87.3, date: "2026-04-05" },
  { id: 2, name: "정민우", firm: "한국투자증권", opinion: "매수" as const, targetPrice: 100000, score: 76.5, date: "2026-04-03" },
  { id: 3, name: "윤서아", firm: "키움증권", opinion: "매수" as const, targetPrice: 90000, score: 67.2, date: "2026-04-01" },
  { id: 4, name: "오태현", firm: "메리츠증권", opinion: "중립" as const, targetPrice: 82000, score: 69.4, date: "2026-03-28" },
  { id: 5, name: "한지민", firm: "NH투자증권", opinion: "매수" as const, targetPrice: 98000, score: 71.8, date: "2026-03-25" },
];

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

function getTrustRing(score: number) {
  if (score >= 80) return "ring-trust-top";
  if (score >= 60) return "ring-trust-high";
  if (score >= 40) return "ring-trust-mid";
  return "ring-trust-low";
}

export default function StockDetailPage() {
  const total = consensus.buy + consensus.hold + consensus.sell;
  const upside = ((consensus.avgTarget - consensus.currentPrice) / consensus.currentPrice * 100);

  return (
    <div className="py-16">
      <div className="container-wide">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-body text-text-tertiary mb-8">
          <Link href="/stocks" className="hover:text-text-primary transition-colors">종목</Link>
          <span>/</span>
          <span className="text-text-primary">{stock.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-display-sm text-text-primary">{stock.name}</h1>
            <p className="text-body-lg text-text-secondary mt-1">{stock.code} &middot; {stock.market} &middot; {stock.sector}</p>
          </div>
          <div className="text-right">
            <div className="text-display text-text-primary">{consensus.currentPrice.toLocaleString()}원</div>
            <div className="text-body text-text-tertiary">현재가</div>
          </div>
        </div>

        {/* Consensus overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Opinion distribution */}
          <div className="bg-white rounded-apple-lg p-6 shadow-apple">
            <h3 className="text-body text-text-tertiary mb-4">투자의견 분포</h3>
            <div className="flex h-8 rounded-apple overflow-hidden mb-4">
              <div className="bg-accent-green flex items-center justify-center text-white text-caption font-semibold" style={{ width: `${(consensus.buy / total) * 100}%` }}>
                {consensus.buy}
              </div>
              {consensus.hold > 0 && (
                <div className="bg-accent-orange flex items-center justify-center text-white text-caption font-semibold" style={{ width: `${(consensus.hold / total) * 100}%` }}>
                  {consensus.hold}
                </div>
              )}
              {consensus.sell > 0 && (
                <div className="bg-accent-red flex items-center justify-center text-white text-caption font-semibold" style={{ width: `${(consensus.sell / total) * 100}%` }}>
                  {consensus.sell}
                </div>
              )}
            </div>
            <div className="flex justify-between text-caption">
              <span className="text-accent-green font-medium">매수 {consensus.buy}</span>
              <span className="text-accent-orange font-medium">중립 {consensus.hold}</span>
              <span className="text-accent-red font-medium">매도 {consensus.sell}</span>
            </div>
          </div>

          {/* Target price range */}
          <div className="bg-white rounded-apple-lg p-6 shadow-apple">
            <h3 className="text-body text-text-tertiary mb-4">목표가 범위</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-caption text-text-tertiary">최고</span>
                <span className="text-body font-semibold text-text-primary">{consensus.highTarget.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-caption text-accent-blue font-medium">평균</span>
                <span className="text-title font-semibold text-accent-blue">{consensus.avgTarget.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-caption text-text-tertiary">최저</span>
                <span className="text-body font-semibold text-text-primary">{consensus.lowTarget.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* Upside */}
          <div className="bg-white rounded-apple-lg p-6 shadow-apple">
            <h3 className="text-body text-text-tertiary mb-4">상승 여력</h3>
            <div className="text-display text-accent-green">+{upside.toFixed(1)}%</div>
            <div className="text-body text-text-tertiary mt-2">
              현재가 대비 평균 목표가
            </div>
          </div>
        </div>

        {/* Analyst opinions with trust indicator */}
        <div>
          <h2 className="text-title text-text-primary mb-4">애널리스트 의견</h2>
          <p className="text-body text-text-tertiary mb-6">
            아이콘 테두리 색상은 애널리스트 신뢰도를 나타냅니다 —
            <span className="text-trust-top"> 최상위</span>,
            <span className="text-trust-high"> 우수</span>,
            <span className="text-trust-mid"> 보통</span>,
            <span className="text-trust-low"> 주의</span>
          </p>

          <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
            {analystOpinions.map((opinion) => (
              <Link
                key={opinion.id}
                href={`/analysts/${opinion.id}`}
                className="flex items-center gap-4 px-6 py-4 border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white shrink-0 ${getTrustRing(opinion.score)}`}
                >
                  <span className="text-body font-semibold text-text-secondary">{opinion.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                      {opinion.name}
                    </span>
                    <span className="text-caption text-text-tertiary">{opinion.firm}</span>
                  </div>
                  <div className="text-caption text-text-tertiary">{opinion.date}</div>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold ${opinionStyle(opinion.opinion)}`}>
                  {opinion.opinion}
                </span>
                <div className="text-right w-24">
                  <div className="text-body font-semibold text-text-primary">{opinion.targetPrice.toLocaleString()}원</div>
                  <div className="text-caption text-text-tertiary">점수 {opinion.score}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
