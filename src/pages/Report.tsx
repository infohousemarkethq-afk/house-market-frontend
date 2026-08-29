import { useSearchParams } from "react-router";

import Callout from "../components/ui/Callout";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../utils/apiError.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useReportPerformance } from "../features/reports/hooks/useReport";
import {
  reportsSubtitle,
  formatReportMonth,
  toMonthParam,
  currentMonthDate,
} from "../features/reports/report.utils";
import { formatNaira } from "../utils/formatNaira.util";

// ─── Summary tile ────────────────────────────────────────────────────────────

interface TileProps {
  label: string;
  value: string;
  caption: string;
}

function SummaryTile({ label, value, caption }: TileProps) {
  return (
    <div className="rounded-[16px] border border-[#E7E3DA] bg-[#FBFAF7] p-5">
      <p className="text-[13px] text-[#8A857B]">{label}</p>
      <p className="mt-1 font-serif text-[28px] leading-tight text-[#141412]">
        {value}
      </p>
      <p className="mt-1 text-[13px] text-[#8A857B]">{caption}</p>
    </div>
  );
}

// ─── Month picker ─────────────────────────────────────────────────────────────

interface MonthPickerProps {
  value: string; // "2026-08"
  onChange: (month: string) => void;
}

function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <input
      type="month"
      value={value}
      max={toMonthParam(new Date())}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-[10px] border border-[#E7E3DA] bg-[#FBFAF7] px-3 py-2 text-[14px] text-[#141412] focus:outline-none focus:ring-2 focus:ring-[#141412]"
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Report = () => {
  const { viewRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Month comes from the URL; defaults to the current month.
  const monthParam =
    searchParams.get("month") ?? toMonthParam(currentMonthDate());

  const updateMonth = (month: string) => {
    setSearchParams({ month }, { replace: true });
  };

  /**
   * Managers have no access to reports — the backend enforces this with a 403.
   * Show an explanation rather than making a request we know will fail.
   */
  const allowed = viewRole === "admin" || viewRole === "owner";

  const { data, isPending, isError, error } = useReportPerformance(
    allowed ? monthParam : "",
  );

  if (!allowed) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
          Reports
        </h1>
        <Callout
          tone="warning"
          title="Reports aren't part of your view"
          className="mt-6"
        >
          Occupancy and revenue reports are available to company admins and unit
          owners. Ask a company admin if you need a figure from it.
        </Callout>
      </div>
    );
  }

  const totals = data?.totals;
  const byUnit = data?.byUnit ?? [];

  return (
    <div className="mx-auto max-w-[1180px]">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
            Reports
          </h1>
          <p className="mt-1 text-[15px] text-[#6B665C]">
            {viewRole ? reportsSubtitle(viewRole) : ""}
          </p>
        </div>

        <MonthPicker value={monthParam} onChange={updateMonth} />
      </div>

      {/* Summary tiles */}
      {isPending ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-[96px] rounded-[16px]" />
          <Skeleton className="h-[96px] rounded-[16px]" />
          <Skeleton className="h-[96px] rounded-[16px]" />
        </div>
      ) : isError ? (
        <Callout tone="warning" title="We couldn't load your report" className="mb-8">
          {getApiErrorMessage(error)}
        </Callout>
      ) : totals ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryTile
            label={
              viewRole === "owner"
                ? `Earned in ${formatReportMonth(monthParam)}`
                : `Revenue in ${formatReportMonth(monthParam)}`
            }
            value={formatNaira(totals.earned)}
            caption={
              viewRole === "owner"
                ? "at your rate"
                : `across ${totals.unitCount} unit${totals.unitCount !== 1 ? "s" : ""}`
            }
          />
          <SummaryTile
            label="Nights booked"
            value={String(totals.nightsBooked)}
            caption={`of ${totals.nightsAvailable} available — ${totals.occupancyPercent}% occupancy`}
          />
          <SummaryTile
            label="Units let"
            value={`${totals.unitsLet} of ${totals.unitCount}`}
            caption="had at least one stay"
          />
        </div>
      ) : null}

      {/* Per-unit table */}
      {!isPending && !isError && (
        <>
          {byUnit.length === 0 ? (
            <EmptyState
              title="No data for this month"
              description="There were no bookings in the selected month. Try a different month."
            />
          ) : (
            <div className="overflow-x-auto rounded-[16px] border border-[#E7E3DA]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F3EF]">
                    <th className="px-5 py-3 text-left text-[13px] font-medium text-[#8A857B]">
                      Unit
                    </th>
                    <th className="px-5 py-3 text-left text-[13px] font-medium text-[#8A857B]">
                      Occupancy
                    </th>
                    <th className="px-5 py-3 text-left text-[13px] font-medium text-[#8A857B]">
                      Nights booked / available
                    </th>
                    <th className="px-5 py-3 text-left text-[13px] font-medium text-[#8A857B]">
                      {viewRole === "owner" ? "Earned" : "Revenue"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DA] bg-white px-5">
                  {byUnit.map((row) => (
                    <tr key={row.unitId} className="px-5">
                      <td className="px-5 py-4">
                        <p className="text-[14px] font-medium text-[#141412]">
                          {row.unitName}
                        </p>
                        <p className="text-[12px] text-[#8A857B]">
                          {row.propertyName}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[14px] text-[#141412]">
                        {row.occupancyPercent}%
                      </td>
                      <td className="px-5 py-4 text-[14px] text-[#141412]">
                        {row.nightsBooked}{" "}
                        <span className="text-[#8A857B]">
                          / {row.nightsAvailable}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[14px] text-[#141412]">
                        {row.earned > 0 ? formatNaira(row.earned) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Report;