"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { reportAPI } from "@/lib/api";
import type { ReportDetail, Report, PaginatedResponse } from "@/types";

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

function opinionBorder(opinion: string) {
  if (opinion === "매수") return "border-accent-green";
  if (opinion === "매도") return "border-accent-red";
  return "border-accent-orange";
}

function formatReturn(priceAtReport: number, currentPrice: number): { value: string; positive: boolean } {
  const ret = ((currentPrice - priceAtReport) / priceAtReport) * 100;
  return {
    value: `${ret >= 0 ? "+" : ""}${ret.toFixed(1)}%`,
    positive: ret >= 0,
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [relatedReports, setRelatedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || isNaN(id)) {
      setError("잘못된 리포트 ID입니다.");
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const data = await reportAPI.get(id) as ReportDetail;
        setReport(data);

        // 같은 종목의 다른 리포트
        const related = await reportAPI.list({
          stock_id: String(data.stock_id),
          page: "1",
          size: "10",
        }) as PaginatedResponse<Report>;
        setRelatedReports(related.items.filter((r) => r.id !== id));
      } catch {
        setError("리포트를 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container-wide">
          <div className="animate-pulse space-y-6">
            <div className="w-48 h-4 bg-surface-secondary rounded" />
            <div className="w-96 h-8 bg-surface-secondary rounded" />
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-secondary rounded-apple-lg" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-32 text-center">
        <div className="text-text-tertiary mb-4">{error || "리포트를 찾을 수 없습니다."}</div>
        <Link href="/reports" className="text-accent-blue hover:text-accent-blue-hover transition-colors">
          리포트 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const targetChange = report.previous_target_price
    ? report.target_price - report.previous_target_price
    : null;

  const upside = report.price_at_report
    ? ((report.target_price - report.price_at_report) / report.price_at_report) * 100
    : null;

  // 추적 가격 데이터
  const trackedPrices = [
    { label: "발행일", price: report.price_at_report, period: null },
    { label: "1개월 후", price: report.price_1m, period: "1m" },
    { label: "3개월 후", price: report.price_3m, period: "3m" },
    { label: "6개월 후", price: report.price_6m, period: "6m" },
    { label: "12개월 후", price: report.price_12m, period: "12m" },
  ].filter((p) => p.price !== null && p.price !== undefined);

  return (
    <div className="py-16">
      <div className="container-wide max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-body text-text-tertiary mb-8">
          <Link href="/reports" className="hover:text-text-primary transition-colors">리포트</Link>
          <span>/</span>
          <span className="text-text-primary truncate max-w-xs">{report.title || `${report.stock_name} ${report.opinion}`}</span>
        </div>

        {/* Header */}
        <div className={`border-l-4 ${opinionBorder(report.opinion)} pl-6 mb-10`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-body font-semibold ${opinionStyle(report.opinion)}`}>
              {report.opinion}
            </span>
            <span className="text-body text-text-tertiary">{report.report_date}</span>
          </div>
          <h1 className="text-headline md:text-display-sm text-text-primary mb-3">
            {report.title || `${report.stock_name} ${report.opinion} 리포트`}
          </h1>
          <div className="flex items-center gap-4 text-body text-text-secondary">
            <Link href={`/analysts/${report.analyst_id}`} className="hover:text-accent-blue transition-colors">
              {report.analyst_name}
            </Link>
            <span className="text-text-tertiary">·</span>
            <span>{report.analyst_firm}</span>
            <span className="text-text-tertiary">·</span>
            <Link href={`/stocks/${report.stock_code}`} className="hover:text-accent-blue transition-colors">
              {report.stock_name} ({report.stock_code})
            </Link>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-apple-lg p-5 shadow-apple">
            <div className="text-caption text-text-tertiary mb-1">목표가</div>
            <div className="text-headline text-text-primary">{report.target_price.toLocaleString()}원</div>
            {targetChange !== null && targetChange !== 0 && (
              <div className={`text-caption mt-1 ${targetChange > 0 ? "text-accent-green" : "text-accent-red"}`}>
                이전 대비 {targetChange > 0 ? "+" : ""}{targetChange.toLocaleString()}원
              </div>
            )}
          </div>

          <div className="bg-white rounded-apple-lg p-5 shadow-apple">
            <div className="text-caption text-text-tertiary mb-1">발행일 주가</div>
            <div className="text-headline text-text-primary">
              {report.price_at_report ? `${report.price_at_report.toLocaleString()}원` : "-"}
            </div>
            {upside !== null && (
              <div className={`text-caption mt-1 ${upside >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                상승 여력 {upside >= 0 ? "+" : ""}{upside.toFixed(1)}%
              </div>
            )}
          </div>

          <div className="bg-white rounded-apple-lg p-5 shadow-apple">
            <div className="text-caption text-text-tertiary mb-1">목표가 달성</div>
            <div className="text-headline">
              {report.target_achieved === true ? (
                <span className="text-accent-green">달성</span>
              ) : report.target_achieved === false ? (
                <span className="text-accent-red">미달성</span>
              ) : (
                <span className="text-text-tertiary">추적 중</span>
              )}
            </div>
            {report.achieved_date && (
              <div className="text-caption text-text-tertiary mt-1">{report.achieved_date}</div>
            )}
          </div>

          <div className="bg-white rounded-apple-lg p-5 shadow-apple">
            <div className="text-caption text-text-tertiary mb-1">투자의견</div>
            <div className="text-headline text-text-primary">{report.opinion}</div>
            <div className="text-caption text-text-tertiary mt-1">{report.analyst_firm}</div>
          </div>
        </div>

        {/* Price tracking */}
        {trackedPrices.length > 1 && report.price_at_report && report.price_at_report > 0 && (
          <div className="mb-10">
            <h2 className="text-title text-text-primary mb-4">주가 추적</h2>
            <div className="bg-white rounded-apple-lg shadow-apple p-6">
              {/* Simple bar chart */}
              <div className="flex items-end gap-2 md:gap-3 h-40 mb-4" role="img" aria-label={`주가 추적 차트: 발행일 ${report.price_at_report.toLocaleString()}원, 목표가 ${report.target_price.toLocaleString()}원`}>
                {trackedPrices.map((p) => {
                  const maxPrice = Math.max(...trackedPrices.map((t) => t.price!), report.target_price) || 1;
                  const heightPct = (p.price! / maxPrice) * 100;
                  const isBase = p.period === null;
                  return (
                    <div key={p.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-caption text-text-tertiary">
                        {p.price!.toLocaleString()}
                      </span>
                      <div
                        className={`w-full rounded-t transition-all ${
                          isBase
                            ? "bg-text-tertiary/30"
                            : p.price! >= report.price_at_report!
                              ? "bg-accent-green/60"
                              : "bg-accent-red/60"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-caption text-text-tertiary text-center">{p.label}</span>
                    </div>
                  );
                })}
                {/* Target price line reference */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-caption text-accent-blue font-medium">
                    {report.target_price.toLocaleString()}
                  </span>
                  <div
                    className="w-full rounded-t bg-accent-blue/30 border-t-2 border-dashed border-accent-blue"
                    style={{ height: `${(report.target_price / Math.max(...trackedPrices.map((t) => t.price!), report.target_price)) * 100}%` }}
                  />
                  <span className="text-caption text-accent-blue text-center">목표가</span>
                </div>
              </div>

              {/* Return table */}
              {report.price_at_report && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border-secondary">
                  {trackedPrices.filter((p) => p.period !== null).map((p) => {
                    const ret = formatReturn(report.price_at_report!, p.price!);
                    return (
                      <div key={p.label} className="text-center">
                        <div className="text-caption text-text-tertiary">{p.label} 수익률</div>
                        <div className={`text-title font-semibold ${ret.positive ? "text-accent-green" : "text-accent-red"}`}>
                          {ret.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related reports - same stock */}
        {relatedReports.length > 0 && (
          <div>
            <h2 className="text-title text-text-primary mb-4">
              {report.stock_name} 관련 리포트
            </h2>
            <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
              {relatedReports.map((r) => (
                <Link
                  key={r.id}
                  href={`/reports/${r.id}`}
                  className="flex items-center gap-4 px-6 py-4 border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-body font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">
                      {r.title || `${r.stock_name} ${r.opinion}`}
                    </div>
                    <div className="text-caption text-text-tertiary mt-0.5">
                      {r.analyst_name} · {r.analyst_firm} · {r.report_date}
                    </div>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold shrink-0 ${opinionStyle(r.opinion)}`}>
                    {r.opinion}
                  </span>
                  <div className="text-right shrink-0 w-24">
                    <div className="text-body font-medium text-text-primary">{r.target_price.toLocaleString()}원</div>
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
