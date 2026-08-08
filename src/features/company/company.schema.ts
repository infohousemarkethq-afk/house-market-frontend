import { z } from "zod";

/** Mirrors `updateCompanySchema` in the backend's company.schema.ts. */
export const CompanyDetailsSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(150, "Company name must be at most 150 characters"),
  companyEmail: z.email("Enter a valid email address"),
  companyPhoneNumber: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be at most 20 characters"),
  companyAddress: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address must be at most 255 characters"),
});

export type CompanyDetailsValues = z.infer<typeof CompanyDetailsSchema>;

export const CompanyBrandingSchema = z.object({
  companyLogo: z.url("Enter a valid image URL").or(z.literal("")),
});

export type CompanyBrandingValues = z.infer<typeof CompanyBrandingSchema>;
