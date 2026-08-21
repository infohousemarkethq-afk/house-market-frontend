import { z } from "zod";

import {
  MAX_PAYMENT_KOBO,
  PAYMENT_DIRECTIONS,
  PAYMENT_TYPES,
} from "./payment.types";

/**
 * Amounts are typed in naira and stored in kobo, so the form's ceiling is the
 * API's kobo ceiling divided by 100 — otherwise a valid-looking figure would
 * pass here and fail at the server with a 400.
 */
const MAX_PAYMENT_NAIRA = Math.floor(MAX_PAYMENT_KOBO / 100);

const naira = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

/**
 * Mirrors `createPaymentSchema` in the backend's payment.schema.ts.
 *
 * The amount is a string, matching UnitPriceSchema: that's what an input
 * actually holds, and it keeps the form's value type the same before and after
 * validation. The hook converts with `toKobo` on submit.
 */
export const RecordPaymentSchema = z.object({
  unitId: z.string().min(1, "Choose a unit"),

  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount")
    .refine((v) => naira(v) > 0, "Amount must be more than zero")
    .refine(
      (v) => naira(v) <= MAX_PAYMENT_NAIRA,
      `Amount must be at most ₦${MAX_PAYMENT_NAIRA.toLocaleString()}`,
    ),

  type: z.enum(PAYMENT_TYPES),
  direction: z.enum(PAYMENT_DIRECTIONS),

  description: z
    .string()
    .trim()
    .min(2, "Say what this payment was for")
    .max(500, "Description must be at most 500 characters"),

  reference: z
    .string()
    .trim()
    .max(100, "Reference must be at most 100 characters"),

  // The API rejects a future date; catching it here keeps the message inline.
  paidAt: z
    .string()
    .min(1, "Choose the date this was paid")
    .refine(
      (value) => new Date(value) <= new Date(),
      "Payment date cannot be in the future",
    ),
});

export type RecordPaymentValues = z.infer<typeof RecordPaymentSchema>;
