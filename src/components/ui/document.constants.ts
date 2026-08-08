/**
 * Mirrors UPLOAD_LIMITS in the backend's constants.config.ts. A looser rule
 * here just means the user waits for a round trip to be told no.
 */
export const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
