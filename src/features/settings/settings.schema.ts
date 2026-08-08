import { z } from "zod";

/** Mirrors `updateProfileSchema` in the backend's settings.schema.ts. */
export const ProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (value.length >= 7 && value.length <= 20),
      "Phone number must be between 7 and 20 characters",
    ),
});

export type ProfileValues = z.infer<typeof ProfileSchema>;

/**
 * Mirrors `changePasswordSchema`, including the rule that the new password
 * must differ — the server refuses it, so catching it here saves a round trip.
 */
export const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password must be at most 128 characters"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "The new password must be different from the current one",
  });

export type PasswordValues = z.infer<typeof PasswordSchema>;
