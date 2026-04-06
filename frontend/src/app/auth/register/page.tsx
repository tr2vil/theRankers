"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "회원가입에 실패했습니다.");
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
          <h1 className="text-display-sm text-text-primary mb-2">회원가입</h1>
          <p className="text-body text-text-tertiary">theRankers에 가입하고 커뮤니티에 참여하세요.</p>
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
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="w-full rounded-apple bg-surface-secondary px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-body font-medium text-text-primary mb-1.5">사용자 이름</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              required
              className="w-full rounded-apple bg-surface-secondary px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30"
              placeholder="닉네임"
            />
          </div>

          <div>
            <label className="block text-body font-medium text-text-primary mb-1.5">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              className="w-full rounded-apple bg-surface-secondary px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30"
              placeholder="8자 이상"
            />
          </div>

          <div>
            <label className="block text-body font-medium text-text-primary mb-1.5">비밀번호 확인</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              required
              className="w-full rounded-apple bg-surface-secondary px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-blue/30"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-apple bg-text-primary text-white py-3 text-body font-medium hover:bg-text-secondary transition-colors"
          >
            가입하기
          </button>
        </form>

        <p className="text-center text-body text-text-tertiary mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-accent-blue hover:text-accent-blue-hover">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
