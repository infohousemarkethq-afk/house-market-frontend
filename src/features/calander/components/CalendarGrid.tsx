import { Fragment } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Skeleton } from "../../../components/ui/SkeletonLoader";
import { cn } from "../../../utils/cn.util";
import { formatCalendarRange } from "../../../utils/formatTime.util";
import type { UnitSummary } from "../../units/units.types";
import {
  entryGeometry,
  isToday,
  monthDays,
  type MonthWindow,
} from "../calander.utils";
import {
  BOOKING_STATUS_LABEL,
  type BookingStatus,
  type CalendarBlockEntry,
  type CalendarBookingEntry,
  type CalendarView,
} from "../calander.types";

const BLOCK_STRIPES =
  "repeating-linear-gradient(45deg, #B98A5E 0 5px, #D4AB84 5px 10px)";

const BAR_TONES: Record<BookingStatus, string> = {
  CONFIRMED: "bg-[#3F7D5A] text-white",
  CHECKED_IN: "bg-[#141412] text-white",
  CHECKED_OUT: "bg-[#C6C1B5] text-[#2B2721]",
  CANCELLED: "bg-[#E4E0D6] text-[#8A857B]",
};

const LEGEND = [
  { label: "Confirmed", className: "bg-[#3F7D5A]" },
  { label: "Checked in", className: "bg-[#141412]" },
  { label: "Checked out", className: "bg-[#C6C1B5]" },
  { label: "Blocked", className: "", style: { backgroundImage: BLOCK_STRIPES } },
];

const arrowClasses =
  "flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full border border-[#DCD6CB] bg-white text-[#2A2822] transition-colors hover:border-[#B8B1A4]";

interface CalendarGridProps {
  window: MonthWindow;
  units: UnitSummary[];
  views: CalendarView[];
  isPending: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectBooking: (entry: CalendarBookingEntry, unit: UnitSummary) => void;
  onSelectBlock: (entry: CalendarBlockEntry, unit: UnitSummary) => void;
}

const CalendarGrid = ({
  window,
  units,
  views,
  isPending,
  onPreviousMonth,
  onNextMonth,
  onSelectBooking,
  onSelectBlock,
}: CalendarGridProps) => {
  const days = monthDays(window);
  const columns = { gridTemplateColumns: `repeat(${window.days}, 1fr)` };

  return (
    <div className="rounded-[16px] border border-[#E7E3DA] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPreviousMonth}
            className={arrowClasses}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.8}
            />
          </button>

          <h2 className="min-w-[150px] text-center text-[19px] font-semibold text-[#141412]">
            {window.label}
          </h2>

          <button
            type="button"
            aria-label="Next month"
            onClick={onNextMonth}
            className={arrowClasses}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.8}
            />
          </button>
        </div>

        <ul className="flex flex-wrap items-center gap-4 text-[13px] text-[#6B665C]">
          {LEGEND.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                style={item.style}
                className={cn(
                  "inline-block h-[10px] w-[16px] rounded-[3px]",
                  item.className,
                )}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[860px] overflow-hidden rounded-[10px] border border-[#EDEAE2]">
          <div className="grid grid-cols-[170px_1fr]">
            <div className="h-[34px] border-r border-b border-[#EDEAE2] bg-[#FBFAF7]" />

            <div
              className="grid h-[34px] border-b border-[#EDEAE2] bg-[#FBFAF7]"
              style={columns}
            >
              {days.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "flex items-center justify-center border-r border-[#F2F0EA] text-[11px] last:border-r-0",
                    isToday(window, day)
                      ? "font-bold text-[#141412]"
                      : "text-[#8A857B]",
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {units.map((unit) => {
              const view = views.find((candidate) => candidate.unitId === unit.id);

              return (
                <Fragment key={unit.id}>
                  <div className="flex h-[52px] flex-col justify-center border-r border-b border-[#F2F0EA] px-3.5">
                    <p className="truncate text-[14px] font-medium text-[#2A2822]">
                      {unit.unitName}
                    </p>
                    <p className="truncate text-[11px] text-[#A29C90]">
                      {unit.property.propertyName}
                    </p>
                  </div>

                  <div className="relative h-[52px] border-b border-[#F2F0EA]">
                    <div className="absolute inset-0 grid" style={columns}>
                      {days.map((day) => (
                        <div
                          key={day}
                          className={cn(
                            "border-r border-[#F7F5F0] last:border-r-0",
                            isToday(window, day) && "bg-[#FBFAF7]",
                          )}
                        />
                      ))}
                    </div>

                    {isPending && !view && (
                      <Skeleton className="absolute top-[11px] left-[4%] h-[30px] w-[28%]" />
                    )}

                    {view?.bookings.map((entry) => {
                      const geometry = entryGeometry(
                        window,
                        entry.startDate,
                        entry.endDate,
                      );
                      if (!geometry) return null;

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => onSelectBooking(entry, unit)}
                          style={geometry}
                          title={`${entry.guestName} · ${formatCalendarRange(entry.startDate, entry.endDate)} — ${BOOKING_STATUS_LABEL[entry.status]}`}
                          className={cn(
                            "absolute top-[11px] flex h-[30px] cursor-pointer items-center overflow-hidden rounded-[6px] px-2.5 text-[12px] font-medium whitespace-nowrap",
                            BAR_TONES[entry.status],
                          )}
                        >
                          {entry.guestName}
                        </button>
                      );
                    })}

                    {view?.blocks.map((entry) => {
                      const geometry = entryGeometry(
                        window,
                        entry.startDate,
                        entry.endDate,
                      );
                      if (!geometry) return null;

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => onSelectBlock(entry, unit)}
                          style={{ ...geometry, backgroundImage: BLOCK_STRIPES }}
                          title={`${entry.reason ?? "Blocked"} · ${formatCalendarRange(entry.startDate, entry.endDate)}`}
                          className="absolute top-[11px] flex h-[30px] cursor-pointer items-center overflow-hidden rounded-[6px] px-2.5 text-[12px] font-medium whitespace-nowrap text-[#2B2721]"
                        >
                          {entry.reason ?? "Blocked"}
                        </button>
                      );
                    })}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-[760px] text-[13px] leading-relaxed text-[#8A857B]">
        Bars start and end at midday, so a checkout and a check-in on the same
        date meet in the middle of the cell instead of overlapping — a
        changeover, not a clash.
      </p>
    </div>
  );
};

export default CalendarGrid;
