import { z } from "zod";

export const VerifyOtpSchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .length(6, "Enter the 6-character code we sent you"),
});

export type VerifyOtpValues = z.infer<typeof VerifyOtpSchema>;
