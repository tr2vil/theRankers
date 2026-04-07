import { create } from "zustand";
import type { User, TokenResponse } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setAuth: (tokens: TokenResponse, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  setAuth: (tokens, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
    }
    set({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    set({ user: null, accessToken: null, refreshToken: null });
  },
  isAuthenticated: () => !!get().accessToken,
  hydrate: async () => {
    if (typeof window === "undefined" || get().hydrated) return;
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    if (!token) {
      set({ hydrated: true });
      return;
    }
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        set({ user, accessToken: token, refreshToken: refresh, hydrated: true });
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
