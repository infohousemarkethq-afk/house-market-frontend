import { z } from "zod";

import { INVITE_ROLES } from "./team.types";

/** Mirrors `createInviteSchema` in the backend's invite.schema.ts. */
export const InviteFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z.email("Enter a valid email address"),
  role: z.enum(INVITE_ROLES),
  unitIds: z
    .array(z.string().min(1))
    .min(1, "Pick at least one unit")
    .max(100, "That's more than 100 units"),
});

export type InviteFormValues = z.infer<typeof InviteFormSchema>;
