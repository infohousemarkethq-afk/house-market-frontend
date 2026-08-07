import { z } from "zod";

/**
 * Mirrors `acceptInviteSchema` in the backend's auth/invite.schema.ts, where
 * `password` is optional on purpose: an existing OWNER accepting a second
 * company's invite already has one. GET /auth/invites/verify tells us which
 * case we're in, so the rule is built per-invite.
 *
 * The requirement is expressed with superRefine rather than by swapping the
 * field's type, so the inferred shape stays the same either way — otherwise
 * the form's value type changes depending on a runtime flag.
 */
const baseSchema = z.object({
  password: z
    .string()
    .max(128, "Password must be at most 128 characters")
    .optional(),
});

export const acceptInviteSchemaFor = (requiresPassword: boolean) =>
  baseSchema.superRefine((data, ctx) => {
    if (!requiresPassword) return;

    if (!data.password || data.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    }
  });

export type AcceptInviteValues = z.infer<typeof baseSchema>;
