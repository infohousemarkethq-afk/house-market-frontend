import { z } from "zod";

export const AccountStepSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const CompanyStepSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(150, "Company name must be at most 150 characters"),
  companyEmail: z.email("Invalid company email address"),
  companyPhoneNumber: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number must be at most 20 characters"),
  companyAddress: z
    .string()
    .trim()
    .min(5, "Company address must be at least 5 characters")
    .max(255, "Company address must be at most 255 characters"),
});

export const RegisterSchema = AccountStepSchema.extend(CompanyStepSchema.shape);

export type RegisterValues = z.infer<typeof RegisterSchema>;
