export const BOOKING_STATUSES = [
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  CHECKED_OUT: "Checked out",
  CANCELLED: "Cancelled",
};

export interface BookingUnitSummary {
  id: string;
  unitName: string;
  propertyName: string;
}

/**
 * Mirrors `BookingSummary` in the backend's booking.types.ts.
 *
 * Both amounts are optional because `shapeMoney` strips the one the caller
 * isn't entitled to: an owner gets `ownerAmount` only, a manager gets
 * `totalAmount` only, an admin gets both. The gap between them is the
 * company's margin, which is why neither role ever sees the other's field.
 */
export interface BookingSummary {
  id: string;
  guestName: string;
  /** ISO. Half-open: the end date is a checkout, so it's free for the next guest. */
  startDate: string;
  endDate: string;
  nights: number;
  numberOfGuests: number | null;
  status: BookingStatus;
  totalAmount?: number | null;
  ownerAmount?: number | null;
  cancelledAt: string | null;
  createdAt: string;
  unit: BookingUnitSummary;
}

export interface BookingDetail extends BookingSummary {
  guestPhone: string | null;
  guestEmail: string | null;
  notes: string | null;
  cancelledReason: string | null;
  updatedAt: string;
  createdBy: {
    id: string;
    fullName: string;
  };
}

export interface CalendarBookingEntry {
  id: string;
  startDate: string;
  endDate: string;
  guestName: string;
  status: BookingStatus;
}

export interface CalendarBlockEntry {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

/**
 * One unit's month. The endpoint is per-unit, so the grid holds one of these
 * per row rather than a single company-wide response.
 */
export interface CalendarView {
  unitId: string;
  from: string;
  to: string;
  bookings: CalendarBookingEntry[];
  blocks: CalendarBlockEntry[];
}

/** The stays list's state, and the whole of what lives in the URL. */
export interface BookingFilters {
  page: number;
  search: string;
  unitId: string;
  status: BookingStatus | "";
}

export const DEFAULT_BOOKING_FILTERS: BookingFilters = {
  page: 1,
  search: "",
  unitId: "",
  status: "",
};

/* ------------------------------------------------------------------------ *
 * Legacy fixture shapes.
 *
 * The dashboard and reports screens still derive their numbers from
 * calander.fixtures.ts. These describe that fixture row, which counts days of
 * one pinned month — not an API response. New code wants the types above.
 * ------------------------------------------------------------------------ */

export interface Booking {
  id: string;
  unitId: string;
  guest: string;
  start: number;
  end: number;
  status: BookingStatus;
  phone: string;
  email: string;
  guests: number;
  /** Kobo. */
  total: number;
  notes: string | null;
  createdBy: string;
}

export interface DateBlock {
  id: string;
  unitId: string;
  reason: string;
  start: number;
  end: number;
}
