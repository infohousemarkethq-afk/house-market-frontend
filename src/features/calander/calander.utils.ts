import { CALENDAR_MONTH } from "../../utils/formatTime.util";
import { BLOCKS, BOOKINGS } from "./calander.fixtures";
import type { Booking, CalendarView, DateBlock } from "./calander.types";

export function staysFor(unitId: string): Booking[] {
  return BOOKINGS.filter((booking) => booking.unitId === unitId);
}

export function blocksFor(unitId: string): DateBlock[] {
  return BLOCKS.filter((block) => block.unitId === unitId);
}

export function nightsBooked(unitId: string): number {
  return staysFor(unitId).reduce(
    (total, booking) => total + (booking.end - booking.start),
    0,
  );
}

export function nightsBlocked(unitId: string): number {
  return blocksFor(unitId).reduce(
    (total, block) => total + (block.end - block.start),
    0,
  );
}

/** Blocked nights are unavailable, not a miss — they leave the denominator. */
export function nightsAvailable(unitId: string): number {
  return CALENDAR_MONTH.days - nightsBlocked(unitId);
}

export function occupancyPct(unitId: string): number {
  const available = nightsAvailable(unitId);
  return available > 0 ? Math.round((nightsBooked(unitId) / available) * 100) : 0;
}

/** Kobo taken across the month, at the guest rate. */
export function revenueFor(unitId: string): number {
  return staysFor(unitId).reduce((total, booking) => total + booking.total, 0);
}

/** What each day of the month is doing for one unit. */
export function dayStates(
  unitId: string,
): { day: number; state: "booked" | "blocked" | "free" }[] {
  const stays = staysFor(unitId);
  const blocks = blocksFor(unitId);

  return Array.from({ length: CALENDAR_MONTH.days }, (_, index) => {
    const day = index + 1;
    const booked = stays.some((stay) => day >= stay.start && day < stay.end);
    const blocked = blocks.some(
      (block) => day >= block.start && day < block.end,
    );
    return { day, state: booked ? "booked" : blocked ? "blocked" : "free" };
  });
}

/** Percentage offsets for a bar drawn across a 31-column row. */
export function barGeometry(start: number, end: number) {
  return {
    left: `${(((start - 0.5) / CALENDAR_MONTH.days) * 100).toFixed(3)}%`,
    width: `${(((end - start) / CALENDAR_MONTH.days) * 100).toFixed(3)}%`,
  };
}

/* ------------------------------------------------------------------------ *
 * API helpers — for the Calendar and Bookings screens, which read the real
 * API. Everything above this line still serves the fixture-driven dashboard
 * and reports screens.
 * ------------------------------------------------------------------------ */

const MONTH_NAMES = [
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

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Everything here works in UTC.
 *
 * The API normalises every calendar date to UTC midnight (see `calendarDate`
 * in booking.schema.ts) because a stay starts on a day, not at an instant.
 * Reading those back with local getters would shift the day for anyone west
 * of Greenwich, so a booking would draw on the wrong column.
 */
export interface MonthWindow {
  /** UTC midnight on the 1st. */
  start: Date;
  /** Exclusive — UTC midnight on the 1st of the next month. */
  end: Date;
  /** "August 2026" */
  label: string;
  days: number;
}

export function monthWindowOf(anchor: Date): MonthWindow {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();

  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 1));

  return {
    start,
    end,
    label: `${MONTH_NAMES[month]} ${year}`,
    days: Math.round((end.getTime() - start.getTime()) / DAY_MS),
  };
}

export function currentMonthWindow(): MonthWindow {
  return monthWindowOf(new Date());
}

export function shiftMonth(window: MonthWindow, by: number): MonthWindow {
  return monthWindowOf(
    new Date(
      Date.UTC(window.start.getUTCFullYear(), window.start.getUTCMonth() + by, 1),
    ),
  );
}

/** Date -> "2026-08-01", the only form the API's query params need. */
export function toApiDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Whole days from the window's first day. Negative before it, and that's fine. */
function dayOffset(window: MonthWindow, iso: string): number {
  return Math.round(
    (new Date(iso).getTime() - window.start.getTime()) / DAY_MS,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Where a stay or block sits on a row, as percentages.
 *
 * Bars start and end at midday, so a checkout and a check-in on the same date
 * meet in the middle of one cell instead of overlapping — the half-open range
 * drawn honestly. Anything running past either edge of the month is clipped
 * to it.
 */
export function entryGeometry(
  window: MonthWindow,
  startDate: string,
  endDate: string,
): { left: string; width: string } | null {
  const from = clamp(dayOffset(window, startDate) + 0.5, 0, window.days);
  const to = clamp(dayOffset(window, endDate) + 0.5, 0, window.days);

  if (to <= from) return null;

  return {
    left: `${((from / window.days) * 100).toFixed(3)}%`,
    width: `${(((to - from) / window.days) * 100).toFixed(3)}%`,
  };
}

/** The day numbers across the top of the grid. */
export function monthDays(window: MonthWindow): number[] {
  return Array.from({ length: window.days }, (_, index) => index + 1);
}

/** UTC midnight on a given day of the window. */
export function dayDate(window: MonthWindow, day: number): Date {
  return new Date(
    Date.UTC(
      window.start.getUTCFullYear(),
      window.start.getUTCMonth(),
      day,
    ),
  );
}

export function isToday(window: MonthWindow, day: number): boolean {
  const now = new Date();
  return (
    now.getUTCFullYear() === window.start.getUTCFullYear() &&
    now.getUTCMonth() === window.start.getUTCMonth() &&
    now.getUTCDate() === day
  );
}

/** Nights between two API dates. */
export function nightsBetween(startDate: string, endDate: string): number {
  return Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS,
  );
}

/**
 * The money this caller is allowed to see.
 *
 * `shapeMoney` on the server strips the other field, so which one is present
 * is itself the answer — an owner only ever gets their share, and labelling
 * it "Booking total" would overstate what they're owed.
 */
export function visibleAmount(booking: {
  totalAmount?: number | null;
  ownerAmount?: number | null;
}): { kobo: number; label: string } | null {
  if (booking.totalAmount != null) {
    return { kobo: booking.totalAmount, label: "Booking total" };
  }
  if (booking.ownerAmount != null) {
    return { kobo: booking.ownerAmount, label: "Your share" };
  }
  return null;
}

/**
 * The nights this month already has something on them.
 *
 * Nights, not dates: a stay from the 12th to the 15th holds the 12th, 13th
 * and 14th, and hands the unit back on the 15th. Marking the 15th busy would
 * refuse a legitimate same-day changeover.
 */
export function busyNightsOf(
  window: MonthWindow,
  view: CalendarView | undefined,
): Set<number> {
  const nights = new Set<number>();
  if (!view) return nights;

  const mark = (startDate: string, endDate: string) => {
    const firstNight = Math.max(1, dayOffset(window, startDate) + 1);
    const lastNight = Math.min(window.days, dayOffset(window, endDate));

    for (let night = firstNight; night <= lastNight; night += 1) {
      nights.add(night);
    }
  };

  view.bookings.forEach((entry) => mark(entry.startDate, entry.endDate));
  view.blocks.forEach((entry) => mark(entry.startDate, entry.endDate));

  return nights;
}
