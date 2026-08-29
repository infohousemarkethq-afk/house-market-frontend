import type { ViewRole } from "../auth/auth.types";

/**
 * Subtitle shown under the Reports heading.
 * Role-aware but contains no data — purely presentational.
 */
export function reportsSubtitle(role: ViewRole): string {
  return role === "owner"
    ? "Your units only. Revenue is shown at your agreed rate."
    : "Company-wide occupancy and revenue, derived from bookings.";
}

/**
 * Turns a "2026-08" label into something readable: "August 2026".
 */
export function formatReportMonth(month: string): string {
  const [year, monthNum] = month.split("-");
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/**
 * Builds the ?month= param string from a Date object.
 * Returns "" for the current month so the API uses its own default.
 */
export function toMonthParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Returns a Date for the first day of the current month — used as the
 * default when no month is in the URL.
 */
export function currentMonthDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}