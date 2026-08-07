import type { ReactNode } from "react";

import { cn } from "../../utils/cn.util";

interface BadgeProps {
  tone?: "neutral" | "muted" | "warning";
  children: ReactNode;
  className?: string;
}

const TONES = {
  neutral: "bg-[#EDEAE2] text-[#4A463E]",
  muted: "bg-transparent text-[#8A857B] border border-[#DCD6CB]",
  warning: "bg-[#FBF3E1] text-[#6B5A34]",
} as const;

const Badge = ({ tone = "neutral", children, className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap",
      TONES[tone],
      className,
    )}
  >
    {children}
  </span>
);

export default Badge;
