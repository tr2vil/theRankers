"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";

const navItems = [
  { href: "/rankings", label: "랭킹" },
  { href: "/analysts", label: "애널리스트" },
  { href: "/stocks", label: "종목" },
  { href: "/reports", label: "리포트" },
  { href: "/boards/general", label: "커뮤니티" },
];

export default function Header() {
  const { user, logout, hydrate } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border-secondary">
      <nav className="container-wide flex h-12 items-center justify-between">
        <Link href="/" className="text-title tracking-tight text-text-primary">
          theRankers
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
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

        <div className="hidden md:flex items-center gap-4">
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
