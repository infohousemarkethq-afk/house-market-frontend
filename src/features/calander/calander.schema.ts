import { z } from "zod";

/** Both forms pick dates from a month grid, so they arrive as "2026-08-22". */
const calendarDate = z.string().min(1, "Pick a date");

const endAfterStart = (data: { startDate: string; endDate: string }) =>
  new Date(data.endDate).getTime() > new Date(data.startDate).getTime();

/** Mirrors `createBookingSchema` in the backend's booking.schema.ts. */
export const BookingFormSchema = z
  .object({
    unitId: z.string().min(1, "Choose a unit"),
    guestName: z
      .string()
      .trim()
      .min(2, "Guest name must be at least 2 characters")
      .max(150, "Guest name must be at most 150 characters"),
    guestPhone: z
      .string()
      .trim()
      .min(7, "Phone number must be at least 7 characters")
      .max(20, "Phone number must be at most 20 characters")
      .or(z.literal("")),
    guestEmail: z.email("Enter a valid email address").or(z.literal("")),
    startDate: calendarDate,
    endDate: calendarDate,
    // Typed as a string like UnitPriceSchema does: coercion inside the schema
    // makes its input type `unknown`, which no longer matches the form values
    // the resolver is generic over.
    numberOfGuests: z
      .string()
      .trim()
      .regex(/^\d+$/, "Enter a whole number")
      .refine((value) => {
        const guests = Number(value);
        return guests >= 1 && guests <= 100;
      }, "Between 1 and 100 guests"),
    notes: z
      .string()
      .trim()
      .max(2000, "Notes must be at most 2000 characters")
      .or(z.literal("")),
  })
  .refine(endAfterStart, {
    path: ["endDate"],
    message: "A stay has to run at least one night",
  });

export type BookingFormValues = z.infer<typeof BookingFormSchema>;

/** Mirrors `createBlockSchema` in the backend's calendar.schema.ts. */
export const BlockFormSchema = z
  .object({
    unitId: z.string().min(1, "Choose a unit"),
    startDate: calendarDate,
    endDate: calendarDate,
    reason: z
      .string()
      .trim()
      .min(2, "Give the reason at least 2 characters")
      .max(200, "Reason must be at most 200 characters")
      .or(z.literal("")),
  })
  .refine(endAfterStart, {
    path: ["endDate"],
    message: "A block has to cover at least one night",
  });

export type BlockFormValues = z.infer<typeof BlockFormSchema>;

export const CancelBookingSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(2, "Give the reason at least 2 characters")
    .max(500, "Reason must be at most 500 characters")
    .or(z.literal("")),
});

export type CancelBookingValues = z.infer<typeof CancelBookingSchema>;
