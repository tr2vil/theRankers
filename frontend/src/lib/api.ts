const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const authAPI = {
  register: (data: { email: string; username: string; password: string; display_name?: string }) =>
    fetchAPI("/api/v1/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    fetchAPI("/api/v1/auth/login", { method: "POST", body: JSON.stringify(data) }),
  refresh: (refresh_token: string) =>
    fetchAPI("/api/v1/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token }) }),
  me: (token: string) =>
    fetchAPI("/api/v1/auth/me", { token }),
};

// Analysts
export const analystAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/api/v1/analysts${qs}`);
  },
  get: (id: number) => fetchAPI(`/api/v1/analysts/${id}`),
};

// Reports
export const reportAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/api/v1/reports${qs}`);
  },
  get: (id: number) => fetchAPI(`/api/v1/reports/${id}`),
};

// Stocks
export const stockAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/api/v1/stocks${qs}`);
  },
  get: (id: number) => fetchAPI(`/api/v1/stocks/${id}`),
  consensus: (id: number) => fetchAPI(`/api/v1/stocks/${id}/consensus`),
  forecast: (id: number) => fetchAPI(`/api/v1/stocks/${id}/forecast`),
  prices: (id: number, days: number = 30) => fetchAPI(`/api/v1/stocks/${id}/prices?days=${days}`),
};

// Rankings
export const rankingAPI = {
  get: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/api/v1/rankings${qs}`);
  },
};

// Search
export const searchAPI = {
  search: (q: string) => fetchAPI(`/api/v1/search?q=${encodeURIComponent(q)}`),
};

// Boards
export const boardAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/api/v1/boards${qs}`);
  },
  posts: (slug: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/api/v1/boards/${slug}/posts${qs}`);
  },
  getPost: (slug: string, postId: number) =>
    fetchAPI(`/api/v1/boards/${slug}/posts/${postId}`),
  createPost: (slug: string, data: { title: string; content: string }, token: string) =>
    fetchAPI(`/api/v1/boards/${slug}/posts`, { method: "POST", body: JSON.stringify(data), token }),
  comments: (slug: string, postId: number) =>
    fetchAPI(`/api/v1/boards/${slug}/posts/${postId}/comments`),
  createComment: (slug: string, postId: number, data: { content: string; parent_id?: number }, token: string) =>
    fetchAPI(`/api/v1/boards/${slug}/posts/${postId}/comments`, { method: "POST", body: JSON.stringify(data), token }),
};
