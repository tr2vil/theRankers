"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import type { TokenResponse, User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tokens = await authAPI.login({ email, password }) as TokenResponse;
      const user = await authAPI.me(tokens.access_token) as User;
      setAuth(tokens, user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
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
            disabled={loading}
            className="w-full rounded-apple bg-text-primary text-white py-3 text-body font-medium hover:bg-text-secondary transition-colors disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
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
