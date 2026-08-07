import type { ReactNode } from "react";

import { cn } from "../../utils/cn.util";

interface CalloutProps {
  tone?: "warning" | "muted";
  title?: string;
  children?: ReactNode;
  className?: string;
}

const TONES = {
  warning: {
    box: "bg-[#FBF3E1] border-[#E7D9B6]",
    title: "text-[#4A3B1C]",
    body: "text-[#6B5A34]",
  },
  muted: {
    box: "bg-[#EEEBE3] border-[#DCD6CB]",
    title: "text-[#2A2822]",
    body: "text-[#6B665C]",
  },
} as const;

const Callout = ({
  tone = "muted",
  title,
  children,
  className,
}: CalloutProps) => {
  const styles = TONES[tone];

  return (
    <div className={cn("rounded-[10px] border p-4", styles.box, className)}>
      {title && (
        <p className={cn("text-[14px] font-semibold", styles.title)}>{title}</p>
      )}
      {children && (
        <div
          className={cn(
            "text-[14px] leading-relaxed",
            styles.body,
            title && "mt-1.5",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Callout;
