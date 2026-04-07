"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { stockAPI, reportAPI } from "@/lib/api";
import type { Stock, StockConsensus, Report, PricePoint, PaginatedResponse } from "@/types";

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
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const stockList = await stockAPI.list({ search: code, size: "1" }) as PaginatedResponse<Stock>;
        if (stockList.items.length === 0) {
          setError("종목을 찾을 수 없습니다.");
          setLoading(false);
          return;
        }
        const foundStock = stockList.items[0];
        setStock(foundStock);

        const [consensusData, reportData, priceData] = await Promise.all([
          stockAPI.consensus(foundStock.id) as Promise<StockConsensus>,
          reportAPI.list({ stock_id: String(foundStock.id), page: "1", size: "20" }) as Promise<PaginatedResponse<Report>>,
          stockAPI.prices(foundStock.id, 60) as Promise<PricePoint[]>,
        ]);
        setConsensus(consensusData);
        setReports(reportData.items);
        setPrices(priceData);
      } catch {
        setError("종목 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    if (code) load();
  }, [code]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container-wide">
          <div className="animate-pulse space-y-6">
            <div className="w-48 h-4 bg-surface-secondary rounded" />
            <div className="w-64 h-8 bg-surface-secondary rounded" />
            <div className="h-64 bg-surface-secondary rounded-apple-lg" />
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-secondary rounded-apple-lg" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stock) return <div className="py-32 text-center text-text-tertiary">{error || "종목을 찾을 수 없습니다."}</div>;

  const total = consensus ? consensus.buy_count + consensus.hold_count + consensus.sell_count : 0;
  const avgTarget = consensus?.avg_target_price ?? 0;
  const lastPrice = prices.length > 0 ? prices[prices.length - 1].close_price : null;

  // Chart data formatting
  const chartData = prices.map((p) => ({
    date: p.date.slice(5),  // MM-DD
    price: p.close_price,
    volume: p.volume,
  }));

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
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-display-sm text-text-primary">{stock.name}</h1>
            <p className="text-body-lg text-text-secondary mt-1">
              {stock.code} · {stock.market} {stock.gics_sector ? `· ${stock.gics_sector}` : ""}
            </p>
          </div>
          {lastPrice && (
            <div className="text-right">
              <div className="text-display text-text-primary">{lastPrice.toLocaleString()}원</div>
              <div className="text-body text-text-tertiary">최근 종가</div>
            </div>
          )}
        </div>

        {/* Price Chart */}
        {chartData.length > 1 && (
          <div className="bg-white rounded-apple-lg shadow-apple p-6 mb-8">
            <h3 className="text-body text-text-tertiary mb-4">주가 추이</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#8e8e93" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5ea" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#8e8e93" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()}원`, "종가"]}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: 13,
                    }}
                  />
                  {avgTarget > 0 && (
                    <ReferenceLine
                      y={avgTarget}
                      stroke="#007aff"
                      strokeDasharray="4 4"
                      label={{ value: `목표가 ${Math.round(avgTarget).toLocaleString()}`, position: "right", fontSize: 11, fill: "#007aff" }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1c1c1e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: "#1c1c1e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Consensus overview */}
        {consensus && total > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
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

            {/* Upside / Report count */}
            <div className="bg-white rounded-apple-lg p-6 shadow-apple">
              <h3 className="text-body text-text-tertiary mb-4">상승 여력</h3>
              {lastPrice && avgTarget > 0 ? (
                <>
                  <div className={`text-display ${avgTarget > lastPrice ? "text-accent-green" : "text-accent-red"}`}>
                    {avgTarget > lastPrice ? "+" : ""}{(((avgTarget - lastPrice) / lastPrice) * 100).toFixed(1)}%
                  </div>
                  <div className="text-body text-text-tertiary mt-2">
                    현재가 대비 평균 목표가
                  </div>
                </>
              ) : (
                <>
                  <div className="text-display text-text-primary">{consensus.report_count}</div>
                  <div className="text-body text-text-tertiary mt-2">총 리포트 수</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Target price dot chart */}
        {reports.length > 0 && (
          <div className="bg-white rounded-apple-lg shadow-apple p-6 mb-8">
            <h3 className="text-body text-text-tertiary mb-4">애널리스트별 목표가</h3>
            <div className="space-y-2">
              {reports.map((r) => {
                const maxTP = consensus?.high_target_price || Math.max(...reports.map((rr) => rr.target_price));
                const pct = maxTP > 0 ? (r.target_price / maxTP) * 100 : 0;
                return (
                  <Link
                    key={r.id}
                    href={`/reports/${r.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <span className="text-caption text-text-tertiary w-20 truncate shrink-0">{r.analyst_name}</span>
                    <div className="flex-1 relative h-6">
                      <div className="absolute inset-0 bg-surface-secondary rounded-full" />
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                          r.opinion === "매수" ? "bg-accent-green/30" : r.opinion === "매도" ? "bg-accent-red/30" : "bg-accent-orange/30"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                          r.opinion === "매수" ? "bg-accent-green" : r.opinion === "매도" ? "bg-accent-red" : "bg-accent-orange"
                        }`}
                        style={{ left: `calc(${pct}% - 6px)` }}
                      />
                    </div>
                    <span className="text-caption font-medium text-text-primary w-20 text-right shrink-0">
                      {r.target_price.toLocaleString()}원
                    </span>
                  </Link>
                );
              })}
            </div>
            {lastPrice && (
              <div className="text-caption text-text-tertiary mt-3 text-right">
                현재가: {lastPrice.toLocaleString()}원
              </div>
            )}
          </div>
        )}

        {/* Analyst opinions */}
        <div>
          <h2 className="text-title text-text-primary mb-4">애널리스트 의견</h2>
          <p className="text-body text-text-tertiary mb-6">
            테두리 색상은 신뢰도 —
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
                  href={`/reports/${report.id}`}
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
