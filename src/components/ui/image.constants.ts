/**
 * Mirrors UPLOAD_LIMITS in the backend's constants.config.ts. A looser rule
 * here just means the user waits for a round trip to be told no.
 */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
