import type { ViewRole } from "../auth/auth.types";

/** Mirrors `paymentTypeEnum` in the backend's payment.schema.ts. */
export const PAYMENT_TYPES = [
  "BOOKING_PAYMENT",
  "OWNER_PAYOUT",
  "MAINTENANCE_COST",
  "OTHER",
] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  BOOKING_PAYMENT: "Booking payment",
  OWNER_PAYOUT: "Owner payout",
  MAINTENANCE_COST: "Maintenance cost",
  OTHER: "Other",
};

export const PAYMENT_DIRECTIONS = ["INFLOW", "OUTFLOW"] as const;

export type PaymentDirection = (typeof PAYMENT_DIRECTIONS)[number];

export const PAYMENT_DIRECTION_LABEL: Record<PaymentDirection, string> = {
  INFLOW: "Money in",
  OUTFLOW: "Money out",
};

/**
 * Which direction each type must move — the same table the API enforces in
 * `payment.schema.ts`. Mirrored so the form can set it for you rather than
 * letting you pick a pair the server will reject.
 *
 * OTHER is deliberately absent: it can go either way.
 */
export const REQUIRED_DIRECTION: Partial<Record<PaymentType, PaymentDirection>> =
  {
    BOOKING_PAYMENT: "INFLOW",
    OWNER_PAYOUT: "OUTFLOW",
    MAINTENANCE_COST: "OUTFLOW",
  };

/**
 * Kobo, and the column is a Postgres `integer`. Matching the API's ceiling so
 * a large payout fails inline instead of coming back as a server error.
 */
export const MAX_PAYMENT_KOBO = 2_147_483_647;

export interface PaymentUnit {
  id: string;
  unitName: string;
  propertyName: string;
}

export interface PaymentBooking {
  id: string;
  guestName: string;
  startDate: string;
  endDate: string;
}

export interface PaymentSummaryRow {
  id: string;
  /** Kobo. Always positive — `direction` carries the sign. */
  amount: number;
  type: PaymentType;
  direction: PaymentDirection;
  description: string;
  reference: string | null;
  paidAt: string;
  createdAt: string;
  unit: PaymentUnit;
  booking: PaymentBooking | null;
}

export interface PaymentDetail extends PaymentSummaryRow {
  updatedAt: string;
  recordedBy: { id: string; fullName: string };
}

/** GET /payment/summary. Totals for a period, already scoped to the caller. */
export interface PaymentTotals {
  from: string;
  to: string;
  inflow: number;
  outflow: number;
  net: number;
  byType: Partial<Record<PaymentType, number>>;
}

export interface PaymentFilters {
  page: number;
  search: string;
  unitId: string;
  type: PaymentType | "";
  direction: PaymentDirection | "";
  from: string;
  to: string;
}

export const DEFAULT_PAYMENT_FILTERS: PaymentFilters = {
  page: 1,
  search: "",
  unitId: "",
  type: "",
  direction: "",
  from: "",
  to: "",
};

export interface CreatePaymentInput {
  unitId: string;
  bookingId?: string;
  /** Kobo. */
  amount: number;
  type: PaymentType;
  direction: PaymentDirection;
  description: string;
  reference?: string;
  paidAt: string;
}

/** No `unitId`: the API refuses to move a payment between units. */
export interface UpdatePaymentInput {
  bookingId?: string | null;
  amount?: number;
  type?: PaymentType;
  direction?: PaymentDirection;
  description?: string;
  reference?: string | null;
  paidAt?: string;
}

/**
 * Managers are absent on purpose. The permission matrix gives them no payment
 * visibility, and every route in the backend's payment.routes.ts sits behind
 * requireRole("COMPANY_ADMIN", "OWNER") — so a link would only lead to a 403.
 */
export const PAYMENT_ROLES: ViewRole[] = ["admin", "owner"];
