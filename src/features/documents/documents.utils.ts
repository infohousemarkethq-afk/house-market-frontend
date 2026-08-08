import type { ViewRole } from "../auth/auth.types";
import {
  DEFAULT_DOCUMENT_FILTERS,
  DOCUMENT_CATEGORIES,
  UPLOAD_CATEGORIES,
  type DocumentCategory,
  type DocumentFilters,
  type DocumentSummary,
} from "./document.type";

function isDocumentCategory(value: string): value is DocumentCategory {
  return (DOCUMENT_CATEGORIES as readonly string[]).includes(value);
}

/** URL -> filters. Anything unrecognised falls back to the default. */
export function documentFiltersFromParams(
  params: URLSearchParams,
): DocumentFilters {
  const page = Number(params.get("page"));
  const category = params.get("category") ?? "";

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get("search") ?? "",
    unitId: params.get("unitId") ?? "",
    category: isDocumentCategory(category) ? category : "",
  };
}

/** Filters -> URL. Defaults are omitted so a clean view has a clean address. */
export function paramsFromDocumentFilters(
  filters: DocumentFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.unitId) params.set("unitId", filters.unitId);
  if (filters.category) params.set("category", filters.category);
  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}

/** Filters -> axios params. Same omissions, so the query key stays stable. */
export function documentQueryParams(filters: DocumentFilters) {
  return {
    page: filters.page,
    ...(filters.search && { search: filters.search }),
    ...(filters.unitId && { unitId: filters.unitId }),
    ...(filters.category && { category: filters.category }),
  };
}

export function hasActiveDocumentFilters(filters: DocumentFilters): boolean {
  return (
    filters.search !== DEFAULT_DOCUMENT_FILTERS.search ||
    filters.unitId !== DEFAULT_DOCUMENT_FILTERS.unitId ||
    filters.category !== DEFAULT_DOCUMENT_FILTERS.category
  );
}

/** "Penthouse 5C · Lekki Court" */
export function documentUnitLine(document: DocumentSummary): string {
  return `${document.unit.unitName} · ${document.unit.propertyName}`;
}

export function uploadCategoriesFor(role: ViewRole): DocumentCategory[] {
  return UPLOAD_CATEGORIES[role];
}

export function uploadHintFor(role: ViewRole): string {
  if (role === "manager") {
    return "Managers can file inspections and maintenance only.";
  }
  if (role === "owner") {
    return "Owners can file title, ID and proof-of-ownership documents.";
  }
  return "Any category, filed against one unit.";
}

export function documentsSubtitleFor(role: ViewRole): string {
  if (role === "manager") {
    return "Inspections and maintenance on your assigned units.";
  }
  if (role === "owner") return "Filed on the units you own.";
  return "Everything filed against your units.";
}

/** "application/pdf" -> "PDF". Falls back to the subtype for odd types. */
export function fileTypeLabel(mimeType: string): string {
  const subtype = mimeType.split("/")[1] ?? mimeType;

  const known: Record<string, string> = {
    pdf: "PDF",
    jpeg: "JPEG",
    jpg: "JPEG",
    png: "PNG",
    "vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    msword: "DOC",
  };

  return known[subtype] ?? subtype.toUpperCase();
}

/** Bytes -> "6.1 MB". */
export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
