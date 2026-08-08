import { z } from "zod";

import {
  DAMAGE_SEVERITIES,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
} from "./maintenance.types";

/**
 * Mirrors `createMaintenanceSchema` in the backend's maintenance.schema.ts.
 *
 * `description` is required there (min 2), so the form's notes field is too —
 * a looser rule here would turn an inline hint into a generic 400.
 */
export const MaintenanceFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Say what was done, in at least 2 characters")
    .max(150, "Keep this under 150 characters"),
  type: z.enum(MAINTENANCE_TYPES),
  category: z.enum(MAINTENANCE_CATEGORIES),
  status: z.enum(MAINTENANCE_STATUSES),
  description: z
    .string()
    .trim()
    .min(2, "Add a short note about the work")
    .max(2000, "Keep this under 2000 characters"),
  // Naira as typed, converted to kobo in the payload — coercion inside the
  // schema would make its input type `unknown` and break the resolver.
  cost: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || Number(value.replace(/[^0-9.]/g, "")) > 0,
      "Enter an amount, or leave it blank",
    ),
  performedAt: z.string(),
});

export type MaintenanceFormValues = z.infer<typeof MaintenanceFormSchema>;

/**
 * Mirrors `createDamageSchema`.
 *
 * `bookingId` is required because damage belongs to a stay, not a unit — the
 * server reads the unit off the booking so the two can never disagree.
 * `location` has no column: it's prepended to the description, which is what
 * the free-text field is for.
 */
export const DamageFormSchema = z.object({
  bookingId: z.string().min(1, "Choose the stay this damage belongs to"),
  severity: z.enum(DAMAGE_SEVERITIES),
  location: z.string().trim().max(120, "Keep this under 120 characters"),
  description: z
    .string()
    .trim()
    .min(2, "Describe the damage in at least 2 characters")
    .max(1800, "Keep this under 1800 characters"),
  estimatedCost: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || Number(value.replace(/[^0-9.]/g, "")) > 0,
      "Enter an amount, or leave it blank",
    ),
});

export type DamageFormValues = z.infer<typeof DamageFormSchema>;
