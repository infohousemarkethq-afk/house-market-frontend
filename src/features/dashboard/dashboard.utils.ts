import {
  Building01Icon,
  Calendar03Icon,
  CreditCardIcon,
  File02Icon,
  Home01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { formatNaira } from "../../utils/formatNaira.util";
import { CALENDAR_MONTH } from "../../utils/formatTime.util";
import {
  nightsBlocked,
  nightsBooked,
  occupancyPct,
  revenueFor,
} from "../calander/calander.utils";
import { DOCUMENTS } from "../documents/documents.fixtures";
import { isSensitive } from "../documents/document.type";
import { PROPERTIES } from "../properties/properties.fixtures";
import { INVITATIONS, MEMBERS } from "../team/team.fixtures";
import { companyUnits } from "../units/units.utils";
import type { DashboardTile, OccupancyBar } from "./dashboard.types";

function liveUnits() {
  return companyUnits().filter((unit) => !unit.archivedAt);
}

function liveProperties() {
  return PROPERTIES.filter((property) => !property.archivedAt);
}

function scope() {
  const units = liveUnits();
  const booked = units.reduce((total, unit) => total + nightsBooked(unit.id), 0);
  const blocked = units.reduce(
    (total, unit) => total + nightsBlocked(unit.id),
    0,
  );
  const available = units.length * CALENDAR_MONTH.days - blocked;
  const revenue = units.reduce((total, unit) => total + revenueFor(unit.id), 0);
  return { units, booked, available, revenue };
}

export function dashboardTiles(): DashboardTile[] {
  const { units, booked, available, revenue } = scope();
  const activeMembers = MEMBERS.filter((member) => !member.deactivatedAt).length;
  const pendingInvites = INVITATIONS.filter(
    (invite) => invite.status === "PENDING",
  ).length;
  const sensitiveCount = DOCUMENTS.filter((doc) =>
    isSensitive(doc.documentCategory),
  ).length;

  return [
    {
      label: "Properties",
      value: String(liveProperties().length),
      caption: `${units.length} units`,
      icon: Building01Icon,
    },
    {
      label: "Active units",
      value: String(units.length),
      caption: `of ${companyUnits().length}`,
      icon: Home01Icon,
    },
    {
      label: "Documents",
      value: String(DOCUMENTS.length),
      caption: `${sensitiveCount} sensitive`,
      icon: File02Icon,
    },
    {
      label: "Occupancy",
      value: `${available > 0 ? Math.round((booked / available) * 100) : 0}%`,
      caption: "August",
      icon: Calendar03Icon,
      planned: true,
    },
    {
      label: "Revenue",
      value: formatNaira(revenue),
      caption: "August",
      icon: CreditCardIcon,
      planned: true,
    },
    {
      label: "Team",
      value: String(activeMembers),
      caption: `${pendingInvites} invite pending`,
      icon: UserGroupIcon,
    },
  ];
}

export function occupancyBars(): OccupancyBar[] {
  return liveUnits().map((unit) => ({
    unitName: unit.unitName,
    pct: occupancyPct(unit.id),
  }));
}

export function dashboardSubtitle(): string {
  const activeMembers = MEMBERS.filter((member) => !member.deactivatedAt).length;
  return `Bella Suites — ${liveProperties().length} properties, ${liveUnits().length} units, ${activeMembers} staff.`;
}

export function occupancyCaption(): string {
  const { booked, available } = scope();
  return `${booked} of ${available} available nights in August`;
}
