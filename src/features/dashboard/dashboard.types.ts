/** Mirrors `Dashboard` and friends in the backend's dashboard.types.ts. */

export interface UnitOccupancy {
  unitId: string;
  unitName: string;
  bookedNights: number;
  availableNights: number;
  percent: number;
}

/** The strip under the title: "Bella Suites — 4 properties, 5 units, 3 staff." */
export interface DashboardScope {
  /** Null for an owner — they hold units across companies, not inside one. */
  companyName: string | null;
  propertyCount: number;
  unitCount: number;
  /** Admin only. */
  staffCount?: number;
}

/**
 * `team` and `revenue` are optional because the server omits what the caller
 * isn't entitled to: managers get neither, owners get revenue at their own
 * rate but no headcount. A missing field is the rule, not a bug.
 */
export interface DashboardCards {
  properties: { total: number; unitCount: number };
  units: { active: number; total: number };
  documents: { total: number; sensitive: number };
  occupancy: { percent: number; bookedNights: number; availableNights: number };
  team?: { members: number; pendingInvites: number };
  revenue?: { amount: number; month: string };
}

export type TodayItemType = "CHECK_IN" | "CHECK_OUT" | "BLOCKED";

export interface TodayItem {
  id: string;
  type: TodayItemType;
  /** Guest name, or the reason a unit is blocked. */
  label: string;
  unit: { id: string; unitName: string };
  startDate: string;
  endDate: string;
  nights: number;
}

export type ActivityType =
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_DOWNLOADED"
  | "BOOKING_CREATED"
  | "MAINTENANCE_LOGGED"
  | "DAMAGE_REPORTED";

/**
 * The API sends parts, not prose — actor, subject, unit — so the wording can
 * change here without a backend release.
 */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: { id: string; fullName: string } | null;
  subject: string;
  unit: { id: string; unitName: string } | null;
  occurredAt: string;
}

export interface Dashboard {
  month: string;
  scope: DashboardScope;
  cards: DashboardCards;
  occupancyByUnit: UnitOccupancy[];
  today: TodayItem[];
  activity: ActivityItem[];
}
