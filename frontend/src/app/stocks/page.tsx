"use client";

import { useState } from "react";
import Link from "next/link";

const sectors = ["전체", "에너지", "소재", "산업재", "경기소비재", "필수소비재", "헬스케어", "금융", "IT", "커뮤니케이션", "유틸리티", "부동산"];

const demoStocks = [
  { id: 1, code: "005930", name: "삼성전자", market: "KOSPI", sector: "IT", buyCount: 18, holdCount: 3, sellCount: 0, avgTarget: 95000 },
  { id: 2, code: "000660", name: "SK하이닉스", market: "KOSPI", sector: "IT", buyCount: 15, holdCount: 2, sellCount: 0, avgTarget: 250000 },
  { id: 3, code: "035420", name: "네이버", market: "KOSPI", sector: "커뮤니케이션", buyCount: 12, holdCount: 5, sellCount: 1, avgTarget: 310000 },
  { id: 4, code: "005380", name: "현대자동차", market: "KOSPI", sector: "경기소비재", buyCount: 14, holdCount: 3, sellCount: 0, avgTarget: 290000 },
  { id: 5, code: "068270", name: "셀트리온", market: "KOSPI", sector: "헬스케어", buyCount: 10, holdCount: 4, sellCount: 1, avgTarget: 280000 },
  { id: 6, code: "373220", name: "LG에너지솔루션", market: "KOSPI", sector: "IT", buyCount: 13, holdCount: 3, sellCount: 0, avgTarget: 480000 },
];

export default function StocksPage() {
  const [sector, setSector] = useState("전체");
  const [search, setSearch] = useState("");

  const filtered = demoStocks.filter((s) => {
    if (sector !== "전체" && s.sector !== sector) return false;
    if (search && !s.name.includes(search) && !s.code.includes(search)) return false;
    return true;
  });

  return (
    <div className="py-16">
      <div className="container-wide">
        <div className="mb-12">
          <h1 className="text-display-sm text-text-primary mb-3">종목</h1>
          <p className="text-body-lg text-text-secondary">종목별 애널리스트 컨센서스를 확인하세요.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="종목명 또는 종목코드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-apple bg-surface-secondary px-4 py-2.5 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30 w-full md:w-72"
          />
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sectors.slice(0, 8).map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`shrink-0 px-4 py-2 rounded-full text-body transition-colors ${
                  sector === s
                    ? "bg-text-primary text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-border-secondary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_200px_120px] gap-4 px-6 py-3 border-b border-border-secondary text-caption text-text-tertiary font-medium">
            <span>종목</span>
            <span>시장</span>
            <span>컨센서스</span>
            <span className="text-right">평균 목표가</span>
          </div>
          {filtered.map((stock) => {
            const total = stock.buyCount + stock.holdCount + stock.sellCount;
            return (
              <Link
                key={stock.id}
                href={`/stocks/${stock.code}`}
                className="grid grid-cols-[1fr_100px_200px_120px] gap-4 px-6 py-4 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors group"
              >
                <div>
                  <span className="text-body font-semibold text-text-primary group-hover:text-accent-blue transition-colors">{stock.name}</span>
                  <span className="text-caption text-text-tertiary ml-2">{stock.code}</span>
                </div>
                <span className="text-body text-text-secondary">{stock.market}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex h-5 rounded overflow-hidden">
                    <div className="bg-accent-green/70" style={{ width: `${(stock.buyCount / total) * 100}%` }} />
                    <div className="bg-accent-orange/70" style={{ width: `${(stock.holdCount / total) * 100}%` }} />
                    <div className="bg-accent-red/70" style={{ width: `${(stock.sellCount / total) * 100}%` }} />
                  </div>
                  <span className="text-caption text-text-tertiary shrink-0">{total}건</span>
                </div>
                <span className="text-body font-medium text-text-primary text-right">
                  {stock.avgTarget.toLocaleString()}원
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
