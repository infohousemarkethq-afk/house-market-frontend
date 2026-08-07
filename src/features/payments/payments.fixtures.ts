import type { LedgerEntry, Payout } from "./payment.types";

export const LEDGER: LedgerEntry[] = [
  {
    date: "2 Aug 2026",
    description: "Booking — Grace Adeyemi",
    unitName: "Penthouse 5C",
    reference: "TRF-1029",
    amount: 36000000,
    direction: "INFLOW",
    type: "BOOKING_PAYMENT",
  },
  {
    date: "1 Aug 2026",
    description: "July payout",
    unitName: "Flat 14",
    reference: "TRF-1024",
    amount: 8000000,
    direction: "OUTFLOW",
    type: "OWNER_PAYOUT",
  },
  {
    date: "29 Jul 2026",
    description: "AC servicing",
    unitName: "Flat 14",
    reference: "INV-3391",
    amount: 4500000,
    direction: "OUTFLOW",
    type: "MAINTENANCE_COST",
  },
  {
    date: "26 Jul 2026",
    description: "Booking — Halima Sule",
    unitName: "Flat 14",
    reference: "TRF-1018",
    amount: 39000000,
    direction: "INFLOW",
    type: "BOOKING_PAYMENT",
  },
  {
    date: "22 Jul 2026",
    description: "Deep clean, changeover",
    unitName: "Penthouse 5C",
    reference: "INV-3380",
    amount: 1200000,
    direction: "OUTFLOW",
    type: "MAINTENANCE_COST",
  },
  {
    date: "1 Jul 2026",
    description: "June payout",
    unitName: "Flat 14",
    reference: "TRF-0994",
    amount: 7400000,
    direction: "OUTFLOW",
    type: "OWNER_PAYOUT",
  },
];

export const PAYOUTS: Payout[] = [
  {
    date: "1 Aug 2026",
    unitName: "Flat 14",
    managedBy: "Bella Suites",
    description: "July payout",
    amount: 8000000,
  },
  {
    date: "1 Aug 2026",
    unitName: "Flat 88",
    managedBy: "Biodun Properties",
    description: "July payout",
    amount: 5100000,
  },
  {
    date: "1 Jul 2026",
    unitName: "Flat 14",
    managedBy: "Bella Suites",
    description: "June payout",
    amount: 7400000,
  },
  {
    date: "1 Jul 2026",
    unitName: "Flat 88",
    managedBy: "Biodun Properties",
    description: "June payout",
    amount: 4300000,
  },
];

/** Month-to-date totals shown above the ledger. */
export const PAYMENT_SUMMARY = {
  inflow: 124000000,
  outflow: 60500000,
  net: 63500000,
};

/** Owner statement header. */
export const PAYOUT_SUMMARY = {
  paidToYou: 24800000,
  caption: "Across 2 units and 2 companies",
};
