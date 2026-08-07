import { CALENDAR_MONTH } from "../../utils/formatTime.util";
import { BLOCKS, BOOKINGS } from "./calander.fixtures";
import type { Booking, DateBlock } from "./calander.types";

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
