import { cn } from "../../../utils/cn.util";
import { monthDays, type MonthWindow } from "../calander.utils";

interface MonthDayPickerProps {
  window: MonthWindow;
  /** Nights already held by a stay or a block. */
  busyNights: Set<number>;
  startDay: number | null;
  endDay: number | null;
  onChange: (startDay: number | null, endDay: number | null) => void;
  disabled?: boolean;
}

/**
 * Picks a half-open range on one month.
 *
 * Nights are what's occupied, not dates: a stay from the 12th to the 15th
 * holds the nights of the 12th, 13th and 14th, so the 15th is still a valid
 * arrival. That's why a busy night blocks a *start* but never blocks the
 * checkout day that follows it.
 */
const MonthDayPicker = ({
  window,
  busyNights,
  startDay,
  endDay,
  onChange,
  disabled,
}: MonthDayPickerProps) => {
  const days = monthDays(window);

  /** Free run after the arrival, so a range can't jump over a booked night. */
  const canEndOn = (day: number) => {
    if (startDay === null || day <= startDay) return false;

    for (let night = startDay; night < day; night += 1) {
      if (busyNights.has(night)) return false;
    }
    return true;
  };

  const isSelectable = (day: number) => {
    if (disabled) return false;
    // Choosing the arrival, or starting a new range after one is complete.
    if (startDay === null || endDay !== null) return !busyNights.has(day);
    return canEndOn(day) || !busyNights.has(day);
  };

  const onPick = (day: number) => {
    if (startDay === null || endDay !== null) {
      onChange(day, null);
      return;
    }

    if (canEndOn(day)) {
      onChange(startDay, day);
      return;
    }

    // Anything else restarts, which is what a click before the arrival means.
    onChange(day, null);
  };

  const inRange = (day: number) =>
    startDay !== null && endDay !== null && day >= startDay && day < endDay;

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const selected = day === startDay || inRange(day);
          const selectable = isSelectable(day);

          return (
            <button
              key={day}
              type="button"
              disabled={!selectable}
              aria-pressed={selected}
              onClick={() => onPick(day)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-[8px] text-[13px] transition-colors",
                selected
                  ? "bg-[#141412] font-semibold text-[#F5F3EF]"
                  : selectable
                    ? "cursor-pointer border border-[#EDEAE2] bg-white text-[#4A463E] hover:border-[#B8B1A4]"
                    : "cursor-not-allowed bg-[#EEECE5] text-[#B5B0A5]",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-[#8A857B]">
        <span className="flex items-center gap-2">
          <span className="inline-block h-[12px] w-[12px] rounded-[3px] bg-[#141412]" />
          {startDay && endDay
            ? `Selected ${startDay}–${endDay}`
            : startDay
              ? `Arriving ${startDay} — pick the checkout day`
              : "Pick the arrival day"}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-[12px] w-[12px] rounded-[3px] bg-[#EEECE5]" />
          Unavailable
        </span>
      </div>
    </div>
  );
};

export default MonthDayPicker;
