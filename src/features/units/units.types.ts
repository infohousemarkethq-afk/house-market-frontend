/**
 * Mirrors `unitTypeEnum` in the backend's unit.schema.ts, in the order the
 * designs show it. Declared as const tuples so they can feed `z.enum` and
 * still yield the literal union — a mutable array widens it to `string`.
 */
export const UNIT_TYPE_OPTIONS = [
  "STUDIO",
  "SELF_CONTAIN",
  "FLAT",
  "DUPLEX",
  "PENTHOUSE",
  "OTHER",
] as const;

export type UnitType = (typeof UNIT_TYPE_OPTIONS)[number];

/** Order matters — it's the order of the amenity grid in the unit form. */
export const AMENITY_KEYS = [
  "WIFI",
  "AIR_CONDITIONING",
  "GENERATOR",
  "INVERTER",
  "PARKING",
  "SWIMMING_POOL",
  "GYM",
  "KITCHEN",
  "WASHING_MACHINE",
  "TV",
  "SECURITY",
  "ELEVATOR",
  "WATER_HEATER",
  "BALCONY",
] as const;

export type Amenity = (typeof AMENITY_KEYS)[number];

export const UNIT_TYPE_LABEL: Record<UnitType, string> = {
  STUDIO: "Studio",
  SELF_CONTAIN: "Self contain",
  FLAT: "Flat",
  DUPLEX: "Duplex",
  PENTHOUSE: "Penthouse",
  OTHER: "Other",
};

export const AMENITY_LABEL: Record<Amenity, string> = {
  WIFI: "Wi-Fi",
  AIR_CONDITIONING: "A/C",
  GENERATOR: "Generator",
  INVERTER: "Inverter",
  PARKING: "Parking",
  SWIMMING_POOL: "Pool",
  GYM: "Gym",
  KITCHEN: "Kitchen",
  WASHING_MACHINE: "Washer",
  TV: "TV",
  SECURITY: "Security",
  ELEVATOR: "Lift",
  WATER_HEATER: "Water heater",
  BALCONY: "Balcony",
};

export interface UnitOwner {
  fullName: string;
  email: string;
}

export interface UnitPropertySummary {
  id: string;
  propertyName: string;
  propertyAddress: string;
  propertyCity: string;
}

export interface UnitImageSummary {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  caption: string | null;
  position: number;
  createdAt: string;
}

/**
 * Mirrors `unitListSelect` in the backend's unit.service.ts.
 *
 * Both prices are optional because `shapeUnitMoney` strips the one the caller
 * isn't entitled to: an owner gets `ownerRatePerNight` only, a manager gets
 * `pricePerNight` only, and an admin gets both. Typing either as required
 * would make a missing field look like a bug rather than the rule.
 */
export interface UnitSummary {
  id: string;
  unitName: string;
  unitType: UnitType;
  unitTypeOther: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  maxGuests: number | null;
  amenities: Amenity[];
  pricePerNight?: number | null;
  ownerRatePerNight?: number | null;
  archivedAt: string | null;
  coverImageUrl: string | null;
  property: {
    id: string;
    propertyName: string;
    propertyCity: string;
  };
}

export interface UnitDetail {
  id: string;
  unitName: string;
  unitType: UnitType;
  unitTypeOther: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  parlors: number | null;
  maxGuests: number | null;
  amenities: Amenity[];
  pricePerNight?: number | null;
  ownerRatePerNight?: number | null;
  description: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  property: UnitPropertySummary;
  owners: { id: string; fullName: string; email: string }[];
  /** Ordered by position — images[0] is the cover. */
  images: UnitImageSummary[];
}

/** The list screen's state, and the whole of what lives in the URL. */
export interface UnitFilters {
  page: number;
  search: string;
  propertyId: string;
  type: UnitType | "";
  minBedrooms: string;
  amenities: Amenity[];
  includeArchived: boolean;
}

export const DEFAULT_UNIT_FILTERS: UnitFilters = {
  page: 1,
  search: "",
  propertyId: "",
  type: "",
  minBedrooms: "",
  amenities: [],
  includeArchived: false,
};

/* ------------------------------------------------------------------------ *
 * Legacy fixture shapes.
 *
 * The dashboard, reports and calendar screens still run on units.fixtures.ts
 * and haven't been wired to the API yet. These describe that flat fixture
 * row — not an API response. New code wants UnitSummary / UnitDetail above.
 * ------------------------------------------------------------------------ */

export interface Unit {
  id: string;
  photo: string;
  unitName: string;
  unitType: UnitType;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  parlors: number;
  maxGuests: number;
  pricePerNight: number;
  ownerRatePerNight?: number;
  amenities: Amenity[];
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  /** Only set on units another company runs, for the owner's view. */
  managedBy?: string;
  archivedAt: string | null;
  description: string;
  owners: UnitOwner[];
}

export type MaintenanceType = "SCHEDULED" | "REACTIVE";
export type MaintenanceCategory =
  | "CLEANING"
  | "REPAIR"
  | "INSPECTION"
  | "OTHER";
export type MaintenanceStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface MaintenanceRecord {
  id: string;
  unitId: string;
  title: string;
  type: MaintenanceType;
  category: MaintenanceCategory;
  status: MaintenanceStatus;
  /** Kobo. */
  cost: number;
  performedAt: string;
}
