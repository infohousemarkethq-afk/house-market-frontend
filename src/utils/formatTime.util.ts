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

/** API timestamp -> "14 Jul 2026". Handles the full ISO string, not just a date. */
export function formatApiDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** API timestamp -> "14 Jul, 10:11am", for logs where the time matters. */
export function formatApiDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${hour12}:${minutes}${suffix}`;
}

const MONTH_NAMES_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Calendar dates read in UTC.
 *
 * The API stores a stay's dates at UTC midnight because they're days, not
 * instants. Formatting them with local getters would move the day for anyone
 * west of Greenwich, so a 12 August arrival would print as the 11th.
 */
export function formatCalendarDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "12–15 Aug 2026", collapsing the month and year when they're shared. */
export function formatCalendarRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—";

  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    return `${start.getUTCDate()}–${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  }

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const from = sameYear
    ? `${start.getUTCDate()} ${MONTHS[start.getUTCMonth()]}`
    : formatCalendarDate(startIso);

  return `${from} – ${formatCalendarDate(endIso)}`;
}

/** "12 – 15 August 2026", for the booking screen's headline. */
export function formatCalendarRangeLong(
  startIso: string,
  endIso: string,
): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—";

  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    return `${start.getUTCDate()} – ${end.getUTCDate()} ${MONTH_NAMES_LONG[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  }

  return `${start.getUTCDate()} ${MONTH_NAMES_LONG[start.getUTCMonth()]} – ${end.getUTCDate()} ${MONTH_NAMES_LONG[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
}

/** "12 Aug", for the compact lines on the booking timeline. */
export function formatCalendarDayShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}
