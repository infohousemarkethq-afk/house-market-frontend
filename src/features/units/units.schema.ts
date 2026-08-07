import { z } from "zod";

import { AMENITY_KEYS, UNIT_TYPE_OPTIONS } from "./units.types";

/**
 * Mirrors `createUnitSchema` / `updateUnitSchema` in the backend's
 * unit.schema.ts, bounds included. `unitTypeOther` uses superRefine rather
 * than a schema per type so the form's value shape stays constant while the
 * user flips between types.
 */
const roomCount = z
  .number()
  .int()
  .min(0, "Can't be negative")
  .max(50, "That's more than 50");

export const UnitFormSchema = z
  .object({
    propertyId: z.string().min(1, "Choose which property this unit is in"),
    unitName: z
      .string()
      .trim()
      .min(1, "Unit name is required")
      .max(100, "Unit name must be at most 100 characters"),
    unitType: z.enum(UNIT_TYPE_OPTIONS),
    unitTypeOther: z
      .string()
      .trim()
      .max(100, "Description must be at most 100 characters")
      .optional(),

    bedrooms: roomCount,
    bathrooms: roomCount,
    toilets: roomCount,
    parlors: roomCount,
    maxGuests: z
      .number()
      .int()
      .min(1, "At least one guest")
      .max(100, "That's more than 100"),

    amenities: z.array(z.enum(AMENITY_KEYS)).max(30),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be at most 2000 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.unitType !== "OTHER") return;

    if (!data.unitTypeOther || data.unitTypeOther.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["unitTypeOther"],
        message: "Describe the unit type when choosing Other",
      });
    }
  });

export type UnitFormValues = z.infer<typeof UnitFormSchema>;

/**
 * Its own endpoint (PATCH /unit/:id/price), so its own schema. Typed in naira
 * because that's what the user enters; the hook converts to kobo.
 */
export const UnitPriceSchema = z.object({
  pricePerNight: z
    .string()
    .trim()
    .min(1, "Enter a nightly rate")
    .refine((v) => Number(v.replace(/[^0-9.]/g, "")) > 0, "Enter an amount"),
  ownerRatePerNight: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || Number(v.replace(/[^0-9.]/g, "")) > 0,
      "Enter an amount, or leave it blank",
    ),
});

export type UnitPriceValues = z.infer<typeof UnitPriceSchema>;
