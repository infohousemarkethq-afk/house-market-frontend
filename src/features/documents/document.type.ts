export type DocumentCategory =
  | "LEASE"
  | "TITLE"
  | "ID_KYC"
  | "PROOF_OF_OWNERSHIP"
  | "INSPECTION"
  | "MAINTENANCE"
  | "OTHER";

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  LEASE: "Lease",
  TITLE: "Title",
  ID_KYC: "ID / KYC",
  PROOF_OF_OWNERSHIP: "Proof of ownership",
  INSPECTION: "Inspection",
  MAINTENANCE: "Maintenance",
  OTHER: "Other",
};

/** Views and downloads of these are logged and shown to the owner. */
export const SENSITIVE_CATEGORIES: DocumentCategory[] = [
  "TITLE",
  "ID_KYC",
  "PROOF_OF_OWNERSHIP",
];

export function isSensitive(category: DocumentCategory): boolean {
  return SENSITIVE_CATEGORIES.includes(category);
}

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

export interface DocumentDraft {
  documentName: string;
  documentCategory: DocumentCategory;
}
