"use client";

import { useEffect, useState, useCallback } from "react";
import { reportAPI } from "@/lib/api";
import type { Report, PaginatedResponse } from "@/types";

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [opinion, setOpinion] = useState("전체");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), size: "20" };
      if (opinion !== "전체") params.opinion = opinion;
      if (search) params.search = search;
      const data = await reportAPI.list(params) as PaginatedResponse<Report>;
      setReports(data.items);
      setTotal(data.total);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page, opinion, search]);

  useEffect(() => { load(); }, [load]);

  function handleOpinionChange(op: string) {
    setOpinion(op);
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="py-16">
      <div className="container-wide">
        <div className="mb-12">
          <h1 className="text-display-sm text-text-primary mb-3">리포트</h1>
          <p className="text-body-lg text-text-secondary">최신 애널리스트 리포트를 검색하세요.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="종목명, 애널리스트, 코드 검색"
            aria-label="리포트 검색"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="rounded-apple bg-surface-secondary px-4 py-2.5 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30 w-full md:w-80"
          />
          <div className="flex items-center gap-2">
            {["전체", "매수", "중립", "매도"].map((op) => (
              <button
                key={op}
                onClick={() => handleOpinionChange(op)}
                className={`px-4 py-2 rounded-full text-body transition-colors ${
                  opinion === op
                    ? "bg-text-primary text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-border-secondary"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-text-tertiary">로딩 중...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-text-tertiary">해당하는 리포트가 없습니다.</div>
        ) : (
          <>
            <div className="bg-white rounded-apple-xl shadow-apple overflow-x-auto">
              <div className="grid grid-cols-[1fr_140px_80px_140px_100px] gap-4 px-6 py-3 border-b border-border-secondary text-caption text-text-tertiary font-medium min-w-[600px]">
                <span>종목</span>
                <span>애널리스트</span>
                <span>의견</span>
                <span className="text-right">목표가</span>
                <span className="text-right">날짜</span>
              </div>
              {reports.map((report) => {
                const change = report.previous_target_price
                  ? report.target_price - report.previous_target_price
                  : 0;
                return (
                  <div
                    key={report.id}
                    className="grid grid-cols-[1fr_140px_80px_140px_100px] gap-4 px-6 py-4 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors min-w-[600px]"
                  >
                    <div>
                      <span className="text-body font-semibold text-text-primary">{report.stock_name}</span>
                      <span className="text-caption text-text-tertiary ml-2">{report.stock_code}</span>
                    </div>
                    <div>
                      <span className="text-body text-text-primary">{report.analyst_name}</span>
                      <span className="text-caption text-text-tertiary block">{report.analyst_firm}</span>
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold w-fit ${opinionStyle(report.opinion)}`}>
                      {report.opinion}
                    </span>
                    <div className="text-right">
                      <span className="text-body font-medium text-text-primary">{report.target_price.toLocaleString()}원</span>
                      {change !== 0 && (
                        <span className={`text-caption block ${change > 0 ? "text-accent-green" : "text-accent-red"}`}>
                          {change > 0 ? "+" : ""}{change.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-body text-text-tertiary text-right">{report.report_date}</span>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-full text-body bg-surface-secondary text-text-secondary hover:bg-border-secondary transition-colors disabled:opacity-40"
                >
                  이전
                </button>
                <span className="text-body text-text-tertiary px-4">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-full text-body bg-surface-secondary text-text-secondary hover:bg-border-secondary transition-colors disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
