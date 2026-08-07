import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="rounded-[16px] border border-dashed border-[#DCD6CB] bg-white/50 px-6 py-16 text-center">
    <p className="font-serif text-[24px] text-[#141412]">{title}</p>
    {description && (
      <p className="mx-auto mt-2 max-w-[380px] text-[15px] text-[#6B665C]">
        {description}
      </p>
    )}
    {action && <div className="mt-6 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
