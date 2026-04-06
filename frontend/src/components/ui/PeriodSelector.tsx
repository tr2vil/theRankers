"use client";

import { cn } from "@/lib/utils";

interface PeriodSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

const periods = [
  { value: "1m", label: "1개월" },
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: "12m", label: "12개월" },
];

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex rounded-full bg-surface-secondary p-0.5">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-body font-medium transition-all",
            value === p.value
              ? "bg-white text-text-primary shadow-apple"
              : "text-text-tertiary hover:text-text-secondary",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
