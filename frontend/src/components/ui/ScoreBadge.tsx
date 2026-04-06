import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md";
}

export default function ScoreBadge({ score, label, size = "md" }: ScoreBadgeProps) {
  const color =
    score >= 80
      ? "bg-trust-top/10 text-trust-top"
      : score >= 60
        ? "bg-trust-high/10 text-trust-high"
        : score >= 40
          ? "bg-trust-mid/10 text-trust-mid"
          : score > 0
            ? "bg-trust-low/10 text-trust-low"
            : "bg-surface-secondary text-text-tertiary";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-caption" : "px-3 py-1 text-body",
        color,
      )}
    >
      {score.toFixed(1)}
      {label && <span className="font-normal opacity-70">{label}</span>}
    </span>
  );
}
