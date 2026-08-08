import { cn } from "../../../utils/cn.util";
import { formatApiDateTime } from "../../../utils/formatTime.util";
import type { ActivityItem } from "../dashboard.types";
import { ACTIVITY_TONE, activitySentence } from "../dashboard.utils";

const ActivityFeed = ({ items }: { items: ActivityItem[] }) => (
  <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-6">
    <h2 className="text-[17px] font-semibold text-[#141412]">Recent activity</h2>

    {items.length === 0 ? (
      <p className="mt-4 text-[14px] leading-relaxed text-[#6B665C]">
        Nothing has happened yet. Uploads, bookings and maintenance will show up
        here.
      </p>
    ) : (
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 h-[8px] w-[8px] shrink-0 rounded-full",
                ACTIVITY_TONE[item.type],
              )}
            />
            <div>
              <p className="text-[14px] leading-snug text-[#1A1917]">
                {activitySentence(item)}
              </p>
              <p className="mt-0.5 text-[12px] text-[#A29C90]">
                {formatApiDateTime(item.occurredAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default ActivityFeed;
