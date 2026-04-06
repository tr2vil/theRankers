"use client";

import { cn } from "@/lib/utils";

interface AnalystAvatarProps {
  name: string;
  imageUrl?: string | null;
  score: number;
  size?: "sm" | "md" | "lg";
}

function getTrustRing(score: number): string {
  if (score >= 80) return "ring-trust-top";
  if (score >= 60) return "ring-trust-high";
  if (score >= 40) return "ring-trust-mid";
  if (score > 0) return "ring-trust-low";
  return "ring-trust-none";
}

const sizeMap = {
  sm: "w-8 h-8 text-caption ring-2",
  md: "w-11 h-11 text-body ring-[3px]",
  lg: "w-16 h-16 text-body-lg ring-[3px]",
};

export default function AnalystAvatar({ name, imageUrl, score, size = "md" }: AnalystAvatarProps) {
  const initials = name.slice(0, 1);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center overflow-hidden shrink-0",
        "ring-offset-2 ring-offset-white",
        sizeMap[size],
        getTrustRing(score),
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-surface-secondary flex items-center justify-center font-semibold text-text-secondary">
          {initials}
        </div>
      )}
    </div>
  );
}
