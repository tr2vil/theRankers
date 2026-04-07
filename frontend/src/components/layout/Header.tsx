"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { searchAPI } from "@/lib/api";

interface SearchResult {
  type: string;
  id: number;
  name: string;
  sub: string;
}

const navItems = [
  { href: "/rankings", label: "랭킹" },
  { href: "/analysts", label: "애널리스트" },
  { href: "/stocks", label: "종목" },
  { href: "/reports", label: "리포트" },
  { href: "/boards/general", label: "커뮤니티" },
];

export default function Header() {
  const router = useRouter();
  const { user, logout, hydrate } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Close search on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  function handleSearch(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchAPI.search(val) as { results: SearchResult[] };
        setResults(data.results);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function handleResultClick(result: SearchResult) {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    if (result.type === "stock") {
      router.push(`/stocks/${result.sub}`);
    } else {
      router.push(`/analysts/${result.id}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-border-secondary">
      <nav className="container-wide flex h-12 items-center justify-between gap-4">
        <Link href="/" className="text-title tracking-tight text-text-primary shrink-0">
          theRankers
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-body text-text-secondary hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Search + Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="검색"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-apple-lg shadow-apple-md border border-border-secondary overflow-hidden">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="종목명, 애널리스트 검색"
                  aria-label="통합 검색"
                  className="w-full px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none border-b border-border-secondary"
                  autoFocus
                />
                {(results.length > 0 || searching) && (
                  <div className="max-h-64 overflow-y-auto">
                    {searching && (
                      <div className="px-4 py-3 text-caption text-text-tertiary">검색 중...</div>
                    )}
                    {results.map((r, i) => (
                      <button
                        key={`${r.type}-${r.id}-${i}`}
                        onClick={() => handleResultClick(r)}
                        className="w-full text-left px-4 py-3 hover:bg-surface-secondary transition-colors flex items-center gap-3"
                      >
                        <span className={`text-caption px-1.5 py-0.5 rounded ${
                          r.type === "stock" ? "bg-accent-blue/10 text-accent-blue" : "bg-accent-green/10 text-accent-green"
                        }`}>
                          {r.type === "stock" ? "종목" : "애널리스트"}
                        </span>
                        <span className="text-body text-text-primary">{r.name}</span>
                        <span className="text-caption text-text-tertiary">{r.sub}</span>
                      </button>
                    ))}
                    {!searching && query && results.length === 0 && (
                      <div className="px-4 py-3 text-caption text-text-tertiary">검색 결과가 없습니다.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-body text-text-secondary">{user.display_name || user.username}</span>
              <button
                onClick={logout}
                className="text-body text-text-tertiary hover:text-text-primary transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full bg-text-primary px-4 py-1.5 text-body text-white hover:bg-text-secondary transition-colors"
            >
              로그인
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={mobileOpen}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {mobileOpen ? (
              <path d="M4 4L14 14M4 14L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M2 4.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 9H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 13.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border-secondary">
          <div className="container-wide py-4 flex flex-col gap-4">
            {/* Mobile search */}
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="종목명, 애널리스트 검색"
              aria-label="통합 검색"
              className="rounded-apple bg-surface-secondary px-4 py-2.5 text-body text-text-primary placeholder:text-text-tertiary outline-none"
            />
            {(results.length > 0 || (searching && query)) && (
              <div className="bg-white rounded-apple shadow-apple overflow-hidden">
                {searching && <div className="px-4 py-3 text-caption text-text-tertiary">검색 중...</div>}
                {results.map((r, i) => (
                  <button
                    key={`m-${r.type}-${r.id}-${i}`}
                    onClick={() => { handleResultClick(r); setMobileOpen(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-secondary transition-colors flex items-center gap-3 border-b border-border-secondary last:border-0"
                  >
                    <span className={`text-caption px-1.5 py-0.5 rounded ${
                      r.type === "stock" ? "bg-accent-blue/10 text-accent-blue" : "bg-accent-green/10 text-accent-green"
                    }`}>
                      {r.type === "stock" ? "종목" : "애널리스트"}
                    </span>
                    <span className="text-body text-text-primary">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-body-lg text-text-secondary hover:text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/auth/login"
                className="text-body-lg text-accent-blue"
                onClick={() => setMobileOpen(false)}
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
