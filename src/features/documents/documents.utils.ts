import type { ViewRole } from "../auth/auth.types";
import { UNITS } from "../units/units.fixtures";
import { DOCUMENTS } from "./documents.fixtures";
import type { DocumentRecord } from "./document.type";

const MANAGER_UNIT_IDS = ["u1", "u2"];

/**
 * Managers see inspections and maintenance on their own units. The owner
 * fixture account took ownership on 2 August, so nothing is filed to it yet.
 */
export function documentsForRole(role: ViewRole): DocumentRecord[] {
  if (role === "manager") {
    return DOCUMENTS.filter(
      (doc) =>
        MANAGER_UNIT_IDS.includes(doc.unitId) &&
        (doc.documentCategory === "INSPECTION" ||
          doc.documentCategory === "MAINTENANCE"),
    );
  }
  if (role === "owner") return [];
  return DOCUMENTS;
}

export function documentsForUnit(
  unitId: string,
  role: ViewRole,
): DocumentRecord[] {
  return documentsForRole(role).filter((doc) => doc.unitId === unitId);
}

export function inspectionsForUnit(unitId: string): DocumentRecord[] {
  return DOCUMENTS.filter(
    (doc) => doc.unitId === unitId && doc.documentCategory === "INSPECTION",
  );
}

export function findDocument(docId: string | undefined) {
  return DOCUMENTS.find((doc) => doc.id === docId);
}

/** "Penthouse 5C · Lekki Court" */
export function documentUnitLine(doc: DocumentRecord): string {
  const unit = UNITS.find((candidate) => candidate.id === doc.unitId);
  return unit ? `${unit.unitName} · ${unit.propertyName}` : "—";
}

/** Categories a role is allowed to file under. */
export function uploadCategoriesFor(role: ViewRole): string[] {
  if (role === "manager") return ["Inspection", "Maintenance"];
  if (role === "owner") return ["Title", "ID / KYC", "Proof of ownership"];
  return [
    "Lease",
    "Title",
    "ID / KYC",
    "Proof of ownership",
    "Inspection",
    "Maintenance",
    "Other",
  ];
}

export function uploadHintFor(role: ViewRole): string {
  if (role === "manager")
    return "Managers can file inspections and maintenance only.";
  if (role === "owner")
    return "Owners can file title, ID and proof-of-ownership documents.";
  return "Any category, filed against one unit.";
}
