import type { ViewRole } from "../auth/auth.types";
import {
  DEFAULT_PAYMENT_FILTERS,
  PAYMENT_DIRECTIONS,
  PAYMENT_TYPES,
  REQUIRED_DIRECTION,
  type PaymentDirection,
  type PaymentFilters,
  type PaymentSummaryRow,
  type PaymentType,
} from "./payment.types";

function isPaymentType(value: string): value is PaymentType {
  return (PAYMENT_TYPES as readonly string[]).includes(value);
}

function isDirection(value: string): value is PaymentDirection {
  return (PAYMENT_DIRECTIONS as readonly string[]).includes(value);
}

/** "2026-08-15" only — anything else is dropped rather than sent to the API. */
function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

/** URL -> filters. Anything unrecognised falls back to the default. */
export function paymentFiltersFromParams(
  params: URLSearchParams,
): PaymentFilters {
  const page = Number(params.get("page"));
  const type = params.get("type") ?? "";
  const direction = params.get("direction") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get("search") ?? "",
    unitId: params.get("unitId") ?? "",
    type: isPaymentType(type) ? type : "",
    direction: isDirection(direction) ? direction : "",
    from: isIsoDate(from) ? from : "",
    to: isIsoDate(to) ? to : "",
  };
}

/** Filters -> URL. Defaults are omitted so a clean view has a clean address. */
export function paramsFromPaymentFilters(
  filters: PaymentFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.unitId) params.set("unitId", filters.unitId);
  if (filters.type) params.set("type", filters.type);
  if (filters.direction) params.set("direction", filters.direction);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}

/** Filters -> axios params. Same omissions, so the query key stays stable. */
export function paymentQueryParams(filters: PaymentFilters) {
  return {
    page: filters.page,
    ...(filters.search && { search: filters.search }),
    ...(filters.unitId && { unitId: filters.unitId }),
    ...(filters.type && { type: filters.type }),
    ...(filters.direction && { direction: filters.direction }),
    ...(filters.from && { from: filters.from }),
    ...(filters.to && { to: filters.to }),
  };
}

export function hasActivePaymentFilters(filters: PaymentFilters): boolean {
  return (
    filters.search !== DEFAULT_PAYMENT_FILTERS.search ||
    filters.unitId !== DEFAULT_PAYMENT_FILTERS.unitId ||
    filters.type !== DEFAULT_PAYMENT_FILTERS.type ||
    filters.direction !== DEFAULT_PAYMENT_FILTERS.direction ||
    filters.from !== DEFAULT_PAYMENT_FILTERS.from ||
    filters.to !== DEFAULT_PAYMENT_FILTERS.to
  );
}

/** "Penthouse 5C · Lekki Court" */
export function paymentUnitLine(payment: PaymentSummaryRow): string {
  return `${payment.unit.unitName} · ${payment.unit.propertyName}`;
}

/**
 * The direction the API will insist on for a type, or null when it's free.
 * Used to set the field for the user rather than let them pick a rejected pair.
 */
export function directionFor(type: PaymentType): PaymentDirection | null {
  return REQUIRED_DIRECTION[type] ?? null;
}

export function paymentsSubtitleFor(role: ViewRole): string {
  if (role === "owner") {
    return "What you've been paid, on the units you own.";
  }
  return "Every payment recorded against your units. Display only — no money moves here.";
}

/**
 * Owners see one side of the ledger, so "in / out / net" would be three
 * numbers where one is always zero. They get a single total instead.
 */
export function showsBothDirections(role: ViewRole): boolean {
  return role !== "owner";
}

/** Today as "2026-08-15", for capping the date inputs. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** First day of the current month, for the summary's default range. */
export function monthStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}
