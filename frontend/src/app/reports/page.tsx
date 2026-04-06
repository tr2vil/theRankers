"use client";

import { useState } from "react";

const demoReports = [
  { id: 1, analyst: "김서연", firm: "미래에셋", stock: "삼성전자", code: "005930", opinion: "매수" as const, targetPrice: 95000, prevTarget: 90000, date: "2026-04-05" },
  { id: 2, analyst: "박준혁", firm: "삼성증권", stock: "셀트리온", code: "068270", opinion: "매수" as const, targetPrice: 280000, prevTarget: 260000, date: "2026-04-05" },
  { id: 3, analyst: "이수진", firm: "KB증권", stock: "카카오뱅크", code: "323410", opinion: "중립" as const, targetPrice: 32000, prevTarget: 35000, date: "2026-04-04" },
  { id: 4, analyst: "정민우", firm: "한투증권", stock: "네이버", code: "035420", opinion: "매수" as const, targetPrice: 320000, prevTarget: 300000, date: "2026-04-04" },
  { id: 5, analyst: "최하영", firm: "대신증권", stock: "현대차", code: "005380", opinion: "매수" as const, targetPrice: 290000, prevTarget: 270000, date: "2026-04-03" },
  { id: 6, analyst: "한지민", firm: "NH투자", stock: "LG화학", code: "051910", opinion: "매도" as const, targetPrice: 350000, prevTarget: 400000, date: "2026-04-03" },
  { id: 7, analyst: "오태현", firm: "메리츠", stock: "현대중공업", code: "329180", opinion: "매수" as const, targetPrice: 180000, prevTarget: 160000, date: "2026-04-02" },
  { id: 8, analyst: "윤서아", firm: "키움증권", stock: "카카오", code: "035720", opinion: "매수" as const, targetPrice: 85000, prevTarget: 80000, date: "2026-04-02" },
];

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

export default function ReportsPage() {
  const [opinion, setOpinion] = useState("전체");
  const [search, setSearch] = useState("");

  const filtered = demoReports.filter((r) => {
    if (opinion !== "전체" && r.opinion !== opinion) return false;
    if (search && !r.stock.includes(search) && !r.analyst.includes(search) && !r.code.includes(search)) return false;
    return true;
  });

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-apple bg-surface-secondary px-4 py-2.5 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30 w-full md:w-80"
          />
          <div className="flex items-center gap-2">
            {["전체", "매수", "중립", "매도"].map((op) => (
              <button
                key={op}
                onClick={() => setOpinion(op)}
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

        <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_80px_140px_100px] gap-4 px-6 py-3 border-b border-border-secondary text-caption text-text-tertiary font-medium">
            <span>종목</span>
            <span>애널리스트</span>
            <span>의견</span>
            <span className="text-right">목표가</span>
            <span className="text-right">날짜</span>
          </div>
          {filtered.map((report) => {
            const change = report.targetPrice - (report.prevTarget || report.targetPrice);
            return (
              <div
                key={report.id}
                className="grid grid-cols-[1fr_140px_80px_140px_100px] gap-4 px-6 py-4 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors"
              >
                <div>
                  <span className="text-body font-semibold text-text-primary">{report.stock}</span>
                  <span className="text-caption text-text-tertiary ml-2">{report.code}</span>
                </div>
                <div>
                  <span className="text-body text-text-primary">{report.analyst}</span>
                  <span className="text-caption text-text-tertiary block">{report.firm}</span>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold w-fit ${opinionStyle(report.opinion)}`}>
                  {report.opinion}
                </span>
                <div className="text-right">
                  <span className="text-body font-medium text-text-primary">{report.targetPrice.toLocaleString()}원</span>
                  {change !== 0 && (
                    <span className={`text-caption block ${change > 0 ? "text-accent-green" : "text-accent-red"}`}>
                      {change > 0 ? "+" : ""}{change.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-body text-text-tertiary text-right">{report.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
