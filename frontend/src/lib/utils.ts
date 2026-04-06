import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);
}

export function getTrustColor(score: number): string {
  if (score >= 80) return "trust-top";
  if (score >= 60) return "trust-high";
  if (score >= 40) return "trust-mid";
  if (score > 0) return "trust-low";
  return "trust-none";
}

export function getTrustLabel(score: number): string {
  if (score >= 80) return "최상위";
  if (score >= 60) return "우수";
  if (score >= 40) return "보통";
  if (score > 0) return "주의";
  return "미평가";
}
