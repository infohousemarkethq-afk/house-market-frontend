export const PROPERTY_TYPES = [
  "APARTMENT",
  "DUPLEX",
  "BUNGALOW",
  "TERRACE",
  "STUDIO",
  "PENTHOUSE",
  "OTHER",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  APARTMENT: "Apartment",
  DUPLEX: "Duplex",
  BUNGALOW: "Bungalow",
  TERRACE: "Terrace",
  STUDIO: "Studio",
  PENTHOUSE: "Penthouse",
  OTHER: "Other",
};

export interface PropertySummary {
  id: string;
  propertyName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyType: PropertyType;
  propertyTypeOther: string | null;
  imageUrl: string | null;
  archivedAt: string | null;
  createdAt: string;
  activeUnitCount: number;
}

export interface PropertyDetail extends PropertySummary {
  updatedAt: string;
  totalUnitCount: number;
}

export interface PropertyFilters {
  page: number;
  search: string;
  city: string;
  type: PropertyType | "";
  includeArchived: boolean;
}

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters = {
  page: 1,
  search: "",
  city: "",
  type: "",
  includeArchived: false,
};
