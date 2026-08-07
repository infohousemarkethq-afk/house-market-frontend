const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** The month the calendar, reports and bookings are scoped to. */
export const CALENDAR_MONTH = { label: "August 2026", short: "Aug", days: 31 };

/** 12 -> "12 Aug 2026" */
export function formatDay(day: number): string {
  return `${day} ${CALENDAR_MONTH.short} 2026`;
}

/** 12, 15 -> "12–15 Aug 2026" */
export function formatDayRange(start: number, end: number): string {
  return `${start}–${end} ${CALENDAR_MONTH.short} 2026`;
}

/** "2026-05-02" -> "2 May 2026" */
export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
