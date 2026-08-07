export type LedgerDirection = "INFLOW" | "OUTFLOW";

export type LedgerType =
  | "BOOKING_PAYMENT"
  | "OWNER_PAYOUT"
  | "MAINTENANCE_COST";

export const LEDGER_TYPE_LABEL: Record<LedgerType, string> = {
  BOOKING_PAYMENT: "Booking payment",
  OWNER_PAYOUT: "Owner payout",
  MAINTENANCE_COST: "Maintenance cost",
};

/** A record of money in and out. House Market does not move funds. */
export interface LedgerEntry {
  date: string;
  description: string;
  unitName: string;
  reference: string;
  /** Kobo. */
  amount: number;
  direction: LedgerDirection;
  type: LedgerType;
}

/** What a managing company has paid an owner. */
export interface Payout {
  date: string;
  unitName: string;
  managedBy: string;
  description: string;
  /** Kobo. */
  amount: number;
}
