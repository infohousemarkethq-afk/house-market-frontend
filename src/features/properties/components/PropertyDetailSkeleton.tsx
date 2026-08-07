import CardGridSkeleton, {
  Skeleton,
} from "../../../components/ui/SkeletonLoader";

/** Mirrors PropertyDetail's layout so the page doesn't jump when data lands. */
const PropertyDetailSkeleton = () => (
  <div className="mx-auto max-w-[1180px]">
    <span className="sr-only" role="status" aria-live="polite">
      Loading property
    </span>

    <Skeleton className="mb-6 h-[20px] w-[110px]" />

    <div
      className="overflow-hidden rounded-[16px] border border-[#E7E3DA] bg-white md:flex"
      aria-hidden="true"
    >
      <Skeleton className="h-[240px] rounded-none md:h-auto md:w-[300px] md:shrink-0" />

      <div className="flex-1 p-7">
        <div className="flex items-center gap-3">
          <Skeleton className="h-[34px] w-[240px]" />
          <Skeleton className="h-[26px] w-[86px] rounded-full" />
        </div>

        <Skeleton className="mt-4 h-[16px] w-[280px]" />
        <Skeleton className="mt-3 h-[16px] w-[150px]" />

        <div className="mt-6 flex flex-wrap gap-3">
          <Skeleton className="h-[52px] w-[130px] rounded-[10px]" />
          <Skeleton className="h-[52px] w-[150px] rounded-[10px]" />
          <Skeleton className="h-[52px] w-[160px] rounded-[10px]" />
        </div>
      </div>
    </div>

    <Skeleton className="mt-12 mb-6 h-[26px] w-[210px]" />
    <CardGridSkeleton count={3} />
  </div>
);

export default PropertyDetailSkeleton;
