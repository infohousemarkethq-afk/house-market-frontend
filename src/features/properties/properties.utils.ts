import type { PropertyFormValues } from "./properties.schema";
import {
  DEFAULT_PROPERTY_FILTERS,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABEL,
  type PropertyFilters,
  type PropertySummary,
  type PropertyType,
} from "./properties.types";

/** What to call this property's type — the custom label wins for OTHER. */
export function typeLabel(property: {
  propertyType: PropertyType;
  propertyTypeOther: string | null;
}): string {
  if (property.propertyType === "OTHER") {
    return property.propertyTypeOther ?? PROPERTY_TYPE_LABEL.OTHER;
  }
  return PROPERTY_TYPE_LABEL[property.propertyType];
}

export function isArchived(property: Pick<PropertySummary, "archivedAt">) {
  return property.archivedAt !== null;
}

/**
 * The API rejects `propertyTypeOther` unless the type is OTHER (see
 * otherTypeRule in property.schema.ts), so it has to be dropped rather than
 * sent as an empty string — which is also why the form can keep it around
 * while the user flips types without the last edit leaking into the payload.
 */
export function toPropertyPayload(values: PropertyFormValues) {
  const { propertyTypeOther, ...rest } = values;

  return values.propertyType === "OTHER"
    ? { ...rest, propertyTypeOther }
    : rest;
}

function isPropertyType(value: string): value is PropertyType {
  return (PROPERTY_TYPES as readonly string[]).includes(value);
}

/** URL -> filters. Anything unrecognised falls back to the default. */
export function filtersFromParams(params: URLSearchParams): PropertyFilters {
  const page = Number(params.get("page"));
  const type = params.get("type") ?? "";

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get("search") ?? "",
    city: params.get("city") ?? "",
    type: isPropertyType(type) ? type : "",
    includeArchived: params.get("archived") === "1",
  };
}

/** Filters -> URL. Defaults are omitted so a clean view has a clean address. */
export function paramsFromFilters(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.city) params.set("city", filters.city);
  if (filters.type) params.set("type", filters.type);
  if (filters.includeArchived) params.set("archived", "1");
  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}

/** Filters -> axios params. Same omissions, so the query key stays stable. */
export function queryParamsFromFilters(filters: PropertyFilters) {
  return {
    page: filters.page,
    ...(filters.search && { search: filters.search }),
    ...(filters.city && { city: filters.city }),
    ...(filters.type && { type: filters.type }),
    ...(filters.includeArchived && { includeArchived: true }),
  };
}

export function hasActiveFilters(filters: PropertyFilters): boolean {
  return (
    filters.search !== DEFAULT_PROPERTY_FILTERS.search ||
    filters.city !== DEFAULT_PROPERTY_FILTERS.city ||
    filters.type !== DEFAULT_PROPERTY_FILTERS.type ||
    filters.includeArchived !== DEFAULT_PROPERTY_FILTERS.includeArchived
  );
}
