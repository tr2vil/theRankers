import { cn } from "@/lib/utils";

interface OpinionBadgeProps {
  opinion: "매수" | "중립" | "매도";
}

const styles = {
  "매수": "bg-accent-green/10 text-accent-green",
  "중립": "bg-accent-orange/10 text-accent-orange",
  "매도": "bg-accent-red/10 text-accent-red",
};

export default function OpinionBadge({ opinion }: OpinionBadgeProps) {
  return (
    <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold", styles[opinion])}>
      {opinion}
    </span>
  );
}
