import { cn } from "../../utils/cn.util";

/** A single shimmering block. Compose these into screen-shaped placeholders. */
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-[8px] bg-[#E4E0D6]", className)} />
);

/**
 * Matches the property and unit card shape, so the grid doesn't reflow when
 * the data lands. A skeleton beats a spinner wherever the shape is known.
 */
const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div
    role="status"
    aria-live="polite"
    className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
  >
    <span className="sr-only">Loading</span>

    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-[16px] border border-[#E7E3DA] bg-white"
        aria-hidden="true"
      >
        <Skeleton className="h-[190px] rounded-none" />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-[18px] w-1/2" />
            <Skeleton className="h-[24px] w-[76px] rounded-full" />
          </div>
          <Skeleton className="mt-3 h-[14px] w-3/4" />
          <div className="mt-5 border-t border-[#EDEAE2] pt-4">
            <Skeleton className="h-[14px] w-1/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default CardGridSkeleton;
