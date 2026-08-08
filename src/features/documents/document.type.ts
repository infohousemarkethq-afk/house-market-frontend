import type { ViewRole } from "../auth/auth.types";

/** Mirrors `documentCategoryEnum` in the backend's document.schema.ts. */
export const DOCUMENT_CATEGORIES = [
  "LEASE",
  "TITLE",
  "ID_KYC",
  "PROOF_OF_OWNERSHIP",
  "INSPECTION",
  "MAINTENANCE",
  "OTHER",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  LEASE: "Lease",
  TITLE: "Title",
  ID_KYC: "ID / KYC",
  PROOF_OF_OWNERSHIP: "Proof of ownership",
  INSPECTION: "Inspection",
  MAINTENANCE: "Maintenance",
  OTHER: "Other",
};

/**
 * Reads and downloads of these are logged (SENSITIVE_DOCUMENT_CATEGORIES in
 * the backend's constants.config.ts). The server derives the flag and returns
 * it as `isSensitive`, so list rows never have to work it out — this is here
 * for the fixture-driven dashboard tile, which has no API response to read.
 */
export const SENSITIVE_CATEGORIES: DocumentCategory[] = [
  "TITLE",
  "ID_KYC",
  "PROOF_OF_OWNERSHIP",
];

export function isSensitive(category: DocumentCategory): boolean {
  return SENSITIVE_CATEGORIES.includes(category);
}

/**
 * What each role may file, mirroring DOCUMENT_UPLOAD_PERMISSIONS on the
 * server. Offering a category the API will reject is a 403 the user can't act
 * on, so the upload form only lists these.
 */
export const UPLOAD_CATEGORIES: Record<ViewRole, DocumentCategory[]> = {
  admin: [...DOCUMENT_CATEGORIES],
  manager: ["INSPECTION", "MAINTENANCE"],
  owner: ["TITLE", "ID_KYC", "PROOF_OF_OWNERSHIP"],
};

export interface DocumentUnitSummary {
  id: string;
  unitName: string;
  propertyName: string;
}

/**
 * Note what's absent: the stored file URL. Cloudinary signs it permanently,
 * so the API never hands it over — a short-lived link comes from
 * GET /document/:id/download instead.
 */
export interface DocumentSummary {
  id: string;
  documentName: string;
  documentCategory: DocumentCategory;
  isSensitive: boolean;
  createdAt: string;
  unit: DocumentUnitSummary;
}

export interface DocumentDetail extends DocumentSummary {
  mimeType: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    fullName: string;
  };
}

export type DocumentAccessAction = "UPLOADED" | "VIEWED" | "DOWNLOADED";

export const ACCESS_ACTION_LABEL: Record<DocumentAccessAction, string> = {
  UPLOADED: "uploaded this document",
  VIEWED: "viewed this document",
  DOWNLOADED: "downloaded this document",
};

export interface DocumentAccessLogEntry {
  id: string;
  action: DocumentAccessAction;
  ipAddress: string | null;
  occurredAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

/** Minted per request and good for a few minutes only. */
export interface DownloadLink {
  documentName: string;
  downloadUrl: string;
}

/** The list screen's state, and the whole of what lives in the URL. */
export interface DocumentFilters {
  page: number;
  search: string;
  unitId: string;
  category: DocumentCategory | "";
}

export const DEFAULT_DOCUMENT_FILTERS: DocumentFilters = {
  page: 1,
  search: "",
  unitId: "",
  category: "",
};

/* ------------------------------------------------------------------------ *
 * Legacy fixture shape.
 *
 * The dashboard tiles still count documents.fixtures.ts rather than calling
 * the API. This describes that flat fixture row — new code wants
 * DocumentSummary / DocumentDetail above.
 * ------------------------------------------------------------------------ */

export interface DocumentRecord {
  id: string;
  documentName: string;
  documentCategory: DocumentCategory;
  unitId: string;
  date: string;
  uploadedBy: string;
  mimeLabel: string;
  sizeLabel: string;
}

export interface AccessLogEntry {
  user: string;
  actionText: string;
  meta: string;
  when: string;
  tone: "green" | "tan" | "ink";
}
