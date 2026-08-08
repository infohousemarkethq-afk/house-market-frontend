/** Mirrors the enums in the backend's maintenance.schema.ts. */
export const MAINTENANCE_TYPES = ["SCHEDULED", "REACTIVE"] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_TYPE_LABEL: Record<MaintenanceType, string> = {
  SCHEDULED: "Scheduled",
  REACTIVE: "Reactive",
};

export const MAINTENANCE_CATEGORIES = [
  "CLEANING",
  "REPAIR",
  "INSPECTION",
  "OTHER",
] as const;
export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[number];

export const MAINTENANCE_CATEGORY_LABEL: Record<MaintenanceCategory, string> = {
  CLEANING: "Cleaning",
  REPAIR: "Repair",
  INSPECTION: "Inspection",
  OTHER: "Other",
};

export const MAINTENANCE_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export const MAINTENANCE_STATUS_LABEL: Record<MaintenanceStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export interface PhotoSummary {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
}

/**
 * `cost` is optional because the server strips it for owners — the work and
 * its status are theirs to see, what it cost the company is not.
 */
export interface MaintenanceSummary {
  id: string;
  title: string;
  type: MaintenanceType;
  category: MaintenanceCategory;
  status: MaintenanceStatus;
  cost?: number | null;
  performedAt: string | null;
  createdAt: string;
  unit: {
    id: string;
    unitName: string;
    propertyName: string;
  };
}

export interface MaintenanceDetail extends MaintenanceSummary {
  description: string;
  updatedAt: string;
  bookingId: string | null;
  createdBy: { id: string; fullName: string };
  photos: PhotoSummary[];
}

export const DAMAGE_SEVERITIES = ["MINOR", "MODERATE", "SEVERE"] as const;
export type DamageSeverity = (typeof DAMAGE_SEVERITIES)[number];

export const DAMAGE_SEVERITY_LABEL: Record<DamageSeverity, string> = {
  MINOR: "Minor",
  MODERATE: "Moderate",
  SEVERE: "Severe",
};

export const DAMAGE_SEVERITY_HINT: Record<DamageSeverity, string> = {
  MINOR: "Wear, marks, a chipped tile",
  MODERATE: "A broken fitting, a stain that needs a pro",
  SEVERE: "Structural, or the unit cannot be let",
};

/** Owners do see `estimatedCost` — a guest damaged their property. */
export interface DamageSummary {
  id: string;
  description: string;
  severity: DamageSeverity;
  estimatedCost: number | null;
  reportedAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
  unit: {
    id: string;
    unitName: string;
    propertyName: string;
  };
}

export interface DamageDetail extends DamageSummary {
  updatedAt: string;
  booking: {
    id: string;
    guestName: string;
    startDate: string;
    endDate: string;
  };
  reportedBy: { id: string; fullName: string };
  photos: PhotoSummary[];
}

/** UPLOAD_LIMITS in the backend's constants.config.ts. */
export const DAMAGE_PHOTOS_PER_REQUEST = 10;
export const MAINTENANCE_PHOTOS_PER_REQUEST = 5;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
