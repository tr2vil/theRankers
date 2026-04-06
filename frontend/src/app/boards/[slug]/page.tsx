"use client";

import { useState } from "react";
import Link from "next/link";

const demoPosts = [
  { id: 1, title: "삼성전자 목표가 10만원 가능할까요?", author: "투자고수", comments: 23, views: 456, likes: 12, date: "2026-04-05 14:30" },
  { id: 2, title: "김서연 애널리스트 반도체 전망 리포트 분석", author: "반도체매니아", comments: 15, views: 312, likes: 28, date: "2026-04-05 12:15" },
  { id: 3, title: "메리츠증권 리서치 퀄리티가 좋아진 느낌", author: "가치투자자", comments: 8, views: 189, likes: 5, date: "2026-04-04 18:45" },
  { id: 4, title: "애널리스트 매수 의견만 내는 이유가 뭔가요?", author: "주린이", comments: 31, views: 782, likes: 45, date: "2026-04-04 10:20" },
  { id: 5, title: "theRankers 점수 상위 애널리스트 추천 종목 모음", author: "데이터분석러", comments: 42, views: 1203, likes: 67, date: "2026-04-03 16:00" },
  { id: 6, title: "2분기 실적 시즌 앞두고 주목할 리포트", author: "시장관찰자", comments: 11, views: 298, likes: 18, date: "2026-04-03 09:30" },
];

export default function BoardPage() {
  const [showWrite, setShowWrite] = useState(false);

  return (
    <div className="py-16">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-display-sm text-text-primary mb-3">커뮤니티</h1>
            <p className="text-body-lg text-text-secondary">
              애널리스트 리포트와 투자 전략에 대해 토론하세요.
            </p>
          </div>
          <button
            onClick={() => setShowWrite(!showWrite)}
            className="rounded-full bg-text-primary px-5 py-2.5 text-body text-white hover:bg-text-secondary transition-colors"
          >
            글쓰기
          </button>
        </div>

        {/* Board tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {["자유게시판", "종목토론", "애널리스트 평가", "증권사 리뷰"].map((tab, i) => (
            <button
              key={tab}
              className={`shrink-0 px-4 py-2 rounded-full text-body transition-colors ${
                i === 0
                  ? "bg-text-primary text-white"
                  : "bg-surface-secondary text-text-secondary hover:bg-border-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Write form */}
        {showWrite && (
          <div className="bg-white rounded-apple-lg p-6 shadow-apple mb-6">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              className="w-full text-title text-text-primary placeholder:text-text-tertiary outline-none mb-4"
            />
            <textarea
              placeholder="내용을 입력하세요"
              rows={4}
              className="w-full rounded-apple bg-surface-secondary px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none resize-none focus:ring-2 focus:ring-accent-blue/30 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWrite(false)}
                className="px-5 py-2 rounded-full text-body text-text-secondary hover:text-text-primary transition-colors"
              >
                취소
              </button>
              <button className="px-5 py-2 rounded-full bg-accent-blue text-white text-body hover:bg-accent-blue-hover transition-colors">
                게시
              </button>
            </div>
          </div>
        )}

        {/* Posts list */}
        <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
          {demoPosts.map((post) => (
            <div
              key={post.id}
              className="px-6 py-4 border-b border-border-secondary last:border-0 hover:bg-surface-tertiary transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-body-lg font-medium text-text-primary truncate hover:text-accent-blue transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-caption text-text-tertiary">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-caption text-text-tertiary shrink-0">
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    {post.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    {post.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
