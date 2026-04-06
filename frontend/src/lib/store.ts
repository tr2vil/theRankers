import { create } from "zustand";
import type { User, TokenResponse } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (tokens: TokenResponse, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
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
}));
