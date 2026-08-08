import { z } from "zod";

import { DOCUMENT_CATEGORIES } from "./document.type";

/** Mirrors `uploadDocumentSchema` in the backend's document.schema.ts. */
export const DocumentUploadSchema = z.object({
  unitId: z.string().min(1, "Choose the unit this belongs to"),
  documentName: z
    .string()
    .trim()
    .min(2, "Document name must be at least 2 characters")
    .max(200, "Document name must be at most 200 characters"),
  documentCategory: z.enum(DOCUMENT_CATEGORIES),
});

export type DocumentUploadValues = z.infer<typeof DocumentUploadSchema>;
