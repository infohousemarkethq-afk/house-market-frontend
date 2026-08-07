export interface ReportRow {
  unitId: string;
  unitName: string;
  propertyName: string;
  occupancyPct: number;
  nights: number;
  /** Kobo. Revenue for staff, earnings at the owner's rate for owners. */
  earned: number;
}

export interface SummaryTile {
  label: string;
  value: string;
  caption: string;
}

export interface UnitReport {
  unitName: string;
  propertyLine: string;
  occupancyPct: number;
  revenueLabel: string;
  /** Kobo. */
  revenue: number;
  timesBooked: number;
  nightsBooked: number;
  avgStay: string;
  avgNightly: string;
  blockedNights: string;
  rateCaption: string;
  /** Kobo. */
  rate: number;
}
