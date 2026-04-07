"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { stockAPI } from "@/lib/api";
import type { Stock, PaginatedResponse } from "@/types";

const sectors = ["전체", "에너지", "소재", "산업재", "경기소비재", "필수소비재", "헬스케어", "금융", "IT", "커뮤니케이션", "유틸리티", "부동산"];

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("전체");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string> = { page: "1", size: "100" };
        if (sector !== "전체") params.sector = sector;
        if (search) params.search = search;
        const data = await stockAPI.list(params) as PaginatedResponse<Stock>;
        setStocks(data.items);
      } catch {
        setStocks([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sector, search]);

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
            aria-label="종목 검색"
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

        {loading ? (
          <div className="text-center py-16 text-text-tertiary">로딩 중...</div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-16 text-text-tertiary">해당하는 종목이 없습니다.</div>
        ) : (
          <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_120px] gap-4 px-6 py-3 border-b border-border-secondary text-caption text-text-tertiary font-medium">
              <span>종목</span>
              <span>시장</span>
              <span>섹터</span>
            </div>
            {stocks.map((stock) => (
              <Link
                key={stock.id}
                href={`/stocks/${stock.code}`}
                className="grid grid-cols-[1fr_100px_120px] gap-4 px-6 py-4 items-center border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors group"
              >
                <div>
                  <span className="text-body font-semibold text-text-primary group-hover:text-accent-blue transition-colors">{stock.name}</span>
                  <span className="text-caption text-text-tertiary ml-2">{stock.code}</span>
                </div>
                <span className="text-body text-text-secondary">{stock.market}</span>
                <span className="text-body text-text-secondary">{stock.gics_sector || "-"}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
