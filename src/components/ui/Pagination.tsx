import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { cn } from "../../utils/cn.util";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const arrowClasses =
  "flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border border-[#DCD6CB] bg-white text-[#2A2822] transition-colors hover:border-[#B8B1A4] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#DCD6CB]";

const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-4"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(arrowClasses)}
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={18}
          color="currentColor"
          strokeWidth={1.8}
        />
      </button>

      <p className="font-label text-[12px] tracking-[0.14em] text-[#6B665C] uppercase">
        Page {page} of {totalPages}
      </p>

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(arrowClasses)}
      >
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={18}
          color="currentColor"
          strokeWidth={1.8}
        />
      </button>
    </nav>
  );
};

export default Pagination;
