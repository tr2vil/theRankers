"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, CartesianGrid, Area, ComposedChart,
} from "recharts";
import { stockAPI } from "@/lib/api";
import type { Stock, StockForecast, PricePoint, PaginatedResponse } from "@/types";

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

function starRating(score: number): number {
  if (score >= 70) return 5;
  if (score >= 50) return 4;
  if (score >= 30) return 3;
  if (score >= 15) return 2;
  return 1;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count}점`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= count ? "#007aff" : "none"} stroke={i <= count ? "#007aff" : "#d1d1d6"} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function StockForecastPage() {
  const params = useParams();
  const code = params.code as string;
  const [stock, setStock] = useState<Stock | null>(null);
  const [forecast, setForecast] = useState<StockForecast | null>(null);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "score" | "target">("date");
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

        const [forecastData, priceData] = await Promise.all([
          stockAPI.forecast(foundStock.id) as Promise<StockForecast>,
          stockAPI.prices(foundStock.id, 60) as Promise<PricePoint[]>,
        ]);
        setForecast(forecastData);
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
            <div className="h-48 bg-surface-secondary rounded-apple-lg" />
            <div className="h-64 bg-surface-secondary rounded-apple-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !stock || !forecast) {
    return <div className="py-32 text-center text-text-tertiary">{error || "종목을 찾을 수 없습니다."}</div>;
  }

  const total = forecast.buy_count + forecast.hold_count + forecast.sell_count;
  const avgTarget = forecast.avg_target_price;
  const lastPrice = prices.length > 0 ? prices[prices.length - 1].close_price : null;
  const upside = lastPrice && avgTarget > 0 ? ((avgTarget - lastPrice) / lastPrice) * 100 : null;

  // Consensus label
  const buyPct = total > 0 ? forecast.buy_count / total : 0;
  const sellPct = total > 0 ? forecast.sell_count / total : 0;
  let consensusLabel = "중립";
  let consensusColor = "text-accent-orange";
  if (buyPct >= 0.7) { consensusLabel = "적극 매수"; consensusColor = "text-accent-green"; }
  else if (buyPct >= 0.5) { consensusLabel = "매수"; consensusColor = "text-accent-green"; }
  else if (sellPct >= 0.5) { consensusLabel = "매도"; consensusColor = "text-accent-red"; }

  // Filter and sort opinions
  let opinions = [...forecast.opinions];
  if (showTopOnly) {
    const threshold = Math.max(...opinions.map((o) => o.ranking_score)) * 0.5;
    opinions = opinions.filter((o) => o.ranking_score >= threshold);
  }
  if (sortBy === "score") opinions.sort((a, b) => b.ranking_score - a.ranking_score);
  else if (sortBy === "target") opinions.sort((a, b) => b.target_price - a.target_price);
  else opinions.sort((a, b) => b.report_date.localeCompare(a.report_date));

  // Forecast chart data
  const chartData = prices.map((p) => ({
    date: p.date.slice(5),
    price: p.close_price,
  }));

  return (
    <div className="py-16">
      <div className="container-wide">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-body text-text-tertiary mb-6">
          <Link href="/stocks" className="hover:text-text-primary transition-colors">종목</Link>
          <span>/</span>
          <span className="text-text-primary">{stock.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-display-sm text-text-primary">{stock.name}</h1>
            <p className="text-body-lg text-text-secondary mt-1">
              {stock.code} · {stock.market} {stock.gics_sector ? `· ${stock.gics_sector}` : ""}
            </p>
          </div>
          {lastPrice && (
            <div className="text-right">
              <div className="text-display text-text-primary">{lastPrice.toLocaleString()}<span className="text-body text-text-tertiary">원</span></div>
              {upside !== null && (
                <div className={`text-body font-medium ${upside >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                  목표가 대비 {upside >= 0 ? "+" : ""}{upside.toFixed(1)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 1: Analyst Consensus */}
        {total > 0 && (
          <div className="bg-white rounded-apple-lg shadow-apple p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title text-text-primary">애널리스트 컨센서스</h2>
              <span className="text-caption text-text-tertiary">최근 리포트 {total}건 기준</span>
            </div>

            <div className="flex items-center gap-8 mb-4">
              {/* Consensus label */}
              <div className="text-center">
                <div className={`text-headline font-semibold ${consensusColor}`}>{consensusLabel}</div>
                <div className="text-caption text-text-tertiary mt-1">컨센서스</div>
              </div>

              {/* Gauge bar */}
              <div className="flex-1">
                <div className="flex h-10 rounded-apple overflow-hidden mb-2">
                  {forecast.buy_count > 0 && (
                    <div className="bg-accent-green flex items-center justify-center text-white text-body font-semibold transition-all" style={{ width: `${(forecast.buy_count / total) * 100}%` }}>
                      {forecast.buy_count}
                    </div>
                  )}
                  {forecast.hold_count > 0 && (
                    <div className="bg-accent-orange flex items-center justify-center text-white text-body font-semibold transition-all" style={{ width: `${(forecast.hold_count / total) * 100}%` }}>
                      {forecast.hold_count}
                    </div>
                  )}
                  {forecast.sell_count > 0 && (
                    <div className="bg-accent-red flex items-center justify-center text-white text-body font-semibold transition-all" style={{ width: `${(forecast.sell_count / total) * 100}%` }}>
                      {forecast.sell_count}
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-caption">
                  <span className="text-accent-green font-medium">매수 {forecast.buy_count}</span>
                  <span className="text-accent-orange font-medium">중립 {forecast.hold_count}</span>
                  <span className="text-accent-red font-medium">매도 {forecast.sell_count}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Price Target Range Bar */}
        {forecast.high_target_price && forecast.low_target_price && lastPrice && (
          <div className="bg-white rounded-apple-lg shadow-apple p-6 mb-6">
            <h2 className="text-title text-text-primary mb-4">목표가 범위</h2>
            <div className="relative h-12 mb-6">
              {/* Range bar */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-surface-secondary rounded-full">
                <div
                  className="absolute h-full bg-accent-blue/30 rounded-full"
                  style={{
                    left: `${((forecast.low_target_price - forecast.low_target_price) / (forecast.high_target_price - forecast.low_target_price)) * 100}%`,
                    right: "0%",
                  }}
                />
              </div>
              {/* Current price marker */}
              {(() => {
                const range = forecast.high_target_price - forecast.low_target_price;
                const pct = range > 0 ? Math.min(100, Math.max(0, ((lastPrice - forecast.low_target_price) / range) * 100)) : 50;
                return (
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pct}%` }}>
                    <div className="w-4 h-4 rounded-full bg-text-primary border-2 border-white shadow-md" />
                    <div className="absolute top-5 -translate-x-1/2 left-1/2 text-caption text-text-primary font-medium whitespace-nowrap">
                      현재가 {lastPrice.toLocaleString()}
                    </div>
                  </div>
                );
              })()}
              {/* Avg marker */}
              {(() => {
                const range = forecast.high_target_price - forecast.low_target_price;
                const pct = range > 0 ? ((avgTarget - forecast.low_target_price) / range) * 100 : 50;
                return (
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pct}%` }}>
                    <div className="w-3 h-3 rounded-full bg-accent-blue border-2 border-white shadow-sm" />
                  </div>
                );
              })()}
            </div>
            <div className="flex justify-between text-caption">
              <div>
                <span className="text-text-tertiary">최저 </span>
                <span className="text-text-primary font-semibold">{forecast.low_target_price.toLocaleString()}원</span>
              </div>
              <div className="text-center">
                <span className="text-accent-blue font-semibold">평균 {Math.round(avgTarget).toLocaleString()}원</span>
                {upside !== null && (
                  <span className={`ml-2 ${upside >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    ({upside >= 0 ? "+" : ""}{upside.toFixed(1)}%)
                  </span>
                )}
              </div>
              <div>
                <span className="text-text-tertiary">최고 </span>
                <span className="text-text-primary font-semibold">{forecast.high_target_price.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Price Forecast Chart */}
        {chartData.length > 1 && (
          <div className="bg-white rounded-apple-lg shadow-apple p-6 mb-6">
            <h2 className="text-title text-text-primary mb-4">주가 추이 + 목표가</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8e8e93" }} tickLine={false} axisLine={{ stroke: "#e5e5ea" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#8e8e93" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} domain={["auto", "auto"]} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()}원`, "종가"]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 13 }}
                  />
                  {/* Target price band */}
                  {forecast.high_target_price && (
                    <ReferenceLine y={forecast.high_target_price} stroke="#34c759" strokeDasharray="4 4" label={{ value: `최고 ${forecast.high_target_price.toLocaleString()}`, position: "right", fontSize: 10, fill: "#34c759" }} />
                  )}
                  {avgTarget > 0 && (
                    <ReferenceLine y={avgTarget} stroke="#007aff" strokeDasharray="4 4" label={{ value: `평균 ${Math.round(avgTarget).toLocaleString()}`, position: "right", fontSize: 10, fill: "#007aff" }} />
                  )}
                  {forecast.low_target_price && (
                    <ReferenceLine y={forecast.low_target_price} stroke="#ff9500" strokeDasharray="4 4" label={{ value: `최저 ${forecast.low_target_price.toLocaleString()}`, position: "right", fontSize: 10, fill: "#ff9500" }} />
                  )}
                  <Line type="monotone" dataKey="price" stroke="#1c1c1e" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#1c1c1e" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Section 4: Best Analyst */}
        {forecast.best_analyst && (
          <div className="bg-white rounded-apple-lg shadow-apple p-6 mb-6">
            <h2 className="text-title text-text-primary mb-4">Best Analyst</h2>
            <Link
              href={`/analysts/${forecast.best_analyst.analyst_id}`}
              className="flex items-center gap-4 p-4 rounded-apple-lg bg-surface-secondary hover:bg-border-secondary transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-accent-blue/10 flex items-center justify-center ring-[3px] ring-accent-blue ring-offset-2 ring-offset-white">
                <span className="text-title font-semibold text-accent-blue">{forecast.best_analyst.analyst_name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="text-body-lg font-semibold text-text-primary">{forecast.best_analyst.analyst_name}</div>
                <div className="text-body text-text-tertiary">{forecast.best_analyst.analyst_firm}</div>
              </div>
              <div className="text-center px-4">
                <Stars count={starRating(forecast.best_analyst.ranking_score)} />
                <div className="text-caption text-text-tertiary mt-1">점수 {forecast.best_analyst.ranking_score.toFixed(1)}</div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 rounded-full text-body font-semibold ${opinionStyle(forecast.best_analyst.opinion)}`}>
                  {forecast.best_analyst.opinion}
                </span>
                <div className="text-body font-semibold text-text-primary mt-1">{forecast.best_analyst.target_price.toLocaleString()}원</div>
              </div>
            </Link>
          </div>
        )}

        {/* Section 5: Analyst Table */}
        {opinions.length > 0 && (
          <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden mb-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-secondary">
              <h2 className="text-title text-text-primary">애널리스트 의견</h2>
              <div className="flex items-center gap-3">
                {/* All / Top toggle */}
                <div className="flex items-center bg-surface-secondary rounded-full p-0.5">
                  <button
                    onClick={() => setShowTopOnly(false)}
                    className={`px-3 py-1 rounded-full text-caption transition-colors ${!showTopOnly ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary"}`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setShowTopOnly(true)}
                    className={`px-3 py-1 rounded-full text-caption transition-colors ${showTopOnly ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary"}`}
                  >
                    Top
                  </button>
                </div>
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "score" | "target")}
                  className="text-caption bg-surface-secondary rounded-apple px-2 py-1 outline-none"
                  aria-label="정렬 기준"
                >
                  <option value="date">최신순</option>
                  <option value="score">점수순</option>
                  <option value="target">목표가순</option>
                </select>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <div className="grid grid-cols-[1fr_120px_80px_100px_80px_80px_80px] gap-3 px-6 py-2 text-caption text-text-tertiary font-medium border-b border-border-secondary">
                <span>애널리스트</span>
                <span>의견</span>
                <span className="text-right">목표가</span>
                <span className="text-center">등급</span>
                <span className="text-right">성공률</span>
                <span className="text-right">수익률</span>
                <span className="text-right">날짜</span>
              </div>
              {opinions.map((o) => (
                <Link
                  key={o.report_id}
                  href={`/reports/${o.report_id}`}
                  className="grid grid-cols-[1fr_120px_80px_100px_80px_80px_80px] gap-3 px-6 py-3 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors group"
                >
                  <div>
                    <span className="text-body font-semibold text-text-primary group-hover:text-accent-blue transition-colors">{o.analyst_name}</span>
                    <span className="text-caption text-text-tertiary block">{o.analyst_firm}</span>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold w-fit ${opinionStyle(o.opinion)}`}>
                    {o.opinion}
                  </span>
                  <span className="text-body font-medium text-text-primary text-right">{o.target_price.toLocaleString()}</span>
                  <div className="flex justify-center"><Stars count={starRating(o.ranking_score)} /></div>
                  <span className="text-body text-text-secondary text-right">{o.accuracy_rate.toFixed(0)}%</span>
                  <span className={`text-body text-right ${o.avg_return >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    {o.avg_return >= 0 ? "+" : ""}{o.avg_return.toFixed(1)}%
                  </span>
                  <span className="text-caption text-text-tertiary text-right">{o.report_date.slice(5)}</span>
                </Link>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {opinions.map((o) => (
                <Link
                  key={o.report_id}
                  href={`/reports/${o.report_id}`}
                  className="block px-6 py-4 border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-body font-semibold text-text-primary">{o.analyst_name}</span>
                      <span className="text-caption text-text-tertiary ml-2">{o.analyst_firm}</span>
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold ${opinionStyle(o.opinion)}`}>
                      {o.opinion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Stars count={starRating(o.ranking_score)} />
                    <span className="text-body font-semibold text-text-primary">{o.target_price.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-caption text-text-tertiary">
                    <span>성공률 {o.accuracy_rate.toFixed(0)}%</span>
                    <span className={o.avg_return >= 0 ? "text-accent-green" : "text-accent-red"}>
                      수익률 {o.avg_return >= 0 ? "+" : ""}{o.avg_return.toFixed(1)}%
                    </span>
                    <span>{o.report_date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
