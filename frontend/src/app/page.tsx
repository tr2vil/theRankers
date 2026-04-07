"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rankingAPI, reportAPI } from "@/lib/api";
import type { RankingEntry, Report, RankingResponse, PaginatedResponse } from "@/types";

function getTrustRing(score: number) {
  if (score >= 80) return "ring-trust-top";
  if (score >= 60) return "ring-trust-high";
  if (score >= 40) return "ring-trust-mid";
  return "ring-trust-low";
}

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

export default function Home() {
  const [topAnalysts, setTopAnalysts] = useState<RankingEntry[]>([]);
  const [latestReports, setLatestReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({ analysts: 0, firms: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rankingData, reportData] = await Promise.all([
          rankingAPI.get({ period: "12m" }) as Promise<RankingResponse>,
          reportAPI.list({ page: "1", size: "4" }) as Promise<PaginatedResponse<Report>>,
        ]);
        setTopAnalysts(rankingData.items.slice(0, 5));
        setLatestReports(reportData.items);
        const firms = new Set(rankingData.items.map((r) => r.analyst_firm));
        setStats({ analysts: rankingData.items.length, firms: firms.size });
      } catch {
        // silently fail - show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container-tight text-center">
          <h1 className="text-display-sm md:text-display lg:text-display-lg text-text-primary mb-6 animate-fade-in">
            누가 진짜 잘 맞추는지,<br />
            데이터가 말해줍니다.
          </h1>
          <p className="text-body-lg md:text-title text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up font-normal">
            국내 증권사 애널리스트의 목표가와 투자의견을<br className="hidden md:block" />
            실제 주가와 비교하여 정량 평가합니다.
          </p>
          <div className="flex items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/rankings"
              className="rounded-full bg-text-primary px-7 py-3 text-body-lg text-white hover:bg-text-secondary transition-colors"
            >
              랭킹 보기
            </Link>
            <Link
              href="/reports"
              className="rounded-full bg-surface-secondary px-7 py-3 text-body-lg text-text-primary hover:bg-border-secondary transition-colors"
            >
              리포트 검색
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-surface-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: loading ? "-" : String(stats.analysts), label: "평가 애널리스트" },
              { value: loading ? "-" : String(stats.firms), label: "증권사" },
              { value: "11", label: "GICS 섹터" },
              { value: "100%", label: "정량 평가" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-display-sm md:text-display text-text-primary">{stat.value}</div>
                <div className="text-body text-text-tertiary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Analysts */}
      <section className="py-20">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-headline text-text-primary">Top 애널리스트</h2>
              <p className="text-body text-text-tertiary mt-1">최근 12개월 기준 종합 랭킹</p>
            </div>
            <Link href="/rankings" className="text-body text-accent-blue hover:text-accent-blue-hover transition-colors">
              전체 보기 &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3">{[...Array(3)].map((_, i) => (<div key={i} className="flex items-center gap-5 p-4 animate-pulse"><div className="w-8 h-4 bg-surface-secondary rounded" /><div className="w-11 h-11 bg-surface-secondary rounded-full" /><div className="flex-1 space-y-2"><div className="w-24 h-4 bg-surface-secondary rounded" /><div className="w-16 h-3 bg-surface-secondary rounded" /></div><div className="w-12 h-4 bg-surface-secondary rounded" /></div>))}</div>
          ) : topAnalysts.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">랭킹 데이터가 없습니다.</div>
          ) : (
            <div className="grid gap-3">
              {topAnalysts.map((analyst, i) => (
                <Link
                  key={analyst.analyst_id}
                  href={`/analysts/${analyst.analyst_id}`}
                  className="group flex items-center gap-5 p-4 rounded-apple-lg hover:bg-surface-secondary transition-colors"
                >
                  <span className="text-title text-text-tertiary w-8 text-right">{i + 1}</span>
                  <div
                    className={`w-11 h-11 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white ${getTrustRing(analyst.score)}`}
                  >
                    <span className="text-body font-semibold text-text-secondary">
                      {analyst.analyst_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body-lg font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                        {analyst.analyst_name}
                      </span>
                      <span className="text-body text-text-tertiary">{analyst.analyst_firm}</span>
                    </div>
                    <div className="text-caption text-text-tertiary mt-0.5">
                      리포트 {analyst.total_reports}건
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-title text-text-primary">{analyst.score.toFixed(1)}</div>
                    <div className="text-caption text-text-tertiary">점</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Reports */}
      <section className="py-20 bg-surface-secondary">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-headline text-text-primary">최신 리포트</h2>
              <p className="text-body text-text-tertiary mt-1">최근 발행된 애널리스트 리포트</p>
            </div>
            <Link href="/reports" className="text-body text-accent-blue hover:text-accent-blue-hover transition-colors">
              전체 보기 &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3">{[...Array(3)].map((_, i) => (<div key={i} className="flex items-center gap-5 p-4 animate-pulse"><div className="w-8 h-4 bg-surface-secondary rounded" /><div className="w-11 h-11 bg-surface-secondary rounded-full" /><div className="flex-1 space-y-2"><div className="w-24 h-4 bg-surface-secondary rounded" /><div className="w-16 h-3 bg-surface-secondary rounded" /></div><div className="w-12 h-4 bg-surface-secondary rounded" /></div>))}</div>
          ) : latestReports.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">리포트 데이터가 없습니다.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {latestReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-apple-lg p-5 shadow-apple hover:shadow-apple-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-body-lg font-semibold text-text-primary">{report.stock_name}</span>
                      <span className="text-body text-text-tertiary ml-2">{report.report_date}</span>
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold ${opinionStyle(report.opinion)}`}>
                      {report.opinion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-text-secondary">{report.analyst_name} · {report.analyst_firm}</span>
                    <span className="text-body font-semibold text-text-primary">
                      목표가 {report.target_price.toLocaleString()}원
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container-tight text-center">
          <h2 className="text-display-sm text-text-primary mb-4">
            투자 판단의 새로운 기준
          </h2>
          <p className="text-body-lg text-text-secondary mb-8 max-w-lg mx-auto">
            회원가입 후 커뮤니티에서 다른 투자자들과 애널리스트 리포트에 대한 의견을 나눠보세요.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex rounded-full bg-accent-blue px-7 py-3 text-body-lg text-white hover:bg-accent-blue-hover transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
