// All money fields are integer kobo. Format at render time only via formatNaira.

export interface UnitPerformance {
  unitId: string;
  unitName: string;
  propertyName: string;
  occupancyPercent: number;
  nightsBooked: number;
  nightsAvailable: number;
  earned: number; // kobo — totalAmount for admin, ownerAmount for owner
}

export interface PerformanceReport {
  month: string; // "2026-08"
  totals: {
    earned: number;
    nightsBooked: number;
    nightsAvailable: number;
    occupancyPercent: number;
    unitsLet: number;
    unitCount: number;
  };
  byUnit: UnitPerformance[];
}

export interface UnitReport {
  month: string;
  unit: {
    id: string;
    unitName: string;
    propertyName: string;
  };
  occupancyPercent: number;
  nightsBooked: number;
  nightsAvailable: number;
  nightsBlocked: number;
  stays: number;
  averageStayNights: number;
  earned: number;          // kobo
  averagePerNight: number; // kobo
  ratePerNight: number;    // kobo — pricePerNight for admin, ownerRatePerNight for owner
}