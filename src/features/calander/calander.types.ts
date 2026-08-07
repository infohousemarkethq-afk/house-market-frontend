export type BookingStatus =
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  CHECKED_OUT: "Checked out",
  CANCELLED: "Cancelled",
};

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

export interface BookingDraft {
  unitId: string;
  guests: number;
}

export interface BlockDraft {
  unitId: string;
  from: string;
  to: string;
  reason: string;
}
