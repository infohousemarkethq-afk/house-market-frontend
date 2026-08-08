import { cn } from "../../../utils/cn.util";
import { formatCalendarDayShort } from "../../../utils/formatTime.util";
import type { TodayItem } from "../dashboard.types";
import { TODAY_LABEL, TODAY_TONE } from "../dashboard.utils";

/** "3 nights", or "until 24 Aug" for a block that runs on. */
function detailFor(item: TodayItem): string {
  if (item.type === "BLOCKED") {
    return `until ${formatCalendarDayShort(item.endDate)}`;
  }
  if (item.type === "CHECK_IN") return "from today";
  return `${item.nights} ${item.nights === 1 ? "night" : "nights"}`;
}

const TodayPanel = ({ items }: { items: TodayItem[] }) => (
  <section className="min-w-0 rounded-[16px] bg-[#141412] p-5 text-[#F5F3EF] sm:p-6">
    <h2 className="text-[17px] font-semibold">Today</h2>

    {items.length === 0 ? (
      <p className="mt-4 text-[14px] leading-relaxed break-words text-[#8A857B]">
        Nothing moving today — no arrivals, departures or blocks starting.
      </p>
    ) : (
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 border-b border-[#2C2A26] pb-4 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">{item.label}</p>
              <p className="truncate text-[12px] text-[#8A857B]">
                {item.unit.unitName} · {detailFor(item)}
              </p>
            </div>

            <span
              className={cn(
                "shrink-0 rounded-[6px] px-2.5 py-1 text-[12px] font-medium whitespace-nowrap",
                TODAY_TONE[item.type],
              )}
            >
              {TODAY_LABEL[item.type]}
            </span>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default TodayPanel;
