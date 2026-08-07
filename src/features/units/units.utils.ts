import type { ViewRole } from "../auth/auth.types";
import { MAINTENANCE, UNITS } from "./units.fixtures";
import type { UnitFormValues } from "./units.schema";
import {
  AMENITY_KEYS,
  DEFAULT_UNIT_FILTERS,
  UNIT_TYPE_LABEL,
  UNIT_TYPE_OPTIONS,
  type Amenity,
  type MaintenanceRecord,
  type Unit,
  type UnitFilters,
  type UnitSummary,
  type UnitType,
} from "./units.types";

/** Units the manager fixture account is assigned to. */
const MANAGER_UNIT_IDS = ["u1", "u2"];
/** Units the owner fixture account owns, including one another company runs. */
const OWNER_UNIT_IDS = ["u2", "u7"];
/** Flat 88 sits outside the company — it only exists for the owner's view. */
const EXTERNAL_UNIT_ID = "u7";

export function unitsForRole(role: ViewRole, showArchived = false): Unit[] {
  if (role === "manager") {
    return UNITS.filter((unit) => MANAGER_UNIT_IDS.includes(unit.id));
  }
  if (role === "owner") {
    return UNITS.filter((unit) => OWNER_UNIT_IDS.includes(unit.id));
  }
  return UNITS.filter(
    (unit) =>
      unit.id !== EXTERNAL_UNIT_ID && (showArchived || !unit.archivedAt),
  );
}

/** Company-wide scope for dashboard and report totals. */
export function companyUnits(): Unit[] {
  return UNITS.filter((unit) => unit.id !== EXTERNAL_UNIT_ID);
}

export function activeUnits(role: ViewRole): Unit[] {
  return unitsForRole(role, false).filter((unit) => !unit.archivedAt);
}

export function findUnit(unitId: string | undefined): Unit | undefined {
  return UNITS.find((unit) => unit.id === unitId);
}

export function unitsInProperty(propertyId: string): Unit[] {
  return UNITS.filter(
    (unit) => unit.propertyId === propertyId && !unit.archivedAt,
  );
}

export function maintenanceForUnit(unitId: string): MaintenanceRecord[] {
  return MAINTENANCE.filter((record) => record.unitId === unitId);
}

/** Owners see who runs the unit; staff see where it is. */
export function unitPropertyLine(unit: Unit, role: ViewRole): string {
  return role === "owner"
    ? `Managed by ${unit.managedBy ?? "Bella Suites"}`
    : `${unit.propertyName} · ${unit.propertyCity}`;
}

/** Owners are quoted their own rate, everyone else the guest rate. */
export function rateForRole(unit: Unit, role: ViewRole): number {
  return role === "owner" ? (unit.ownerRatePerNight ?? 0) : unit.pricePerNight;
}

/* ------------------------------------------------------------------------ *
 * API helpers — for the Units screens, which read the real API.
 * Everything above this line still serves the fixture-driven dashboard,
 * reports and calendar screens.
 * ------------------------------------------------------------------------ */

/** What to call this unit's type — the custom label wins for OTHER. */
export function unitTypeLabel(unit: {
  unitType: UnitType;
  unitTypeOther?: string | null;
}): string {
  if (unit.unitType === "OTHER") {
    return unit.unitTypeOther ?? UNIT_TYPE_LABEL.OTHER;
  }
  return UNIT_TYPE_LABEL[unit.unitType];
}

export function isUnitArchived(unit: Pick<UnitSummary, "archivedAt">) {
  return unit.archivedAt !== null;
}

/**
 * The rate this caller is allowed to see.
 *
 * `shapeUnitMoney` on the server strips the other one, so which field is
 * present is itself the answer — an owner only ever gets their own rate, and
 * labelling it "Guest rate" would be a lie.
 */
export function visibleRate(
  unit: Pick<UnitSummary, "pricePerNight" | "ownerRatePerNight">,
): { kobo: number; label: string } | null {
  if (unit.pricePerNight != null) {
    return { kobo: unit.pricePerNight, label: "Guest rate" };
  }
  if (unit.ownerRatePerNight != null) {
    return { kobo: unit.ownerRatePerNight, label: "Your rate" };
  }
  return null;
}

/** "3 bed · 2 bath · 6 guests", skipping whatever wasn't recorded. */
export function unitSpecLine(
  unit: Pick<UnitSummary, "bedrooms" | "bathrooms" | "maxGuests">,
): string {
  return [
    unit.bedrooms != null && `${unit.bedrooms} bed`,
    unit.bathrooms != null && `${unit.bathrooms} bath`,
    unit.maxGuests != null && `${unit.maxGuests} guests`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function isUnitType(value: string): value is UnitType {
  return (UNIT_TYPE_OPTIONS as readonly string[]).includes(value);
}

function isAmenity(value: string): value is Amenity {
  return (AMENITY_KEYS as readonly string[]).includes(value);
}

/** URL -> filters. Anything unrecognised falls back to the default. */
export function unitFiltersFromParams(params: URLSearchParams): UnitFilters {
  const page = Number(params.get("page"));
  const type = params.get("type") ?? "";
  const minBedrooms = params.get("minBedrooms") ?? "";

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get("search") ?? "",
    propertyId: params.get("propertyId") ?? "",
    type: isUnitType(type) ? type : "",
    minBedrooms: /^\d+$/.test(minBedrooms) ? minBedrooms : "",
    amenities: (params.get("amenities") ?? "").split(",").filter(isAmenity),
    includeArchived: params.get("archived") === "1",
  };
}

/** Filters -> URL. Defaults are omitted so a clean view has a clean address. */
export function paramsFromUnitFilters(filters: UnitFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.propertyId) params.set("propertyId", filters.propertyId);
  if (filters.type) params.set("type", filters.type);
  if (filters.minBedrooms) params.set("minBedrooms", filters.minBedrooms);
  if (filters.amenities.length) {
    params.set("amenities", filters.amenities.join(","));
  }
  if (filters.includeArchived) params.set("archived", "1");
  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}

/** Filters -> axios params. The API reads amenities as a comma-joined list. */
export function unitQueryParamsFromFilters(filters: UnitFilters) {
  return {
    page: filters.page,
    ...(filters.search && { search: filters.search }),
    ...(filters.propertyId && { propertyId: filters.propertyId }),
    ...(filters.type && { type: filters.type }),
    ...(filters.minBedrooms && { minBedrooms: Number(filters.minBedrooms) }),
    ...(filters.amenities.length && { amenities: filters.amenities.join(",") }),
    ...(filters.includeArchived && { includeArchived: true }),
  };
}

export function hasActiveUnitFilters(filters: UnitFilters): boolean {
  return (
    filters.search !== DEFAULT_UNIT_FILTERS.search ||
    filters.propertyId !== DEFAULT_UNIT_FILTERS.propertyId ||
    filters.type !== DEFAULT_UNIT_FILTERS.type ||
    filters.minBedrooms !== DEFAULT_UNIT_FILTERS.minBedrooms ||
    filters.amenities.length > 0 ||
    filters.includeArchived !== DEFAULT_UNIT_FILTERS.includeArchived
  );
}

/**
 * The API rejects `unitTypeOther` unless the type is OTHER (see otherTypeRule
 * in unit.schema.ts), so it has to be dropped rather than sent empty.
 */
export function toUnitPayload(values: UnitFormValues) {
  const { unitTypeOther, description, ...rest } = values;

  return {
    ...rest,
    ...(values.unitType === "OTHER" && { unitTypeOther }),
    ...(description ? { description } : {}),
  };
}
