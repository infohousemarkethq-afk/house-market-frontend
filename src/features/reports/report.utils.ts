import { formatNaira } from "../../utils/formatNaira.util";
import { CALENDAR_MONTH } from "../../utils/formatTime.util";
import type { ViewRole } from "../auth/auth.types";
import {
  nightsBlocked,
  nightsBooked,
  occupancyPct,
  revenueFor,
  staysFor,
} from "../calander/calander.utils";
import type { Unit } from "../units/units.types";
import { activeUnits, rateForRole, unitPropertyLine } from "../units/units.utils";
import type { ReportRow, SummaryTile, UnitReport } from "./report.types";

/** Owners are paid their own rate; staff see what the guest paid. */
function earnedFor(unit: Unit, role: ViewRole): number {
  return role === "owner"
    ? nightsBooked(unit.id) * (unit.ownerRatePerNight ?? 0)
    : revenueFor(unit.id);
}

export function reportScope(role: ViewRole): Unit[] {
  return activeUnits(role);
}

export function reportRows(role: ViewRole): ReportRow[] {
  return reportScope(role).map((unit) => ({
    unitId: unit.id,
    unitName: unit.unitName,
    propertyName:
      role === "owner"
        ? `Managed by ${unit.managedBy ?? "Bella Suites"}`
        : unit.propertyName,
    occupancyPct: occupancyPct(unit.id),
    nights: nightsBooked(unit.id),
    earned: earnedFor(unit, role),
  }));
}

export function summaryTiles(role: ViewRole): SummaryTile[] {
  const units = reportScope(role);
  const nights = units.reduce((total, unit) => total + nightsBooked(unit.id), 0);
  const earned = units.reduce((total, unit) => total + earnedFor(unit, role), 0);
  const available = units.reduce(
    (total, unit) => total + (CALENDAR_MONTH.days - nightsBlocked(unit.id)),
    0,
  );
  const let_ = units.filter((unit) => nightsBooked(unit.id) > 0).length;

  return [
    {
      label: role === "owner" ? "Earned in August" : "Revenue in August",
      value: formatNaira(earned),
      caption:
        role === "owner" ? "at your rate" : `across ${units.length} units`,
    },
    {
      label: "Nights booked",
      value: String(nights),
      caption: `of ${available} available`,
    },
    {
      label: "Units let",
      value: `${let_} of ${units.length}`,
      caption: "had at least one stay",
    },
  ];
}

export function unitReport(unit: Unit, role: ViewRole): UnitReport {
  const stays = staysFor(unit.id);
  const nights = nightsBooked(unit.id);
  const revenue = earnedFor(unit, role);

  return {
    unitName: unit.unitName,
    propertyLine: unitPropertyLine(unit, role),
    occupancyPct: occupancyPct(unit.id),
    revenueLabel: role === "owner" ? "Earned on this unit" : "Revenue",
    revenue,
    timesBooked: stays.length,
    nightsBooked: nights,
    avgStay: stays.length ? `${(nights / stays.length).toFixed(1)} nights` : "—",
    avgNightly: nights ? formatNaira(Math.round(revenue / nights)) : "—",
    blockedNights: `${nightsBlocked(unit.id)} nights`,
    rateCaption: role === "owner" ? "Your rate " : "Current rate ",
    rate: rateForRole(unit, role),
  };
}

export function reportsSubtitle(role: ViewRole): string {
  return role === "owner"
    ? "Your units only. We do not compare them against the rest of the portfolio."
    : "Company-wide, derived from bookings.";
}
