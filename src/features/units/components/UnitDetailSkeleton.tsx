import { Skeleton } from "../../../components/ui/SkeletonLoader";

const UnitDetailSkeleton = () => (
  <div className="mx-auto max-w-[1180px]">
    <span className="sr-only" role="status" aria-live="polite">
      Loading unit
    </span>

    <Skeleton className="mb-6 h-[20px] w-[80px]" />

    <div className="grid gap-6 lg:grid-cols-[1fr_360px]" aria-hidden="true">
      <div className="space-y-6">
        <div className="rounded-[16px] border border-[#E7E3DA] bg-white p-7">
          <div className="flex items-center gap-3">
            <Skeleton className="h-[34px] w-[220px]" />
            <Skeleton className="h-[26px] w-[80px] rounded-full" />
          </div>
          <Skeleton className="mt-3 h-[16px] w-[200px]" />

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-[72px] rounded-[10px]" />
            ))}
          </div>

          <Skeleton className="mt-6 h-[16px] w-full" />
          <Skeleton className="mt-2 h-[16px] w-2/3" />
        </div>

        <div className="rounded-[16px] border border-[#E7E3DA] bg-white p-7">
          <Skeleton className="h-[22px] w-[110px]" />
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="aspect-[4/3] rounded-[10px]" />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-[250px] rounded-[16px]" />
        <Skeleton className="h-[180px] rounded-[16px]" />
      </div>
    </div>
  </div>
);

export default UnitDetailSkeleton;
