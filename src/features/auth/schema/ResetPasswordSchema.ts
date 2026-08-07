import { z } from "zod";

/**
 * Mirrors `resetPasswordSchema` in the backend's auth/auth.schema.ts. The
 * field is named `newPassword` on the wire; the form keeps `password` because
 * that's what the input is, and the hook maps it at the call site.
 */
export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;
