"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { boardAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import type { Post } from "@/types";

interface Board {
  id: number;
  slug: string;
  name: string;
  board_type: string;
  post_count: number;
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { accessToken } = useAuthStore();

  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWrite, setShowWrite] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [writeError, setWriteError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [boardList, postList] = await Promise.all([
          boardAPI.list() as Promise<Board[]>,
          boardAPI.posts(slug) as Promise<{ items: Post[]; total: number } | Post[]>,
        ]);
        setBoards(boardList);
        const items = Array.isArray(postList) ? postList : postList.items;
        setPosts(items);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  async function handleSubmit() {
    if (!title.trim() || !content.trim() || !accessToken) return;
    setSubmitting(true);
    setWriteError("");
    try {
      await boardAPI.createPost(slug, { title, content }, accessToken);
      setTitle("");
      setContent("");
      setShowWrite(false);
      const postList = await boardAPI.posts(slug) as { items: Post[]; total: number } | Post[];
      const items = Array.isArray(postList) ? postList : postList.items;
      setPosts(items);
    } catch {
      setWriteError("게시글 작성에 실패했습니다. 로그인 상태를 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  const boardTabs = boards.length > 0 ? boards : [];

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
            onClick={() => {
              if (!accessToken) {
                router.push("/auth/login");
                return;
              }
              setShowWrite(!showWrite);
            }}
            className="rounded-full bg-text-primary px-5 py-2.5 text-body text-white hover:bg-text-secondary transition-colors"
          >
            글쓰기
          </button>
        </div>

        {/* Board tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {boardTabs.map((board) => (
            <Link
              key={board.slug}
              href={`/boards/${board.slug}`}
              className={`shrink-0 px-4 py-2 rounded-full text-body transition-colors ${
                board.slug === slug
                  ? "bg-text-primary text-white"
                  : "bg-surface-secondary text-text-secondary hover:bg-border-secondary"
              }`}
            >
              {board.name}
            </Link>
          ))}
        </div>

        {/* Write form */}
        {showWrite && (
          <div className="bg-white rounded-apple-lg p-6 shadow-apple mb-6">
            {writeError && (
              <div className="rounded-apple bg-accent-red/10 px-4 py-3 text-body text-accent-red mb-4">
                {writeError}
              </div>
            )}
            <input
              type="text"
              placeholder="제목을 입력하세요"
              aria-label="게시글 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-title text-text-primary placeholder:text-text-tertiary outline-none mb-4"
            />
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
              <button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !content.trim()}
                className="px-5 py-2 rounded-full bg-accent-blue text-white text-body hover:bg-accent-blue-hover transition-colors disabled:opacity-40"
              >
                {submitting ? "게시 중..." : "게시"}
              </button>
            </div>
          </div>
        )}

        {/* Posts list */}
        {loading ? (
          <div className="text-center py-16 text-text-tertiary">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-text-tertiary">게시글이 없습니다. 첫 번째 글을 작성해보세요!</div>
        ) : (
          <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
            {posts.map((post) => (
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
                      <span>{post.author_display_name || post.author_username}</span>
                      <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-caption text-text-tertiary shrink-0">
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {post.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      {post.comment_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      {post.like_count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
