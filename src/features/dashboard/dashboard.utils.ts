import type {
  ActivityItem,
  DashboardScope,
  TodayItemType,
} from "./dashboard.types";

/** "Bella Suites — 4 properties, 5 units, 3 staff." */
export function scopeLine(scope: DashboardScope): string {
  const parts = [
    `${scope.propertyCount} ${scope.propertyCount === 1 ? "property" : "properties"}`,
    `${scope.unitCount} ${scope.unitCount === 1 ? "unit" : "units"}`,
  ];

  if (scope.staffCount !== undefined) {
    parts.push(`${scope.staffCount} staff`);
  }

  const counts = `${parts.join(", ")}.`;

  // An owner belongs to no company, so there's no name to lead with.
  return scope.companyName ? `${scope.companyName} — ${counts}` : counts;
}

/**
 * Builds the sentence from the parts the API sends. Anything missing is
 * dropped rather than printed as "undefined" — an activity row with no actor
 * is normal (a system-created record), not an error.
 */
export function activitySentence(item: ActivityItem): string {
  const actor = item.actor?.fullName;
  const unit = item.unit ? ` on ${item.unit.unitName}` : "";

  switch (item.type) {
    case "DOCUMENT_UPLOADED":
      return actor
        ? `${actor} filed ${item.subject}${unit}`
        : `${item.subject} was filed${unit}`;

    case "DOCUMENT_DOWNLOADED":
      return actor
        ? `${actor} downloaded ${item.subject}${unit}`
        : `${item.subject} was downloaded${unit}`;

    case "BOOKING_CREATED":
      return actor
        ? `${actor} booked ${item.subject}${unit}`
        : `${item.subject} was booked${unit}`;

    case "MAINTENANCE_LOGGED":
      return actor
        ? `${actor} logged ${item.subject}${unit}`
        : `${item.subject} was logged${unit}`;

    case "DAMAGE_REPORTED":
      return actor
        ? `${actor} reported ${item.subject}${unit}`
        : `${item.subject} was reported${unit}`;
  }
}

export const ACTIVITY_TONE: Record<ActivityItem["type"], string> = {
  DOCUMENT_UPLOADED: "bg-[#3F7D5A]",
  DOCUMENT_DOWNLOADED: "bg-[#B98A5E]",
  BOOKING_CREATED: "bg-[#141412]",
  MAINTENANCE_LOGGED: "bg-[#8A857B]",
  DAMAGE_REPORTED: "bg-[#A8543C]",
};

export const TODAY_LABEL: Record<TodayItemType, string> = {
  CHECK_IN: "Checking in",
  CHECK_OUT: "Checking out",
  BLOCKED: "Blocked",
};

export const TODAY_TONE: Record<TodayItemType, string> = {
  CHECK_IN: "bg-[#3F7D5A] text-white",
  CHECK_OUT: "bg-[#2C2A26] text-[#E8E5DC]",
  BLOCKED: "bg-[#5C4A33] text-[#E8DDCB]",
};
