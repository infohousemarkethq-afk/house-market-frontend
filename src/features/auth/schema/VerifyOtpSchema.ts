import { z } from "zod";

/** Mirrors `verifyOtpSchema` in the backend's auth/auth.schema.ts (OTP.LENGTH = 6). */
export const VerifyOtpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code we sent you"),
});

export type VerifyOtpValues = z.infer<typeof VerifyOtpSchema>;
