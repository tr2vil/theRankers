"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { stockAPI, reportAPI } from "@/lib/api";
import type { Stock, StockConsensus, Report, PaginatedResponse } from "@/types";

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
  const params = useParams();
  const code = params.code as string;
  const [stock, setStock] = useState<Stock | null>(null);
  const [consensus, setConsensus] = useState<StockConsensus | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Find stock by code
        const stockList = await stockAPI.list({ search: code, size: "1" }) as PaginatedResponse<Stock>;
        if (stockList.items.length === 0) {
          setError("종목을 찾을 수 없습니다.");
          setLoading(false);
          return;
        }
        const foundStock = stockList.items[0];
        setStock(foundStock);

        const [consensusData, reportData] = await Promise.all([
          stockAPI.consensus(foundStock.id) as Promise<StockConsensus>,
          reportAPI.list({ stock_id: String(foundStock.id), page: "1", size: "20" }) as Promise<PaginatedResponse<Report>>,
        ]);
        setConsensus(consensusData);
        setReports(reportData.items);
      } catch {
        setError("종목 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    if (code) load();
  }, [code]);

  if (loading) return <div className="py-32 text-center text-text-tertiary">로딩 중...</div>;
  if (error || !stock) return <div className="py-32 text-center text-text-tertiary">{error || "종목을 찾을 수 없습니다."}</div>;

  const total = consensus ? consensus.buy_count + consensus.hold_count + consensus.sell_count : 0;
  const avgTarget = consensus?.avg_target_price ?? 0;

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
            <p className="text-body-lg text-text-secondary mt-1">{stock.code} · {stock.market} {stock.gics_sector ? `· ${stock.gics_sector}` : ""}</p>
          </div>
        </div>

        {/* Consensus overview */}
        {consensus && total > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Opinion distribution */}
            <div className="bg-white rounded-apple-lg p-6 shadow-apple">
              <h3 className="text-body text-text-tertiary mb-4">투자의견 분포</h3>
              <div className="flex h-8 rounded-apple overflow-hidden mb-4">
                {consensus.buy_count > 0 && (
                  <div className="bg-accent-green flex items-center justify-center text-white text-caption font-semibold" style={{ width: `${(consensus.buy_count / total) * 100}%` }}>
                    {consensus.buy_count}
                  </div>
                )}
                {consensus.hold_count > 0 && (
                  <div className="bg-accent-orange flex items-center justify-center text-white text-caption font-semibold" style={{ width: `${(consensus.hold_count / total) * 100}%` }}>
                    {consensus.hold_count}
                  </div>
                )}
                {consensus.sell_count > 0 && (
                  <div className="bg-accent-red flex items-center justify-center text-white text-caption font-semibold" style={{ width: `${(consensus.sell_count / total) * 100}%` }}>
                    {consensus.sell_count}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-caption">
                <span className="text-accent-green font-medium">매수 {consensus.buy_count}</span>
                <span className="text-accent-orange font-medium">중립 {consensus.hold_count}</span>
                <span className="text-accent-red font-medium">매도 {consensus.sell_count}</span>
              </div>
            </div>

            {/* Target price range */}
            <div className="bg-white rounded-apple-lg p-6 shadow-apple">
              <h3 className="text-body text-text-tertiary mb-4">목표가 범위</h3>
              <div className="space-y-3">
                {consensus.high_target_price && (
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-text-tertiary">최고</span>
                    <span className="text-body font-semibold text-text-primary">{consensus.high_target_price.toLocaleString()}원</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-caption text-accent-blue font-medium">평균</span>
                  <span className="text-title font-semibold text-accent-blue">{Math.round(avgTarget).toLocaleString()}원</span>
                </div>
                {consensus.low_target_price && (
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-text-tertiary">최저</span>
                    <span className="text-body font-semibold text-text-primary">{consensus.low_target_price.toLocaleString()}원</span>
                  </div>
                )}
              </div>
            </div>

            {/* Report count */}
            <div className="bg-white rounded-apple-lg p-6 shadow-apple">
              <h3 className="text-body text-text-tertiary mb-4">리포트 현황</h3>
              <div className="text-display text-text-primary">{consensus.report_count}</div>
              <div className="text-body text-text-tertiary mt-2">총 리포트 수</div>
            </div>
          </div>
        )}

        {/* Analyst opinions */}
        <div>
          <h2 className="text-title text-text-primary mb-4">애널리스트 의견</h2>
          <p className="text-body text-text-tertiary mb-6">
            아이콘 테두리 색상은 애널리스트 신뢰도를 나타냅니다 —
            <span className="text-trust-top"> 최상위</span>,
            <span className="text-trust-high"> 우수</span>,
            <span className="text-trust-mid"> 보통</span>,
            <span className="text-trust-low"> 주의</span>
          </p>

          {reports.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">리포트가 없습니다.</div>
          ) : (
            <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/analysts/${report.analyst_id}`}
                  className="flex items-center gap-4 px-6 py-4 border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors group"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white shrink-0 ${getTrustRing(50)}`}
                  >
                    <span className="text-body font-semibold text-text-secondary">{(report.analyst_name || "?").charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                        {report.analyst_name}
                      </span>
                      <span className="text-caption text-text-tertiary">{report.analyst_firm}</span>
                    </div>
                    <div className="text-caption text-text-tertiary">{report.report_date}</div>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold ${opinionStyle(report.opinion)}`}>
                    {report.opinion}
                  </span>
                  <div className="text-right w-28">
                    <div className="text-body font-semibold text-text-primary">{report.target_price.toLocaleString()}원</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
