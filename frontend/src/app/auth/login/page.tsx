"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "로그인에 실패했습니다.");
        return;
      }
      const tokens = await res.json();
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      router.push("/");
    } catch {
      setError("서버에 연결할 수 없습니다.");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-display-sm text-text-primary mb-2">로그인</h1>
          <p className="text-body text-text-tertiary">theRankers 계정으로 로그인하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-apple bg-accent-red/10 px-4 py-3 text-body text-accent-red">
              {error}
            </div>
          )}

          <div>
            <label className="block text-body font-medium text-text-primary mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-apple bg-surface-secondary px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-body font-medium text-text-primary mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-apple bg-surface-secondary px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-apple bg-text-primary text-white py-3 text-body font-medium hover:bg-text-secondary transition-colors"
          >
            로그인
          </button>
        </form>

        <p className="text-center text-body text-text-tertiary mt-6">
          계정이 없으신가요?{" "}
          <Link href="/auth/register" className="text-accent-blue hover:text-accent-blue-hover">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
