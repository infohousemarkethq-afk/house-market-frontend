import Callout from "../components/ui/Callout";
import { Skeleton } from "../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../utils/apiError.util";
import ActivityFeed from "../features/dashboard/components/ActivityFeed";
import OccupancyChart from "../features/dashboard/components/OccupancyChart";
import StatTiles from "../features/dashboard/components/StatTiles";
import TodayPanel from "../features/dashboard/components/TodayPanel";
import { useDashboard } from "../features/dashboard/hooks/useDashboard";
import { scopeLine } from "../features/dashboard/dashboard.utils";

/** Mirrors the real layout, so nothing jumps when the data lands. */
const DashboardSkeleton = () => (
  <div className="space-y-7">
    <div className="space-y-2">
      <Skeleton className="h-[38px] w-[220px]" />
      <Skeleton className="h-[16px] w-[340px]" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-[140px] rounded-[16px]" />
      ))}
    </div>

    <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
      <Skeleton className="h-[340px] rounded-[16px]" />
      <div className="space-y-5">
        <Skeleton className="h-[180px] rounded-[16px]" />
        <Skeleton className="h-[200px] rounded-[16px]" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isPending, isError, error } = useDashboard();

  if (isPending) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <Callout tone="warning" title="We couldn't load your dashboard">
          {getApiErrorMessage(error)}
        </Callout>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8">
        <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
          Dashboard
        </h1>
        <p className="mt-1 text-[15px] text-[#6B665C]">
          {scopeLine(data.scope)}
        </p>
      </div>

      <StatTiles cards={data.cards} />

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
        <OccupancyChart
          units={data.occupancyByUnit}
          month={data.month}
          bookedNights={data.cards.occupancy.bookedNights}
          availableNights={data.cards.occupancy.availableNights}
        />

        {/* min-w-0: a grid child defaults to min-width:auto, so without this
            a long guest name or unit label widens the column past the screen
            instead of wrapping inside it. */}
        <div className="min-w-0 space-y-5">
          <TodayPanel items={data.today} />
          <ActivityFeed items={data.activity} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
