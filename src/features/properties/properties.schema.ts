import { z } from "zod";
import { PROPERTY_TYPES } from "./properties.types";

export const PropertyFormSchema = z
  .object({
    propertyName: z
      .string()
      .trim()
      .min(2, "Property name must be at least 2 characters")
      .max(150, "Property name must be at most 150 characters"),
    propertyAddress: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .max(255, "Address must be at most 255 characters"),
    propertyCity: z
      .string()
      .trim()
      .min(2, "City must be at least 2 characters")
      .max(100, "City must be at most 100 characters"),
    propertyType: z.enum(PROPERTY_TYPES),
    propertyTypeOther: z
      .string()
      .trim()
      .max(100, "Description must be at most 100 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.propertyType !== "OTHER") return;

    if (!data.propertyTypeOther || data.propertyTypeOther.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["propertyTypeOther"],
        message: "Describe the property type when choosing Other",
      });
    }
  });

export type PropertyFormValues = z.infer<typeof PropertyFormSchema>;
