import { z } from "zod";

/** Mirrors `forgotPasswordSchema` in the backend's auth/auth.schema.ts. */
export const ForgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;
